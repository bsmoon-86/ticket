export interface ServiceRes {
    id: string;
    publicKey: string;
    type: string;
    serviceEndpoint: string;
}
export default class Service {
    private id;
    private publicKey;
    private type;
    private serviceEndpoint;
    constructor(res: ServiceRes);
    getId(): string;
    setId(id: string): void;
    getPublicKey(): string;
    setPublicKey(publicKey: string): void;
    getType(): string;
    setType(type: string): void;
    getServiceEndpoint(): string;
    setServiceEndpoint(serviceEndpoint: string): void;
}
