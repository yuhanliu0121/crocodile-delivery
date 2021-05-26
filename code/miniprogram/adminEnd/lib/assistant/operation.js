import {
  showLoading,
  hideLoading,
  showModal,
  showToast,
  sleep,
} from "../../utils/asyncWX.js";
import { CanI } from "../accessControl/operation.js";
// 初始化云环境
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
// 这里只获取shop和goodsCate的索引 goods通过云函数获得
const shopRef = db.collection("shop");
const assistantRef = db.collection("assistant");
const registerCodeRef = db.collection("registerCode");

// 获取店员数据
async function getAssistData(shopInfo) {
  const shopId = shopInfo.shopId;
  await showLoading("加载中");
  const getAssistRes = await assistantRef
    .where({
      shopId: shopId,
      isExist: true,
    })
    .field({
      _id: false,
      isExist: false,
    })
    .get();
  await hideLoading();
  return getAssistRes;
}

// 生成店员邀请码来添加店员
async function generateAssistCode(shopInfo, assistList) {
  if(!await CanI("assistant")){
    // console.log("无操作权限assist");
    return
  }
  // TODO 还原本段
  // if (assistList.length >=6){
  //     await showModal("添加失败","店员数量不能多于6个")
  //     return
  // }

  // 随机生成一个7位邀请码 生成一个小数并捕获小数点后7位
  const codeString = Math.random().toString();
  const code = codeString.match(/\.(\d{7})/)[1]

  await showLoading("正在生成邀请码");
  const codeRes = await registerCodeRef.add({
    data: {
      code: code,
      isUsed: false,
      shopId: shopInfo.shopId,
      shopName:shopInfo.shopName,
      type: "assistant",
      watermark: new Date().getTime(),
    },
  });
  // console.log("codeRes", codeRes);
  await hideLoading();
  if (!codeRes._id) {
    return;
  }
  return { data: code };
}

// 修改店员备注名
async function editAssistNoteName(shopInfo, assistInfo, noteName) {
  if(!await CanI("assistant")){
    // console.log("无操作权限");
    return
  }
  const shopId = shopInfo.shopId;
  const assistOpenid = assistInfo._openid;
  await showLoading("正在保存修改");
  const renameRes = await assistantRef
    .where({
      _openid: assistOpenid,
      shopId: shopId,
    })
    .update({
      data: {
        noteName: noteName,
      },
    });
  await hideLoading();
  return renameRes;
}

// 删除店员
async function deleteAssist(shopInfo, assistInfo) {
  if(!await CanI("assistant")){
    // console.log("无操作权限");
    return
  }
  const shopId = shopInfo.shopId;
  const assistOpenid = assistInfo._openid;
  const accessInfo =assistInfo.access;
  await showLoading("正在删除");
  const deleteRes = await assistantRef
    .where({
      _openid: assistOpenid,
      shopId: shopId,
    })
    .update({
      data: {
        isExist: false,
      },
    });
  await hideLoading();

  return deleteRes;
}

// 修改店员权限
async function editAssistAuth(shopInfo, assistInfo, accessInfo){
  if(!await CanI("assistant")){
    // console.log("无操作权限");
    return
  }
  const shopId = shopInfo.shopId;
  const assistOpenid = assistInfo._openid;
  const access =accessInfo;
  await showLoading("正在保存修改")
  // 修改店员权限
  const AuthRes = await assistantRef
    .where({
      _openid: assistOpenid,
      shopId: shopId,
    })
    .update({
      data: {
        access: access,
      },
    });
  await hideLoading()
  return AuthRes
 }

export { generateAssistCode, editAssistNoteName, getAssistData, deleteAssist, editAssistAuth };
