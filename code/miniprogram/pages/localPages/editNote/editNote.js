import { showModal } from "../../../utils/asyncWX.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    note: "",
  },

  // 用户输入备注内容
  handleInputeNote(e) {
    this.setData({ note: e.detail.value });
  },

  // 用户清空备注内容
  handleTapDiscard() {
    this.setData({ note: "" });
  },

  // 用户点击保存备注
  handleSaveNote() {
    let note = this.data.note;
    let pages = getCurrentPages(); // 获取页面栈
    let prevPage = pages[pages.length - 2]; //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({ note });
    wx.navigateBack({
      delta: -1,
    });
  },

  onLoad(options) {
    const note = decodeURIComponent(options.note);
    this.setData({note})
  },
});
