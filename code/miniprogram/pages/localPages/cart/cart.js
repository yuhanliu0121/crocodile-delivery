import { getAllShopCart, removeShopCart } from "../../../lib/cart/operation";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    allShopCart: [],
    hasShopCart: false,
  },

  /* ================ 页面业务处理函数 =============== */

  // 清除购物车数据 注意这里的清除购物车数据不是只将goods置为[] 而是将这个商店的整个购物车删除
  handleClearShopCart(e) {
    const { index } = e.currentTarget.dataset;
    const shopId = this.data.allShopCart[index].shopId;
    wx.showModal({
      title: "确定清除该店所有商品？",
      success: (res) => {
        if (res.confirm) {
          removeShopCart(shopId);
          this.setPageData()
        }
      },
    });
  },

  // TODO 用户点击下单 检查用户是否可以下单 如是否达到最低限购 
  handlePay(e) {
    // 获取用户点击的是那个商店的索引
    const { index } = e.currentTarget.dataset;
    const shopId = this.data.allShopCart[index].shopId;
    wx.navigateTo({
      url: "../pay/pay?shopId=" + shopId,
    });
  },

  // 更新页面数据
  setPageData() {
    // 1 获取缓存中的所有商店的购物车数据
    const allShopCart = getAllShopCart();
    let hasShopCart = allShopCart.length !== 0;
    this.setData({ allShopCart, hasShopCart });
  },

  /* =============== 页面生命周期函数 =============== */

  onShow: function () {
    this.setPageData();
  },
});
