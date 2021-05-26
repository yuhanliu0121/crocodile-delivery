import {
  showToast,
  showModal,
  showLoading,
  hideLoading,
} from "../../../utils/asyncWX.js";

let app = getApp();
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const advertiseShopRef = db.collection("advertiseShop");

Page({
  data: {
    // 是否初始化完毕
    // 引入这个变量是为了保证数据拉取完之前用户不会看到 没有店员而展示的页面 以及添加店员按钮
    finishLoading: false,

    // 是否展示店员操作选项
    showActionsheet: false,

    // 可以对店员进行的操作
    actionsOnShop: [{
        text: "修改排名值",
        value: 0
      },
    ],

    // 要操作的店员的名字
    actionOnShopName: "",

    // 每个店员的slidebuttons
    slideButtons: [],

    // 对店员进行操作的对话框的button
    buttons: [{
      text: "取消"
    }, {
      text: "确定"
    }],

    // 是否打开修改店员名称对话框
    openEditNoteNameDialog: false,
    // 修改名称对话框显示内容
    dialogInputText: "",

    // 是否打开修改商店排名数值的框
    openInputDialog: false,

  },

  // 商店信息
  shopInfo: {},


  // 要进行操作的店员的index
  actionOnShopIdx: -1,

  //商店列表
  shopList: [],

  // 点击某一个店铺打开action sheet
  handleTapShop(e) {
    const index = e.currentTarget.dataset.index;
    console.log("点击了商店", index);
    this.actionOnShopIdx = index;
    this.setData({ showActionsheet: true });
  },
  // 关闭actionSheet
  closeActionSheet() {
    this.setData({
      showActionsheet: false,
    });
  },

  // 选择对商店进行的操作
  handleTapActionSheetItem(e) {
    const actionIndex = e.detail.index;
    switch (actionIndex) {
      case 0:
        // 打开修改商店排名数值对话框
        this.setData({ openInputDialog: true });
        break;
    }
    this.closeActionSheet();
  },

  // 用户在对话框中输入商店排名数值
  handleChangeDialogInput(e) {
    console.log("输入了店铺排名数值", e.detail.value);
    this.setData({ dialogInputText: e.detail.value });
  },

  async handleTapInputDialogButton(e) {
    console.log("用户点击编辑类别名称对话框的按钮");
    const tapButtonIndex = e.detail.index;
    let tabShopIndex = this.actionOnShopIdx;
    // 用户点击的是取消
    if (tapButtonIndex === 0) {
      this.setData({ openInputDialog: false });
    }

    if (tapButtonIndex === 1) {
      //  后台实际的修改操作
      this.setData({ openInputDialog: false });
      let shopInfo = this.shopList[tabShopIndex]
      shopInfo.shopRank = parseFloat(this.data.dialogInputText)
      await showLoading()
      const res = await advertiseShopRef.where({
        shopId: shopInfo.shopId
      }).update({
        data: {
          shopRank: shopInfo.shopRank
        },
      });
      await hideLoading()
      // 如果后台修改成功则前端也手动把当前的用户的备注名改掉
      if (res) {
        this.refresh()
      }
    }
  },

  async refresh(){
    await showLoading()
    const res = await wx.cloud.callFunction({
      name: "get_advertise_shop",
    });
    console.log(res.result);
    this.shopList = res.result.allShops
    this.setSlideButtons(this.shopList)
    await hideLoading()
  },

  // =====================================================================
  // =====================================================================
  // ===========================   重置页面  ==============================
  // =====================================================================
  // =====================================================================

  // 重置slideView
  setSlideButtons(shopList) {
    let slideButtons = [];
    shopList.forEach((v, i) => {
      slideButtons.push({
        loopId: i,
        button: [
          {
            text: "删除",
            type: "warn",
            data: v.shopName,
          },
        ],
        shopName: v.shopName,
        shopRank: v.shopRank,
      });
    });
    console.log("slideButtons", slideButtons);

    this.setData({
      slideButtons,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await showLoading()
    const res = await wx.cloud.callFunction({
      name: "get_advertise_shop",
    });
    console.log(res.result);
    this.shopList = res.result.allShops
    this.setSlideButtons(this.shopList)
    await hideLoading()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
})