import {
  openSetting
} from "../../../utils/asyncWX.js"

Page({
  data: {

  },

  // 用户点击登出客户端
  handleLogOut() {
    wx.reLaunch({
      url: '../selAppEnd/selAppEnd',
    })
  },

  // 用户点击权限管理
  async handleManageAuth() {
    const res = await openSetting()
  },
})