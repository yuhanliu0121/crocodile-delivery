// components/order/Order.js
Component({
  attached: function () {
    let status = this.data.orderDetail.status;
    let statusText = "";
    switch (status) {
      case -1:
        statusText = "已取消";
        break;
      case 3:
        statusText = "已送达";
        break;

      default:
        statusText = "加载中";
        break;
    }
    this.setData({ statusText });
  },
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
    // 订单状态的文字显示
    statusText: "获取订单状态中......",

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

    // 点击电话号码时触发事件
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

    // 点击复制订单信息时触发父组件事件
    handleTapCopyInfo(e) {
      wx.setClipboardData({
        data: "订单编号: " + this.data.orderDetail.orderId,
        success(res) {
          wx.getClipboardData({
            success(res) {},
          });
        },
      });
    },
  },
});
