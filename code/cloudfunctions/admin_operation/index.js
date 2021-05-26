// 写了一些管理员会用到的操作

// 云函数入口文件
const cloud = require("wx-server-sdk");
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAcMIC_CURRENT_ENV,
});
const db = cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const _ = db.command;

const registerCodeRef = db.collection("registerCode");
const shopRef = db.collection("shop");
const goodsCateRef = db.collection("goodsCate");
const goodsRef = db.collection("goods");
const ownerRef = db.collection("owner");
const assistantRef = db.collection("assistant");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const type = event.type;

  if (type === "addShopRegistCode") {
    const code = event.code;
    return await addShopRegistCode(openid, code);
  }

  if (type === "deleteShop") {
    const shopId = event.shopId;
    return await deleteShop(shopId);
  }
};

async function addShopRegistCode(openid, code) {
  return await registerCodeRef.add({
    data: {
      _openid: openid,
      code: code,
      isUsed: false,
      type: "owner",
      watermark: new Date().getTime(),
    },
  });
}

async function deleteShop(shopId) {
  let tasks = [];
  tasks.push(shopRef.where({ shopId: shopId }).update({ data: { isExist: false } }));
  tasks.push(goodsCateRef.where({ shopId: shopId }).update({ data: { isExist: false } }));
  tasks.push(goodsRef.where({ shopId: shopId }).update({ data: { isExist: false } }));
  tasks.push(ownerRef.where({ shopId: shopId }).update({ data: { isExist: false } }));
  tasks.push(assistantRef.where({ shopId: shopId }).update({ data: { isExist: false } }));
  tasks.push(registerCodeRef.where({ shopId: shopId }).update({ data: { isExist: false } }));
  return await Promise.all(tasks);
}
