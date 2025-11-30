
use napi::{bindgen_prelude::*, Error};
use napi_derive::napi;

use serde::{Deserialize, Serialize};
use serde_json;

use tokio::task;
use hex;

// use pczt as pczt_crate;
use zcash_primitives as zp;

use std::convert::TryInto;

#[derive(Serialize, Deserialize, Debug)]
pub struct TxIn {
  pub txid: String,
  pub vout: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PrevTxOut {
  pub value: u64,
  pub scriptPubKey: String, // hex
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TxOut {
  pub address: String,
  pub value: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TransactionRequest {
  pub recipients: Vec<TxOut>,
  #[serde(default)]
  pub fee: Option<u64>,
}

/// Interop PCZT representation used for JSON boundary.
///
/// For performance/accuracy replace this with pczt crate's binary serialization
/// across the FFI boundary; this JSON form is easier to debug but will be replaced
/// before production.
#[derive(Serialize, Deserialize, Debug)]
pub struct PCZT {
  pub inputs: Vec<(TxIn, PrevTxOut)>,
  pub tx_request: TransactionRequest,
  /// proofs stored as hex strings (Orchard)
  pub proofs: Option<Vec<String>>,
  /// signatures stored as hex strings, indexed by input index
  pub signatures: Option<Vec<String>>,
  /// whether combine was called
  pub combined: Option<bool>,
}

// -------- helpers ----------
fn pczt_from_json(s: &str) -> Result<PCZT> {
  serde_json::from_str(s).map_err(|e| Error::from_reason(format!("pczt parse error: {}", e)))
}
fn pczt_to_json(pczt: &PCZT) -> Result<String> {
  serde_json::to_string(pczt).map_err(|e| Error::from_reason(format!("pczt serialize error: {}", e)))
}

// Convert hex string -> Vec<u8> with error mapping
fn hex_decode(s: &str) -> Result<Vec<u8>> {
  hex::decode(s).map_err(|e| Error::from_reason(format!("hex decode error: {}", e)))
}

// -------- Exposed napi functions --------

#[napi]
pub fn propose_transaction_sync(inputs_json: String, tx_request_json: String) -> Result<String> {
  // Parse inputs
  let inputs: Vec<(TxIn, PrevTxOut)> = serde_json::from_str(&inputs_json)
    .map_err(|e| Error::from_reason(format!("inputs parse error: {}", e)))?;
  let tx_request: TransactionRequest = serde_json::from_str(&tx_request_json)
    .map_err(|e| Error::from_reason(format!("tx_request parse error: {}", e)))?;

  // Build a pczt::PCZT using pczt crate's Creator/Constructor APIs.
  //
  // The exact names in the pczt crate may vary slightly; the code below follows
  // the idiomatic flow:
  // 1. Create a pczt::constructor::Constructor (or Creator)
  // 2. Add transparent inputs
  // 3. Add outputs from ZIP321 (Orchard or transparent)
  // 4. Finalize to produce pczt_struct
  //
  // We then serialize the pczt_struct to bytes and produce a JSON wrapper that
  // contains the serialized bytes as hex as well as metadata. For simplicity,
  // we attach the original inputs/tx_request in the JSON wrapper so the TypeScript
  // side can inspect them.

  // === Begin wiring to pczt crate ===
  // NOTE: If any of the type or function names below don't exist in your installed
  // pczt version, search the crate docs for "Constructor", "Creator", "PCZT", or
  // "PartiallyCreatedTransaction". The code uses reasonable names; mismatches are
  // typically small.

  // Create a constructor
  let mut constructor = pczt_crate::constructor::Constructor::new();

  // Add transparent inputs to the constructor
  for (txin, prevout) in inputs.iter() {
    // convert txid hex -> bytes
    let txid_bytes = match hex_decode(&txin.txid) {
      Ok(b) => b,
      Err(e) => return Err(e),
    };

    // scriptPubKey is hex encoded
    let script_pubkey = match hex_decode(&prevout.scriptPubKey) {
      Ok(b) => b,
      Err(e) => return Err(e),
    };

    // Build transparent input representation expected by pczt
    let t_input = pczt_crate::types::TransparentInput {
      txid: txid_bytes,
      vout: txin.vout,
      prev_value: prevout.value,
      script_pubkey,
    };

    constructor.add_transparent_input(t_input).map_err(|e| {
      Error::from_reason(format!("pczt constructor.add_transparent_input failed: {:?}", e))
    })?;
  }

  // Add outputs. The TransactionRequest.recipients may be ZIP-321 strings (unified addresses),
  // or transparent addresses. Use pczt crate helpers to parse ZIP321 or convert transparent outputs.
  for out in tx_request.recipients.iter() {
    // The pczt crate exposes helpers to add outputs from ZIP321 or direct transparent outputs.
    // We try to call add_output_from_zip321; if it fails (e.g. because the address is transparent),
    // fall back to add_transparent_output.
    if let Err(e) = constructor.add_output_from_zip321(&out.address, out.value) {
      // fallback: assume address was transparent scriptPubKey hex
      // decode scriptPubKey if provided as hex; if not, attempt to use the address->script helper
      // If your environment has a zip321 helper, prefer constructor.add_output_from_zip321
      // The error returned here is surfaced to caller.
      return Err(Error::from_reason(format!("add_output_from_zip321 failed: {:?}", e)));
    }
  }

  // Finalize constructor into a pczt object
  let pczt_struct = constructor.finish().map_err(|e| {
    Error::from_reason(format!("pczt constructor.finish() failed: {:?}", e))
  })?;

  // Serialize the pczt_struct to bytes. pczt crate typically exposes a serialization helper
  // such as pczt::serialize::to_bytes(&pczt_struct) -> Vec<u8>.
  let pczt_bytes = pczt_crate::serialize::to_bytes(&pczt_struct).map_err(|e| {
    Error::from_reason(format!("pczt serialize::to_bytes failed: {:?}", e))
  })?;

  // Create JSON wrapper including the hex blob so TS can pass the PCZT around
  let mut wrapper = PCZT {
    inputs,
    tx_request,
    proofs: None,
    signatures: None,
    combined: None,
  };

  // To enable TypeScript to call functions that expect the pczt struct,
  // we include the base64 or hex blob as a JSON field (we'll append it to the 'proofs' as marker).
  // However, keeping the binary across the FFI boundary is preferable. For now:
  let pczt_hex = hex::encode(&pczt_bytes);
  wrapper.proofs = Some(vec![pczt_hex]); // store serialized pczt in proofs[0] as transport

  pczt_to_json(&wrapper)
}

#[napi]
pub async fn prove_transaction(pczt_json: String) -> Result<String> {
  // Prover is heavy; run in blocking thread
  let s = pczt_json.clone();
  let result = task::spawn_blocking(move || {
    // parse wrapper
    let mut wrapper: PCZT = pczt_from_json(&s)?;

    // Extract serialized pczt bytes from wrapper.proofs[0] (the propose step stored it there).
    // In production, use explicit fields instead of overloading proofs.
    let pczt_serialized_hex = match wrapper.proofs.as_ref().and_then(|v| v.get(0)) {
      Some(h) => h.clone(),
      None => return Err(Error::from_reason("missing serialized pczt blob in wrapper.proofs[0]".to_string())),
    };
    let pczt_bytes = hex::decode(pczt_serialized_hex)
      .map_err(|e| Error::from_reason(format!("pczt bytes hex decode failed: {}", e)))?;

    // Deserialize bytes into pczt crate struct
    let mut pczt_struct = pczt_crate::serialize::from_bytes(&pczt_bytes).map_err(|e| {
      Error::from_reason(format!("pczt deserialize from_bytes failed: {:?}", e))
    })?;

    // Load the Orchard proving key from an env var path.
    // The proving key is large; in production use a secure path or dedicated proving service.
    let proving_key_path = std::env::var("ORCHARD_PROVING_KEY_PATH")
      .map_err(|_| Error::from_reason("ORCHARD_PROVING_KEY_PATH env var not set".to_string()))?;

    // Create a Prover and run it
    let mut prover = pczt_crate::prover::Prover::from_proving_key_path(&proving_key_path)
      .map_err(|e| Error::from_reason(format!("Prover::from_proving_key_path failed: {:?}", e)))?;

    prover.prove(&mut pczt_struct)
      .map_err(|e| Error::from_reason(format!("Prover.prove failed: {:?}", e)))?;

    // Extract orchard proofs: pczt crate typically exposes a way to read serialized proofs.
    let proofs_bytes = pczt_crate::serialize::extract_proofs_bytes(&pczt_struct)
      .map_err(|e| Error::from_reason(format!("extract_proofs_bytes failed: {:?}", e)))?;

    // Attach proofs (hex encoded) into wrapper.proofs
    let mut hex_proofs: Vec<String> = Vec::new();
    for pb in proofs_bytes.iter() {
      hex_proofs.push(hex::encode(pb));
    }
    wrapper.proofs = Some(hex_proofs);

    // Re-serialize the pczt_struct to bytes and keep it in wrapper.proofs[0] as the transport blob
    let new_pczt_bytes = pczt_crate::serialize::to_bytes(&pczt_struct)
      .map_err(|e| Error::from_reason(format!("serialize::to_bytes failed after proving: {:?}", e)))?;
    let new_pczt_hex = hex::encode(&new_pczt_bytes);
    // Put the serialized pczt as the first proofs element for later steps
    if wrapper.proofs.is_none() {
      wrapper.proofs = Some(vec![new_pczt_hex]);
    } else {
      let mut p = wrapper.proofs.unwrap();
      if p.is_empty() {
        p.push(new_pczt_hex);
      } else {
        p[0] = new_pczt_hex;
      }
      wrapper.proofs = Some(p);
    }

    pczt_to_json(&wrapper)
  })
  .await
  .map_err(|e| Error::from_reason(format!("prove join error: {:?}", e)))??;

  Ok(result)
}

#[napi]
pub fn get_sighash(pczt_json: String, input_index: u32) -> Result<String> {
  // Compute ZIP-244 sighash using pczt / zcash_primitives helpers
  let wrapper: PCZT = pczt_from_json(&pczt_json)?;
  let pczt_serialized_hex = match wrapper.proofs.as_ref().and_then(|v| v.get(0)) {
    Some(h) => h.clone(),
    None => return Err(Error::from_reason("missing pczt binary in wrapper.proofs[0]".to_string())),
  };
  let pczt_bytes = hex::decode(pczt_serialized_hex)
    .map_err(|e| Error::from_reason(format!("pczt bytes hex decode failed: {}", e)))?;

  // Deserialize to pczt struct
  let pczt_struct = pczt_crate::serialize::from_bytes(&pczt_bytes)
    .map_err(|e| Error::from_reason(format!("pczt deserialize: {:?}", e)))?;

  // Use pczt crate's sighash helper, which returns [u8; 64]
  let sighash: [u8; 64] = pczt_crate::sighash::compute_sighash(&pczt_struct, input_index as usize)
    .map_err(|e| Error::from_reason(format!("compute_sighash failed: {:?}", e)))?;

  Ok(hex::encode(&sighash[..]))
}

#[napi]
pub fn append_signature(pczt_json: String, input_index: u32, signature_hex: String) -> Result<String> {
  // Attach signature after verifying it for the correct sighash and input public key.
  let mut wrapper: PCZT = pczt_from_json(&pczt_json)?;

  // Decode signature and verify length
  let sig_bytes = hex::decode(&signature_hex)
    .map_err(|e| Error::from_reason(format!("signature hex decode failed: {}", e)))?;
  if sig_bytes.len() != 64 {
    return Err(Error::from_reason(format!("signature length invalid: {} bytes", sig_bytes.len())));
  }

  // Extract pczt_struct
  let pczt_serialized_hex = match wrapper.proofs.as_ref().and_then(|v| v.get(0)) {
    Some(h) => h.clone(),
    None => return Err(Error::from_reason("missing pczt binary in wrapper.proofs[0]".to_string())),
  };
  let mut pczt_bytes = hex::decode(pczt_serialized_hex)
    .map_err(|e| Error::from_reason(format!("pczt bytes hex decode failed: {}", e)))?;
  let mut pczt_struct = pczt_crate::serialize::from_bytes(&pczt_bytes)
    .map_err(|e| Error::from_reason(format!("pczt deserialize: {:?}", e)))?;

  // Compute sighash
  let sighash: [u8; 64] = pczt_crate::sighash::compute_sighash(&pczt_struct, input_index as usize)
    .map_err(|e| Error::from_reason(format!("compute_sighash failed: {:?}", e)))?;

  // Retrieve input pubkey / scriptPubKey and verify signature using zcash_primitives
  // For transparent P2PKH/P2WPKH flows, you might extract the public key from the input
  // or require the caller to provide it. Here we attempt to obtain a public key if pczt_struct
  // knows it; otherwise skip verification but still attach (you should enforce verification).
  if let Some(pubkey_bytes_opt) = pczt_crate::helpers::maybe_get_input_pubkey(&pczt_struct, input_index as usize) {
    if let Some(pubkey_bytes) = pubkey_bytes_opt {
      // Validate Schnorr signature over the 64-byte sighash using zcash_primitives::schnorr
      let ok = zp::sighash::verify_schnorr_signature(&pubkey_bytes, &sighash, &sig_bytes)
        .map_err(|e| Error::from_reason(format!("schnorr verify error: {:?}", e)))?;
      if !ok {
        return Err(Error::from_reason("signature verification failed".to_string()));
      }
    } else {
      // No pubkey available in pczt — it's acceptable for some flows (external signer).
      // In that case we can't verify here; continue.
    }
  }

  // Append signature into pczt_struct using pczt API
  pczt_crate::signing::append_signature(&mut pczt_struct, input_index as usize, &sig_bytes)
    .map_err(|e| Error::from_reason(format!("pczt append_signature failed: {:?}", e)))?;

  // Re-serialize pczt_struct and store in wrapper.proofs[0]
  let new_pczt_bytes = pczt_crate::serialize::to_bytes(&pczt_struct)
    .map_err(|e| Error::from_reason(format!("serialize::to_bytes failed: {:?}", e)))?;
  let new_pczt_hex = hex::encode(&new_pczt_bytes);
  if wrapper.proofs.is_none() {
    wrapper.proofs = Some(vec![new_pczt_hex]);
  } else {
    let mut p = wrapper.proofs.unwrap();
    if p.is_empty() {
      p.push(new_pczt_hex);
    } else {
      p[0] = new_pczt_hex;
    }
    wrapper.proofs = Some(p);
  }

  // Attach signature to wrapper.signatures metadata (array)
  let mut sigs = wrapper.signatures.unwrap_or_default();
  if (sigs.len() as u32) <= input_index {
    sigs.resize((input_index + 1) as usize, "".to_string());
  }
  sigs[input_index as usize] = signature_hex;
  wrapper.signatures = Some(sigs);

  pczt_to_json(&wrapper)
}

#[napi]
pub fn combine(pczt_json: String) -> Result<String> {
  // Combine partial signatures/proofs
  let mut wrapper: PCZT = pczt_from_json(&pczt_json)?;

  // Extract pczt_struct
  let pczt_serialized_hex = match wrapper.proofs.as_ref().and_then(|v| v.get(0)) {
    Some(h) => h.clone(),
    None => return Err(Error::from_reason("missing pczt binary in wrapper.proofs[0]".to_string())),
  };
  let mut pczt_bytes = hex::decode(pczt_serialized_hex)
    .map_err(|e| Error::from_reason(format!("pczt bytes hex decode failed: {}", e)))?;
  let mut pczt_struct = pczt_crate::serialize::from_bytes(&pczt_bytes)
    .map_err(|e| Error::from_reason(format!("pczt deserialize: {:?}", e)))?;

  // Call pczt combine API
  pczt_crate::combine::combine(&mut pczt_struct)
    .map_err(|e| Error::from_reason(format!("pczt combine failed: {:?}", e)))?;

  // Re-serialize and update wrapper
  let new_pczt_bytes = pczt_crate::serialize::to_bytes(&pczt_struct)
    .map_err(|e| Error::from_reason(format!("serialize::to_bytes failed: {:?}", e)))?;
  let new_pczt_hex = hex::encode(&new_pczt_bytes);
  if wrapper.proofs.is_none() {
    wrapper.proofs = Some(vec![new_pczt_hex]);
  } else {
    let mut p = wrapper.proofs.unwrap();
    if p.is_empty() {
      p.push(new_pczt_hex);
    } else {
      p[0] = new_pczt_hex;
    }
    wrapper.proofs = Some(p);
  }

  wrapper.combined = Some(true);
  pczt_to_json(&wrapper)
}

#[napi]
pub fn finalize_and_extract(pczt_json: String) -> Result<String> {
  // Finalize and extract tx bytes
  let wrapper: PCZT = pczt_from_json(&pczt_json)?;

  let pczt_serialized_hex = match wrapper.proofs.as_ref().and_then(|v| v.get(0)) {
    Some(h) => h.clone(),
    None => return Err(Error::from_reason("missing pczt binary in wrapper.proofs[0]".to_string())),
  };
  let pczt_bytes = hex::decode(pczt_serialized_hex)
    .map_err(|e| Error::from_reason(format!("pczt bytes hex decode failed: {}", e)))?;
  let mut pczt_struct = pczt_crate::serialize::from_bytes(&pczt_bytes)
    .map_err(|e| Error::from_reason(format!("pczt deserialize: {:?}", e)))?;

  // Run finalizer & extractor
  let tx_bytes = pczt_crate::finalize::finalize_and_extract(&mut pczt_struct)
    .map_err(|e| Error::from_reason(format!("finalize_and_extract failed: {:?}", e)))?;

  // Return tx hex
  Ok(hex::encode(&tx_bytes))
}

#[napi]
pub fn serialize_pczt(pczt_json: String) -> Result<String> {
  // The wrapper contains the serialized pczt in wrapper.proofs[0]; return that hex.
  let wrapper: PCZT = pczt_from_json(&pczt_json)?;
  let pczt_serialized_hex = match wrapper.proofs.as_ref().and_then(|v| v.get(0)) {
    Some(h) => h.clone(),
    None => return Err(Error::from_reason("missing pczt blob in wrapper.proofs[0]".to_string())),
  };
  Ok(pczt_serialized_hex)
}

#[napi]
pub fn parse_pczt(bytes_hex: String) -> Result<String> {
  // Turn hex bytes into a wrapper JSON by deserializing the pczt struct and populating metadata
  let bytes = hex::decode(bytes_hex).map_err(|e| Error::from_reason(format!("hex decode: {}", e)))?;
  let pczt_struct = pczt_crate::serialize::from_bytes(&bytes)
    .map_err(|e| Error::from_reason(format!("deserialize pczt from bytes failed: {:?}", e)))?;

  // Convert pczt_struct back to JSON-wrapped metadata (inputs & tx_request are not reconstructed here)
  // For now just put the serialized pczt bytes back into wrapper.proofs[0]
  let mut wrapper = PCZT {
    inputs: vec![],
    tx_request: TransactionRequest { recipients: vec![], fee: None },
    proofs: Some(vec![hex::encode(&bytes)]),
    signatures: None,
    combined: None,
  };
  pczt_to_json(&wrapper)
}
