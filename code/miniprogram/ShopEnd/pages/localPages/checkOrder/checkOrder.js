import { showModal, showToast, showLoading, hideLoading } from "../../../utils/asyncWX";
import { getRecentOrderCloud, getOldOrderCloud } from "../../../lib/order/operation.js";
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 顶部tabBar内容
    tabs: [{ title: "近一周" }, { title: "更早" }],

    // 刷新最近订单flag
    refreshRecentOrderFlag: false,

    // 刷新更早订单flag
    refreshOldOrderFlag: false,

    // 近一周的订单
    recentOrder: [],

    // 更早的订单
    oldOrder: [],
  },

  // 商店信息
  shopInfo: {},

  // recentOrder页面索引
  recentOrderPageNum: 0,

  // 没有更多recentOrder的flag
  noMoreRecentOrderFlag: false,

  // oldOrder页面编号
  oldOrderPageNum: 0,

  // 没有更多oldOrder的flag
  noMoreOldOrderFlag: false,

  //  ============================== 刷新所有订单的函数 =========================

  async refreshAllOrder() {
    let pageNum = 0;
    const shopId = this.shopInfo.shopId;
    await showLoading();
    const res = await Promise.all([getRecentOrderCloud(shopId, pageNum), getOldOrderCloud(shopId, pageNum)]);
    if (!res[0] && !res[1]) {
      return;
    }
    const recentOrder = res[0].result.data;
    const oldOrder = res[1].result.data;

    this.setData({ recentOrder, oldOrder, refreshRecentOrderFlag: false, refreshOldOrderFlag: false });
    await hideLoading();
  },

  // =============================== 对一周内订单的操作 ===========================

  // 刷新这一周的订单
  async handleRefreshRecentOrder() {
    this.setData({ refreshRecentOrderFlag: true });
    await this.refreshAllOrder();
    this.setData({ refreshRecentOrderFlag: false });
    this.noMoreRecentOrderFlag = false;
    this.recentOrderPageNum = 0;
    wx.showToast({ title: "已刷新" });
  },

  // 获取更多的这一周的订单
  async handleGetMoreRecentOrder() {
    if (this.noMoreRecentOrderFlag) {
      showToast("没有更多数据");
      return;
    }
    const res = await getRecentOrderCloud(this.shopInfo.shopId, this.recentOrderPageNum + 1);
    if (!res) {
      return;
    }
    const moreRecentOrder = res.result.data;
    if (moreRecentOrder.length === 0) {
      showToast("没有更多数据");
      this.noMoreRecentOrderFlag = true;
    } else {
      let recentOrder = this.data.recentOrder;
      recentOrder.push(...moreRecentOrder);
      this.setData({ recentOrder });
      showToast("已刷新", "success");
      this.recentOrderPageNum += 1;
    }
  },

  // =============================== 对一周前订单的操作 ===========================

  // 刷新老订单数据
  async handleRefreshOldOrder() {
    this.setData({ refreshOldOrderFlag: true });
    await this.refreshAllOrder();
    this.setData({ refreshOldOrderFlag: false });
    this.oldOrderPageNum = 0;
    this.noMoreOldOrderFlag = false;
    wx.showToast({ title: "已刷新" });
  },

  // 获取更多的一周前订单
  async handleGetMoreOldOrder() {
    if (this.noMoreOldOrderFlag) {
      showToast("没有更多数据");
      return;
    }

    const res = await getOldOrderCloud(this.shopInfo.shopId, this.oldOrderPageNum + 1);
    if (!res) {
      return;
    }
    const moreOldOrder = res.result.data;
    if (moreOldOrder.length === 0) {
      showToast("没有更多数据");
      this.noMoreOldOrderFlag = true;
    } else {
      let oldOrder = this.data.oldOrder;
      oldOrder.push(...moreOldOrder);
      this.setData({ oldOrder });
      showToast("已刷新", "success");
      this.oldOrderPageNum += 1;
    }
  },

  // =============================== 对tab的操作 ================================

  // 点击选择tab
  onTabCLick(e) {
    const index = e.detail.index;
    this.setData({ activeTab: index });
  },

  // 滑动选择tab
  onChange(e) {
    const index = e.detail.index;
    this.setData({ activeTab: index });
  },

  // ===================== 页面生命周期函数 ======================
  async onLoad() {
    let shopInfo = app.globalData.shopInfo;
    this.shopInfo = shopInfo;
    console.log(shopInfo);
    await this.refreshAllOrder();
  },
});
