import {
  showLoading,
  hideLoading,
  showModal,
  showToast
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
const ugGoodsRef = db.collection("ugGoods");
const refreshFlag = false;

let app = getApp();
Page({
  data: {
    allGoods: [],
  },
  // TODO 动态传入shopId
  shopId: "XauzkdyMJjf9qs",

  onTapAddGoods: function () {
    let cateId = this.cates[this.data.currentIndex].cateId;
    let goodsOrder = 65536;
    if (this.data.rightContent.length != 0) {
      goodsOrder = this.data.rightContent[0].goodsOrder / 2;
    }
    let catesInfo = JSON.stringify({
      shopId: this.shopId,
      cateId: cateId,
      goodsOrder: goodsOrder,
    });
    //console.log(this.data.rightContent)
    //console.log(catesInfo);

    wx.navigateTo({
      url: "../addGoods/addGoods?catesInfo=" + catesInfo,
    });
  },

  // 获取分类数据
  async getMyGoods(shopId) {
    try {
      await showLoading();
      let res2 = await wx.cloud.callFunction({
        name: "get_shop_ugGoods",
        data: {
          shopId: shopId,
          requireType: "my",
        },
      });
      // console.log("res2", res2);
      this.setData({
        allGoods: res2.result.allGoods,
      });
    } catch (error) {
      console.log("error", error);
      showModal("错误", "请检查网络状态后重试");
      return false
    } finally {
      hideLoading();
    }
  },

  // 点击商品图片跳转到商品详情
  handleTapEdit(e) {
    let {
      index
    } = e.currentTarget.dataset;

    // 准备要传递给商品详情页面的数据
    let goodsInfo = JSON.stringify({
      ...this.data.allGoods[index],
    });

    wx.navigateTo({
      url: "../editMyGoods/editMyGoods?goodsInfo="+goodsInfo,
    });
  },

  // ==========================================================
  // ==========================================================
  // =================== 页面生命周期函数 =======================
  // ==========================================================
  // ==========================================================
  async onShow() {
    // 根据全局变量判断当前页面是否需要刷新
    if (app.globalData.refreshFlag.myGoods) {
      // console.log("刷新页面");
      await this.getMyGoods(this.shopId);
      app.globalData.refreshFlag.myGoods = false;
    }
  },
  async onLoad() {
    app.globalData.refreshFlag.myGoods = true
  },

  async onPullDownRefresh() {
    await this.getMyGoods(this.shopId);
    await showToast("已刷新");
    wx.stopPullDownRefresh();
  },
});