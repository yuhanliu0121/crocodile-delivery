let app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 营业类型显示文字
    shopCateText: "",
    logoUrl: "",
    shopId: "",
    shopName: "",
    shopPhoneNumber: "",
    shopAddress: "",
    city: "",
    state: "",
    zipcode: "",
  },
  // 商店信息
  shopInfo: {},
  /*============== 事件处理函数 ===============*/

  handlePreviewImg() {
    console.log("用户点击商店logo");
    const logo = this.data.logoUrl;
    wx.previewImage({
      current: logo,
      urls: [logo],
      success: (result) => {},
      fail: () => {},
      complete: () => {},
    });
  },

  refreshEditShopBasicInfo(shopInfo) {
    const {
      shopCate,
      logoUrl,
      shopId,
      shopName,
      shopPhoneNumber,
      shopAddress,
      city,
      state,
      zipcode,
    } = shopInfo;
    const shopCateText = shopCate === 0 ? "超市" : "餐厅";
    this.setData({
      logoUrl,
      shopCateText,
      shopId,
      shopName,
      shopPhoneNumber,
      shopAddress,
      city,
      state,
      zipcode,
    });
  },

  /*============== 页面生命周期函数 ===============*/

  onLoad(options) {
    this.shopInfo = app.globalData.shopInfo;
    this.refreshEditShopBasicInfo(this.shopInfo);
  },
});
