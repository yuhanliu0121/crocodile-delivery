const WEIXIN = 0;
const MOBILE = 1;
const EMAIL = 2;
const QQ = 3;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    goodsInfo: {},
    contactTypeText: "",
  },

  shopInfo: {},

  /*============== 事务处理函数 ====================*/

  /*============== 页面生命周期函数 ====================*/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从URL中获取页面数据
    let shopInfo = JSON.parse(decodeURIComponent(options.shopInfo));
    let goodsInfo = JSON.parse(decodeURIComponent(options.goodsInfo));
    this.shopInfo = shopInfo;

    let contactTypeText;
    switch (goodsInfo.contactType) {
      case WEIXIN:
        contactTypeText = "微信号";
        break;
      case MOBILE:
        contactTypeText = "手机号";
        break;
      case EMAIL:
        contactTypeText = "邮箱";
        break;
      case QQ:
        contactTypeText = "QQ号";
        break;
    }

    // 初始化页面数据
    this.setData({
      goodsInfo: goodsInfo,
      contactTypeText
    });
  },
});
