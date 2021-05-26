import { loginCloud, registerCloud } from "../../../lib/login/operation.js";
import { showToast, showModal, showLoading, sleep } from "../../../utils/asyncWX.js";
import { getAccessControlFromLogin, startAccessWatcher } from "../../../lib/accessControl/operation.js";
import { setLoginRecord } from "../../../lib/loginRecord/operation.js";
import { startWatchOrder } from "../../../lib/order/operation.js";

// 获得app实例
// 用来绑定一些全局变量 比如权限
let app = getApp();
Page({
  data: {
    // 是否展示页面内容 （在背景图加载好了以后置为true）
    showPage: false,

    // 商店选择对话框是否显示
    openSelectShopDialog: false,
    // 商店选择对话框的radio默认全不选
    radioChecked: false,

    // 对话框按钮
    buttons: [{ text: "取消" }, { text: "确定" }],

    // 带输入框的对话框是否显示
    openInputDialog: false,
    // 对话框标题
    inputDialogTitle: "",
    // 对话框placeholder内容
    inputDialogPlaceholder: "",
    // 对话框输入框的输入内容
    dialogInputText: "",
  },

  // 背景图片加载完毕 可以显示页面内容了
  handleLoadBgpComplete() {
    wx.hideLoading();
    this.setData({
      showPage: true,
    });
  },

  /*  =============用户点击登录(店主或店员)================= */
  // 用户登陆类型
  userType: "",

  // 与用户有关的所有商店 user to shop
  user2shop: [],

  async handleLogin(e) {
    // 获取用户的登录类型
    const userType = e.currentTarget.dataset.type;
    this.userType = userType;
    // 获取商店信息
    const loginRes = await loginCloud(userType);
    if (!loginRes) {
      return;
    }
    // console.log("登录返回结果 loginRes", loginRes);
    // errCode 103 没有注册的店主信息
    // errCode: 201 店主登录信息拉取成功
    // errCode:1103 没有注册的店员信息
    // errCode:2201 店员登录成功

    // user2shop user to shop: 当前用户对应的商店信息
    const user2shop = loginRes.result.data;
    const errCode = loginRes.result.errCode;

    // 如果errcode是103 或 1103 则弹出提示信息并return
    if (errCode === 103) {
      await showModal("未找到与您相关的店主信息");
      return;
    }
    if (errCode === 1103) {
      await showModal("未找到与您相关的店员信息");
      return;
    }

    this.user2shop = user2shop;
    console.log("user2shop", user2shop);

    // 将待选商店的名字装进数组
    let shopsToLogin = [];
    user2shop.forEach((v) => {
      shopsToLogin.push({
        shopId: v.shopInfo.shopId,
        shopName: v.shopInfo.shopName,
        isActivated: v.shopInfo.isActivated,
      });
    });

    // 弹出dialog
    this.setData({
      openSelectShopDialog: true,
      shopsToLogin,
    });

    // 此时弹出商店选择对话框 用户的动作将由hadnleTapSelectShopDialogButton监听
  },

  /*==========  登录已绑定商店  ==========*/

  // 用户选择的登录商店的index
  loginShopIndex: -1,

  // 获取用户点击的dialog中的radio的index
  handleRadioChange(e) {
    this.loginShopIndex = parseInt(e.detail.value);
  },

  // 用户点击dialog的确定还是取消
  async hadnleTapSelectShopDialogButton(e) {
    const tapButtonIndex = e.detail.index;
    // 用户点击的是取消
    if (tapButtonIndex === 0) {
      this.setData({ openSelectShopDialog: false, radioChecked: false });
      // 重置radio为未选择状态
      this.loginShopIndex = -1;
      return;
    }

    // 用户点击的是确定
    if (tapButtonIndex === 1) {
      if (this.loginShopIndex === -1) {
        // 说明用户没有选择任何一个商店
        await showToast("请选择一个商店登录");
      } else {
        const selShop = this.user2shop[this.loginShopIndex];
        const shopInfo = selShop.shopInfo;
        // console.log("shopInfo", shopInfo);

        // 判断商店是否已经被激活
        if (!shopInfo.isActivated && this.userType === "owner") {
          // 如果是店主选择了一个没有被激活的商店 则带去激活
          const modal = await showModal("当前商店没有被激活\n是否前往激活页面？");
          if (modal.confirm) {
            wx.navigateTo({
              url: "../initialShop/initialShop?shopId=" + shopInfo.shopId,
            });
            return;
          } else {
            return;
          }
        }

        if (!shopInfo.isActivated && this.userType === "assistant") {
          // 如果是店员选择了一个没有被激活的商店 则告知他这件事就行
          await showModal("当前商店尚未被店主激活");
          return;
        }

        // 运行到这说明没啥问题可以登录了

        // 1 获取操作权限并绑定到全局
        let accessInfo = getAccessControlFromLogin(selShop);
        app.globalData.accessInfo = accessInfo;

        // 开启权限监听器
        let lastAccessWatcher = app.globalData.watcher.accessWatcher || {};
        if (Object.keys(lastAccessWatcher).length !== 0) {
          // 每次开启一个监听器时先确保上一个同样的监听器被关闭
          await lastAccessWatcher.close();
        }
        startAccessWatcher(selShop);

        //开启监听器监听新订单
        //开启监听器监听数据库内该记录的权限变化
        let lastOrderWatcher = app.globalData.watcher.orderWatcher || {};
        if (Object.keys(lastOrderWatcher).length !== 0) {
          // 每次开启一个监听器时先确保上一个同样的监听器被关闭
          await lastOrderWatcher.close();
        }
        startWatchOrder(selShop);
        // 2 记录当前的登录状态方便下一次登录
        const shopInfoForLogin = {
          shopId: shopInfo.shopId,
          shopName: shopInfo.shopName,
        };
        // 商店信息也同时绑定到全局方便其他页面调用
        app.globalData.shopInfo = shopInfo;
        // 3 打包登录信息
        const loginInfo = {
          shopInfo: shopInfoForLogin,
          accessInfo: accessInfo,
        };
        // 4 将登录信息缓存
        setLoginRecord(loginInfo);
        console.log("登录成功", shopInfo);
        // 关闭所有非tabbar页面 跳转到订单处理页面 跳转成功则关掉当前的商店选择框
        // 注意wx.switchTab不支持url传参
        wx.reLaunch({
          url: "../orderProcess/orderProcess",
          success: (result) => {
            // 关闭选择框
            this.setData({ openSelectShopDialog: false, radioChecked: false });
          },
        });
      }
    }
  },

  // 用户点击蒙版来关闭选择登录商店对话框
  handleSelectShopDialogClose(e) {
    // 重置radio为未选择状态
    this.loginShopIndex = -1;
    this.setData({ radioChecked: false });
  },

  /* ======== 带输入框对话框相关函数 这部分代码将由新【新商入驻】，【成为店员】弹出dialog后调用======== */

  // 用户是点击的是 【新商入驻】还是【成为店员】
  registerType: "",

  // 用户改变对话框内输入框的内容
  handleChangeDialogInput(e) {
    // console.log("改变输入框内容", e.detail.value);
    this.setData({ dialogInputText: e.detail.value });
  },

  // 用户点击对话框的取消或确定按钮
  async handleTapInputDialogButton(e) {
    const tapButtonIndex = e.detail.index;

    // 用户点击确定 则进行简单的输入非空检测
    if (tapButtonIndex === 1) {
      const code = this.data.dialogInputText;
      if (code === "") {
        await showToast("未检测到输入内容");
        return;
      }
      // 获取用户微信昵称
      const nickName = this.getUserNickName();
      const userInfo = { nickName: nickName };

      if (this.registerType === "owner") {
        this.register(code, "owner", userInfo);
      }
      if (this.registerType === "assistant") {
        this.register(code, "assistant", userInfo);
      }
    }

    // 关闭对话框 清空输入内容
    this.setData({ dialogInputText: "", openInputDialog: false });
  },

  /* ======== 新商入驻 ======== */

  // 用户点击【新商入驻】
  async handleTapRegisterShop() {
    // 先确认有无用户昵称信息
    const checkUserInfo = await this.hasUserInfo();

    // 没有的话直接结束当前函数
    if (!checkUserInfo) {
      return;
    }
    this.registerType = "owner";
    // 打开dialog等待用户输入商店注册码
    this.setData({
      openInputDialog: true,
      inputDialogTitle: "请输入商店注册码",
      inputDialogPlaceholder: "商店注册码 可询问客服获得",
    });
  },

  async register(code, type, userInfo) {
    const registerRes = await registerCloud(code, type, userInfo);
    if (!registerRes) {
      return;
    }
    const { data, errCode } = registerRes.result;
    // errCode 100 表示注册码不存在
    // errCode 101 表示注册码已经被用过
    // errCode 102 表示注册码已过期
    // errCode 201 注册商店成功
    // errCode 103 注册店员失败 该店不存在
    // errCode 104 注册店员失败 已经是该店的店员
    // errCode 105 注册店员失败 已经是该店的店主
    // errCode 202 注册店员成功
    // errCode 900 管理员登录成功
    let modalTitle = "";
    let shopId = "";
    switch (errCode) {
      case 100:
        modalTitle = "注册码无效";
        break;
      case 101:
        modalTitle = "注册码无效";
        break;
      case 102:
        modalTitle = "注册码无效";
        break;
      case 201:
        modalTitle = "注册商店成功\n即将跳转到商店初始设置页面";
        shopId = data;
        break;
      case 103:
        modalTitle = "注册店员失败\n商店不存在";
        break;
      case 104:
        modalTitle = "注册店员失败\n已经是该店的店员";
        break;
      case 105:
        modalTitle = "注册店员失败\n已经是该店的店主";
        break;
      case 202:
        modalTitle = "注册店员成功";
        break;
      default:
        modalTitle = "其他注册码";
        break;
    }
    await showModal("提示", modalTitle);
    if (errCode === 201) {
      wx.navigateTo({
        url: "../initialShop/initialShop?shopId=" + shopId,
      });
    }
    if (errCode === 900) {
      wx.navigateTo({
        url: "../../../../adminEnd/pages/localPages/adminPage/adminPage",
      });
    }
  },

  /* ===========  成为店员  ===========*/

  // 用户点击【成为店员】
  async handleTapRegisterShopAssist() {
    // 先确认有无用户昵称信息
    const checkUserInfo = await this.hasUserInfo();

    // 没有的话直接结束当前函数
    if (!checkUserInfo) {
      return;
    }
    this.registerType = "assistant";
    // 打开dialog等待用户输入商店认证码
    this.setData({
      openInputDialog: true,
      inputDialogTitle: "请输入店员邀请码",
      inputDialogPlaceholder: "店员邀请码 可询问店主获得",
    });
  },

  onLoad() {
    wx.showLoading({
      title: "加载中",
    });
  },

  // 跳转到获取用户信息界面
  async hasUserInfo() {
    const userInfo = wx.getStorageSync("userInfo") || {};
    if (!userInfo.nickName) {
      const modal = await showModal("提示", "我们需要使用您的微信昵称来方便店主与店员之间的管理\n点击确定跳转到授权页面进行授权");
      if (modal.confirm) {
        wx.navigateTo({
          url: "../getUserInfo/getUserInfo",
        });
      } else {
        return false;
      }
    } else {
      return true;
    }
  },

  // 返回用户的昵称
  getUserNickName() {
    const userInfo = wx.getStorageSync("userInfo");
    return userInfo.nickName;
  },
});
