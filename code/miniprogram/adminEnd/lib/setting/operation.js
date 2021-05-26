import {
  showToast,
  showModal,
  showLoading,
  hideLoading,
} from "../../utils/asyncWX.js";
import { CanI } from "../accessControl/operation.js";
let app = getApp();
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const shopRef = db.collection("shop");

export async function getShopInfoCloud(shopId=app.globalData.shopInfo.shopId) {
  await showLoading();
  const shopInfoRes = await shopRef
    .where({
      shopId: shopId,
    })
    .field({
      _id:false,
      _openid:false,
    })
    .get();
  await hideLoading();
  console.log("shopInfoRes", shopInfoRes);

  return shopInfoRes.data[0];
}

// 更新全局变量
export async function updateAppShopInfo(shopId=app.globalData.shopInfo.shopId){
  const shopInfo = await getShopInfoCloud(shopId)
  if(shopInfo){
    app.globalData.shopInfo = shopInfo
  }else{
    showModal("网络错误 请重试")
  }
}

export async function updateShopStatusCloud(shopInfo, newStatus) {
  //console.log(app.globalData.accessInfo);
  if (!(await CanI("setting"))) {
    // console.log("无操作权限");
    return;
  }
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
  await hideLoading();
  return updateShopStatusRes;
}

export async function updateShopAnnounceCloud(shopInfo, newAnnounce) {
  if (!(await CanI("setting"))) {
    // console.log("无操作权限");
    return;
  }
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
  await hideLoading();
  return updateShopAnnounceRes;
}

export async function updateOpenTime(shopInfo, timeInfo) {
  if (!(await CanI("setting"))) {
    // console.log("无操作权限");
    return;
  }
  await showLoading("保存中");
  const updateOpenTimeRes = await shopRef
    .where({
      shopId: shopInfo.shopId,
    })
    .update({
      data: {
        ...timeInfo
      },
    });
  await hideLoading();
  return updateOpenTimeRes;
}

export async function updateDeliverSetting(shopInfo, setting){
  if (!(await CanI("setting"))) {
    // console.log("无操作权限");
    return;
  }
  await showLoading("保存中");
  const updateRes = await shopRef
    .where({
      shopId: shopInfo.shopId,
    })
    .update({
      data: {
        ...setting
      },
    });
  await hideLoading();
  return updateRes;
}
