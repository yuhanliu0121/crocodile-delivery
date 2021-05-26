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
const ugGoodsCateRef = db.collection("ugGoodsCate");
const ugGoodsRef = db.collection("ugGoods");
const _ = db.command;
const $ = _.aggregate;
// 云函数入口函数
exports.main = async (event, context) => {
  const { shopId, requireType } = event;
  const openid = cloud.getWXContext().OPENID;

  // 从数据库返回指定商店的商品分类和各类下的商品数据
  // 商品分类和商品都已经按照cateOrder和goodsOrder排好序
  // cateOrder越小越靠前
  // goodsOrder同上

  switch (requireType) {
    // 返回当前商店的所有商品（用于用户进入自营店需要浏览所有商品的情况）
    case "all":
      return await requireAllUgGoods(shopId);

    // 只返回用户自己发布的商品（用于用户查看自己上传的商品的情况）
    case "my":
      return await requireMyUgGoods(shopId, openid);

    case "censor":
      return requireCensorUgGoods(shopId)
  }
};

// 返回自营店的所有数据
async function requireAllUgGoods(shopId) {
  let res = await ugGoodsCateRef
    .aggregate()
    .match({
      shopId: shopId,
      isExist: true,
    })
    .sort({
      cateOrder: 1,
    })
    .lookup({
      from: "ugGoods",
      let: { goodsCate_cateId: "$cateId" },
      pipeline: $.pipeline()
        .sort({
          goodsOrder: 1,
        })
        .match(
          _.expr(
            $.and([
              $.eq(["$cateId", "$$goodsCate_cateId"]),
              $.eq(["$isExist", true]),
              $.eq(["$status", 1]),
            ])
          )
        )
        .done(),
      as: "goods",
    })
    .end();

  return {
    allGoods: res.list,
    errMsg: res.errMsg,
  };
}

// 返回当前用户在自营店上传的商品
async function requireMyUgGoods(shopId, openid) {
  let res = await ugGoodsRef
    .where({
      shopId: shopId,
      _openid: openid,
      isExist: true,
    })
    .field({
      _id: false,
    })
    .get();
  console.log("res", res);

  return {
    allGoods: res.data,
    errMsg: res.errMsg,
  };
}

// 返回需要审查的商品
async function requireCensorUgGoods(shopId) {
  let res = await ugGoodsRef
  .where({
    isExist: true,
    status: 0,
  })
  .field({
    _id: false,
    _openid: false,
  })
  .orderBy("watermark", "asc")
  .get();
  return {
    allGoods: res.data,
    errMsg: res.errMsg,
  };
}
