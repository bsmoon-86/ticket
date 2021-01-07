export interface PublickeyRes {
    id: string;
    type: string;
    controller: string;
    publicKeyHex?: string;
    publicKeyHash?: string;
}
export default class PublicKey {
    private id;
    private type;
    private controller;
    private publicKeyHex;
    private publicKeyHash;
    constructor(res: PublickeyRes);
    getId(): string;
    setId(id: string): void;
    getType(): string;
    setType(type: string): void;
    getController(): string;
    setController(controller: string): void;
    getPublicKeyHex(): string | null;
    setPublicKeyHex(publicKeyHex: string): void;
    getPublicKeyHash(): string | null;
    setPublicKeyHash(publicKeyHash: string): void;
}
