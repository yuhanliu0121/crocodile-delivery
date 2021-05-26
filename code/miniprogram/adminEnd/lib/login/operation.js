import {
  showToast,
  showModal,
  showLoading,
  hideLoading,
  toBase64,
} from "../../utils/asyncWX.js";
import { byteof } from "../../utils/helper.js";
// 初始化云环境
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const shopRef = db.collection("shop");
const _ = db.command;

// 用户登录并获取商店基本信息
async function loginCloud(type) {
  await showLoading();
  const shopInfoRes = await wx.cloud.callFunction({
    name: "login",
    data: {
      type: type,
    },
  });
  await hideLoading();
  return shopInfoRes;
}

// 验证用户输入的商店注册码或者店员注册码
async function registerCloud(code, type, userInfo) {
  await showLoading("正在注册");
  // errCode 100 表示注册码不存在
  // errCode 101 表示注册码已经被用过
  // errCode 102 表示注册码已过期
  // errCode 201 注册商店成功
  // errCode 103 注册店员失败 该店不存在
  // errCode 104 注册店员失败 已经是该店的店员
  // errCode 105 注册店员失败 已经是该店的店主
  // errCode 202 注册店员成功
  const registerRes = await wx.cloud.callFunction({
    name: "register",
    data: {
      code: code,
      type: type,
      userInfo:userInfo
    },
  });
  await hideLoading();
  return registerRes;
}

async function initialiShop(form) {
  // 将一些信息转换成对应的数据结构并返回
  form.shopCate = parseInt(form.shopCate);
  form.minConsumption = Number(form.minConsumption);
  
  // 补充一些初始信息
  let now = new Date();
  form.geoPoint = [];
  form.startDate = now.getTime();
  form.shopStatus = 0;
  form.isExist = true;
  form.isActivated=true;
  form.shopTimezoneOffset = now.getTimezoneOffset();
  // 在此处将本地图片文件转换为base64编码 因为转为base64到用了wx.下的方法 而云端是无法调用wx.的函数的 所以只能在本地将图片转为base64
  let logoUrl = form.logoUrl;
  const fileBase64 = await toBase64(logoUrl);
  // console.log("fileBase64", fileBase64);
  // 计算base64字节流大小 大于100K提示用户换一张小点的图
  const streamByteSize = byteof(fileBase64.data);
  // console.log("图片字节流大小", Math.ceil(streamByteSize / 1000), "KB");
  if (streamByteSize > 100000) {
    await showModal( "图片过大无法上传");
    return;
  }
  form.logoUrl = fileBase64.data;
  await showLoading("正在初始化商店");
  const initShopRes = await wx.cloud.callFunction({
    name: "init_shop",
    data: {
      form: form,
    },
  });
  await hideLoading();
  return initShopRes;
}

export { loginCloud, registerCloud, initialiShop };
