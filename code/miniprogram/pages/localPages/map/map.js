import {
  reverseGeocoder,
  getSuggestion
} from "../../../lib/map/operation.js";

Page({
  data: {
    // 地址输入框是否聚焦

    // ==== 地图显示相关数据 ===
    latitude: 39.9087, //TODO 打开地图后默认位置 现在这个坐标是天安门 到时候记得换成迈阿密某个地方
    longitude: 116.3975, // TODO 打开地图后默认地址 现在这个坐标是天安门 到时候记得换成迈阿密某个地方
    showCancelBtn: false, // 是否显示取消按钮
    suggestion: [], //推荐地址列表
    availableAddr: [], // 待选地址列表
  },

  /* =============== 页面事务处理函数 =========== */

  handleInputFocus(e) {
    // 地址搜索框聚焦后显示“取消”按钮
    this.setData({
      showCancelBtn: true,
      suggestion: []
    });
  },

  handleCancel() {
    this.setData({
      showCancelBtn: false,
      inputAddr: "",
    });
  },
  // =========地理信息处理相关函数==========//

  // 用户拖动地图视图后，获取地图中心点附近的地址
  handleRegionChange() {
    this.mapCtx = wx.createMapContext("map");
    this.mapCtx.getCenterLocation({
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        reverseGeocoder(latitude, longitude).then((availableAddr) => {
          this.setData({
            availableAddr
          });
        });
      },
    });
  },

  //地理位置关键词提示数据回填
  suggestionAddrBackfill(e) {
    // TODO 判断用户选择的位置能否获取到邮编 如果不能则要求重新选择一个精确的位置
    let id = e.currentTarget.id;
    let index = Number(id);
    let pages = getCurrentPages(); // 获取页面栈
    let prevPage = pages[pages.length - 2]; //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      address: this.data.suggestion[index]
    });
    wx.navigateBack({
      delta: -1,
    });
  },

  // 待选地理位置回填
  availableAddrBackfill(e) {
    // TODO 判断用户选择的位置能否获取到邮编 如果不能则要求重新选择一个精确的位置
    let id = e.currentTarget.id;
    let index = Number(id);
    let pages = getCurrentPages(); // 获取页面栈
    let prevPage = pages[pages.length - 2]; //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      address: this.data.availableAddr[index]
    });
    wx.navigateBack({
      delta: -1,
    });
  },

  //触发关键词输入提示事件
  getsuggest(e) {
    const keyword = e.detail.value;

    // 判断关键词合法性
    if (!keyword.trim()) {
      this.setData({
        suggestion: []
      });
      return;
    }

    // 注意这里不能用await
    // getsuggest是input的bindinput绑定的方法
    // 如果用了await 则getsuggest必须用async修饰，但这样会导致input在输入任意内容后都会显示[object promise]
    getSuggestion(keyword).then((suggestion) => {
      this.setData({
        suggestion
      });
    });
  },

  /* =============== 页面生命周期函数 =========== */
  async onLoad(options) {
    // 获取当前的位置及当前位置的可选地址
    let current_address = JSON.parse(decodeURIComponent(options.current_address));
    if (current_address.addr) {
      this.setData({
        latitude: current_address.latitude,
        longitude: current_address.longitude
      });
      let availableAddr = await reverseGeocoder(current_address.latitude, current_address.longitude);

      // 从可选地址列表中将当前地址置顶
      let current_address_idx = availableAddr.findIndex((v) => v.id === current_address.id);
      if (current_address_idx !== -1) {
        availableAddr.splice(current_address_idx, 1);
      }
      availableAddr.unshift({
        ...current_address,
        address_title_select: true
      });
      this.setData({
        availableAddr
      });
    } else {

      // TODO使用IP地址获取大致方位 可以用于初始化当前位置
      wx.getLocation({
        type: "wgs84",
        success: (res) => {
          const latitude = res.latitude;
          const longitude = res.longitude;
          // const accuracy = res.accuracy;
          console.log("latitude", latitude);
          console.log("longitude", longitude);
          // console.log("accuracy", accuracy);
          this.setData({
            latitude,
            longitude,
          });
        },
      });
    }
  },
  onShow() {

  },
});