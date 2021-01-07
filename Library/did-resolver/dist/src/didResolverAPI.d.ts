import DidDocument from './document/DidDocument';
export declare const RESOLVER_URL: {
    TESTNET: string;
    MAINNET: string;
};
/**
 * Request did document
 * @param did to search. did:meta:(testnet|mainnet):{meta_id}
 * @param noCache if true, did resolver does not cache did document
 * @return Did document. if not exists did or occur io error, return null
 */
export default function getDocument(did: string, resolver?: string | null, noCache?: boolean): Promise<DidDocument | null>;
