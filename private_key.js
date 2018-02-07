const nem = require("nem-sdk").default;
const networkId = nem.model.network.data.testnet.id;
const rBytes = nem.crypto.nacl.randomBytes(32);
const privateKey = nem.utils.convert.ua2hex(rBytes);
const keyPair = nem.crypto.keyPair.create(privateKey);
const address = nem.model.address.toAddress(keyPair.publicKey.toString(), networkId);

console.log(`Address   : ${address}`);
console.log(`PrivateKey: ${privateKey}`);
console.log(`PublicKey : ${keyPair.publicKey.toString()}`);