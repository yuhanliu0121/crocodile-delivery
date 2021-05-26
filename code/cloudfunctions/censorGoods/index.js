// 审核用户发布的商品

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
const $ = db.command.aggregate;

// 获取ugGoods表的引用
const ugGoodsRef = db.collection("ugGoods");

// 云函数入口函数
exports.main = async (event, context) => {
  const { goodsInfo } = event;
  return await ugGoodsRef
    .where({
      goodsId: goodsInfo.goodsId,
    })
    .update({ data: { ...goodsInfo } });
};
