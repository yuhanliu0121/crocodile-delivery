import { showLoading, hideLoading, showToast, showModal } from "../../../utils/asyncWX.js";
import { getSwiperListCloud, getSelfRunShopListCloud, getRecommendShopListCloud } from "../../../lib/home/operation.js";

Page({
  data: {
    // 轮播图数据
    swiperList: [],
    // 推荐店铺数组
    recommendShopList: [],
    // 自营店数组
    selfRunShopList: [],
  },

  /*============= 方法 =========================*/

  // 刷新首页
  async refreshHomePage() {
    const res = await Promise.all([getSwiperListCloud(), getSelfRunShopListCloud(), getRecommendShopListCloud()]);
    const swiperList = res[0];
    const selfRunShopList = res[1];
    const recommendShopList = res[2];
    console.log(recommendShopList);
    

    this.setData({ swiperList, selfRunShopList, recommendShopList });
  },

  // 用户点击首页swiper
  handleTapSwiper(e) {
    const index = e.currentTarget.dataset.index;
    const swiper = this.data.swiperList[index];

    wx.navigateTo({
      url: swiper.navigatorUrl,
    });
  },

  async onPullDownRefresh() {
    try {
      await showLoading();
      await this.refreshHomePage();
      await showToast("已刷新");
    } catch (error) {
      console.log("error", error);
      showModal("错误", "请检查网络状态后重试");
      return false;
    } finally {
      await hideLoading();
      wx.stopPullDownRefresh();
    }
  },

  /*==================== 页面生命周期函数 ===========================*/
  // 页面开始加载 就会触发
  async onLoad(options) {
    try {
      await showLoading();
      await this.refreshHomePage();
    } catch (error) {
      console.log("error", error);
      showModal("错误", "请检查网络状态后重试");
      return false;
    } finally {
      await hideLoading();
    }
  },
});
