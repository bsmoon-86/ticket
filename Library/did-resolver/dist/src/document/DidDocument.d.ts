import PublicKey, { PublickeyRes } from './PublicKey';
import Service, { ServiceRes } from './Service';
export interface DidDocumentRes {
    '@context': string;
    id: string;
    publicKey?: PublickeyRes[];
    authentication?: string[];
    service?: ServiceRes[];
}
export default class DidDocument {
    private context;
    private id;
    private publicKey;
    private authentication;
    private service;
    constructor(res: DidDocumentRes);
    getContext(): string;
    setContext(context: string): void;
    getId(): string;
    setId(id: string): void;
    getPublicKey(): PublicKey[];
    setPublicKey(publicKey: PublickeyRes[]): void;
    getAuthentication(): string[];
    setAuthentication(authentication: string[]): void;
    getService(): Service[];
    setService(service: ServiceRes[]): void;
    /**
     * Find public key of service
     * @param serviceId to find
     * @return find result
     */
    hasServicePublicKey(serviceId: string): boolean;
    /**
     * Get public key with key id
     * @param keyId
     * @return public key object
     */
    getOnePublicKey(keyId: string): PublicKey | null;
    /**
     * Find public key hash with address
     * @param address
     * @return find result
     */
    hasPublicKeyWithAddress(did: string, svc_id: string, address: string): boolean;
    /**
     * Find autg with address
     * @param did
     * @param svc_id
     * @param address
     * @return find result
     */
    hasAuthWithAddress(did: string, svc_id: string, address: string): boolean;
    /**
     * Get public keys of authentication
     * @return public key list
     */
    getPublicKeyOfAuthentication(): PublicKey[];
    /**
     * verify signature and check if address is owned by did
     * @param did used when signing
     * @param svc_id used when signing
     * @param message used when signing
     * @param signature signature
     * @return if verified and is address of did owner, return true
     * @throws SignatureException
     */
    hasRecoverAddressFromSignature(did: string, svc_id: string, message: string, signature: string): boolean;
}
