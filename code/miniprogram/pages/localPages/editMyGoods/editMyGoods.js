import { removeManyGoodsCloud, updateGoodsCloud } from "../../../lib/goods/operation.js";
import { showModal, showLoading, hideLoading } from "../../../utils/asyncWX.js";

// 初始化云环境
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
// 这里只获取shop和goodsCate的索引 goods通过云函数获得
const shopRef = db.collection("shop");
const ugGoodsCateRef = db.collection("ugGoodsCate");
const refreshFlag = false;

let app = getApp();

Page({
  data: {
    // 商品信息对象
    goodsInfo: {},

    // 商品图片 该数据将由handleUploadImage事件跳转到editGoodsPic页面后得到修改
    img: "",

    goodsDetail: "",

    // 可供选择的商品类别
    selGoodsCateItems: [],

    // 联系方式索引
    contactTypesIndex: 0,

    // 商品类别的索引
    cateIndex: -1,

    // 可供选择的商品类别
    catePickRng: {},

    // 具体的联系方式
    contactType: ["微信号", "手机号", "邮箱", "QQ号"],
  },

  shopId: "",
  cateInfo: [],

  /* ====== 页面业务处理函数 ======*/

  // ==============================================================
  // ==============================================================
  // =====================   提交修改处理   ========================
  // ==============================================================
  // ==============================================================

  // 保存商品信息
  async handleSaveGoods(e) {
    // 新的商品信息
    const goodsInfoNew = {
      ...e.detail.value,
      cateId: this.cateInfo[this.data.cateIndex].cateId,
      goodsPicUrl: this.data.img,
    };

    // 旧的商品信息
    const goodsInfoOld = this.data.goodsInfo;
    // console.log("goodsInfoNew", goodsInfoNew);
    // console.log("goodsInfoOld", goodsInfoOld);
    // 更新商品信息
    const res = await updateGoodsCloud(goodsInfoNew, goodsInfoOld);
    // console.log("res", res);

    // 如果上传成功则云端返回的数据是含有_id属性的，这时再跳转回上一页否则停留在当前页
    if (res) {
      app.globalData.refreshFlag.myGoods = true;
      wx.navigateBack({
        delta: 1,
      });
    }
  },

  async handleDeleteGoods() {
    // TODO 删除结束以后需要回退一个页面 并重新拉取页面数据
    const modal = await showModal("确定删除?");
    if (modal.confirm) {
      const res = await removeManyGoodsCloud([this.data.goodsInfo]);
      if (res) {
        app.globalData.refreshFlag.myGoods = true;
        wx.navigateBack({
          delta: 1,
        });
      }
    }
  },

  // ==============================================================
  // ==============================================================
  // =====================   商品详情处理   ========================
  // ==============================================================
  // ==============================================================

  // 商品详情变化
  handleGoodsDetailChange(e) {
    const goodsDetail = e.detail.value;
    this.setData({ goodsDetail });
  },

  // ==============================================================
  // ==============================================================
  // =====================   商品图片处理   ========================
  // ==============================================================
  // ==============================================================

  // 点击上传图片按钮
  handleUploadImage() {
    wx.navigateTo({
      url: "../editGoodsPic/editGoodsPic",
    });
  },

  // 点击图片进行大图预览
  handlePreviewImg(e) {
    const img = this.data.img;
    wx.previewImage({
      current: img,
      urls: [img],
    });
  },

  // 点击删除图片按钮
  handleRemoveImg(e) {
    this.setData({ img: "" });
  },

  // ==============================================================
  // ==============================================================
  // =====================   商品类别处理   ========================
  // ==============================================================
  // ==============================================================

  // 用户更改商品类别
  handleChangeGoodsCate(e) {
    this.setData({ cateIndex: e.detail.value });
  },

  // 获得商店的分类数据
  async getShopCateInfo(shopId) {
    try {
      await showLoading("加载中");
      const cateRes = await ugGoodsCateRef
        .where({
          shopId: shopId,
          isExist: true,
        })
        .field({
          _id: false,
          cateId: true,
          cateName: true,
        })
        .get();
      return cateRes.data;
    } catch (error) {
      showModal("错误", "请检查网络状态后重试");
      return;
    } finally {
      await hideLoading();
    }
  },

  // ==============================================================
  // ==============================================================
  // =====================   联系方式   ============================
  // ==============================================================
  // ==============================================================

  // 用户更改联系方式
  handleContactTypeChange(e) {
    const contactTypesIndex = e.detail.value;
    this.setData({
      contactTypesIndex,
    });
  },

  // ==============================================================
  // ==============================================================
  // =====================   页面初始数据设置   ====================
  // ==============================================================
  // ==============================================================
  async initPage() {
    // 先初始化商品详情和联系信息
    const goodsDetail = this.data.goodsInfo.goodsDetail;
    const contactType = this.data.goodsInfo.contactType;
    this.setData({
      goodsDetail,
      contactTypesIndex: contactType,
    });

    // 准备可供选择的cate项目
    const cateInfo = await this.getShopCateInfo(this.shopId);
    if (!cateInfo) {
      return;
    }
    this.cateInfo = cateInfo;

    // 从goodsInfo中获取cateId
    let goodsCateId = this.data.goodsInfo.cateId;
    let cateIndex = this.cateInfo.findIndex((v) => v.cateId === goodsCateId);

    // set cateName
    this.setData({
      cateIndex,
      catePickRng: cateInfo,
    });
  },

  /* ====== 页面生命周期函数 ======*/

  async onLoad(option) {
    let goodsInfo = JSON.parse(option.goodsInfo);
    // console.log(goodsInfo);
    this.setData({
      goodsInfo,
      img: goodsInfo.goodsPicUrl,
    });

    // 获得商店的分类数据
    const shopId = goodsInfo.shopId;
    this.shopId = shopId;

    this.initPage();
  },
});
