// 本函数用于给用户发推送信息
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
  console.log(event)
  switch (event.action) {
    case 'sendAcceptMessage': {
      return sendAcceptMessage(event)
    }
    case 'sendFinishPickGoodsMessage': {
      return sendFinishPickGoodsMessage(event)
    }
    case 'sendArrivedMessage': {
      return sendArrivedMessage(event)
    }
    default: {
      return
    }
  }
}

async function sendAcceptMessage(event) {
  const OPENID = event.openid
  const orderId = event.orderId
  const shopName = event.shopName
  const shopPhoneNumber = event.phoneNumber
  const handleTimeStr = event.handleTimeStr
  console.log(shopPhoneNumber);

  let templateShopName = shopName.length > 19 ? shopName.slice(0, 15) + "..." : shopName;

  const templateId = '--o3q1SUOMEYyE5hCzgG4ayho__1YObjp8QFIZyEJj0'
  try {
    const sendResult = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      templateId,
      miniprogram_state: 'developer',
      page: "pages/localPages/myOrder/myOrder?activeTab=0",
      // 此处字段应修改为所申请模板所要求的字段
      data: {
        thing1: {
          value: templateShopName,
        },
        thing3: {
          value: '点击查看订单详情',
        },
        time4: {
          value: handleTimeStr,
        },
      }
    })
    return sendResult
  } catch (error) {
    return error
  }
}


async function sendFinishPickGoodsMessage(event) {
  const OPENID = event.openid
  const orderId = event.orderId
  const deliverTimeStr = event.deliverTimeStr
  const templateId = 'VsIZkMmPSzVdFlVJIG2N9AWl95-SBurq0yLKyGa4Pkk'
  try {
    const sendResult = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      templateId,
      miniprogram_state: 'developer',
      page: "pages/localPages/myOrder/myOrder?activeTab=0",
      // 此处字段应修改为所申请模板所要求的字段
      data: {
        character_string4: {
          value: orderId,
        },
        time3: {
          value: deliverTimeStr,
        },
        thing2: {
          value: '点击查看订单详情',
        },
      }
    })
    return sendResult
  } catch (error) {
    return error
  }

}


async function sendArrivedMessage(event) {
  const OPENID = event.openid
  const orderId = event.orderId
  const completeTimeStr = event.completeTimeStr
  const templateId = 'SjlHOqbRcflXwiHX2HUDYkFxE4mMgeR7bCEn4PwUgfk'
  try {
    const sendResult = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      templateId,
      miniprogram_state: 'developer',
      page: "pages/localPages/myOrder/myOrder?activeTab=1",
      // 此处字段应修改为所申请模板所要求的字段
      data: {
        character_string2: {
          value: orderId,
        },
        time3: {
          value: completeTimeStr,
        },
        thing1: {
          value: '点击查看订单详情',
        },
      }
    })
    return sendResult
  } catch (error) {
    return error
  }

}

// function timestamp){
//   let date = new Date(timestamp);
//   let year = date.getFullYear();
//   let month = date.getMonth() + 1;
//   let day = date.getDate();
//   let hour = date.getHours()
//   let minute = date.getMinutes()
//   return [year, month, day].map(formatNumber).join("-") + " " + [hour, minute].map(formatNumber).join(":")
// }

// function formatNumber(n) {
//   n = n.toString();
//   return n[1] ? n : "0" + n;
// };