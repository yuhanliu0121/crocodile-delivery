import { showLoading, hideLoading, showModal, showToast } from "../../../utils/asyncWX.js";

import { addGoodsCloud } from "../../../lib/goods/operation.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 商品图片 该数据将由handleUploadImage事件跳转到editGoodsPic页面后得到修改
    img: "",

    // 可供选择的商品类别
    selGoodsCateItems: [],
    // 商品类别显示的文字
    cateName: "请选择商品类别",

    // 商品详情
    goodsDetail: "",

    // 联系方式索引
    contactTypesIndex: 0,

    // 具体的联系方式
    contactType: ["微信号", "手机号", "邮箱", "QQ号"],

    // 是否展示商品管理办法
    showRule: false,
  },

  shopId: "",
  cateInfo: [],
  // 用户选择的商品类别的index
  // cateInfo[cateIndex]即可得到商品类别的id和name
  cateIndex: -1,

  /* =========  页面业务处理函数 ===========*/

  // 保存商品数据
  async handleSaveGoods(e) {
    // console.log("e.detail.value", e.detail.value);
    /*
    通过e.detail.value拿到的数据只有
      goodsName
      goodsStock
      goodsPrice
      goodsDetail
      contactType

    还需要再添加:
    goodsPicUrl ---> this.data.img
    cateId --->this.cateIndex === -1 ? "" : this.cateInfo[this.cateIndex].cateId
    shopId ---> this.shopId
    goodsOrder ---> 由addGoodsCloud根据进行添加
    goodsId --->由addGoodsCloud根据一定算法自动添加
    isExist --->由addGoodsCloud自动添加
    */
    let goodsInfo = {
      ...e.detail.value,
      shopId: this.shopId,
      cateName: this.data.cateName,
      goodsPicUrl: this.data.img,
      cateId: this.cateIndex === -1 ? "" : this.cateInfo[this.cateIndex].cateId,
    };
    const res = await addGoodsCloud(goodsInfo);
    // console.log("res", res);

    // 如果上传成功则云端返回的数据是含有_id属性的，这时再跳转回上一页否则停留在当前页
    if (res) {
      wx.navigateBack({
        delta: 1,
      });
    }
  },

  // 用户填写商品详情
  handleGoodsDetailChange(e) {
    let goodsDetail = e.detail.value;
    this.setData({ goodsDetail });
  },

  // 删除上传的商品图
  handleRemoveImg() {
    this.setData({ img: "" });
  },

  // 点击预览商品大图
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

  // 准备可供选择的商品类别
  setCateItems(cateInfo) {
    let selGoodsCateItems = [];
    cateInfo.forEach((v) => {
      selGoodsCateItems.push(v.cateName);
    });
    this.setData({ selGoodsCateItems });
  },

  // 用户更改商品类别
  handleChangeGoodsCate(e) {
    const cateIndex = e.detail.value;
    this.cateIndex = cateIndex;
    this.setData({
      cateName: this.cateInfo[cateIndex].cateName,
    });
  },

  // 用户更改联系方式
  handleContactTypeChange(e) {
    const contactTypesIndex = e.detail.value;
    this.setData({
      contactTypesIndex,
    });
  },

  // 用户点击阅读商品管理办法
  handleTapReadRule() {
    const showRule = this.data.showRule;
    this.setData({
      showRule: !showRule,
    });
  },

  onLoad(options) {
    const { shopId, cateInfoURI } = options;
    const cateInfo = JSON.parse(decodeURIComponent(cateInfoURI));
    // console.log("shopId", shopId);
    // console.log("cateInfo", cateInfo);
    this.shopId = shopId;
    this.cateInfo = cateInfo;

    // 准备好可供选择的商品类别
    this.setCateItems(cateInfo);
  },
});
