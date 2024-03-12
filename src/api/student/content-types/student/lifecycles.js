const md5 = require("md5");
const cryptoJs = require("crypto-js");
const cryptoKey = "my-secret-key";

const appId = "api::student.student";
module.exports = {
  async beforeCreate(event) {
    // console.log('beforeCreate is worked...', event.params.data)
    // event.params.data.mobile = 'demo-hook'
    // event.params.data.mobile = md5(event.params.data.mobile)
    const mobile = event.params.data.mobile;
    // const makeEncrypt = cryptoJs.AES.encrypt(mobile, cryptoKey).toString()

    event.params.data.mobile = await strapi.service(appId).encrypt(mobile);
  },
  async afterFindOne(event) {
    // console.log('afterFindOne ', event.result.mobile)

    const mobile = event.result.mobile;
    // const makeDecrypt = cryptoJs.AES.decrypt(mobile, cryptoKey)
    // const makeToString = makeDecrypt.toString(cryptoJs.enc.Utf8)
    event.result.mobile = await strapi.service(appId).decrypt(mobile);
  },
  async afterFindMany(event) {
    console.log("afterFindMany ", event.result);
    event?.result?.map(async (result) => {
      console.log("result ", result);
      result.mobile = await strapi.service(appId).decrypt(result.mobile);
      return result;
    });
  },
};
