// 点击商店分类后返回的商店数据
import { showLoading, hideLoading, showModal } from "../../../utils/asyncWX.js";
const db = wx.cloud.database();
const shop_col = db.collection("shop");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    shopList: [],
  },

  /* =========== 页面事务处理函数 ============*/
  async getShopList(shopCate) {
    try {
      const MAX_LIMIT = 20;
      // 商店查询语句 "_q"表示这是一个查询(query)
      let shops_q = shop_col.where({
        shopCate: shopCate,
        isActivated: true,
        isExist: true,
      });
      // 先查询有多少条数据需要返回
      const countResult = await shops_q.count();
      const total = countResult.total;
      // 计算需分几次取
      const batchTimes = Math.ceil(total / 100);
      // 承载所有读操作的 promise 的数组
      const tasks = [];
      for (let i = 0; i < batchTimes; i++) {
        const promise = shops_q
          .skip(i * MAX_LIMIT)
          .limit(MAX_LIMIT)
          .field({
            // 只返回下列字段
            shopId: true,
            shopName: true,
            logoUrl: true,
            shopStatus: true,
            minConsumption: true,
          })
          .get();
        tasks.push(promise);
      }
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data),
          errMsg: acc.errMsg,
        };
      });
    } catch (error) {
      showModal("错误", "请检查网络状态后重试");
      return false;
    }
  },

  /* =========== 页面生命周期函数 ============*/
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const shopCate = parseInt(options.shopCate);
    await showLoading();
    let res = await this.getShopList(shopCate);
    await hideLoading();
    if (!res) {
      return;
    }
    this.setData({
      shopList: res.data,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
