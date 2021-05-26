import {
  showLoading,
  hideLoading,
  showModal
} from "../../../utils/asyncWX.js";
import {
  enableSaleCloud,
  disableSaleCloud,
} from "../../../lib/goods/operation.js";
// 初始化云环境
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
// 这里只获取shop和goodsCate的索引 goods通过云函数获得
const shopRef = db.collection("shop");
const goodsRef = db.collection("goods");
const refreshFlag = false;

let app = getApp();
Page({
  data: {
    // 左侧的菜单数据
    leftMenuList: [],
    // 右侧的商品数据
    rightContent: [],
    // 被点击的左侧的菜单
    currentIndex: 0,
    // 右侧内容的滚动条距离顶部的距离
    scrollTop: 0,
    // 是否刷新
    refreshFlag: false,
  },
  cates: [],
  shopId: "",

  onTapCategoryManage: function () {
    wx.navigateTo({
      url: "../categoryManage/categoryManage"
    });
  },

  async onTapSortAndBatch() {
    if (this.data.rightContent.length === 0) {
      await showModal("提示", "当前分类还没有商品哦~")
      return
    }
    wx.navigateTo({
      url: "../sortAndBatch/sortAndBatch",
    });
  },
  onTapAddGoods: function () {
    let {
      cateId,
      cateName
    } = this.cates[this.data.currentIndex];
    let goodsOrder = 65536;
    if (this.data.rightContent.length != 0) {
      goodsOrder = this.data.rightContent[0].goodsOrder / 2;
    }
    let catesInfo = JSON.stringify({
      shopId: this.shopId,
      goodsOrder: goodsOrder,
    });

    wx.navigateTo({
      url: "../addGoods/addGoods?catesInfo=" + catesInfo,
    });

  },

  // 点击上架商品
  async tabUpload(e) {
    let index = e.currentTarget.dataset.index;
    let rightContent = this.data.rightContent;

    const goodsInfo = rightContent[index];
    const res = await enableSaleCloud(goodsInfo);

    if (res) {
      rightContent[index].goodsAvailable = true;
      this.setData({
        rightContent,
      });
    }
  },

  // 点击下架商品
  async tabRemove(e) {
    let index = e.currentTarget.dataset.index;
    let rightContent = this.data.rightContent;
    const goodsInfo = rightContent[index];
    const res = await disableSaleCloud(goodsInfo);

    if (res) {
      rightContent[index].goodsAvailable = false;
      this.setData({
        rightContent,
      });
    }
  },

  // 获取分类数据
  async getShopDetail() {
    try {
      let res2 = await wx.cloud.callFunction({
        name: "get_shop_goods",
        data: {
          shopId: this.shopId,
        },
      });
      const {
        allGoods
      } = res2.result;
      // console.log("allGoods",allGoods)

      let cates = allGoods;
      this.cates = cates;
      //======================

      // 构造左侧的大菜单数据
      //console.log('cates:',cates);

      let leftMenuList = cates.map((v) => {
        return {
          cateId: v.cateId,
          cateName: v.cateName,
          cateOrder: v.cateOrder
        }
      });
      // 构造右侧的商品数据
      let index = this.data.currentIndex;

      let rightContent = (cates[index] || []).goods || [];

      // 给页面数据赋值
      this.setData({
        leftMenuList,
        rightContent,
      });
    } catch (error) {
      console.log("error", error);
      showModal("错误", "请检查网络状态后重试");
      return false
    } finally {}
  },

  // 左侧菜单的点击事件
  handleItemTap(e) {
    /* 
    1 获取被点击的标题身上的索引
    2 给data中的currentIndex赋值就可以了
    3 根据不同的索引来渲染右侧的商品内容
     */
    const {
      index
    } = e.currentTarget.dataset;

    let rightContent = this.cates[index].goods;
    this.setData({
      currentIndex: index,
      rightContent,
      // 重新设置 右侧内容的scroll-view标签的距离顶部的距离
      scrollTop: 0,
    });
  },

  // 点击商品图片跳转到商品详情
  handleTapEdit(e) {
    let {
      index
    } = e.currentTarget.dataset;

    // 准备要传递给商品详情页面的数据
    let goodsInfo = JSON.stringify({
      ...this.data.rightContent[index],
    });

    wx.navigateTo({
      url: "../goodsInfo/goodsInfo?goodsInfo=" + goodsInfo,
    });
  },

  // 用户下拉刷新
  async handleRefresh() {
    this.setData({
      refreshFlag: true
    });
    await showLoading();
    await this.getShopDetail();
    await hideLoading();
    this.setData({
      refreshFlag: false
    });
  },

  // ======================================================================
  // ======================================================================
  // ============================ 页面生命周期函数 ==========================
  // ======================================================================
  // ======================================================================

  async onShow() {
    // 获取商店及其商品的数据
    if (this.refreshFlag) {
      await showLoading();
      await this.getShopDetail();
      await hideLoading();
      this.refreshFlag = false;
    }
  },
  async onLoad() {
    this.shopId = app.globalData.shopInfo.shopId;
    this.refreshFlag = true;
  },
});