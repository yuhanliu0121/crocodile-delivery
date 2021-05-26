// 本云函数用于获取当前商店的订单
const cloud = require("wx-server-sdk");
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database({ env: "env-miamielm-5gliunnq19c0a342" });
const orderRef = db.collection("order");
const MAX_LIMIT = 30; // 单次返回最大量
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const { shopId, type, pageNum,orderId } = event;

  switch (type) {
    case "recent":
      return getRecentOrder(shopId, pageNum);

    case "old":
      return getOldOrder(shopId, pageNum);

    case "uncomplete":
      return getUncompleteOrder(shopId);
    case "any":
      return getAnyOrder(orderId);
  }
};

// 获取最近一周的订单
async function getRecentOrder(shopId, pageNum) {
  let timeCut = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
  const res = await orderRef
    .where({
      shopId: shopId,
      completeTime: _.gte(timeCut),
      status: _.in([-1, 3]),
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

// 获取一周前的订单
async function getOldOrder(shopId, pageNum) {
  let timeCut = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
  const res = await orderRef
    .where({
      shopId: shopId,
      completeTime: _.lte(timeCut),
      status: _.in([-1, 3]),
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

// 获取未完成的订单
async function getUncompleteOrder(shopId) {
  const res = await orderRef
    .where({
      shopId: shopId,
      status: _.in([0, 1, 2]),
      isExist: true,
    })
    .orderBy("selDeliverTime", "asc")
    .orderBy("payTime", "asc")
    .field({
      _id: false,
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
