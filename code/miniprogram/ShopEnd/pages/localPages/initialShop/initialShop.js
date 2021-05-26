import { validateInitShopSetting } from "../../../lib/login/check.js";
import { showToast, showModal } from "../../../utils/asyncWX.js";
import { initialiShop } from "../../../lib/login/operation.js";
import { setLoginRecord } from "../../../lib/loginRecord/operation.js";
let app = getApp();
Page({
  data: {
    showTopTips: false,

    // 商店编号
    shopId: "",
    // 商店头像
    img: "",
    // 可供选择的营业类型
    shopCateRng: [
      { cateName: "超市", cateIdx: 0 },
      { cateName: "餐厅", cateIdx: 1 },
    ],
    // 实际选择的商店类型
    shopCate: -1,

    // 可供选择的州份
    stateRng: [{ stateName: "FL", stateIdx: 0 }],
    // 实际选择的州份
    state: "",

    // 开门时间
    openTime: "",
    // 关门时间
    closeTime: "",

    // 门店公告 主要用这个属性来实时显示输入的字数
    shopAnnounce: "",

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
    // 用于展示用户选择了哪些天作为营业天
    selOpenDayText: "请选择营业日",

    // 营业日
    openDay: [0, 0, 0, 0, 0, 0, 0],

    // 选择营业日对话框按钮
    buttons: [{ text: "取消" }, { text: "确定" }],

    // 配送时段数组
    deliverTimeList: [""],

    // 可供选择的截单时间
    cutOrderTimeRng: [...Array(60).keys()],
    // 截单时间
    cutOrderTime: -1,

    // 可供选择的服务费比例
    serviceFeePercentRng: [...Array(101).keys()],

    // 实际选择的服务费比例
    serviceFeePercent: -1,

    // 可供选择的配送费比例
    deliverFeePercentRng: [...Array(101).keys()],

    // 实际选择的配送费比例
    deliverFeePercent: -1,
  },

  // 删除上传的商店头像
  handleRemoveImg() {
    this.setData({
      img: "",
    });
  },

  // 点击预览头像大图
  handlePreviewImg() {
    const img = this.data.img;
    wx.previewImage({
      current: img,
      urls: [img],
    });
  },

  // 上传
  handleUploadImage() {
    wx.navigateTo({
      url: "../editGoodsPic/editGoodsPic",
    });
  },

  // 商店公告输入框变动事件
  handleShopAnnounceChange(e) {
    const shopAnnounce = e.detail.value;
    this.setData({ shopAnnounce });
  },

  // 营业类型输入值变动
  handleChangeShopCate(e) {
    this.setData({ shopCate: Number(e.detail.value) });
  },

  // 所在州份变动
  handleChangeState(e) {
    const state = this.data.stateRng[e.detail.value].stateName;
    this.setData({ state: state });
  },

  // 点击打开选择营业日对话框
  handleChangeOpenDay(e) {
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

    this.setData({ openDay });

    // 准备展示文本
    if (openDayIndex.length === 7) {
      this.setData({ selOpenDayText: "每天" });
    } else if (openDayIndex.length === 5 && !openDayIndex.includes(0) && !openDayIndex.includes(6)) {
      this.setData({ selOpenDayText: "工作日" });
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
      let openDayTextList = openDayIndex.map((v) => {
        return tempDic[v];
      });
      // 如果有周日 则为了习惯把周日放最后
      if (openDayTextList.includes("周日")) {
        openDayTextList.splice(0, 1);
        openDayTextList.push("周日");
      }
      this.setData({
        selOpenDayText: openDayTextList.join(" ") || "请选择营业日",
      });
    }
  },
  // 点击选择营业日对话框按钮
  async hadnleTapSelectOpenDayButton(e) {
    const selOpenDayText = this.data.selOpenDayText;
    this.setData({ openSelectOpenDayDialog: false });
  },

  // 开门时间变动
  handleChangeOpenTime(e) {
    const openTime = e.detail.value;
    this.setData({ openTime: openTime });
  },

  // 关门时间变动
  handleChangeCloseTime(e) {
    const closeTime = e.detail.value;
    this.setData({ closeTime: closeTime });
  },

  // 用户点击增加配送时间
  async handleTapAddDeliverTIme() {
    let deliverTimeList = this.data.deliverTimeList;
    if (deliverTimeList.length === 12) {
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

  // 用户改变服务费比例
  handleChangeServiceFeePercent(e) {
    this.setData({ serviceFeePercent: Number(e.detail.value) });
  },
  // 用户改变配送费比例
  handleChangeDeliverFeePercent(e) {
    this.setData({ deliverFeePercent: Number(e.detail.value) });
  },

  // 此处对表单各个单项进行单个校验

  async handleSaveForm(e) {
    const formData = {
      ...e.detail.value,
      shopId: this.data.shopId,
      logoUrl: this.data.img,
      state: this.data.state,
      openDay: this.data.openDay,
      deliverTimeList: this.data.deliverTimeList,
      openTime: this.data.openTime,
      closeTime: this.data.closeTime,
      cutOrderTime: this.data.cutOrderTime,
      serviceFeePercent: this.data.serviceFeePercent,
      deliverFeePercent: this.data.deliverFeePercent,
    };
    console.log(formData);

    const validateRes = validateInitShopSetting(formData, "商店初始信息");
    console.log("validateRes", validateRes);
    if (!validateRes.isValid) {
      showToast(validateRes.message);
      return;
    }
    // 校验通过
    const initRes = await initialiShop(formData);
    if (!initRes) {
      return;
    }
    const initResData = initRes.result;

    // const initRes = true;
    if (initResData.errCode === 200) {
      // errCode === 200 初始化成功
      // 将商店信息和权限信息绑定到全局
      app.globalData.shopInfo = initResData.data.shopInfo;
      app.globalData.accessInfo = initResData.data.accessInfo;

      // 打包登录信息
      const loginInfo = {
        shopInfo: app.globalData.shopInfo,
        accessInfo: app.globalData.accessInfo,
      };
      // 4 将登录信息缓存
      setLoginRecord(loginInfo);
      // 5 跳转到商品管理页面
      wx.reLaunch({
        url: "../goodsManage/goodsManage",
        success: (result) => {
          wx.showModal({
            title: "商店初始化成功",
            content: "恭喜！您的商店已经初始化成功。即将跳转到商品管理页面。当您的商品数量为0时，顾客端将无法正常显示您的商店详情数据，请尽快添加商品吧~",
          });
          // 在此设置用户的类型为店主
          const loginInfo = {
            shopInfo: {
              shopId: formData.shopId,
              shopName: formData.shopName,
            },
            accessInfo: {},
          };
          app.loginInfo = loginInfo;
        },
        fail: (res) => {
          console.log(res);
        },
      });
    }
  },
  onLoad: function (options) {
    const shopId = options.shopId;
    this.setData({ shopId: shopId });
  },
});
