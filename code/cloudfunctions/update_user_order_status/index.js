// 本函数用于更改用户订单信息

const cloud = require("wx-server-sdk");
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});

const _ = db.command;
const orderRef = db.collection("order");
const goodsRef = db.collection("goods");

// 云函数入口函数
exports.main = async (event, context) => {
  const { updateInfo } = event;
  console.log("updateInfo", updateInfo);
  const { orderId, updateOrderInfo, updateType, cancelReason } = updateInfo;
  let orderRes = await orderRef //重新拉取一遍订单状态
    .where({
      orderId: orderId,
    })
    .field({
      _id: false,
    })
    .get();
  let orderInfo = orderRes.data[0];
  console.log("订单状态：", orderInfo);

  switch (updateType) {
    case -1: //取消订单
      if (orderInfo.status !== 0 && orderInfo.status !== -2) {
        //如果不是预订单或已被商家接单则无法取消
        return { data: [], errCode: 200 }; // errCode 200 表示商家已经接单从而无法取消订单
      }
      let cancelTime = new Date().getTime();
      const res = orderRef
        .where({
          orderId: orderInfo.orderId,
        })
        .update({
          data: {
            status: -1,
            cancelReason: cancelReason,
            completeTime: cancelTime,
          },
        });
      return res;

    case 0: //将预订单改为正式订单
      let currentTime = new Date().getTime();
      if (orderInfo.status != -2) {
        //如果不是预订单无法继续操作
        return;
      }

      await reduceGoodsStock(orderInfo);

      const res0 = orderRef
        .where({
          orderId: orderInfo.orderId,
        })
        .update({
          data: {
            status: 0,
            payTime: currentTime,
            ...updateOrderInfo,
          },
        });
      return res0;

    default:
      return;
  }
};

// 如果成功下单则需要减少商品库存
async function reduceGoodsStock(orderInfo) {
  const validGoods = orderInfo.validGoods;
  let tasks = [];
  for (let i = 0; i < validGoods.length; i++) {
    let goodsAvailable = validGoods[i].goodsStock - validGoods[i].num > validGoods[i].goodsBuyLeastLimit
    let temp = goodsRef
      .where({
        goodsId: validGoods[i].goodsId,
      })
      .update({
        data: {
          goodsStock: _.inc(-validGoods[i].num),
          goodsAvailable: goodsAvailable,
        },
      });
    tasks.push(temp);
  }
  await Promise.all(tasks);
}
