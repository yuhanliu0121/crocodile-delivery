import { showToast, showLoading, hideLoading, showModal } from "../../../utils/asyncWX.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showInputDialog: false,
  },

  // 生成商店注册码
  async handleGenerateOwnerRegistCode() {
    const codeString = Math.random().toString();
    const code = codeString.match(/\.(\d{7})/)[1]
    showLoading();
    const res = await wx.cloud.callFunction({
      name: "admin_operation",
      data: {
        type: "addShopRegistCode",
        code: code,
      },
    });
    // console.log("res", res);
    hideLoading();
    if (res) {
      wx.setClipboardData({
        data: "嗨！~这是您在微信小程序「小鳄鱼跑腿」的商店注册码\n\n" + code + "\n\n请在小程序内点击进入商家端，点击「新商入驻」后输入此注册码即可！",
        success(res) {
          wx.hideToast();
        },
      });

      await showModal("操作提示", "成功生成商店邀请码：\n\n" + code + "\n\n邀请码已复制到剪贴版");
      return;
    }
    
  },

});
