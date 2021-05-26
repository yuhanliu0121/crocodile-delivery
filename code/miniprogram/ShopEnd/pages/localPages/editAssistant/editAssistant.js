import { showToast, showModal, showLoading, hideLoading } from "../../../utils/asyncWX.js";
import { generateAssistCode, editAssistNoteName, getAssistData, deleteAssist, editAssistAuth } from "../../../lib/assistant/operation.js";

let app = getApp();

Page({
  data: {
    // 是否初始化完毕
    // 引入这个变量是为了保证数据拉取完之前用户不会看到 没有店员而展示的页面 以及添加店员按钮
    finishLoading: false,

    // 是否展示店员操作选项
    showActionsheet: false,

    // 可以对店员进行的操作
    actionsOnAssist: [
      {
        text: "修改备注",
        value: 0,
      },
      {
        text: "修改权限",
        value: 1,
      },
    ],

    // 要操作的店员的名字
    actionOnAssistName: "",

    // 每个店员的slidebuttons
    slideButtons: [],

    // 对店员进行操作的对话框的button
    buttons: [
      {
        text: "取消",
      },
      {
        text: "确定",
      },
    ],

    // 是否打开修改店员名称对话框
    openEditNoteNameDialog: false,
    // 修改名称对话框显示内容
    dialogInputText: "",

    // 是否打开修改店员权限操作框
    openEditAssistAuthDialog: false,

    // 店员可以拥有的权限
    assistAuthItem: [
      {
        text: "可以处理订单",
        value: 4,
      },
      {
        text: "可以修改商品",
        value: 2,
      },
      {
        text: "可以修改商店信息",
        value: 1,
      },
    ],
    //权限选择框的值
    checkList: [],
    //操作者是否为店员
    isAssist: true,
  },

  // 商店信息
  shopInfo: {},

  // 店员数组
  assistList: [],

  // 要进行操作的店员的index
  actionOnAssistIdx: -1,

  //记录选中的权限
  currcentAccess: [],

  // ==========================================================//
  // ==========================================================//
  // ================= 修改店员备注名 ========================= //
  // ==========================================================//
  // ==========================================================//

  // 用户在对话框中输入店员的备注名
  handleChangeDialogInput(e) {
    this.setData({
      dialogInputText: e.detail.value,
    });
  },

  // 用户点击编辑店员名称对话框的按钮
  async handleTapEditNoteNameButton(e) {
    const tapButtonIndex = e.detail.index;
    // 用户点击的是取消
    if (tapButtonIndex === 0) {
      this.setData({
        openEditNoteNameDialog: false,
      });
    }

    if (tapButtonIndex === 1) {
      const newNoteName = this.data.dialogInputText.trim();
      if (!newNoteName) {
        await showToast("无效备注");
        return;
      }
      const renameRes = await editAssistNoteName(this.shopInfo, this.assistList[this.actionOnAssistIdx], newNoteName);

      // 如果后台修改成功则前端也手动把当前的用户的备注名改掉
      if (renameRes) {
        this.assistList[this.actionOnAssistIdx].noteName = newNoteName;
        this.setSlideButtons(this.assistList);
        this.setData({
          openEditNoteNameDialog: false,
        });
      }
    }
  },

  // =====================================================================
  // =====================================================================
  // =========================  修改店员权限 ==============================
  // =====================================================================
  // =====================================================================

  // 店员权限改变
  handleAuthChange(e) {
    this.currcentAccess = e.detail.value;
  },

  // 用户点击选择店员权限对话框的按钮
  async handleTapEditAssistAuthButton(e) {
    const tapButtonIndex = e.detail.index;
    // 用户点击的是取消
    if (tapButtonIndex === 0) {
      this.setData({
        openEditAssistAuthDialog: false,
      });
    }

    if (tapButtonIndex === 1) {
      let assistInfo = this.assistList[this.actionOnAssistIdx];
      // console.log("修改的哪个店员的权限：", assistInfo);
      let accessList = this.currcentAccess;
      let access = 0;
      for (let i = 0; i < accessList.length; i++) {
        access = access + parseInt(accessList[i]);
      }
      // console.log("access:", access);
      const editAssistRes = await editAssistAuth(this.shopInfo, assistInfo, access);
      if (editAssistRes) {
        this.assistList[this.actionOnAssistIdx].access = access;
        // 重置页面的店员列表
        this.setSlideButtons(this.assistList);
        this.setData({
          openEditAssistAuthDialog: false,
        });
      }
    }
  },

  // =====================================================================
  // =====================================================================
  // ===================    点击店员打开actionSheet    ====================
  // =====================================================================
  // =====================================================================

  // 点击某一个店员 打开actionSheet
  handleTapAssist(e) {
    const { index } = e.currentTarget.dataset;
    // console.log("点击了店员", index);

    this.actionOnAssistIdx = index;
    this.setData({
      showActionsheet: true,
    });
  },

  // 关闭actionSheet
  closeActionSheet() {
    this.setData({
      showActionsheet: false,
    });
  },
  // 选择对店员的操作
  handleTapActionSheetItem(e) {
    const actionIndex = e.detail.index;
    const actionOnAssistName = this.assistList[this.actionOnAssistIdx].noteName || this.assistList[this.actionOnAssistIdx].nickName;
    this.setData({
      actionOnAssistName,
    });
    switch (actionIndex) {
      case 0:
        // 打开修改店员名称对话框
        this.setData({
          openEditNoteNameDialog: true,
        });
        break;
      case 1:
        // 打开修改店员权限操作框
        this.setData({
          openEditAssistAuthDialog: true,
        });
        let accessAssist = this.assistList[this.actionOnAssistIdx].access;
        let checkList = [];
        let bitValue4 = (accessAssist & 4) / 4;
        if (bitValue4 == 1) {
          checkList.push(true);
        } else {
          checkList.push(false);
        }
        let bitValue2 = (accessAssist & 2) / 2;
        if (bitValue2 == 1) {
          checkList.push(true);
        } else {
          checkList.push(false);
        }
        let bitValue1 = (accessAssist & 1) / 1;
        if (bitValue1 == 1) {
          checkList.push(true);
        } else {
          checkList.push(false);
        }
        this.setData({
          checkList,
        });
        // console.log(this.data.checkList);
        break;
      default:
        break;
    }
    this.closeActionSheet();
  },

  // =====================================================================
  // =====================================================================
  // ===================          点击添加店员         ====================
  // =====================================================================
  // =====================================================================

  // 用户点击添加店员
  async handleAddAssist() {
    const codeRes = await generateAssistCode(this.shopInfo, this.assistList);
    if (!codeRes) {
      return;
    }
    const code = codeRes.data;
    // 将邀请码设置到剪贴版
    wx.setClipboardData({
      data: "嗨！~这是我在微信小程序「小鳄鱼跑腿」的店员邀请码\n\n" + code + "\n\n快来加入我的商店吧！",
      success(res) {
        wx.hideToast();
      },
    });

    await showModal("店员邀请码", "您的邀请码为：\n\n" + code + "\n\n邀请码已复制到剪贴版，该邀请码72小时内有效，请及时发送给店员进行注册");
  },

  // =====================================================================
  // =====================================================================
  // ===========================   重置页面  ==============================
  // =====================================================================
  // =====================================================================

  // 重置slideView
  setSlideButtons(assistList) {
    let slideButtons = [];
    assistList.forEach((v, i) => {
      slideButtons.push({
        loopId: i,
        button: [
          {
            text: "删除",
            type: "warn",
            data: v.noteName || v.nickName,
          },
        ],
        assistName: v.noteName || v.nickName,
      });
    });
    console.log("slideButtons", slideButtons);

    this.setData({
      slideButtons,
    });
  },

  // =====================================================================
  // =====================================================================
  // ===================          删除店员         ====================
  // =====================================================================
  // =====================================================================

  // 用户点击滑动出来的删除店员按钮
  async slideButtonTap(e) {
    // 获取要删除的店员的索引
    const { index } = e.currentTarget.dataset;
    // 获取要删除的店员的名字
    const assistName = e.detail.data;
    const modal = await showModal("确认删除「" + assistName + "」吗？");
    if (modal.cancel) {
      return;
    }

    const assistInfo = this.assistList[index];

    const deleteAssistRes = await deleteAssist(this.shopInfo, assistInfo);
    if (deleteAssistRes) {
      this.assistList.splice(index, 1);
      // 重置页面的店员列表
      this.setSlideButtons(this.assistList);
    }
  },

  // ==========================================================//
  // ==========================================================//
  // ================= 页面生命周期函数 ======================= //
  // ==========================================================//
  // ==========================================================//

  async onLoad(options) {
    this.shopInfo = app.globalData.shopInfo;
    let accessInfo = app.globalData.accessInfo;
    let role = accessInfo.role;
    if (role === "owner") {
      this.setData({ isAssist: false });
    } else {
      this.setData({ isAssist: true });
    }
    // 获取店员数组
    const assistData = await getAssistData(this.shopInfo);
    if (!assistData) {
      return;
    }
    // console.log("assistData", assistData);
    const assistList = assistData.data;

    // 获取到的数据样例
    // let assistList = [
    //   {
    //     nickName: "微信名1",
    //     noteName: "备注名1",
    //     _openid: "openid1",
    //     auth: {},
    //   },
    //   { nickName: "微信名2", noteName: "", _openid: "openid2", auth: {} },
    //   {
    //     nickName: "微信名3",
    //     noteName: "备注名3",
    //     _openid: "openid3",
    //     auth: {},
    //   },
    // ];

    // 设置店员数组为页面全局变量
    this.assistList = assistList;
    // 初始化slideView
    this.setSlideButtons(assistList);
    this.setData({
      finishLoading: true,
    });
  },

  async onPullDownRefresh() {
    console.log("onPullDownRefresh");
    const assistData = await getAssistData(this.shopInfo);
    console.log("assistData", assistData);
    if (!assistData) {
      return;
    }
    const assistList = assistData.data;
    // 设置店员数组为页面全局变量
    this.assistList = assistList;
    // 初始化slideView
    this.setSlideButtons(assistList);
    this.setData({
      finishLoading: true,
    });
    wx.stopPullDownRefresh();
  },
});
