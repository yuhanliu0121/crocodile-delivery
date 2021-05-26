import {
  removeManyGoodsCloud,
  updateGoodsCloud,
} from "../../../lib/goods/operation.js";
import { showModal } from "../../../utils/asyncWX.js";
Page({
  data: {
    // 商品信息对象
    goodsInfo: {},

    // 商品图片 该数据将由handleUploadImage事件跳转到editGoodsPic页面后得到修改
    img:
      "https://hannatiger.com/wp-content/uploads/2020/06/bourbon-every-buger-cookies.jpg",

    goodsDetail: "",

    // 选择分类picker的范围
    catePickRng: [],

    // 分类picker的index
    currentIndex: -1,
  },

  /* ====== 页面业务处理函数 ======*/

  // 处理所有的输入框输入值变动事件(由于官方的表单校验bug较多，这里实际上不会用到这个属性所以暂时搭个框架 等官方修复好了可以恢复使用)
  // handleInputChange(e) {
  //   const { field } = e.currentTarget.dataset;
  //   console.log("检测到", field, "发生变化: ", e.detail.value);
  //   this.setData({
  //     [`formData.${field}`]: e.detail.value,
  //   });
  // },

  // 商品详情变化
  handleGoodsDetailChange(e) {
    const goodsDetail = e.detail.value;
    this.setData({ goodsDetail });
  },

  // 保存商品信息
  async handleSaveGoods(e) {
    // 新的商品信息
    const goodsInfoNew = {
      ...e.detail.value,
      cateId:this.data.catePickRng[this.data.currentIndex].cateId,
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
      let pages = getCurrentPages(); // 获取页面栈
      let prevPage = pages[pages.length - 2]; //获取上一个页面(即：商品管理页面)
      prevPage.refreshFlag = true;
      wx.navigateBack({
        delta: 1,
      });
    }
    //
  },

  async handleDeleteGoods() {
    const modal = await showModal("确定删除?");
    if (modal.confirm) {
      const res = await removeManyGoodsCloud([this.data.goodsInfo]);
      if (res) {
        let pages = getCurrentPages(); // 获取页面栈
        let prevPage = pages[pages.length - 2]; //获取上一个页面(即：商品管理页面)
        prevPage.refreshFlag = true;
        wx.navigateBack({
          delta: 1,
        });
      }
    }
  },

  // 用户更改商品类别
  handleChangeGoodsCate(e) {
    this.setData({
      currentIndex: e.detail.value,
    });
  },

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

  /* ====== 页面生命周期函数 ======*/

  onLoad(option) {
    // 接收传过来的商品信息
    let goodsInfo = JSON.parse(option.goodsInfo);
    // console.log("goodsInfo",goodsInfo);

    // 从上一个页面获取商品类别信息
    let pages = getCurrentPages(); // 获取页面栈
    let prevPage = pages[pages.length - 2]; //上一个页面
    const cates = prevPage.data.leftMenuList;

    let currentIndex = cates.findIndex(v=> v.cateId === goodsInfo.cateId)
    // console.log("currentIndex",currentIndex);

    this.setData({
      goodsInfo,
      img: goodsInfo.goodsPicUrl,
      currentIndex,
      catePickRng: cates,
    });
  },
});
