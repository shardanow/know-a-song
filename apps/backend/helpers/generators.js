const CryptoJS = require("crypto-js");

class generators {
    randomTokenKey() {
        let rand = function () {
            return Math.random().toString(36).substring(2); // remove `0.`
        };

        const token = function () {
            return rand() + rand(); // to make it longer let's double it
        };

        return token();
    }

    encryptStringData(string) {
        return CryptoJS.AES.encrypt(string, process.env.SECRET_KEY_SALT, {
            keySize: 16,
            iv: process.env.SECRET_KEY_IV,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
    }

    decryptStringData(string) {
        return CryptoJS.AES.decrypt(string, process.env.SECRET_KEY_SALT, {
            keySize: 16,
            iv: process.env.SECRET_KEY_IV,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
    }
}

module.exports = new generators();