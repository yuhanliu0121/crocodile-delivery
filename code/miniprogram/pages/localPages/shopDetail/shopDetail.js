import { add, subtract, times, divide } from "../../../lib/calculate/calculate.js";
import { hasShopCart, addShopCart, getShopCart, addGoods, reduceGoods, clearShopCart } from "../../../lib/cart/operation.js";
import { showLoading, hideLoading, showModal, showToast, sleep } from "../../../utils/asyncWX.js";

// 初始化云环境
const db = wx.cloud.database();
// 这里只获取shop和goodsCate的索引 goods通过云函数获得
const shopRef = db.collection("shop");
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
    // 总价
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
    checkOutConsumption: "",
    // 需要滚动到的目标商品的goodsId
    targetGoods: "",
    // 刷新的flag
    refreshFlag: false,
  },
  // 分类数据
  cates: [],
  shopInfo: {},

  /* ================  页面事务处理函数 ==============*/
  // 刷新页面
  async handleRefresh() {
    this.setData({ refreshFlag: true });
    const shopDetailRes = await this.getShopDetail(this.shopInfo.shopId);
    this.setData({ refreshFlag: false });
  },

  async getShopDetail(shopId) {
    if (!shopId) {
      return false;
    }
    // 首先获取商店信息详情
    try {
      showLoading();
      const res1 = await shopRef
        .where({
          shopId: shopId,
        })
        .field({
          shopId: true,
          shopName: true,
          minConsumption: true,
        })
        .get();

      this.shopInfo = res1.data[0]; //小程序端调用数据库返回的数据即便只有一条也是封装在数组中的

      // 获取商店的商品数据
      let res2 = await wx.cloud.callFunction({
        name: "get_shop_goods",
        data: {
          shopId: shopId,
        },
      });

      const { allGoods } = res2.result;

      let cates = allGoods;
      this.cates = cates;

      // 检查是否有针对该商店的购物车缓存 没有的话就加一个购物车
      if (hasShopCart(this.shopInfo.shopId) === -1) {
        addShopCart(this.shopInfo);
      }
      //======================

      // 构造左侧的大菜单数据
      let leftMenuList = cates.map((v) => v.cateName);
      // 构造右侧的商品数据
      let rightContent = cates[this.data.currentIndex].goods;
      // 给页面数据赋值
      this.setData({
        leftMenuList,
        rightContent,
        checkOutConsumption: this.shopInfo.minConsumption,
      });

      // 同步页面数据
      this.setPageData();
      return true;
    } catch (error) {
      console.log("error", error);
      showModal("错误", "请检查网络状态后重试");
      return false;
    } finally {
      hideLoading();
    }
  },

  // 左侧菜单的点击事件
  handleItemTap(e) {
    /* 
    1 获取被点击的标题身上的索引
    2 给data中的currentIndex赋值就可以了
    3 根据不同的索引来渲染右侧的商品内容
     */
    const { index } = e.currentTarget.dataset;

    let rightContent = this.cates[index].goods;
    this.setData({
      currentIndex: index,
      rightContent,
      // 重新设置 右侧内容的scroll-view标签的距离顶部的距离
      scrollTop: 0,
    });
  },

  // 点击商品图片跳转到商品详情
  handleTapGoodsPic(e) {
    let { index } = e.currentTarget.dataset;

    // 准备要传递给商品详情页面的数据
    let shopInfo = encodeURIComponent(
      JSON.stringify({
        ...this.shopInfo,
      })
    );
    let goodsInfo = encodeURIComponent(
      JSON.stringify({
        ...this.data.rightContent[index],
      })
    );
    wx.navigateTo({
      url: "../goodsDetail/goodsDetail?shopInfo=" + shopInfo + "&goodsInfo=" + goodsInfo,
    });
  },
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

    /*这里的逻辑是先reduceGoods(shopId, goodsInfo)来减少商品数量再this.setPageData();更新页面数据 
      当reduceGoods函数发现商品数量只剩一个，要弹出对话框询问用户是否删除商品
      而wx.showModal()是异步函数，所以如果不在此用await进行阻塞的话 就会造成用户还没点击对话框的确定或者取消，this.setPageData();就被执行了
      最终的结果就是假设用户点了确定，商品数量已经在缓存中更改 但这个更改没有同步到页面显示上
      所以这里用await阻塞一下
      而函数内要用await的话 这个函数必须被async修饰
    */
    await reduceGoods(shopId, goodsInfo);
    this.setPageData();
  },

  //点击结算
  handleCheckOutTap(e) {
    let shopId = this.shopInfo.shopId;
    wx.navigateTo({
      url: "../pay/pay?shopId=" + shopId,
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

  // 点击购物车窗口右上角的小垃圾桶清空当前页面的购物车
  async handleClearCart() {
    let res = await showModal("清空购物车?");
    if (res.confirm) {
      clearShopCart(this.shopInfo.shopId);
      this.setPageData();
      // 关闭购物车窗口
      this.closeCart();
    }
  },

  // 更新页面数据
  setPageData() {
    console.log("setPageCart");
    let shopId = this.shopInfo.shopId;

    let tempCart = getShopCart(shopId); //从缓存中获取当前商店的购物车

    // ===========  更新总价 ==============
    let totalPrice = tempCart.totalPrice;
    this.setData({
      totalPrice,
    });

    // =========计算还差多少钱允许结算  ======
    let minConsumption = this.shopInfo.minConsumption;
    // console.log("minConsumption", minConsumption);
    // console.log("totalPrice", totalPrice);

    let checkOutConsumption = subtract(minConsumption, totalPrice);

    // =============== 计算是否允许结算 ===========
    if (checkOutConsumption <= 0 && tempCart.totalNum > 0) {
      this.setData({
        isCheckOutActive: true,
      });
    } else {
      this.setData({
        isCheckOutActive: false,
        checkOutConsumption: checkOutConsumption,
      });
    }
    // 先更新是否允许结算的状态 再改变checkOutConsumption的值
    // 从而避免出现“还差-100元结算”的字样在FooterTool出现
    this.setData({
      checkOutConsumption,
    });

    // ========= 更新购买的商品数据和商品购买量查询表===========
    let buyGoods = tempCart.goods;
    let qbuyGoods = {};
    for (let j = 0, len = buyGoods.length; j < len; j++) {
      qbuyGoods[buyGoods[j].goodsId] = buyGoods[j].num;
    }
    this.setData({
      buyGoods,
      qbuyGoods,
    });

    // ============= 更新已购买商品数量    ===========
    const totalNum = tempCart.totalNum;
    this.setData({
      totalNum,
    });
  },

  // 如果用户是通过轮播图跳转过来 则滚到广告的对应位置
  async scrollToAdvertise(cateId, goodsId) {
    if (!cateId) {
      return;
    }

    console.log("开始根据广告跳转");
    let cateIdx = this.cates.findIndex((v) => v.cateId === cateId);
    if (cateIdx == -1) {
      return;
    }

    let rightContent = this.cates[cateIdx].goods;
    this.setData({
      currentIndex: cateIdx,
      rightContent,
      // 重新设置 右侧内容的scroll-view标签的距离顶部的距离
      scrollTop: 0,
    });

    if (!goodsId) {
      return;
    }
    await sleep(500);
    this.setData({ targetGoods: goodsId });
  },

  /* ===================== 页面生命周期函数 ================== */

  async onLoad(options) {
    // 从购物车页面转来需要获取shopId
    this.watchOnLoadOver((onLoadOver) => {
      if (!onLoadOver) {
        return;
      }
      this.setPageData();
    });

    const shopId = options.shopId || "";
    const cateId = options.cateId || "";
    const goodsId = options.goodsId || "";

    // 获取商店及其商品的数据
    const shopDetailRes = await this.getShopDetail(shopId);
    if (!shopDetailRes) {
      return;
    }
    //更改导航栏标题为商店名
    wx.setNavigationBarTitle({
      title: this.shopInfo.shopName,
    });
    this.scrollToAdvertise(cateId, goodsId);
    this.onLoadOver = true;
  },

  async onShow() {
    if (this.onLoadOver) {
      this.setPageData();
    }
    if (app.globalData.refreshFlag.shopDetail && this.onLoadOver) {
      await this.getShopDetail(this.shopInfo.shopId);
    }
  },

  onReady() {
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

  watchOnLoadOver(method) {
    this._onLoadOver = false;
    let obj = this;
    Object.defineProperty(obj, "onLoadOver", {
      configurable: true,
      enumerable: true,
      get: function () {
        return this._onLoadOver;
      },
      set: function (value) {
        this._onLoadOver = value;
        method(value);
      },
    });
  },
});
