import {
  showLoading,
  hideLoading,
  showModal
} from "../../utils/asyncWX.js";

// 获取未完成的订单
export async function getUncompleteOrderCloud(pageNum) {
  // await new Promise((resolve,reject)=>{
  //   setTimeout(()=>{resolve()},5000)
  // })
  try {
    const res = await wx.cloud.callFunction({
      name: "get_order_user",
      data: {
        type: "uncomplete",
        pageNum: pageNum
      }
    });
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false
  } finally {}
}

// 获取完成的订单
export async function getCompleteOrderCloud(pageNum) {
  try {
    const res = await wx.cloud.callFunction({
      name: "get_order_user",
      data: {
        type: "complete",
        pageNum: pageNum
      }
    });
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false
  } finally {}
}

// 取消订单
export async function cancelOrderCloud(orderId, cancelReason) {
  //
  // console.log("用户取消订单");
  try {
    await showLoading();
    let updateInfo = {
      orderId: orderId,
      updateType: -1,
      cancelReason: cancelReason
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