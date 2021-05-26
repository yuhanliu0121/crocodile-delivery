import { showLoading, hideLoading, showModal, showToast, isConnected } from "../../../utils/asyncWX.js";
import { getUncompleteOrderCloud, getCompleteOrderCloud, cancelOrderCloud } from "../../../lib/order/operation.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 处理中订单
    uncompleteOrder: [],

    // 已完成订单
    completeOrder: [],

    // 上拉刷新未完成订单flag
    refreshUncompleteOrderFlag: false,

    // 上拉刷新已完成订单flag
    refreshCompleteOrderFlag: false,

    // 顶部tabBar内容
    tabs: [{ title: "未完成" }, { title: "已完成" }],
    activeTab: 0, // 默认的被选中的tab索引
  },

  // 所有的订单暂时存在这里
  orders: [],

  // 已完成订单页数
  completeOrderPageNum: 0,

  // 没有更多已完成订单标志
  noMoreCompleteOrderFlag: false,

  // =================   刷新所有订单函数 =============================
  async refreshAllOrder() {
    // console.log("刷新所有订单");

    let pageNum = 0;
    await showLoading();
    const res = await Promise.all([getUncompleteOrderCloud(pageNum), getCompleteOrderCloud(pageNum)]);
    const uncompleteOrder = res[0].result.data;
    const completeOrder = res[1].result.data;

    this.setData({ uncompleteOrder, completeOrder, refreshUncompleteOrderFlag: false, refreshCompleteOrderFlag: false });
    await hideLoading();
  },

  // ========================  未完成订单函数 ====================

  // 用户点击取消订单
  async handleCancelOrder(e) {
    this.orderId_temp = e.currentTarget.dataset.orderid;
    this.setData({ showCancelReasonDialog: true });
  },
  // 用户点击取消理由对话框的结果
  async handleCancelReasonResult(e) {
    // console.log("event", e);
    const dialogRes = e.detail;
    // console.log("dialogRes", dialogRes);
    if (dialogRes.cancel) {
      // console.log("dialogRes.cancel");
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

      const cancelRes = await cancelOrderCloud(orderId, cancelReason);
      this.setData({ showCancelReasonDialog: false });
      if (!cancelRes) {
        return;
      }
      await this.refreshAllOrder();
      wx.showToast({ title: "已取消" });
    }
  },

  // 刷新未完成订单
  // 注意：如果某个未完成订单数据有变化 则已完成订单数据也可能有变化。所以这里虽然时刷新未完成订单，但实际上已完成的也得刷
  async handleRefreshUncompleteOrder() {
    this.setData({ refreshUncompleteOrderFlag: true });
    await this.refreshAllOrder();
    this.setData({ refreshUncompleteOrderFlag: false });
    wx.showToast({ title: "已刷新" });
  },

  // ========================  已完成订单函数 ====================

  // 刷新已完成订单
  async handleRefreshCompleteOrder() {
    this.setData({ refreshCompleteOrderFlag: true });
    await this.refreshAllOrder();
    this.setData({ refreshCompleteOrderFlag: false });
    this.completeOrderPageNum = 0;
    this.noMoreCompleteOrderFlag = false;
    wx.showToast({ title: "已刷新" });
  },

  // 获取更多已完成订单
  async handleGetMoreCompleteOrder() {
    // console.log("获取更多已完成订单");
    if (this.noMoreCompleteOrderFlag) {
      showToast("没有更多数据");
      return;
    }

    await showLoading();
    const res = await getCompleteOrderCloud(this.completeOrderPageNum + 1);
    await hideLoading();
    if (!res) {
      return;
    }
    const moreCompleteOrder = res.result.data;
    if (moreCompleteOrder.length === 0) {
      showToast("没有更多数据");
      this.noMoreCompleteOrderFlag = true;
    } else {
      let completeOrder = this.data.completeOrder;
      completeOrder.push(...moreCompleteOrder);
      this.setData({ completeOrder });
      wx.showToast({ title: "已刷新" });
      this.completeOrderPageNum += 1;
    }
  },

  // ====================== 对tab的操作 ===========================

  // 点击选择 “未完成”或者“已完成”的tab
  onTabCLick(e) {
    const index = e.detail.index;
    this.setData({ activeTab: index });
  },

  // 滑动选择 “未完成”或者“已完成”的tab
  onChange(e) {
    const index = e.detail.index;
    this.setData({ activeTab: index });
  },

  /*================ 页面生命周期函数 ===================*/

  async onLoad(options) {
    const activeTab = options.activeTab || 0;
    this.setData({
      activeTab,
    });
    await this.refreshAllOrder();
  },
});
