import { showToast, showModal } from "../../../utils/asyncWX.js";
import { updateFeeSetting, updateAppShopInfo } from "../../../lib/setting/operation.js";
import { validateServiceFeePercent, validateDeliverFeePercent } from "../../../lib/login/check.js";

let app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 可供选择的服务费比例
    serviceFeePercentRng: [...Array(101).keys()],

    // 实际选择的服务费比例
    serviceFeePercent: -1,

    // 可供选择的配送费比例
    deliverFeePercentRng: [...Array(101).keys()],

    // 实际选择的配送费比例
    deliverFeePercent: -1,

    editable: false,
  },

  // 用户点击放弃修改
  handleTapDiscard() {
    this.refreshFee(this.shopInfo);
    this.setData({ editable: false });
  },

  // 用户点击修改
  handleTapEdit() {
    this.setData({ editable: true });
  },

  // 用户点击保存
  async handleTapSave() {
    // 先比较一下用户有没有真的修改内容
    const newDeliverFeePercent = this.data.deliverFeePercent;
    const newServiceFeePercent = this.data.serviceFeePercent;

    const oldDeliverFeePercent = this.shopInfo.deliverFeePercent;
    const oldServiceFeePercent = this.shopInfo.serviceFeePercent;

    if (newDeliverFeePercent === oldDeliverFeePercent && newServiceFeePercent === oldServiceFeePercent) {
      showToast("未进行修改");
      return;
    }

    // 检验输入合法性
    // 检验配送费比例
    validateRes = validateDeliverFeePercent(newDeliverFeePercent);
    if (!validateRes.isValid) {
      return validateRes;
    }
    let validateRes;
    validateRes = validateServiceFeePercent(newServiceFeePercent);
    if (!validateRes.isValid) {
      return validateRes;
    }

    const modalRes = await showModal("确定保存？");
    if (modalRes.cancel) {
      return;
    }

    // 开始上传修改
    const fee = { deliverFeePercent: newDeliverFeePercent, serviceFeePercent: newServiceFeePercent };
    const updateRes = await updateFeeSetting(this.shopInfo, fee);
    if (updateRes) {
      await updateAppShopInfo(this.shopInfo.shopId);
      showToast("修改成功");
    }
    this.refreshFee(app.globalData.shopInfo);
    this.handleTapDiscard();
  },

  // 用户改变服务费比例
  handleChangeServiceFeePercent(e) {
    this.setData({ serviceFeePercent: Number(e.detail.value) });
  },
  // 用户改变配送费比例
  handleChangeDeliverFeePercent(e) {
    this.setData({ deliverFeePercent: Number(e.detail.value) });
  },

  refreshFee(shopInfo) {
    this.shopInfo = shopInfo;
    let { deliverFeePercent, serviceFeePercent } = shopInfo;
    this.setData({ deliverFeePercent, serviceFeePercent });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.refreshFee(app.globalData.shopInfo);
  },
});
