// miniprogram/pages/localPages/confirmOrder/confirmOrder.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 对顾客是否选择订阅消息通知进行说明
    note: [],
  },

  // 查看订单
  handleCheckOrder() {
    wx.redirectTo({
      url: '../myOrder/myOrder',
    });
  },

  // 返回商店
  handleBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const reqSubMsgRes = JSON.parse(options.reqSubMsgRes);
    console.log("confirmOrder", reqSubMsgRes);
    let note = [];
    if (!reqSubMsgRes.ACCEPT_ORDER) {
      note.push(
        "您没有授权发送接单成功通知，请您自行在「我的订单」中及时查看订单是否被商家接收"
      );
    }
    if (!reqSubMsgRes.DELIVER_ORDER) {
      note.push(
        "您没有授权发送订单配送通知，请您自行在「我的订单」中及时查看订单是否正在配送"
      );
    }
    if (!reqSubMsgRes.COMPLETE_ORDER) {
      note.push(
        "您没有授权发送订单送达通知，商家将通过电话联系您，请留意"
      );
    }
    this.setData({ note });
  },
});
