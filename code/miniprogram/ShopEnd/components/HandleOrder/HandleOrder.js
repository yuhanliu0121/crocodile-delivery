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
    }
  },

    /**
     * 组件的初始数据
     */
    data: {
      // 是否显示商品详情
      isShowGoodsDetail: false,

      //完成订单以及复制订单信息是否按钮有效 isAllchecked 表示所有checkbox都被选中，此时应该让按钮有效
      isAllChecked: false,

      // checkboxs是否被勾选
      checkedBox:[]
    },

    /**
     * 组件的方法列表
     */
    methods: {
      // 点击预览图片
      handleTapImg(e){
        const img = e.currentTarget.dataset.src
        wx.previewImage({
          current: img,
          urls: [img],
        });
      },

      // checkbox勾选触发事件
      handelCheckBoxChange(e) {
        let checkedBox = e.detail.value;
        this.setData({checkedBox})
        
        // 查看有多少个checkbox被选中
        if (checkedBox.length === this.data.orderDetail.validGoods.length + 1) {
          // +1 是因为备注项
          this.setData({
            isAllChecked: true,
          });
        } else {
          this.setData({
            isAllChecked: false,
          });
        }
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

      // 点击取消订单时触发父组件事件
      handleTapCancelOrder(e) {
        this.triggerEvent("tapCancelOrder");
      },

      // 点击完成订单时触发父组件事件
      handleTapDeliverOrder(e) {
        this.triggerEvent("tapDeliverOrder");
      },

      // 点击复制订单信息时触发父组件事件
      handleTapCopyInfo(e) {
        // this.triggerEvent("tapCopyInfo");
        wx.setClipboardData({
          data:
            // "取单号: #" +
            // this.data.orderDetail.orderNum +
            "\n顾客姓名: " +
            this.data.orderDetail.receiverName +
            "\n顾客电话: " +
            this.data.orderDetail.phoneNumber +
            "\n顾客备注: " +
            this.data.orderDetail.note +
            "\n送货地址: " +
            this.data.orderDetail.address +
            "\n订单号: " +
            this.data.orderDetail.orderId,
          success(res) {
            wx.getClipboardData({
              success(res) {
                console.log(res.data); // data
              },
            });
          },
        });
      },
    },
});
