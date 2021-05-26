let app=getApp()
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
import {
  showLoading,
  hideLoading,
  showModal,
  showToast,
} from "../../utils/asyncWX.js";
export function getAccessControlFromLogin(user2shop) {
  /**  user2shop数据结构
     *   access: ["某店店主权限1", "某店店主权限2"]
     *   shopId: "FbAIRZz5Nc0wax"
     *   shopInfo: {shopId: "FbAIRZz5Nc0wax", shopName: "Hanna&Tiger Asian Mart 小卖部", shopAddress: "7650 NW 42TH ST", state: "FL", zipcode: "33567", …}
     *   role: "owner"
     */
   let accessInfo = {
       access:user2shop.access, // 用户的权限
       role:user2shop.role,     // 用户的角色
       shopId:user2shop.shopId  // 用户所在的商店
   }

   return accessInfo
}

async function startAccessWatcher(user2shop) {
  let accessInfo = {
    access:user2shop.access, // 用户的权限
    role:user2shop.role,     // 用户的角色
    shopId:user2shop.shopId, // 用户所在的商店
    _id:user2shop._id,
  }

  if (accessInfo.role === "owner"){
    const watcher = db.collection('owner').doc(accessInfo._id).watch({
      onChange: async function(snapshot) {
        // console.log('snapshot_accessControl_owner', snapshot)
        let res=await db.collection('owner').doc(accessInfo._id).get()
        // console.log(res);
        
        let newaccessInfo={
          access: res.data.access,
          role: "owner",
          shopId: res.data.shopId,
        }
        // console.log(newaccessInfo);
        
        app.globalData.accessInfo = newaccessInfo
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  }
  else if (accessInfo.role === "assistant"){
    const watcher = db.collection('assistant').doc(accessInfo._id).watch({
      onChange: async function(snapshot) {
        // console.log('snapshot_accessControl_assistant', snapshot)
        let res=await db.collection('assistant').doc(accessInfo._id).get()
        // console.log(res);
        
        let newaccessInfo={
          access: res.data.access,
          role: "assistant",
          shopId: res.data.shopId,
        }
        // console.log(newaccessInfo);
        
        app.globalData.accessInfo = newaccessInfo
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  }
}

export async function CanI(operationType) {
  // 目前权限以30位二进制数形式存储，左15位作为系统权限，后15位作为操作权限
  //目前只用到最后三位（订单权限，商品权限，店铺信息设置权限）
  //传入参数operationType是个字符串（order, goods, setting）
  let accessInfo = app.globalData.accessInfo
  let access = accessInfo.access
  let role =accessInfo.role
  // console.log("access:", access);

  if(operationType === "order"){
    let bitValue = (access & 4) / 4
    if (bitValue==1){
      return true
    }
    else{
      await showModal("操作失败","没有相应的权限")
      return false
    }
  }

  if(operationType === "goods"){
    let bitValue = (access & 2) / 2
    if (bitValue==1){
      return true
    }
    else{
      await showModal("操作失败","没有相应的权限")
      return false
    }
  }

  if(operationType === "setting"){
    let bitValue = (access & 1) / 1
    if (bitValue==1){
      return true
    }
    else{
      await showModal("操作失败","没有相应的权限")
      return false
    }
  }

  if(operationType === "assistant"){
    if (role==="owner"){
      return true
    }
    else{
      //console.log("assist here");
      
      await showModal("操作失败","没有相应的权限")
      return false
    }
  }

  return false
  
}

export { startAccessWatcher};