import DidDocument, { DidDocumentRes } from './document/DidDocument';
import ResolverMetadata, { ResolverMetadataRes } from './document/ResolverMetadata';
import MethodMetadata, { MethodMetadataRes } from './document/MethodMetadata';
export interface DidResolverRes {
    redirect: object | null;
    didDocument: DidDocumentRes;
    resolverMetadata: ResolverMetadataRes;
    methodMetadata: MethodMetadataRes;
    success: boolean | undefined;
    message: string | undefined;
}
/**
 * DID resolver response data
 */
export default class DidResolver {
    private redirect;
    private didDocument;
    private resolverMetadata;
    private methodMetadata;
    private success;
    private message;
    constructor(res: DidResolverRes);
    getRedirect(): object | null;
    setRedirect(redirect: object): void;
    getDidDocument(): DidDocument;
    setDidDocument(didDocument: DidDocumentRes): void;
    getResolverMetadata(): ResolverMetadata;
    setResolverMetadata(resolverMetadata: ResolverMetadataRes): void;
    getMethodMetadata(): MethodMetadata;
    setMethodMetadata(methodMetadata: MethodMetadataRes): void;
    getSuccess(): boolean;
    setSuccess(success: boolean): void;
    getMessage(): string;
    setMessage(message: string): void;
}
