// 本云函数用于获取当前用户的最近100条订单
const cloud = require("wx-server-sdk");
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database({ env: "env-miamielm-5gliunnq19c0a342" });
const orderRef = db.collection("order");
const MAX_LIMIT = 20;
const _ = db.command;

exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { type, pageNum, orderId } = event;

  switch (type) {
    case "uncomplete":
      return getUncompleteOrder(openid);
    case "complete":
      return getCompleteOrder(openid, pageNum);
    case "any":
      return getAnyOrder(orderId);
  }
};

async function getUncompleteOrder(openid) {
  const res = await orderRef
    .where({
      _openid: openid,
      status: _.or([_.eq(0), _.eq(1), _.eq(2)]),
      isExist: true,
    })
    .orderBy("createTime", "desc")
    .field({
      _id: false,
      _openid: false,
    })
    .get();
  return res;
}

async function getCompleteOrder(openid, pageNum) {
  const res = await orderRef
    .where({
      _openid: openid,
      status: _.or([_.eq(-1), _.eq(3)]),
      isExist: true,
    })
    .orderBy("completeTime", "desc")
    .skip(MAX_LIMIT * pageNum)
    .limit(MAX_LIMIT)
    .field({
      _id: false,
      _openid: false,
    })
    .get();
  return res;
}

async function getAnyOrder(orderId) {
  const res = await orderRef
    .where({
      orderId: orderId,
      isExist: true,
    })
    .get();
  return res;
}
