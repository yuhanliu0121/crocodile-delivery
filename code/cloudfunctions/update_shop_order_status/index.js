// 本函数用于更改商家订单信息
const cloud = require("wx-server-sdk");
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const orderRef = db.collection("order");

// 云函数入口函数
exports.main = async (event, context) => {
  const { updateInfo } = event;
  console.log("updateInfo", updateInfo);
  const orderId = updateInfo.orderId
  const updateOrderInfo = updateInfo.orderInfo
  const updateType = updateInfo.updateType
  let orderRes = await orderRef//重新拉取一遍订单状态
    .where({
      orderId: orderId,
    })
    .get();
  let orderInfo = orderRes.data[0]
  console.log("订单状态：",orderInfo);
  let currentTime = (new Date()).getTime();
  switch (updateType) {
    case -1://取消订单
      const res = orderRef.where({
        orderId:orderInfo.orderId
      })
      .update({
        data:{
          status:-1
        }
      })
      return res
      break;

    case 1://接单
      if (orderInfo.status!=0){//如果不是未接单订单无法继续操作
        return
      }
      const res1 = orderRef.where({
        orderId:orderInfo.orderId
      })
      .update({
        data:{
          status:1,
          handleTime: currentTime,
          //...updateOrderInfo,
        }
      })
      return res1
      break;

    case 2://完成捡货并开始配送
      if (orderInfo.status!=1){//如果不是已接单订单无法继续操作
        return
      }
      const res2 = orderRef.where({
        orderId:orderInfo.orderId
      })
      .update({
        data:{
          status:2,
          deliverTime: currentTime,
          //...updateOrderInfo,
        }
      })
      return res2
      break;

    case 3://配送完成
      if (orderInfo.status!=2){//如果不是已捡货订单无法继续操作
        return
      }
      const res3 = orderRef.where({
        orderId:orderInfo.orderId
      })
      .update({
        data:{
          status:3,
          completeTime: currentTime,
          //...updateOrderInfo,
        }
      })
      return res3
      break;
  
    default:
      return
      break;
  }
}