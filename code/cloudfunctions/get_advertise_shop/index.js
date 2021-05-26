// 本云函数用于获取当前商店的订单
const cloud = require("wx-server-sdk");
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database({ env: "env-miamielm-5gliunnq19c0a342" });
const advertiseShopRef = db.collection("advertiseShop");
const MAX_LIMIT = 100; // 单次返回最大量
const _ = db.command;
const $ = _.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const res = await advertiseShopRef
  .aggregate()
  .lookup({
    from: "shop",
    localField: "shopId",
    foreignField: "shopId",
    as: "shopList"
  })
  .replaceRoot({
    newRoot: $.mergeObjects([ $.arrayElemAt(['$shopList', 0]), '$$ROOT' ])
  })
  .project({
    shopList: 0
  })
  .sort({
    shopRank: -1,
  })
  .end()
  return{
    allShops: res.list,
    errMsg: res.errMsg,
  }
}