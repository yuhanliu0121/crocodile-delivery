// 本云函数用于获取某个商店的商品分类及商品数据
const cloud = require("wx-server-sdk");
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const goodsCateRef = db.collection("goodsCate");
// 云函数入口函数
exports.main = async (event, context) => {
  const { shopId } = event;
  // 从数据库返回指定商店的商品分类和各类下的商品数据
  // 商品分类和商品都已经按照cateOrder和goodsOrder排好序
  // cateOrder越小越靠前
  // goodsOrder同上
  const _ = db.command;
  const $ = _.aggregate;
  let res = await goodsCateRef
    .aggregate()
    .match({
      shopId: shopId,
      isExist: true,
    })
    .sort({
      cateOrder: 1,
    })
    .lookup({
      from: "goods",
      let: { goodsCate_cateId: "$cateId" },
      pipeline: $.pipeline()
        .sort({
          goodsOrder: 1,
        })
        .match(_.expr($.and([$.eq(["$cateId", "$$goodsCate_cateId"]), $.eq(["$isExist", true])])))
        .done(),
      as: "goods",
    })
    .end();

  return {
    allGoods: res.list,
    errMsg: res.errMsg,
  };
};
