import { getAllAddressItem } from "../../../lib/address/operation.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 已有地址
    addressItem: [],

    // 是否是其他页面需要借用此页面选择一个地址
    selAddressFlag: false,
  },
  // 转到地址编辑页面修改位置等信息
  handleEditAddress(e) {
    let { index } = e.currentTarget.dataset;
    wx.navigateTo({
      url:
        "../editAddress/editAddress?addressId=" +
        this.data.addressItem[index].addressId,
    });
  },

  // 返回点击的地址信息
  handleReturnAddressInfo(e) {
    // 如果不需要点击返回地址信息 则直接return
    if (!this.data.selAddressFlag) {
      return;
    }
    const index = e.currentTarget.dataset.index;
    const addressInfo = this.data.addressItem[index];

    let pages = getCurrentPages(); // 获取页面栈
    let prevPage = pages[pages.length - 2]; //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({ addressInfo: addressInfo });
    wx.navigateBack({
      delta: -1,
    });
  },

  // ================ 页面生命周期函数 ================
  onLoad(options) {
    const selAddressFlag = options.selAddressFlag || false;
    this.setData({ selAddressFlag });
  },

  onShow() {
    const addressItem = getAllAddressItem();
    this.setData({ addressItem });
  },
});
