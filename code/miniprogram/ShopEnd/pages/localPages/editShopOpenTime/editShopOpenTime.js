import { validateOpenCloseTime } from "../../../lib/login/check.js";
import { showToast, showModal } from "../../../utils/asyncWX.js";
import {
  updateOpenTime,
  updateAppShopInfo,
} from "../../../lib/setting/operation.js";
let app = getApp();

Page({
  data: {
    // 是否可编辑
    editable: false,
    // 开门时间
    openTime: "请选择开门时间",
    // 关门时间
    closeTime: "请选择关门时间",
    // 选择营业日对话框是否打开
    openSelectOpenDayDialog: false,
    // 可供选择的营业日
    selOpenDayItems: [
      { text: "周一", value: 1 },
      { text: "周二", value: 2 },
      { text: "周三", value: 3 },
      { text: "周四", value: 4 },
      { text: "周五", value: 5 },
      { text: "周六", value: 6 },
      { text: "周日", value: 0 },
    ],

    // 选择营业日对话框按钮
    buttons: [{ text: "取消" }, { text: "确定" }],

    // 用于展示用户选择了哪些天作为营业天
    selOpenDayText: "请选择营业日",

    // 营业日数组
    openDay: [],
  },

  shopInfo: {},
  openDay_temp: [],
  openDayIndex_temp:[],

  // 点击打开选择营业日对话框
  handleChangeOpenDay(e) {
    // console.log("点击修改营业日");
    if (!this.data.editable) {
      return;
    }
    this.setData({ openSelectOpenDayDialog: true });
  },

  // 用户更改营业日
  handleOpenDayChange(e) {
    let openDayIndex = e.detail.value;
    // 将携带的value值转为int并排序
    let openDay = [0, 0, 0, 0, 0, 0, 0];
    openDayIndex = openDayIndex
      .map((v) => {
        openDay[v] = 1;
        return Number(v);
      })
      .sort();

    this.openDay_temp = openDay;
    this.openDayIndex_temp = openDayIndex;
  },

  // 将openDayList转换成文本
  getOpenDayText(openDayIndex) {
    // 准备展示文本
    if (openDayIndex.length === 7) {
      return "每天";
    } else if (
      openDayIndex.length === 5 &&
      !openDayIndex.includes(0) &&
      !openDayIndex.includes(6)
    ) {
      // console.log("openDayIndex***", openDayIndex);
      return "工作日";
    } else {
      const tempDic = {
        0: "周日",
        1: "周一",
        2: "周二",
        3: "周三",
        4: "周四",
        5: "周五",
        6: "周六",
      };
      let openDayTextList = openDayIndex.map((v) => tempDic[v]);
      // 如果有周日 则为了习惯把周日放最后
      if (openDayTextList.includes("周日")) {
        openDayTextList.splice(0, 1);
        openDayTextList.push("周日");
      }
      return openDayTextList.join(" ") || "请选择营业日";
    }
  },

  // 点击选择营业日对话框按钮
  async hadnleTapSelectOpenDayButton(e) {
    const tapButtonIndex = e.detail.index;
    // 点击取消则先获取本来的设置 再重新setData 否则checkbox会记住上一次修改的结果
    if(tapButtonIndex === 0){
      const openDay = this.data.openDay
      this.setData({ openDay,openSelectOpenDayDialog: false });
    }

    if(tapButtonIndex ===1){
      // 点击确定则重置对应的数据
      this.setData({ openDay:this.openDay_temp});
      let selOpenDayText = this.getOpenDayText(this.openDayIndex_temp);
      this.setData({ selOpenDayText,openSelectOpenDayDialog: false });
    }
  },

  // 开门时间变动
  handleChangeOpenTime(e) {
    const openTime = e.detail.value;
    console.log("检测到开门时间变化", openTime);
    this.setData({
      openTime: openTime,
    });
  },

  // 关门时间变动
  handleChangeCloseTime(e) {
    const closeTime = e.detail.value;
    // console.log("检测到关门时间变化", closeTime);
    this.setData({
      closeTime: closeTime,
    });
  },

  // 用户点击保存
  async handleTapSave() {
    // console.log("用户点击保存");

    // 先比较一下用户有没有进行修改
    const newOpenTime = this.data.openTime;
    const newCloseTime = this.data.closeTime;
    const newOpenDay = this.data.openDay;
    const oldOpenTime = this.shopInfo.openTime;
    const oldCloseTime = this.shopInfo.closeTime;
    const oldOpenDay = this.shopInfo.openDay;

    if (
      newOpenTime === oldOpenTime &&
      newCloseTime === oldCloseTime &&
      newOpenDay.every((v, i) => v === oldOpenDay[i])
    ) {
      showToast("未进行修改");
      return;
    }

    // 能运行到这说明用户确实进行了改变 先检验输入的合法性
    if (newOpenDay.every((v) => v === 0)) {
      showToast("未输入营业日");
      return;
    }
    const valiopenCloseTime = validateOpenCloseTime(newOpenTime, newCloseTime);
    // console.log("valiopenCloseTime",valiopenCloseTime);
    if (!valiopenCloseTime.isValid) {
      showToast(valiopenCloseTime.message);
      return;
    }

    const modalRes = await showModal("确定保存？");
    if (modalRes.cancel) {
      return;
    }

    let timeInfo = {
      openTime: newOpenTime,
      closeTime: newCloseTime,
      openDay: newOpenDay,
    };
    // 开始上传修改
    const updateRes = await updateOpenTime(this.shopInfo, timeInfo);
    if (updateRes) {
      // 重新从云端拉取一遍shopInfo
      await updateAppShopInfo(this.shopInfo.shopId);
      showToast("修改成功");
    }
    this.refreshEditShopOpenTime(app.globalData.shopInfo);
    this.handleTapDiscard();
  },

  // 用户点击放弃修改
  handleTapDiscard() {
    // console.log("用户点击放弃修改");
    this.refreshEditShopOpenTime(this.shopInfo);
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

  // 刷新页面
  refreshEditShopOpenTime(shopInfo) {
    this.shopInfo = shopInfo;
    let { openTime, closeTime, openDay } = shopInfo;
    let openDayIndex = [];
    openDay.forEach((v, i) => {
      if (v === 1) {
        openDayIndex.push(i);
      }
    });
    let selOpenDayText = this.getOpenDayText(openDayIndex);
    this.setData({ openTime, closeTime, selOpenDayText, openDay });
  },

  // ==================================================
  // ================  页面生命周期函数 =================
  // ==================================================

  onLoad(options) {
    this.refreshEditShopOpenTime(app.globalData.shopInfo);
  },
});
