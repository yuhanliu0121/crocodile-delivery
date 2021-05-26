

/**
 * 检查当前用户是否联网
 */
export const isConnected=()=>{
  console.log("getApp().globalData.isConnected",getApp().globalData.isConnected);
  return getApp().globalData.isConnected;
}

/**
 * promise 形式的openSetting
 * 目前只需要用的用户对订阅消息的设置
 */
export const openSetting = () => {
  return new Promise((resolve, reject) => {
    wx.openSetting({
      withSubscriptions: true,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

// 延时函数
export const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

/**
 * promise 形式  getSetting
 */
export const getSetting = () => {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      withSubscriptions: true,
      success(res) {
        resolve(res);
      },
    });
  });
};
/**
 * promise 形式  chooseAddress
 */
export const chooseAddress = () => {
  return new Promise((resolve, reject) => {
    wx.chooseAddress({
      success: (result) => {
        resolve(result);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

/**
 * promise 形式  showLoading
 */
export const showLoading = (title = "加载中") => {
  return new Promise((resolve) => {
    wx.showLoading({
      title: "加载中",
      mask: true,
      success: resolve,
    });
  });
};

/**
 * promise 形式  hideLoading
 */

export const hideLoading = () => {
  return new Promise((resolve) => {
    wx.hideLoading({
      success: resolve,
    });
  });
};

/**
 *  promise 形式  showModal
 * @param {object} param0 参数
 */
export const showModal = (title, content = "") => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

/**
 *  promise 形式  showActionSheet
 * @param {List} itemList 参数
 */
export const showActionSheet = (itemList) => {
  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        resolve(res);
      },

      fail: (err) => {
        reject(err);
      },
    });
  });
};

/**
 *  promise 形式  showToast
 * @param {object} param0 参数
 */
export const showToast = (title, icon = "none") => {
  return new Promise((resolve, reject) => {
    wx.showToast({
      title: title,
      icon: icon,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

/**
 *
 * @param {*} tmplIds
 */

const ACCEPT_ORDER = "--o3q1SUOMEYyE5hCzgG4ayho__1YObjp8QFIZyEJj0";
const DELIVER_ORDER = "VsIZkMmPSzVdFlVJIG2N9AWl95-SBurq0yLKyGa4Pkk";
const COMPLETE_ORDER = "SjlHOqbRcflXwiHX2HUDYkFxE4mMgeR7bCEn4PwUgfk";

const orderTemplate = [ACCEPT_ORDER, DELIVER_ORDER, COMPLETE_ORDER];
export const requestSubscribeMessage = (action) => {
  let tmplIds;
  if (action === "order") {
    tmplIds = orderTemplate;
  }
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({
      tmplIds: tmplIds,
      success: (setting) => {
        resolve(getOrderSubMsgSetting(setting));
      },
      fail: (err) => {
        console.log("err",err);
        const errCode = err.errCode
        switch (errCode) {
          case 20004:
            showModal(
              "提示",
              "为了方便商家及时向您更新订单信息，请允许我们向您发送订阅消息。请前往「我的」-->「权限管理」进行设置 "
            );
            return;
          case 10002:
            showModal("错误", "网络错误 请重试");
            return;
          case 10003:
            showModal("错误", "网络错误 请重试");
            return;
          case 10005:
            showModal("错误", "小程序退出后台");
            return;
          default:
            console.log("调用订阅消息函数发生未知错误",err.errMsg);
            showModal("错误","遇到未知错误");
            return;
        }
      },
    });
  });
};

/**
 * 将用户对订阅消息的设置转换为true false表
 * @param {*} setting 
 */

const getOrderSubMsgSetting = (setting) => {
  let subscriptionsSettingTable = {
    ACCEPT_ORDER: setting[ACCEPT_ORDER] === "accept",
    DELIVER_ORDER: setting[DELIVER_ORDER] === "accept",
    COMPLETE_ORDER: setting[COMPLETE_ORDER] === "accept",
  };

  return subscriptionsSettingTable;
};
