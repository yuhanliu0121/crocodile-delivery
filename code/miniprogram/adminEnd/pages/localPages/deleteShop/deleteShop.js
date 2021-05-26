import { showModal, showLoading, hideLoading } from "../../../utils/asyncWX.js";

const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const shopRef = db.collection("shop");

Page({
  data: {
    // 输入框的值
    inputShopId: "",
    // shop
    shopInfo: {},
    // 删除结果
    deleteRes:"",
  },
  // 输入框的值改变 就会触发的事件
  handleInput(e) {
    // 1 获取输入框的值
    const { value } = e.detail;
    this.setData({
      inputShopId: value,
    });
  },
  // 点击 取消按钮
  async handleTapSearch() {
    const shopId = this.data.inputShopId.trim();
    if (!shopId) {
      showModal("错误", "无效输入");
      return;
    }
    try {
      showLoading();
      await showLoading();
      const shopInfoRes = await shopRef
        .where({
          shopId: shopId,
        })
        .get();
      await hideLoading();
      // console.log("shopInfoRes", shopInfoRes);
      const shopInfo = shopInfoRes.data[0];
      if (!shopInfo) {
        showModal("错误", "未找到商店");
        this.setData({ shopInfo: {} });
        return;
      }
      this.shopInfo = shopInfo;
      this.setData({ shopInfo });
    } catch (error) {
      console.log("error", error);
      return;
    } finally {
      hideLoading();
    }
  },

  async handleDelShop() {
    const modalRes = await showModal("提示", "确认删除？");
    if (modalRes.concel) {
      return;
    }
    try {
      await showLoading();
      let res = await wx.cloud.callFunction({
        name: "admin_operation",
        data: {
          shopId: this.shopInfo.shopId,
          type: "deleteShop",
        },
      });
      await hideLoading();
      // console.log("res", res);
      JSON.stringify(res)
      showModal("提示", "虚拟删除成功");
    } catch (error) {
      console.log("error", error);
      return;
    } finally {
      await hideLoading();
    }
  },
});
