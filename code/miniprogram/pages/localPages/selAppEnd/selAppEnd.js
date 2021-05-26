let app =  getApp();


Page({
  data: {
    showPage: false,
  },

  // 背景图片加载完毕 可以显示页面内容了
  handleLoadBgpComplete() {
    wx.hideLoading();
    this.setData({
      showPage: true,
    });
  },

  // 处理用户选择的端口
  handleLogin(e) {
    const end = e.currentTarget.dataset.type;
    console.log("用户点击登录", end);

    if (end === "customer") {
      app.globalData.isCustomer = true;
      wx.switchTab({
        url: '../home/home',
      })
    }
    if (end === "shop") {
      app.globalData.isShop = true;
      wx.navigateTo({
        url: '../../../ShopEnd/pages/localPages/login/login',
      });
    }
  },

  onLoad() {
    wx.showLoading({
      title: "加载中",
    });
  },
});