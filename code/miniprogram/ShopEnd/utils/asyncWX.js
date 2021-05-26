// import { Buffer } from "buffer";
/**
 * promise 形式  getSetting
 */
export const getSetting = () => {
  return new Promise((resolve, reject) => {
    wx.getSetting({
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
 * promise 形式  openSetting
 */
export const openSetting = () => {
  return new Promise((resolve, reject) => {
    wx.openSetting({
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
      title: title,
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
export const showModal = (title, content = "",cancelText="取消", confirmText="确定") => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: title,
      content: content,
      showCancel: true,
      cancelText: cancelText,
      confirmText: confirmText,
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
export const showToast = (title,icon="none") => {
  return new Promise((resolve, reject) => {
    wx.showToast({
      title: title,
      icon: icon,
      mask:true,
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
 * promise 形式  login
 */
export const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      timeout: 10000,
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
 * promise 形式的 小程序的微信支付
 * @param {object} pay 支付所必要的参数
 */
export const requestPayment = (pay) => {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      ...pay,
      success: (result) => {
        resolve(result);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};
// 将本地文件转换为base64编码 云函数上传图片不能直接上传本地文件 必须上传buffer或者fs.ReadStream
export const toBase64 = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath: filePath, //选择图片返回的相对路径
      encoding: "base64", //编码格式
      success: (res) => {
        //成功的回调
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

// submitForm(e) {
//   var that = this;
//   var index = 0;
//   var len = that.data.images.length;
//   wx.showLoading({
//     title: '上传中...',
//   })
//   for(var i = 0; i < len ; i++)
//   {
//     console.log(i)
//     wx.getFileSystemManager().readFile({
//       filePath: that.data.images[i], //选择图片返回的相对路径
//       encoding: 'base64', //编码格式
//       success: res => { //成功的回调
//         wx.cloud.callFunction({
//           name:'file',
//           data:{
//             path: 'pictures/' + util.vcode(new Date())+index+'.png',
//             file: res.data
//           },
//           success(_res){

//             console.log(_res)
//             wx.hideLoading()
//             //wx.hideLoading()
//           },fail(_res){
//             console.log(_res)
//           }
//         })
//         index++;
//       }
//     })
//   }
// }
