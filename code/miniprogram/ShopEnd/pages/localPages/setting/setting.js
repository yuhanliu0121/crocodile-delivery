import { updateShopStatusCloud, getShopInfoCloud } from "../../../lib/setting/operation.js";
import { showActionSheet } from "../../../utils/asyncWX.js";
let app = getApp();

Page({
  data: {
    // 营业状态
    shopStatus: -1,
    // 营业状态的显示文字
    shopStatusText: "网络错误",
    // 用户的角色：店主还是店员
    roleText: "未登录",
    // 商店logo
    logoUrl: "",
    // 商店名字
    shopName: "网络错误",
  },
  // 商店信息
  shopIndo: {},
  // 用户权限信息
  accessInfo: {},

  // ===========================================================
  // ===========================================================
  // ==================  页面业务处理函数  ======================
  // ===========================================================
  // ===========================================================

  // 点击基本信息
  handleTapBasicInfo() {
    // console.log("用户点击基本信息");
    wx.navigateTo({
      url: "../editShopBasicInfo/editShopBasicInfo",
      success: (result) => {},
      fail: () => {},
      complete: () => {},
    });
  },
  // 点击营业状态
  async handleTapShopStatus() {
    // console.log("用户点击营业状态");
    const actionSheetRes = await showActionSheet(["暂停接单", "开始接单"]);
    const { tapIndex } = actionSheetRes;

    // 检查当前的营业状态是否已经是用户想要的营业状态
    if (tapIndex === this.data.shopStatus) {
      return;
    }
    // 更新云端的商店状态
    const updateStatusRes = await updateShopStatusCloud(this.shopIndo, tapIndex);
    if (updateStatusRes) {
      this.setData({
        shopStatus: tapIndex,
        shopStatusText: tapIndex === 0 ? "暂停接单" : "接单中",
      });
    }
  },

  // 刷新页面
  refreshSetting(shopInfo, accessInfo) {
    const { logoUrl, shopName, shopStatus } = shopInfo;
    let { role } = accessInfo;
    let roleText = role === "owner" ? "店主" : "店员";
    let shopStatusText = shopStatus === 0 ? "暂停接单" : "接单中";

    this.setData({
      logoUrl,
      shopName,
      roleText,
      shopStatusText,
      shopStatus,
    });
  },

  // 用户点击登出商家端
  handleLogOut() {
    wx.reLaunch({
      url: "../../../../pages/localPages/selAppEnd/selAppEnd",
    });
  },

  // ==========================================================
  // ==========================================================
  // ================   页面生命周期函数  ======================
  // ==========================================================
  // ==========================================================

  async onLoad(options) {
    // console.log("app.globalData.shopInfo", app.globalData.shopInfo);
    // const shopInfo = app.globalData.shopInfo;
    const shopInfo = await getShopInfoCloud(app.globalData.shopInfo.shopId);
    if (!shopInfo) {
      return;
    }
    app.globalData.shopInfo = shopInfo;
    const accessInfo = app.globalData.accessInfo;

    this.shopInfo = shopInfo;
    this.accessInfo = accessInfo;

    this.refreshSetting(shopInfo, accessInfo);
  },
});
