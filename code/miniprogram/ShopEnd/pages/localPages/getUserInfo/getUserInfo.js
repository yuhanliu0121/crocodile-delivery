// miniprogram/pages/localPages/getUserInfo/getUserInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  handleGetUserInfo(e){
    console.log(e);
    const {userInfo}  = e.detail;
    console.log(userInfo);
    wx.setStorageSync("userInfo", userInfo);
    wx.navigateBack({
      delta: 1
    });
  }
})