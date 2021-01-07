import getDocument from './src/didResolverAPI';
import DidResolver from './src/DidResolver';
import DidDocument from './src/document/DidDocument';
import MethodMetadata from './src/document/MethodMetadata';
import PublicKey from './src/document/PublicKey';
import ResolverMetadata from './src/document/ResolverMetadata';
import Service from './src/document/Service';
import * as signUtils from './src/util/signature';
declare const _default: {
    getDocument: typeof getDocument;
    RESOLVER_URL: {
        TESTNET: string;
        MAINNET: string;
    };
    DidResolver: typeof DidResolver;
    DidDocument: typeof DidDocument;
    MethodMetadata: typeof MethodMetadata;
    PublicKey: typeof PublicKey;
    ResolverMetadata: typeof ResolverMetadata;
    Service: typeof Service;
    signUtils: typeof signUtils;
};
export default _default;
