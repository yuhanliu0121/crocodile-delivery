import { showToast, showModal, showLoading, hideLoading } from "../../utils/asyncWX.js";
import { CanI } from "../accessControl/operation.js";
let app = getApp();
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const shopRef = db.collection("shop");

export async function getShopInfoCloud(shopId = app.globalData.shopInfo.shopId) {
  try {
    await showLoading();
    const shopInfoRes = await shopRef
      .where({
        shopId: shopId,
      })
      .field({
        _id: false,
        _openid: false,
      })
      .get();
    console.log("shopInfoRes", shopInfoRes);

    return shopInfoRes.data[0];
  } catch (error) {
    console.log(error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
    await hideLoading();
  }
}

// 更新全局变量
export async function updateAppShopInfo(shopId = app.globalData.shopInfo.shopId) {
  const shopInfo = await getShopInfoCloud(shopId);
  if (shopInfo) {
    app.globalData.shopInfo = shopInfo;
  } else {
    showModal("网络错误 请重试");
  }
}

export async function updateShopStatusCloud(shopInfo, newStatus) {
  //console.log(app.globalData.accessInfo);
  if (!(await CanI("setting"))) {
    console.log("无操作权限");
    return;
  }
  try {
    await showLoading("更改中");
    const updateShopStatusRes = await shopRef
      .where({
        shopId: shopInfo.shopId,
      })
      .update({
        data: {
          shopStatus: newStatus,
        },
      });
    return updateShopStatusRes;
  } catch (error) {
    console.log(error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
    await hideLoading();
  }
}

export async function updateShopAnnounceCloud(shopInfo, newAnnounce) {
  if (!(await CanI("setting"))) {
    console.log("无操作权限");
    return;
  }
  try {
    await showLoading("保存中");
    const updateShopAnnounceRes = await shopRef
      .where({
        shopId: shopInfo.shopId,
      })
      .update({
        data: {
          shopAnnounce: newAnnounce,
        },
      });
    return updateShopAnnounceRes;
  } catch (error) {
    console.log(error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
    await hideLoading();
  }
}

export async function updateOpenTime(shopInfo, timeInfo) {
  if (!(await CanI("setting"))) {
    console.log("无操作权限");
    return;
  }
  try {
    await showLoading("保存中");
    const updateOpenTimeRes = await shopRef
      .where({
        shopId: shopInfo.shopId,
      })
      .update({
        data: {
          ...timeInfo,
        },
      });
    return updateOpenTimeRes;
  } catch (error) {
    console.log(error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
    await hideLoading();
  }
}

export async function updateDeliverSetting(shopInfo, setting) {
  if (!(await CanI("setting"))) {
    console.log("无操作权限");
    return;
  }
  try {
    await showLoading("保存中");
    const updateRes = await shopRef
      .where({
        shopId: shopInfo.shopId,
      })
      .update({
        data: {
          ...setting,
        },
      });
    return updateRes;
  } catch (error) {
    console.log(error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
    await hideLoading();
  }
}

export async function updateFeeSetting(shopInfo, fee) {
  if (!(await CanI("setting"))) {
    console.log("无操作权限");
    return;
  }
  try {
    await showLoading("保存中");
    const updateRes = await shopRef
    .where({ shopId: shopInfo.shopId })
    .update({
      data: {
        ...fee,
      },
    });
    return updateRes;
  } catch (error) {
    console.log(error);
    showModal("错误", "请检查网络状态后重试");
    return false;
  } finally {
    await hideLoading();
  }
}
