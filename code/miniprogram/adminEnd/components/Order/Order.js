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

  /**
   * 组件的初始数据
   */
  data: {
    // 是否显示收货信息详情
    isShowUserInfoDetail: false,

    // 是否显示商品详情
    isShowGoodsDetail: false,

    //
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 复制订单编号
    handleTapCopyInfo() {
      wx.setClipboardData({
        data: "订单编号: " + this.data.orderDetail.orderId,
        success(res) {
          wx.getClipboardData({
            success(res) {},
          });
        },
      });
    },

    // 点击电话号码时触发事件
    handleTapTel(e) {
      const type = e.currentTarget.dataset.type;
      let callNumber;
      if (type === "customer") {
        callNumber = this.data.orderDetail.phoneNumber;
      }
      if (type === "shop") {
        callNumber = this.data.orderDetail.shopPhoneNumber;
      }
      wx.makePhoneCall({
        phoneNumber: callNumber,
      });
    },

    // 点击商品详情时触发事件
    handleTapGoodsDetail(e) {
      this.setData({
        isShowGoodsDetail: !this.data.isShowGoodsDetail,
      });
    },

    // 点击收货信息详情触发
    handleTapUserInfo() {
      this.setData({
        isShowUserInfoDetail: !this.data.isShowUserInfoDetail,
      });
    },

    // 点击取消订单时触发父组件事件
    handleTapCancelOrder(e) {
      this.triggerEvent("tapCancelOrder");
    },
  },
});
