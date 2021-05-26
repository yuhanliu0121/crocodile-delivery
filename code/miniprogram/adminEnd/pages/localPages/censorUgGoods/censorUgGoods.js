import {
  showLoading,
  hideLoading,
  showModal,
  showToast,
} from "../../../utils/asyncWX.js";
// 初始化云环境
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
// 这里只获取shop和goodsCate的索引 goods通过云函数获得
const ugGoodsRef = db.collection("ugGoods");

let app = getApp();
Page({
  data: {
    // 待审核商品
    allGoods: [],
    // 显示联系方式
    contactTypeText: ["微信号", "手机号", "邮箱", "QQ号"],
    // 哪些商品的详情被收起
    hideDetail: [],
    // 带输入框的对话框是否显示
    openInputDialog: false,
    // 输入拒绝理由对话框的按钮
    buttons: [{ text: "取消" }, { text: "确定" }],
    // 拒绝理由
    dialogInputText: "",
  },
  // TODO 动态传入shopId
  shopId: "XauzkdyMJjf9qs",

  // 点击一次展开商品详情 再点击一次收起商品详情
  handleTapItem(e) {
    const index = e.currentTarget.dataset.index;
    let hideDetail = this.data.hideDetail;
    hideDetail[index] = !hideDetail[index];
    this.setData({ hideDetail });
  },

  // 预览图片
  handlePreviewImg(e) {
    let img = e.currentTarget.dataset.src;
    wx.previewImage({
      current: img,
      urls: [img],
    });
  },

  // 获取待审查数据
  async getUnderCensorGoods() {
    await showLoading();
    const res2 = await wx.cloud.callFunction({
      name: "get_shop_ugGoods",
      data: {
        shopId: this.shopId,
        requireType: "censor",
      },
    });
    await hideLoading();
    const allGoods = res2.result.allGoods;
    let hideDetail = [];
    allGoods.forEach((v) => {
      hideDetail.push(true);
    });
    this.setData({
      allGoods,
      hideDetail,
    });

    if (allGoods.length === 0) {
      await showToast("没有待审核商品");
    }
  },
  // ==============================================================
  // ==============================================================
  // ======================  审核不通过  ===========================
  // ==============================================================
  // ==============================================================

  // 点击审核不通过
  async handleTapRejectBtn(e) {
    const modal = await showModal("确定拒绝此商品的发布？");
    if (modal.cancel) {
      return;
    }
    // 弹出输入拒绝理由对话框
    this.setData({
      openInputDialog: true,
    });
    // 记录当前操作的goods的index
    const index = e.currentTarget.dataset.index;
    this.goodsIndex = index;
  },

  // 输入拒绝理由
  handleChangeDialogInput(e) {
    this.setData({ dialogInputText: e.detail.value });
  },

  // 完成拒绝理由的输入
  async handleTapInputDialogButton(e) {
    const tapButtonIndex = e.detail.index;

    // 用户点击确定 则进行简单的输入非空检测
    if (tapButtonIndex === 1) {
      const rejectReason = this.data.dialogInputText;
      if (rejectReason.trim() === "") {
        await showToast("无效输入");
        return;
      }
      this.rejectUgGoods(rejectReason);
    }
    // 关闭对话框 清空输入内容
    this.setData({ dialogInputText: "", openInputDialog: false });
  },

  // 拒绝一个商品的发布
  async rejectUgGoods(rejectReason) {
    let goodsInfo = this.data.allGoods[this.goodsIndex];
    goodsInfo.goodsOrder = new Date().getTime();
    goodsInfo.rejectReason = rejectReason;
    goodsInfo.status = 2;
    await showLoading("保存中");
    const updateRes = await wx.cloud.callFunction({
      name: "censorGoods",
      data: {
        goodsInfo,
      },
    });
    await hideLoading();
    if (updateRes) {
      let allGoods = this.data.allGoods;
      allGoods.splice(this.goodsIndex, 1);
      this.setData({ allGoods });
      await showToast("已拒绝该商品发布");
      if (allGoods.length === 0) {
        await this.getUnderCensorGoods();
      }
    }
    return updateRes;
  },

  // ==============================================================
  // ==============================================================
  // ======================  审核通过  ============================
  // ==============================================================
  // ==============================================================

  // 点击审核通过
  async handleTapPassBtn(e) {
    const modal = await showModal("确定同意此商品的发布？");
    if (modal.cancel) {
      return;
    }
    const index = e.currentTarget.dataset.index;
    this.goodsIndex = index;
    this.passUgGoods();
  },

  async passUgGoods() {
    let goodsInfo = this.data.allGoods[this.goodsIndex];
    let goodsOrder = goodsInfo.watermark;

    const now = new Date().getTime();

    // 如果有过审核不通过的记录 则goodsOrder为审核通过时候的timestamp
    if (goodsInfo.rejectReason) {
      goodsOrder = now;
    }
    goodsInfo.goodsOrder = goodsOrder;
    goodsInfo.status = 1;
    goodsInfo.passTime = now;
    goodsInfo.expireTime = now + 30*24*60*60*1000 // 过期时间为审核时间起30天后

    await showLoading("保存中");
    const updateRes = await wx.cloud.callFunction({
      name: "censorGoods",
      data: {
        goodsInfo,
      },
    });
    await hideLoading();
    if (updateRes) {
      let allGoods = this.data.allGoods;
      allGoods.splice(this.goodsIndex, 1);
      this.setData({ allGoods });
      await showToast("该商品已通过审核");
      if (allGoods.length === 0) {
        await this.getUnderCensorGoods();
      }
    }
  },

  // =========== 没有待审核商品时 点击“点击刷新”================
  handleTapRefresh(){
    this.getUnderCensorGoods()
  },

  // ==========================================================
  // ==========================================================
  // =================== 页面生命周期函数 =======================
  // ==========================================================
  // ==========================================================
  async onShow() {
    // 获取商店及其商品的数据
    if (this.refreshFlag) {
      await this.getUnderCensorGoods();
      this.refreshFlag = false;
    }
  },
  async onLoad() {
    // console.log("onload");
    this.refreshFlag = true;
  },

  async onPullDownRefresh() {
    await this.getUnderCensorGoods();
    await showToast("已刷新");
    wx.stopPullDownRefresh();
  },
});
