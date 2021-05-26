import { showToast, showModal } from "../../../utils/asyncWX.js";
import { validateShopAnnounce } from "../../../lib/login/check.js";
import { updateShopAnnounceCloud, updateAppShopInfo } from "../../../lib/setting/operation.js";
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    shopAnnounce: "",
    editable: false,
  },

  shopInfo: {},

  // 用户点击放弃修改
  handleTapDiscard() {
    // console.log("用户点击放弃修改");
    this.setData({
      editable: false,
      shopAnnounce: this.shopInfo.shopAnnounce,
    });
  },

  // 用户点击修改公告
  handleTapEdit() {
    // console.log("用户点击修改公告");
    this.setData({
      editable: true,
    });
  },

  // 商店公告输入框变动事件
  handleShopAnnounceChange(e) {
    const shopAnnounce = e.detail.value;
    this.setData({ shopAnnounce });
  },

  // 用户点击保存
  async handleTapSave() {
    // console.log("用户点击保存");
    const shopAnnounce = this.data.shopAnnounce.trim();
    if (shopAnnounce === this.shopInfo.shopAnnounce) {
      showToast("公告内容未改变");
      return;
    }

    // 验证输入合法性
    let validateRes = validateShopAnnounce(shopAnnounce);
    if (!validateRes.isValid) {
      showToast(validateRes.message);
      return;
    }

    const modalRes = await showModal("确定保存？");
    if (modalRes.cancel) {
      return;
    }

    // 后台保存公告
    const updateRes = await updateShopAnnounceCloud(this.shopInfo, shopAnnounce);
    if (updateRes) {
      // 重新从云端拉取一遍shopInfo
      await updateAppShopInfo(this.shopInfo.shopId);
      showToast("修改成功");
    }
    this.refreshEditShopAnnounce(app.globalData.shopInfo);
    this.handleTapDiscard();
  },

  // 刷新界面
  refreshEditShopAnnounce(shopInfo) {
    this.shopInfo = shopInfo;
    this.setData({
      shopAnnounce: shopInfo.shopAnnounce,
    });
  },

  onLoad(options) {
    this.refreshEditShopAnnounce(app.globalData.shopInfo);
  },
});
