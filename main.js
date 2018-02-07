const readlineSync = require('readline-sync');
const nem = require("nem-sdk").default;
const QRCode = require('qrcode');

class NemOfflineTransaction {
    constructor(networkId) {
        this.networkId = networkId;
    }

    start() {
        // [1] 入力
        this.keyIn();
        // [2] 確認
        this.confirm();
        // [3] 署名付きのトランザクション生成
        const tx = this.generateTransaction();
        // [4] QRコードへ変換
        this.generateQRCode(tx);
    }

    keyIn() {
        this.recipient = readlineSync.question('Recipient: ');
        this.amount = readlineSync.question('Amount: ');
        // 便宜上 標準入力で privateKey を渡す
        this.privateKey = readlineSync.question('PrivateKey: ', { hideEchoBack: true });
        this.keyPair = nem.crypto.keyPair.create(this.privateKey);
        this.address = nem.model.address.toAddress(this.keyPair.publicKey.toString(), this.networkId);
    }

    confirm() {
        console.log(`\n---------------------------------------------------------------`);
        console.log(`[1]      Your address: ${this.address}`);
        console.log(`[2] Recipient address: ${this.recipient}`);
        console.log(`[3]            amount: ${this.amount} XEM`);
        console.log(`---------------------------------------------------------------`);
        if (!readlineSync.keyInYN('Are you sure?:')) {
        process.exit(0);
        }
    }

    generateTransaction() {
        // [1] 未署名のトランザクション生成
        const txEntity = this.generateUnsignedTransaction();
        const serializeTx = nem.utils.serialization.serializeTransaction(txEntity);
        // [2] トランザクションに署名
        const signature = this.generateSignature(this.keyPair, serializeTx);
        // [3] announce で送信できる形式に変換
        return JSON.stringify({
        'data': nem.utils.convert.ua2hex(serializeTx),
        'signature': signature.toString()
        });
    }

    // トランザクションへの署名
    generateSignature(keyPair, unsignedTx) {
        return keyPair.sign(unsignedTx);
    }

    // 未署名のTransactionの生成
    generateUnsignedTransaction() {
        const tx = nem.model.objects.create("transferTransaction")(this.recipient, this.amount, null);
        const common = nem.model.objects.create("common")("", this.privateKey);
        return nem.model.transactions.prepare("transferTransaction")(common, tx, this.networkId);
    }

    // QRコードをファイルとして書き出す
    generateQRCode(tx) {
        QRCode.toFile(`${this.address}_${this.recipient}_${this.amount}.png`, tx);
    }
}

// 本番系でやるには `testnet` => `mainnet` に変換
const network = nem.model.network.data.testnet.id;
offlineTx = new NemOfflineTransaction(network);
offlineTx.start();