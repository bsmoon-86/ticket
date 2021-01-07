/// <reference types="node" />
/**
 * Compute public key from signature of secp256k1
 * @param message to sign
 * @param signature secp256k1 signature. hex string of V+R+S
 * @return ec public key
 */
export declare function publicKeyFromSignature(message: string, signature: string): Buffer;
export declare function toAddress(publicKey: Buffer): string;
/**
 * Compute address of public key from signature of secp256k1
 * @param message to sign
 * @param signature secp256k1 signature. hex string of V+R+S
 * @return address
 */
export declare function addressFromSignature(message: string, signature: string): string;
