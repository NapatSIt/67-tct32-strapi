const crypto = require("crypto");
const md5 = require("md5");

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.SECRET_KEY); // Should be a 32-byte key for aes-256
const iv = process.env.SECRET_KEY_IV; // Should be a 16-byte IV for aes-256-cbc

const encryptmobile = (mobile) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedmobile = cipher.update(mobile, "utf8", "hex");
  encryptedmobile += cipher.final("hex");
  // Pad the encrypted phone number to ensure it's at least 128 characters long
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

// Custom padding function to ensure fixed length
const padToLength = (string, length) => {
  if (string.length >= length) return string; // No need to pad
  const paddingLength = length - string.length;
  const padding = crypto.randomBytes(paddingLength).toString("hex");
  return string + padding;
};

// Custom function to remove padding
const removePadding = (string) => {
  const paddingLength = 32; // Number of characters to remove
  if (string.length > paddingLength) {
    return string.slice(0, paddingLength); // Remove trailing characters
  } else {
    return string; // No padding to remove
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
