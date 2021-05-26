export function setLoginRecord(loginInfo) {
  /**
   * loginInfo = {
   *  shopInfo:{
   *      shopId:xxxxx
   *      shopName:xxxx
   *    },
   * accessInfo:{
   *      access:[xxx,xxx,xxx,...]
   *      role:"owner" (或者"assistant")
   *      shopId:xxxxxx
   *    }
   * 
   * }
   * 
   */
  wx.setStorageSync("loginInfo", loginInfo);
  return true
}

export function getLoginRecord() {
  return wx.getStorageSync(loginInfo);
}
