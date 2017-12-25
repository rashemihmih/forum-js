const crypto = require('crypto');

const SALT_LENGTH = 10;

function generateSalt() {
    let salt = '';
    for (let i = 0; i < SALT_LENGTH; i++) {
        salt += Math.floor(16 * Math.random()).toString(16);
    }
    return salt;
}

function hash(data) {
    let hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

function encode(password, salt) {
    if (salt === undefined) {
        salt = generateSalt();
    }
    return salt + hash(salt + hash(password));
}

function matches(password, passwordHash) {
    let salt = passwordHash.substring(0, SALT_LENGTH);
    return encode(password, salt) === passwordHash;
}

module.exports.encode = encode;
module.exports.matches = matches;