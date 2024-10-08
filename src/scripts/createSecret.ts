const nodeCrypto = require("crypto");

const randomKey = nodeCrypto.randomBytes(32).toString("hex");
console.log({ randomKey });
