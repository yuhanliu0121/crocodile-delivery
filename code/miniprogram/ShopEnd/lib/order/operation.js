import { showLoading, hideLoading, showModal } from "../../utils/asyncWX.js";
import { CanI } from "../accessControl/operation.js";
let app = getApp();
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
// 获取最近一周的订单
export async function getRecentOrderCloud(shopId, pageNum) {
  try {
    let res = await wx.cloud.callFunction({
      name: "get_order_shop",
      data: {
        shopId: shopId,
        type: "recent",
        pageNum: pageNum,
      },
    });
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
  }
}

// 获取一周前的订单
export async function getOldOrderCloud(shopId, pageNum) {
  try {
    let res = await wx.cloud.callFunction({
      name: "get_order_shop",
      data: {
        shopId: shopId,
        type: "old",
        pageNum: pageNum,
      },
    });
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
  }
}

// 获取未完成的订单
export async function getUncompleteOrderCloud(shopId) {
  try {
    let res = await wx.cloud.callFunction({
      name: "get_order_shop",
      data: {
        shopId: shopId,
        type: "uncomplete",
      },
    });
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
  }
}

//取消订单
export async function cancelOrderCloud(orderId, cancelReason) {
  if (!(await CanI("order"))) {
    console.log("无操作权限");
    return;
  }
  let updateInfo = {
    orderId: orderId,
    updateType: -1,
    cancelReason: cancelReason,
  };
  try {
    const res = await wx.cloud.callFunction({
      name: "update_shop_order_status",
      data: {
        updateInfo: updateInfo,
      },
    });
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
  }
}

//商家接单
export async function acceptOrderCloud(orderId, openid) {
  if (!(await CanI("order"))) {
    console.log("无操作权限");
    return;
  }
  console.log(app.globalData.shopInfo);

  let updateInfo = {
    orderId: orderId,
    updateType: 1,
  };

  try {
    const res = await wx.cloud.callFunction({
      name: "update_shop_order_status",
      data: {
        updateInfo: updateInfo,
      },
    });
    console.log("云函数返回", res);

    if (res.result) {
      console.log("accept res", res);

      // await wx.cloud.callFunction({
      //   name: "send_user_message",
      //   data: {
      //     openid: openid,
      //     orderId: orderId,
      //     shopName: app.globalData.shopInfo.shopName,
      //     phoneNumber: app.globalData.shopInfo.shopPhoneNumber,
      //     handleTimeStr: toTimeStr(res.result.handleTime),
      //     action: "sendAcceptMessage",
      //   },
      // });
    } else {
      showModal("操作失败", "该订单已被顾客取消");
    }
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
  }
}

//商家完成捡货并开始配送
export async function deliverOrderCloud(orderId, openid) {
  if (!(await CanI("order"))) {
    console.log("无操作权限");
    return;
  }
  let updateInfo = {
    orderId: orderId,
    updateType: 2,
  };

  try {
    const res = await wx.cloud.callFunction({
      name: "update_shop_order_status",
      data: {
        updateInfo: updateInfo,
      },
    });
    if (res.result) {
    //   await wx.cloud.callFunction({
    //     name: "send_user_message",
    //     data: {
    //       openid: openid,
    //       orderId: orderId,
    //       deliverTimeStr: toTimeStr(res.result.deliverTime),
    //       action: "sendFinishPickGoodsMessage",
    //     },
    //   });
    }
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
  }
}

//订单已送达
export async function completeOrderCloud(orderId, openid) {
  if (!(await CanI("order"))) {
    console.log("无操作权限");
    return;
  }
  let updateInfo = {
    orderId: orderId,
    updateType: 3,
  };
  try {
    const res = await wx.cloud.callFunction({
      name: "update_shop_order_status",
      data: {
        updateInfo: updateInfo,
      },
    });
    if (res.result) {
      // await wx.cloud.callFunction({
      //   name: "send_user_message",
      //   data: {
      //     openid: openid,
      //     orderId: orderId,
      //     completeTimeStr: toTimeStr(res.result.completeTime),
      //     action: "sendArrivedMessage",
      //   },
      // });
    }
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
  }
}

//开始监听新订单
export async function startWatchOrder(user2shop) {

  let accessInfo = {
    access: user2shop.access, // 用户的权限
    role: user2shop.role, // 用户的角色
    shopId: user2shop.shopId, // 用户所在的商店
    _id: user2shop._id,
  };
  console.log("accessinfo", accessInfo);

  const watcher = db
    .collection("order")
    .where({
      shopId: accessInfo.shopId,
      status: 0,
    })
    .watch({
      onChange: async function (snapshot) {
        console.log("snapshot_order", snapshot);
        let orderChange = snapshot.docChanges[0];
        if (!!orderChange && orderChange.dataType === "update" && orderChange.updatedFields.status === 0) {
          console.log("有新订单");
          let pages = getCurrentPages(); // 获取页面栈
          let curPage = pages[pages.length - 1]; //获取当前页面
          if (!!curPage.data.newOrder) {
            // 用户当前在orderProcess页面
            let newOrder = curPage.data.newOrder;
            console.log("neworder", orderChange.doc);
            newOrder.push(orderChange.doc);
            newOrder.sort(function (v1, v2) {
              if (v1.selDeliverTime !== v2.selDeliver) {
                return v1.selDeliverTime - v2.selDeliverTime;
              } else {
                return v1.payTime - v2.payTime;
              }
            });
            app.globalData.refreshFlag.showDot = true;
            curPage.setData({ newOrder: newOrder });
          } else {
            // 用户当前不在orderProcess页面
            app.globalData.refreshFlag.showDot = true;
          }
        }
      },
      onError: function (err) {
        console.error("订单监听异常被关闭 现重启", err);
        startWatchOrder(user2shop);
        let pages = getCurrentPages(); // 获取页面栈
        let curPage = pages[pages.length - 1]; //获取当前页面
        if (curPage.data.newOrder) {
          // 用户当前在orderProcess页面
          curPage.refreshOrder();
        } 
      },
    });
  // 将当前的订单监听器绑定为全局变量以备在其他地方取消监听
  app.globalData.watcher.orderWatcher = watcher;
}

function toTimeStr(timestamp) {
  let date = new Date(timestamp);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  return [year, month, day].map(formatNumber).join("-") + " " + [hour, minute].map(formatNumber).join(":");
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : "0" + n;
}
