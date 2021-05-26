import {
  showLoading,
  hideLoading,
  showModal,
  showToast,
} from "../../../utils/asyncWX.js";

import { addGoodsCloud } from "../../../lib/goods/operation.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 商品信息对象
    goodsInfo: {},

    // 商品图片 该数据将由handleUploadImage事件跳转到editGoodsPic页面后得到修改
    img:"",

    // 商品详情
    goodsDetail:"",

    // 选择分类picker的范围
    catePickRng:[],

    // 分类picker的index
    currentIndex:-1,
  },

  /* =========  页面业务处理函数 ===========*/

  // 保存商品数据
  async handleSaveGoods(e) {
    /*
    通过e.detail.value拿到的数据只有
      goodsName
      goodsStock
      goodsPrice
      goodsBuyLimit
      goodsBuyLeastLimit
      goodsDetail

    还需要再添加:
      goodsId --->由addGoodsCloud根据一定算法自动添加
      goodsAvailable --->由addGoodsCloud根据goodsStock自动添加
      isExist --->由addGoodsCloud自动添加
    */

    let goodsInfo = {
      ...e.detail.value,
      ...this.data.goodsInfo,
      cateId:this.data.catePickRng[this.data.currentIndex].cateId,
      goodsPicUrl:this.data.img
    };
    const res = await addGoodsCloud(goodsInfo);
    console.log("res", res);

    // 如果上传成功则云端返回的数据是含有_id属性的，这时再跳转回上一页否则停留在当前页
    if (res) {
      let pages = getCurrentPages(); // 获取页面栈
      let prevPage = pages[pages.length - 2]; //获取上一个页面(商品管理页面)
      prevPage.refreshFlag = true; // 将重新刷新flag设置为true
      prevPage.setData({
        scrollTop:0
      });
      wx.navigateBack({
        delta: 1,
      });
    }
  },

  // 用户更改商品类别
  handleChangeGoodsCate(e){
    this.setData({
      currentIndex:e.detail.value
    })
  },

  // 用户填写商品详情
  handleGoodsDetailChange(e){
    let goodsDetail = e.detail.value;
    this.setData({goodsDetail})
  },

  // 删除上传的商品图
  handleRemoveImg() {
    this.setData({ img: "" });
  },

  // 点击预览商品大图
  handlePreviewImg() {
    const img = this.data.img
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

  onLoad(options) {
    // 获取传递过来的商品信息
    const { shopId, goodsOrder } = JSON.parse(options.catesInfo);

    // 从上一个页面获取商品类别信息
    let pages = getCurrentPages(); // 获取页面栈
    let prevPage = pages[pages.length - 2];  //上一个页面
    const cates = prevPage.data.leftMenuList;
    const currentIndex = prevPage.data.currentIndex;

    let goodsInfo = {}
    goodsInfo.shopId = shopId;
    goodsInfo.goodsOrder = goodsOrder;
    goodsInfo.goodsPicUrl = ""
    this.setData({
      goodsInfo,
      currentIndex,
      catePickRng:cates,
    });

  },
});
