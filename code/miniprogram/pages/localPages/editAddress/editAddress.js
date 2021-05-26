import {
  verifyAddressInfo,
  addAddressItem,
  getAddressItem,
  updateAddressItem,
  removeAddressItem,
} from "../../../lib/address/operation.js";
import { showToast, showModal } from "../../../utils/asyncWX.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 地址信息
    addressInfo: {},
    // 可供选择的州份
    selStateItems: ["FL"],
    // 选择的州的索引
    stateIndex: -1,
    // 展示选择的州份
    state: "请选择所在州份",
  },

  /*============== 事件处理函数 ===============*/

  // 用户点击删除（能点击删除则说明addressId必然是存在的，不然删除按钮根本不会显示）
  async handleDeleteAddressInfo() {
    const modalRes = await showModal("确认删除？")
    if(modalRes.cancel){
      return
    }
    const addressId = this.data.addressInfo.addressId;
    let removeRes = removeAddressItem(addressId);
    if (removeRes) {
      wx.navigateBack({
        delta: 1,
        success: () => {
          showToast("删除成功");
        },
      });
    }
  },

  // 用户点击保存
  async handleSaveAddressInfo(e) {
    let newAddressInfo = e.detail.value;
    // 删去stateIndex并换成具体的state
    let state = this.data.selStateItems[parseInt(newAddressInfo.stateIndex)];
    // console.log("state", state);
    delete newAddressInfo.stateIndex;
    newAddressInfo.state = state || "";
    // 校验addressInfo
    const verifyRes = await verifyAddressInfo(newAddressInfo);
    // console.log("verifyRes", verifyRes);
    if (!verifyRes) {
      return;
    }
    // 保存到本地缓存
    // console.log("保存地址信息到本地缓存");

    // 通过this.data.addressInfo的Id是否为空来判断是增加一个地址还是修改已有的地址
    const addressId = this.data.addressInfo.addressId || "";

    let saveRes;
    if (!addressId) {
      // 增加一个地址
      saveRes = addAddressItem(newAddressInfo);
    } else {
      // 修改一个地址
      newAddressInfo.addressId = addressId;
      saveRes = updateAddressItem(newAddressInfo);
    }
    if (saveRes !== -1) {
      wx.navigateBack({
        delta: 1,
        success: () => {
          showToast("保存成功");
        },
      });
    }
  },

  // 所在州份变动
  handleChangeState(e) {
    // console.log("检测到State变化");
    const state = this.data.selStateItems[e.detail.value];
    this.setData({
      state: state,
    });
  },

  /*============== 页面生命周期函数 ===============*/

  onLoad: function (options) {
    let addressId = options.addressId || "";
    if (!addressId) {
      return;
    }
    let addressInfo = getAddressItem(addressId);
    let stateIndex = this.data.selStateItems.findIndex(
      (v) => v === addressInfo.state
    );

    this.setData({
      stateIndex,
      addressInfo,
    });
  },
});