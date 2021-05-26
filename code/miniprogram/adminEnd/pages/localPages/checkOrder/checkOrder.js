import { showModal, showLoading, hideLoading } from "../../../utils/asyncWX.js";

Page({
  data: {
    // 输入框的值
    inputOrderId: "",
    // order
    order: {},
  },
  // 输入框的值改变 就会触发的事件
  handleInput(e) {
    // 1 获取输入框的值
    const { value } = e.detail;
    this.setData({
      inputOrderId: value,
    });
  },
  // 点击 取消按钮
  async handleTapSearch() {
    const orderId = this.data.inputOrderId.trim();
    if (!orderId) {
      showModal("错误", "无效输入");
      return;
    }
    try {
      showLoading();
      let res = await wx.cloud.callFunction({
        name: "get_order_user",
        data: {
          orderId: orderId,
          type: "any",
        },
      });
      const order = res.result.data[0];
      if (!order) {
        showModal("错误", "未找到订单");
        this.setData({order:{}})
        return;
      }
      this.setData({order})
    } catch (error) {
      console.log("error", error);
      return;
    } finally {
      hideLoading();
    }
  },
});
