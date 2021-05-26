import { createGlobalCart } from "./lib/cart/operation.js";
import { createGlobalAddress } from "./lib/address/operation.js";
App({
  globalData: {
    refreshFlag: {
      myGoods: true,
      orderProcess: true,
      _showDot: false,  //不要直接访问或修改这个属性而是通过globalData.refreshFlag.showDot来访问或赋值这个属性，否则下面写的watch函数不会被触发
    },
    watcher:{}, // 监听器 在商家端会用到。 目前有订单监听器和店员权限监听器
    accessInfo:{},
    shopInfo: {},
  },

  watch:function(method){ //method是一个函数
    var obj = this.globalData.refreshFlag;
    Object.defineProperty(obj,"showDot", { // 给this.globalData.refreshFlag添加一个名为showDot的“虚拟属性”
      configurable: true,
      enumerable: true,
      get:function(){
        // 每次this.globalData.refreshFlag.showDot被访问时 执行这里
        return this._showDot
      },
      set: function (value) {
        // 每次this.globalData.refreshFlag.showDot被赋值时 执行这里
        this._showDot = value;
        method(value);  //this.globalData.refreshFlag.showDot被修改时的回调函数
      }
    })
  },
  onLaunch() {
    wx.cloud.init({
      env: "env-miamielm-5gliunnq19c0a342",
      traceUer: true,
    });
    // 监听网络状态变化
    wx.getNetworkType({
      success: (res) => {
        this.globalData.isConnected = res.networkType !== "none";
      },
    });
    wx.onNetworkStatusChange((res) => {
      this.globalData.isConnected = res.isConnected;
    });
  },

  onShow() {
    // 检查用户是否有全局购物车数据 为空的话就新建一个
    if (!wx.getStorageSync("cart")) {
      createGlobalCart();
    }
    // 检查用户是否有全局地址数据 为空的话就新建一个
    if (!wx.getStorageSync("address")) {
      createGlobalAddress();
    }
  },

  onError(e) {
    console.log(e);
  },
});
