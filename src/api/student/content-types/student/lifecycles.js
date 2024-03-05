const crypto = require("crypto");
const md5 = require("md5");

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.SECRET_KEY);
const iv = process.env.SECRET_KEY_IV;

const encryptmobile = (mobile) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedmobile = cipher.update(mobile, "utf8", "hex");
  encryptedmobile += cipher.final("hex");

  encryptedmobile = padToLength(encryptedmobile, 128);

  return encryptedmobile;
};

const decryptmobile = (encryptedmobile) => {
  encryptedmobile = removePadding(encryptedmobile);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let mobile = decipher.update(encryptedmobile, "hex", "utf8");
  mobile += decipher.final("utf8");

  return mobile;
};

const padToLength = (string, length) => {
  if (string.length >= length) return string; // No need to pad
  const paddingLength = length - string.length;
  const padding = crypto.randomBytes(paddingLength).toString("hex");
  return string + padding;
};

const removePadding = (string) => {
  const paddingLength = 32;
  if (string.length > paddingLength) {
    return string.slice(0, paddingLength);
  } else {
    return string;
  }
};

module.exports = {
  async beforeCreate(event) {
    console.log("beforeCreate", event.params);
    event.params.data.mobile = encryptmobile(event.params.data.mobile);
  },
  async beforeUpdate(event) {
    console.log("beforeUpdate", event.params.data);
    event.params.data.mobile = encryptmobile(event.params.data.mobile);
  },
  async afterFindMany(event) {
    console.log("afterFindMany", event.result);
    event.result.forEach((item) => {
      if (item.mobile) {
        item.mobile = decryptmobile(item.mobile);
        console.log("afterFindMany :", item.mobile);
      }
    });
  },
  async afterFindOne(event) {
    console.log("afterFindOne", event.result);
    if (event.result && event.result.mobile) {
      event.result.mobile = decryptmobile(event.result.mobile);
      console.log("afterFindOne :", event.result.mobile);
    }
  },
};
