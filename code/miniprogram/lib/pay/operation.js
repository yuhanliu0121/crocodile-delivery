import {
  showLoading,
  hideLoading,
  showModal
} from "../../utils/asyncWX.js";

// 判断当前时间能否选择某个预定送达时间
/**
 * @param {Number} timestamp 待检测的timestamp
 * @param {Number} deliverTimestamp 配送时间的timestamp
 * @param {Number} cutOrderTime 例如 20 (单位:分钟)
 */
export function isReceiveTimeValid(timestamp, deliverTimestamp, cutOrderTime) {
  return timestamp < deliverTimestamp - cutOrderTime * 60 * 1000;
}

// 获取函数调用时刻的timpstamp
export function getCurrentTimestamp() {
  return new Date().getTime();
}

// 获取函数调用时当天0点的timestamp
export function getTodayZeroTimestamp() {
  let now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();
  let millsec = now.getMilliseconds();
  return getCurrentTimestamp() - hour * 60 * 60 * 1000 - minute * 60 * 1000 - second * 1000 - millsec;
}

// 根据商家提供的deliverTimeList和cutOrderTime获取今明两天收货时间的timestamp和有效性
export function getReceiveTimeGroup(deliverTimeList, cutOrderTime) {
  let todayZeroTimestamp = getTodayZeroTimestamp();
  let tomorrowZeroTimestamp = todayZeroTimestamp + 1 * 24 * 60 * 60 * 1000;

  let todayDeliverTimestampList = []
  let tomorrowDeliverTimestampList = []

  deliverTimeList.forEach(v => {
    let hour = Number(v.slice(0, 2));
    let minute = Number(v.slice(-2));
    let timeOffset = hour * 60 * 60 * 1000 + minute * 60 * 1000;

    todayDeliverTimestampList.push({
      time: v,
      timestamp: todayZeroTimestamp + timeOffset,
      valid: isReceiveTimeValid(getCurrentTimestamp(), todayZeroTimestamp + timeOffset, cutOrderTime),
      warnMessage: "已在该配送时间" + String(cutOrderTime) + "分钟前截单",
    })

    tomorrowDeliverTimestampList.push({
      time: v,
      timestamp: tomorrowZeroTimestamp + timeOffset,
      valid: isReceiveTimeValid(getCurrentTimestamp(), tomorrowZeroTimestamp + timeOffset, cutOrderTime),
      warnMessage: "已在该配送时间" + String(cutOrderTime) + "分钟前截单",
    })
  });

  return [todayDeliverTimestampList, tomorrowDeliverTimestampList]
}

// 核验订单信息
export function verifyOrderInfo(orderInfo) {
  // console.log("orderInfo", orderInfo);
  // 验证收货地址
  if (!orderInfo.addressId) {
    return {
      isValid: false,
      message: "未选择收货地址"
    };
  }

  // 验证是否选择配送时间
  if (orderInfo.selDeliverTime === -1) {
    return {
      isValid: false,
      message: "未选择配送时间"
    };
  }

  return {
    isValid: true,
    message: "订单核验无误"
  };
}

export async function placeOrderCloud(orderInfo) {
  // console.log("orderInfo", orderInfo);
  try {
    await showLoading();
    let orderId = orderInfo.orderId;
    let updateInfo = {
      orderId: orderId,
      updateType: 0,
      updateOrderInfo: orderInfo,
    };
    const res = await wx.cloud.callFunction({
      name: "update_user_order_status",
      data: {
        updateInfo: updateInfo,
      },
    });
    // console.log(res);
    return res.result;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false
  } finally {
    hideLoading();
  }
}