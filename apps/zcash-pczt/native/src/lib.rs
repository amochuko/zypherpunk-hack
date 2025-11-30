// native/src/lib.rs
//! Native napi-rs bindings that call into the real `pczt` and `zcash_primitives` crates.
//!

use napi::{bindgen_prelude::*, Error};
use napi_derive::napi;

use serde::{Deserialize, Serialize};
use serde_json;

use tokio::task;
use hex;

use pczt;
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
  pub script_pub_key: String,
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
/// For performance/accuracy, this should move to the pczt crate's binary serialization
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


