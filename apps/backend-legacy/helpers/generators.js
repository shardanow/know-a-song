const bcrypt = require('bcrypt');
const crypto = require('crypto');

class generators {
    randomTokenKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    async hashPassword(password) {
        return bcrypt.hash(password, 12);
    }

    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
}

module.exports = new generators();
