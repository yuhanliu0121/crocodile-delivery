import { showToast, showModal } from "../../../utils/asyncWX.js";
import { updateAppShopInfo, updateDeliverSetting } from "../../../lib/setting/operation.js";
import { validateDeliverTimeList, validateMinConsumption, validateCutOrderTime, getSortedDeliverTime } from "../../../lib/login/check.js";

let app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 是否可编辑
    editable: false,

    // 起送起送消费
    minConsumption: 0,

    // 可供选择的截单时间
    cutOrderTimeRng: [...Array(60).keys()],

    // 截单时间
    cutOrderTime: -1,

    // 配送时段数组
    deliverTimeList: [""],
  },

  shopInfo: {},

  // 用户点击增加配送时间
  async handleTapAddDeliverTIme() {
    let deliverTimeList = this.data.deliverTimeList;
    if (deliverTimeList.length >= 12) {
      await showToast("配送时间不能超过12个");
      return;
    }
    deliverTimeList.push("");
    this.setData({ deliverTimeList });
  },

  // 用户删除配送时间
  handleTapDeleteDeliverTIme(e) {
    const index = e.currentTarget.dataset.index;
    let deliverTimeList = this.data.deliverTimeList;
    deliverTimeList.splice(index, 1);
    this.setData({ deliverTimeList });
  },

  // 用户改变配送时间
  async handleChangeDeliverTime(e) {
    const time = e.detail.value;
    const index = e.currentTarget.dataset.index;
    let deliverTimeList = this.data.deliverTimeList;
    if (deliverTimeList.findIndex((v) => v === time) !== -1) {
      await showToast("该配送时间已存在");
      return;
    }
    deliverTimeList[index] = time;
    this.setData({ deliverTimeList });
  },

  // 用户改变截单时间
  handleChangeCutOrderTime(e) {
    this.setData({ cutOrderTime: Number(e.detail.value) });
  },

  // 用户点击放弃修改
  handleTapDiscard() {
    // console.log("用户点击放弃修改");
    this.refreshEditDeliver(this.shopInfo);
    this.setData({
      editable: false,
    });
  },

  // 用户点击修改
  handleTapEdit() {
    // console.log("用户点击修改");
    this.setData({
      editable: true,
    });
  },

  // 用户点击保存
  async handleTapSave(e) {
    // 先比较一下用户有没有真的修改内容
    const newMinConsumption = e.detail.value.minConsumption;
    const newCutOrderTime = this.data.cutOrderTime;
    const newDeliverTimeList = getSortedDeliverTime(this.data.deliverTimeList.slice()); //.slice()也是为了浅拷贝

    const oldMinConsumption = this.shopInfo.minConsumption;
    const oldCutOrderTime = this.shopInfo.cutOrderTime;
    const oldDeliverTimeList = this.shopInfo.deliverTimeList;

    if (
      Number(newMinConsumption) === Number(oldMinConsumption) &&
      newCutOrderTime === oldCutOrderTime &&
      newDeliverTimeList.every((v, i) => v === oldDeliverTimeList[i])
    ) {
      showToast("未进行修改");
      return;
    }

    // 检验输入合法性
    const validateMinConsumptionRes = validateMinConsumption(String(newMinConsumption));
    if (!validateMinConsumptionRes.isValid) {
      showToast(validateMinConsumptionRes.message);
      return;
    }

    const valiDeliverTimeListRes = validateDeliverTimeList(newDeliverTimeList);
    if (!valiDeliverTimeListRes.isValid) {
      showToast(valiDeliverTimeListRes.message);
      return;
    }

    const valiCutOrderTimeRes = validateCutOrderTime(newCutOrderTime);
    if (!valiCutOrderTimeRes.isValid) {
      showToast(valiCutOrderTimeRes.message);
      return;
    }

    const modalRes = await showModal("确定保存？");
    if (modalRes.cancel) {
      return;
    }

    // 运行到此说明输入数据无误 先做一下数据转换
    let newDeliverSetting = {
      minConsumption: Number(newMinConsumption),
      cutOrderTime: newCutOrderTime,
      deliverTimeList: newDeliverTimeList,
    };

    // 开始上传修改
    const updateRes = await updateDeliverSetting(this.shopInfo, newDeliverSetting);
    if (updateRes) {
      // 重新从云端拉取一遍shopInfo
      await updateAppShopInfo(this.shopInfo.shopId);
      showToast("修改成功");
    }
    this.refreshEditDeliver(app.globalData.shopInfo);
    this.handleTapDiscard();
  },

  // 刷新页面
  refreshEditDeliver(shopInfo) {
    this.shopInfo = shopInfo;
    const { cutOrderTime, deliverTimeList, minConsumption } = shopInfo;
    // 注意这里需要对数组进行一个浅拷贝 不然this.data中的deliverTimeList与shopInfo中的deliverTimeList是同一个引用
    let deliverTimeListCopy = deliverTimeList.slice();

    this.setData({
      cutOrderTime,
      deliverTimeList: deliverTimeListCopy,
      minConsumption,
    });
  },
  // ==============================================
  // ============== 页面生命周期函数 ================
  // ==============================================
  onLoad(options) {
    this.refreshEditDeliver(app.globalData.shopInfo);
  },
});
