const encryptedVp = require('./encryptedVp');
const rsaPrivateKeyJwk = require('./rsaPrivateKeyJwk');

module.exports = {
  // Auth server url
  authServer: 'https://testauth.metadium.com',
  // SP 서비스 아이디
  serviceId: '10523b7c-7cc2-11eb-a5b1-02c81e87218a',
  // Testnet did resolver url
  resolver: 'https://testnetresolver.metadium.com//1.0',
  // 테스트용 샘플
  sample: {
    // VP issuer
    did: 'did:meta:testnet:0000000000000000000000000000000000000000000000000000000000000c2e',
    // rsaPublicKeyJwk 로 암호화된 vp
    encryptedVp,
    // 암호화된 vp를 복호화할 때 사용하는 private key
    rsaPrivateKeyJwk,
  },
};
