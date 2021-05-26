import {
  add,
  subtract,
  times,
  divide,
} from "../../../lib/calculate/calculate.js";
import {
  hasShopCart,
  addShopCart,
  getShopCart,
  addGoods,
  reduceGoods,
  clearShopCart,
} from "../../../lib/cart/operation.js";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    goodsInfo: {},
    // 商品总价
    totalPrice: 0,
    // 商品总数
    totalNum: 0,
    // 在当前页面购买了的商品(搞这个是为了快速查询并展示哪些买了哪些没买  q表示查询)
    qbuyGoods: {},
    // 在当前页面购买的商品 (用来渲染商品)
    buyGoods: [],
    // 是否可以进行结算
    isCheckOutActive: false,
    // 要结算还需消费
    checkOutConsumption: "  ",
  },

  shopInfo: {},

  /*============== 事务处理函数 ====================*/
  // 点击增加商品数量
  handleAddGoodsNum(e) {
    // 用户有可能是在商店详情页面点击的增加 也有可能直接在购物车窗口点击增加 这里需要做一下区分
    // 如果是点击购物车窗口的增加 则商品信息在e.detail.goodsInfo
    // 如果是点击的商店详情页面的增加 则商品信息在e.currentTarget.dataset.goodsInfo
    let goodsInfo = e.detail.goodsInfo || e.currentTarget.dataset.goodsInfo;
    let shopId = this.shopInfo.shopId;
    addGoods(shopId, goodsInfo);
    this.setPageData();
  },

  // 点击减少商品数量
 async handleReduceGoodsNum(e) {
    // 也是需要做一下区分
    let goodsInfo = e.detail.goodsInfo || e.currentTarget.dataset.goodsInfo;
    let shopId = this.shopInfo.shopId;
    await reduceGoods(shopId, goodsInfo);
    this.setPageData();
  },

  // 用户点击结算
  handleCheckOutTap(e) {
    let shopId = this.shopInfo.shopId;
    wx.navigateTo({
      url: "../pay/pay?shopId=" + shopId,
    });
  },

  // 点击购物车窗口右上角的小垃圾桶清空当前页面的购物车
  handleClearCart() {
    wx.showModal({
      title: "清空购物车？",
      success: (result) => {
        if (result.confirm) {
          clearShopCart(this.shopInfo.shopId);
          this.setPageData();

          // 关闭购物车窗口
          this.closeCart();
        }
      },
    });
  },

  // 点击购物车
  handleTabCart(e) {
    if (this.popupCart.data.isShowSheet) {
      // 如果购物车本来就是打开的 则关闭
      this.closeCart();
    } else if (this.data.totalNum > 0) {
      // 如果购物车本来没打开且用户买过东西 则弹出购物车窗口
      this.showCart();
    }
  },

  // 更新页面数据
  setPageData() {
    console.log("setPageCart");
    let shopId = this.shopInfo.shopId;
    let tempCart = getShopCart(shopId); //从缓存中获取当前商店的购物车

    // ===========  更新总价 ==============
    let totalPrice = tempCart.totalPrice;
    this.setData({ totalPrice });

    // =========计算还差多少钱允许结算  ======
    let minConsumption = this.shopInfo.minConsumption;
    let checkOutConsumption = subtract(minConsumption, totalPrice);
    
    
    // =============== 计算是否允许结算 ===========
    if (checkOutConsumption <= 0 && tempCart.totalNum > 0) {
      this.setData({ isCheckOutActive: true });
    } else {
      this.setData({
        isCheckOutActive: false,
        checkOutConsumption: checkOutConsumption,
      });
    }
    // 先更新是否允许结算的状态 再改变checkOutConsumption的值
    // 从而避免出现“还差-100元结算”的字样在FooterTool出现
    this.setData({ checkOutConsumption });

    // ========= 更新购买的商品数据===========
    let buyGoods = tempCart.goods;
    let qbuyGoods = {};
    for (let j = 0, len = buyGoods.length; j < len; j++) {
      qbuyGoods[buyGoods[j].goodsId] = buyGoods[j].num;
    }
    this.setData({ buyGoods, qbuyGoods });

    // ============= 更新已购买商品数量    ===========
    const totalNum = tempCart.totalNum;
    this.setData({ totalNum });
  },

  /*============== 页面生命周期函数 ====================*/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从URL中获取页面数据
    let shopInfo = JSON.parse(decodeURIComponent(options.shopInfo));
    let goodsInfo = JSON.parse(decodeURIComponent(options.goodsInfo));
    this.shopInfo = shopInfo;

    // 初始化页面数据
    this.setData({
      goodsInfo: goodsInfo,
    });
    this.setPageData();
  },

  onShow(){
    this.setPageData()
  },

  onReady: function () {
    // 指定组件 为定义showCart做准备
    this.popupCart = this.selectComponent("#popupCart"); //组件的id
  },

  // 定义一个与CartWindow组件里的showCart同名的函数方便页面调用
  showCart() {
    this.popupCart.showCart(); //组件里里面定义的showPopup方法
  },
  // 定义一个与CartWindow组件里的closeCart同名的函数方便页面调用
  closeCart() {
    this.popupCart.closeCart(); //组件里里面定义的showPopup方法
  },

  onShareAppMessage: function () {},
});
