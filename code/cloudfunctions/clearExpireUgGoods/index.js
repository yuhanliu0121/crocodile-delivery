// 用户点击以店主身份登录或者以店员身份登录时需要拉取的和用户有关的商店数据
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
// 获取shop表的引用
const ugGoodsRef = db.collection("ugGoods");
// 云函数入口函数
exports.main = async (event, context) => {
  now = (new Date()).getTime()
  const clearRes = await ugGoodsRef.where({
    expireTime: _.lte(now)
  }).update({data:{
    isExist:true
  }})


  return clearRes
}