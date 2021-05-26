import { showModal, showToast, showLoading, hideLoading } from "../../../utils/asyncWX.js";
import { getUncompleteOrderCloud, acceptOrderCloud, deliverOrderCloud, completeOrderCloud, cancelOrderCloud } from "../../../lib/order/operation.js";

let app = getApp();
Page({
  data: {
    // 顶部tabBar内容
    tabs: [{ title: "新订单" }, { title: "处理中" }, { title: "配送中" }],

    // 上拉刷新flag
    // 本来可以三个scroll-view共用一个refreshFlag，但是这样有时候会造成已经刷新完却没有回弹的bug
    // 所以把flag分开 同时也把刷新函数分开 但三个刷新函数内部实际调用一个同一个函数
    refreshNewOrderFlag: false,
    refreshHandlingOrderFlag: false,
    refreshDeliverOrderFlag: false,

    // 未处理订单
    newOrder: [],

    // 处理中
    handleOrder: [],

    // 派送中订单
    deliverOrder: [],

    // 是否打开输入取消订单理由对话框
    showCancelReasonDialog: false,

    // 对话框按钮
    buttons: [{ text: "取消" }, { text: "确定" }],
  },
  shopInfo: [],
  order: [],

  // 刷新订单
  async refreshOrder() {
    // console.log("触发刷新订单");
    await showLoading();
    const res = await getUncompleteOrderCloud(this.shopInfo.shopId);
    await hideLoading();
    if (!res) {
      this.setData({
        refreshNewOrderFlag: false,
        refreshHandlingOrderFlag: false,
        refreshDeliverOrderFlag: false,
      });
      return;
    }
    const uncompleteOrder = res.result.data;
    if (uncompleteOrder.length === 0) {
      showToast("没有未处理订单");
    }
    // console.log("res", res);
    this.order = uncompleteOrder;

    // 将获取到到未处理订单分类
    let newOrder = [];
    let handleOrder = [];
    let deliverOrder = [];

    if (uncompleteOrder.length !== 0) {
      uncompleteOrder.forEach((v) => {
        switch (v.status) {
          case 0:
            newOrder.push(v);
            break;
          case 1:
            handleOrder.push(v);
            break;
          case 2:
            deliverOrder.push(v);
            break;
          default:
            break;
        }
      });
    }
    this.setData({
      newOrder,
      handleOrder,
      deliverOrder,
      refreshNewOrderFlag: false,
      refreshHandlingOrderFlag: false,
      refreshDeliverOrderFlag: false,
    });

    app.globalData.refreshFlag.showDot = newOrder.length !== 0;
  },

  async handleRefreshNewOrder() {
    this.setData({ refreshNewOrderFlag: true });
    await this.refreshOrder();
    this.setData({ refreshNewOrderFlag: false });
  },
  async handleRefreshHandlingOrder() {
    this.setData({ refreshHandlingOrderFlag: true });
    await this.refreshOrder();
    this.setData({ refreshHandlingOrderFlag: false });
  },
  async handleRefreshDeliverOrder() {
    this.setData({ refreshDeliverOrderFlag: true });
    await this.refreshOrder();
    this.setData({ refreshDeliverOrderFlag: false });
  },

  // ============================= 选择tab =========================

  // 点击选择tab
  onTabCLick(e) {
    const index = e.detail.index;
    this.setData({
      activeTab: index,
    });
  },

  // 滑动选择tab
  onChange(e) {
    const index = e.detail.index;
    this.setData({
      activeTab: index,
    });
  },

  /*============点击订单进行的触发事件========================*/

  // 点击取消订单触发
  async handleCancelOrder(e) {
    this.orderId_temp = e.currentTarget.dataset.orderid;
    this.setData({ showCancelReasonDialog: true });
  },

  // 用户点击取消理由对话框的结果
  async handleCancelReasonResult(e) {
    const dialogRes = e.detail;

    if (dialogRes.cancel) {
      this.setData({ showCancelReasonDialog: false });
      return;
    }

    if (dialogRes.confirm) {
      const orderId = this.orderId_temp;

      const cancelReason = dialogRes.dialogInput.trim();
      if (!cancelReason) {
        showToast("无效输入");
        return;
      }
      try {
        await showLoading();
        const cancelOrderRes = await cancelOrderCloud(orderId, cancelReason);
        if (cancelOrderRes) {
          this.setData({ showCancelReasonDialog: false });
          await this.refreshOrder();
        }
      } catch (error) {
        console.log(error);
      } finally {
        await hideLoading();
      }
    }
  },

  // 点击接单触发
  async handleAcceptOrder(e) {
    const openid = e.currentTarget.dataset.openid;
    const orderId = e.currentTarget.dataset.orderid;
    // console.log("检测到接单", orderId);
    // console.log("订单openid", openid);
    try {
      await showLoading();
      const res = await acceptOrderCloud(orderId, openid);
      if (res) {
        await this.refreshOrder();
      }
    } catch (error) {
      console.log(error);
    } finally {
      await hideLoading();
    }
  },

  // 点击完成订单
  async handleDeliverOrder(e) {
    const openid = e.currentTarget.dataset.openid;
    const orderId = e.currentTarget.dataset.orderid;
    // console.log("检测到派送订单", orderId);
    // console.log("订单openid", openid);
    try {
      await showLoading();
      const res = await deliverOrderCloud(orderId, openid);
      if (res) {
        await this.refreshOrder();
      }
    } catch (error) {
      console.log(error);
    } finally {
      await hideLoading();
    }
  },

  // 点击已送达订单触发
  async handleCompleteOrder(e) {
    const orderId = e.currentTarget.dataset.orderid;
    const openid = e.currentTarget.dataset.openid;
    // console.log("检测到已送达订单", orderId);
    // console.log("订单openid", openid);

    const allowNotifyOrderComplete = e.currentTarget.dataset.notify;
    // console.log("allowNotifyOrderComplete", allowNotifyOrderComplete);

    if (!allowNotifyOrderComplete) {
      const modalRes = showModal("提示", "当前顾客并未开启订单送达通知服务 请务必电话联系顾客取单", "去联系", "已送达");
      if (modalRes.cancel) {
        return;
      }
    }
    try {
      await showLoading();
      const res = await completeOrderCloud(orderId, openid);
      if (res) {
        await this.refreshOrder();
      }
    } catch (error) {
      console.log(error);
    } finally {
      await hideLoading();
    }
  },

  /*========================页面生命周期函数==========================*/

  //options(Object)
  async onLoad(options) {
    this.shopInfo = app.globalData.shopInfo;
    // console.log("orderprocess shopinfo", this.shopInfo);

    //await this.refreshOrder();
  },

  async onShow() {
    await this.refreshOrder();
  },
});
