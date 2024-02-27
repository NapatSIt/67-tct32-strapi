const md5 = require("md5");
module.exports = {
  async beforeCreate(event) {
    // ...
    console.log("beforeCreate is worked...", event.params.data);
    //event.params.data.mobile = "KFC1150";
    event.params.data.mobile = md5(event.params.data.mobile);

    return;
  },
};
