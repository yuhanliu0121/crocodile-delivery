// 本函数用于生成预订单 也就是用户点击结算以后的页面信息
// 云函数入口文件
const cloud = require("wx-server-sdk");
// 精确加减乘除运算模块 https://github.com/nefe/number-precision
const NP = require("number-precision");
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const goodsRef = db.collection("goods");
const shopRef = db.collection("shop");
const orderRef = db.collection("order");
const MAX_LIMIT = 100;
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取下单的用户的openid以及购物车数据
  const openid = cloud.getWXContext().OPENID;
  const { shopCart } = event;
  console.log("shopCart", shopCart);

  // 1 根据shopId拉取商家信息 确认下单的商店还在平台
  const res1 = await shopRef
    .where({
      shopId: shopCart.shopId,
    })
    .field({ _id: false, _openid: false })
    .get();
  const shopInfo = res1.data[0];
  console.log("shopInfo", shopInfo);
  if (!shopInfo || !shopInfo.isExist) {
    return {
      errCode: 100, // 100分为1和00 1只是一个前缀表示错误 00表示商店不存在
    };
  }

  // 2 确认商家现在可以接单
  console.log("Shopstatus:", shopInfo.shopStatus);

  if (shopInfo.shopStatus === 0) {
    console.log("无法接单");

    return {
      errCode: 101, // 100分为1和00 1只是一个前缀表示错误 01表示商店暂停接单
    };
  }

  // 3 从数据库重新获取一遍用户所购买的所有商品

  // 计算有多少商品
  const batchTimes = shopCart.goods.length;
  // 承载所有读操作的 promise 的数组
  const tasks = [];
  for (let i = 0; i < batchTimes; i++) {
    const promise = goodsRef
      .where({
        goodsId: shopCart.goods[i].goodsId,
      })
      .get();
    tasks.push(promise);
  }
  // 等待所有查询结果返回
  const res2 = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    };
  });
  let goodsFromDataBase = res2.data;
  // 从购物车数据中提出每个商品购买数量
  let goodsNum = {};
  for (let item of shopCart.goods) {
    goodsNum[item.goodsId] = item.num;
  }
  console.log("goodsNum", goodsNum);
  // 将每个商品购买数量添加到从数据库获取的商品属性中
  goodsFromDataBase = goodsFromDataBase.map((v) => ({
    ...v,
    num: goodsNum[v.goodsId],
  }));
  console.log("goodsFromDataBase", goodsFromDataBase);

  // 3.1 将有效的商品挑出来
  /** 注意：用户购买的商品一共有以下几种情况 完全无法买的算作无效商品
   *  1 商品已经被删除 (inValidGoods)
   *  2 商品没有删除但已经下架 (unAvailableGoods)
   *  3 商品正上架但是商品购买量大于库存量 (shortOfStockGoods)
   *  4 没问题 (validGoods)
   *
   * 另外 这里并没有对goodsBuyLeastLimit 和 goodsBuyLimit做检查 后面有空再改
   */
  let validGoods = []; // 有效商品
  let unAvailableGoods = []; // 已经下架的商品
  let inValidGoods = []; // 已经被删除的商品
  let shortOfStockGoods = []; // 购买量大于库存的商品

  for (let i = 0, len = goodsFromDataBase.length; i < len; i++) {
    if (!goodsFromDataBase[i].isExist) {
      // 已经被删除的商品
      inValidGoods.push(goodsFromDataBase[i]);
      continue;
    }
    if (!goodsFromDataBase[i].goodsAvailable) {
      // 已经下架的商品
      unAvailableGoods.push(goodsFromDataBase[i]);
      continue;
    }
    if (goodsFromDataBase[i].num > goodsFromDataBase[i].goodsStock) {
      // 用户欲购买量大于库存量的商品
      shortOfStockGoods.push(goodsFromDataBase[i]);

      // 记录用户欲购买量
      goodsFromDataBase[i].oldNum = goodsFromDataBase[i].num;
      // 修改用户欲购买量为最大库存量
      goodsFromDataBase[i].num = goodsFromDataBase[i].goodsStock;
      // 存入validGoods数组
      validGoods.push(goodsFromDataBase[i]);
      continue;
    }
    validGoods.push(goodsFromDataBase[i]);
  }
  // console.log("validGoods",validGoods);
  // console.log("unAvailableGoods",unAvailableGoods);
  // console.log("inValidGoods",inValidGoods);
  // console.log("shortOfStockGoods",shortOfStockGoods);
  // console.log('******************************');

  // 3.2 重新计算价格
  let totalPrice = 0;
  let totalNum = 0;
  // 计算有效商品的总价
  validGoods.forEach((v) => {
    totalPrice = NP.plus(totalPrice, NP.times(v.goodsPrice, v.num));
    totalNum = NP.plus(totalNum, v.num);
  });

  // 计算服务费 配送费 
  let serviceFee = NP.times(totalPrice, shopInfo.serviceFeePercent / 100);
  let deliverFee = NP.times(totalPrice, shopInfo.deliverFeePercent / 100);

  // 四舍五入到第二位小数
  serviceFee = NP.round(serviceFee,2)
  deliverFee = NP.round(deliverFee,2)

  totalPrice = NP.plus(totalPrice,serviceFee,deliverFee)

  // 计算是否可以下单
  const isCheckOutActive = totalPrice >= shopInfo.minConsumption;

  // 如果有效商品的价格大于最低起送 则向数据库插入一条预订单
  // 否则直接将核验后订单返回

  // 在order数据库中先添加一条预订单 等用户确认下单后 再根据orderNumber更改订单状态即可
  // 在数据库中生成预订单
  // 现在默认用户点击一次结算就下一个预订单并写入数据库
  // 但假如用户没有买到最低消费 退出结算界面新买东西后再产生预订单 则之前没有买满的订单将永远无法得到修改 成为垃圾记录占据空间
  const orderId = "520" + new Date().getTime().toString() + parseInt(Math.random() * 10000).toString();

  // 生成订单creatTime
  const createTime = new Date().getTime();

  // 4 重新打包购物车数据并返回给前端交由顾客确认
  let preOrderInfo = {
    _openid: openid,
    shopId: shopInfo.shopId,
    shopName: shopInfo.shopName,
    shopPhoneNumber: shopInfo.shopPhoneNumber,
    minConsumption: shopInfo.minConsumption,
    isCheckOutActive: isCheckOutActive,
    totalPrice: totalPrice,
    totalNum: totalNum,
    validGoods: validGoods,
    unAvailableGoods: unAvailableGoods,
    inValidGoods: inValidGoods,
    shortOfStockGoods: shortOfStockGoods,
    orderId: orderId,
    serviceFee:serviceFee,
    deliverFee:deliverFee,
    createTime: createTime,
    status: -2,
    isExist: true,
  };

  // 如果消费金额大于起送金额则将当前核验单插入数据库成为预订单
  if (isCheckOutActive) {
    console.log("加入预订单");

    const resOrder = await orderRef.add({
      data: { ...preOrderInfo },
    });
    return {
      preOrderInfo,
      resOrder,
      shopInfo: shopInfo,
      errCode: 200, // 表示成功
    };
  } else {
    return {
      preOrderInfo,
      resOrder: {},
      shopInfo: shopInfo,
      errCode: 102, // 表示检查库存后实际可成交金额小于最小消费额
    };
  }
};
