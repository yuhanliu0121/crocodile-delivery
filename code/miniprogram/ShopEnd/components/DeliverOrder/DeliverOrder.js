// components/order/Order.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 订单详情
    orderDetail: {
      type: Object,
      value: {},
    },
  },
  data: {
    // 是否显示商品详情
    isShowGoodsDetail: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击预览图片
    handleTapImg(e) {
      const img = e.currentTarget.dataset.src;
      wx.previewImage({
        current: img,
        urls: [img],
      });
    },

    // 点击联系顾客时触发事件
    handleTapTel(e) {
      wx.makePhoneCall({
        phoneNumber: this.data.orderDetail.phoneNumber,
      });
    },

    // 点击商品详情时触发事件
    handleTapGoodsDetail(e) {
      this.setData({
        hasDownArror: !this.data.hasDownArror,
        hasUpArror: !this.data.hasUpArror,
        isShowGoodsDetail: !this.data.isShowGoodsDetail,
      });
    },

    // 点击取消订单时触发父组件事件
    handleTapCancelOrder(e) {
      this.triggerEvent("tapCancelOrder");
    },

    // 点击已完成时触发父组件事件
    handleTapCompleteOrder(e) {
      this.triggerEvent("tapCompleteOrder");
    },
  },
});
