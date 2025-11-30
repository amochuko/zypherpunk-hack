export type TxIn = { txid: string; vout: number };
export type PrevTxOut = { value: number; scriptPubKey: string };
export type TxOut = { address: string; value: number };
export type TransactionRequest = { recipients: TxOut[]; fee?: number };

export type PCZT = any;
export type SigHash = string; // hex
export type TransactionBytes = string; // hex

// Error types
export class ProposalError extends Error {}
export class ProverError extends Error {}
export class VerificationFailure extends Error {}
export class SighashError extends Error {}
export class SignatureError extends Error {}
export class CombineError extends Error {}
export class FinalizationError extends Error {}
export class ParseError extends Error {}
