export interface MethodMetadataRes {
    network: string;
    registryAddress: string;
}
export default class MethodMetadata {
    private network;
    private registryAddress;
    constructor(res: MethodMetadataRes);
    getNetwork(): string;
    setNetwork(network: string): void;
    getRegistryAddress(): string;
    setRegistryAddress(registryAddress: string): void;
}
