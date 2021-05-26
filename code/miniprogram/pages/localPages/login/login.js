
Page({
  // 获取用户信息
  handleGetUserInfo(e){
    // console.log(e);
    // 用户一般信息
    const {userInfo}=e.detail;
    wx.setStorageSync("userinfo", userInfo);
    wx.navigateBack({
      delta: 1
    });

    // 用户支付关键信息 该信息具有时效性 需要马上用于拉取用户历史订单信息等
    // 在真正下单时需要重新通过open-type="getUserInfo"的button获取用户关键信息
    // TODO 用关键信息拉取用户历史订单数据
    const { encryptedData, iv, rawData, signature } = e.detail;
  }
  
})