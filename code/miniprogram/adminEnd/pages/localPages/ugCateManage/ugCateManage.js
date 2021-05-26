import {
  removeGoodsCateCloud,
  addGoodsCateCloud,
  updateGoodsCateOrder,
  updateGoodsCateInfoCloud,
} from "../../../lib/category/operation.js";
import {
  showToast,
  showModal,
  showLoading,
  hideLoading,
} from "../../../utils/asyncWX.js";
import { addGoodsCloud } from "../../../lib/goods/operation.js";
const app = getApp();

Page({
  data: {
    add_tab: false, //是否弹出弹框
    add_Info: "",
    isIphoneX: app.globalData.isIphoneX,
    focusValue: true, //是否自动获取焦点
    space: 130,
    modalHidden: true,
    editable: false,
    size: 1,
    listData: [],
    pageMetaScrollTop: 0,
    scrollTop: 0,

    // 对类别进行操作的对话框的button
    buttons: [{ text: "取消" }, { text: "确定" }],

    // 是否展示action sheet
    showActionsheet: false,

    // 可以对商品类别进行的操作
    actionsOnCate: [{ text: "修改类别名称", value: 0 }],
    // 是否打开修改商品名称输入框
    openInputDialog: false,

    // 用户在修改商品名称对话框中输入的名称
    dialogInputText: "",
  },

  iniListData: [],
  minRefreshDist: 20, //如果有Order间隔小于这个就全部刷新
  shopInfo: {
    shopId: "",
  },
  sortEnd(e) {
    console.log("sortEnd", e.detail.listData);
    let listData = e.detail.listData;
    let i = 0;
    let w_index = -1; //记录发生变化的位置
    if (listData.length > 1) {
      for (i = 0; i < listData.length - 1; i++) {
        if (listData[i].cateOrder > listData[i + 1].cateOrder) {
          w_index = i;
        }
      }
      console.log(w_index);
      if (w_index >= 0) {
        if (w_index == 0) {
          //移到队里嗯头部情况
          listData[0].cateOrder = listData[1].cateOrder / 2;
        } else if (w_index == listData.length - 2) {
          //移到队列尾部情况
          listData[w_index + 1].cateOrder = listData[w_index].cateOrder + 65536;
        } else {
          if (
            listData[w_index + 1].cateOrder > listData[w_index - 1].cateOrder
          ) {
            //凸起型
            listData[w_index].cateOrder =
              (listData[w_index - 1].cateOrder +
                listData[w_index + 1].cateOrder) /
              2;
          } else {
            //凹陷型
            listData[w_index + 1].cateOrder =
              (listData[w_index].cateOrder + listData[w_index + 2].cateOrder) /
              2;
          }
        }
      }
      let minDist = 65536 * 2;
      for (i = 1; i < listData.length; i++) {
        if (listData[i].cateOrder - listData[i - 1].cateOrder < minDist) {
          minDist = listData[i].cateOrder - listData[i - 1].cateOrder;
        }
      } //获取最小间隔
      if (minDist < this.minRefreshDist) {
        for (i = 0; i < listData.length; i++) {
          listData[i].cateOrder = (i + 1) * 65536;
        }
      }
    }

    this.setData({
      listData: e.detail.listData,
    });
  },
  change(e) {
    console.log("change", e.detail.listData);
  },
  sizeChange(e) {
    wx.pageScrollTo({ scrollTop: 0 });
    this.setData({
      size: e.detail.value,
    });
    this.drag.init();
  },

  toggleFixed(e) {
    let key = e.currentTarget.dataset.key;

    let { listData } = this.data;

    listData[key].fixed = !listData[key].fixed;

    this.setData({
      listData: listData,
    });

    this.drag.init();
  },
  editCategory(e) {
    console.log(e);
  },

  async tabSort() {
    this.setData({
      editable: true,
    });
    wx.showToast({title: "长按拖动排序",icon:"none"})
    let i = 0;
    let { listData } = this.data;
    for (i = 0; i < listData.length; i++) {
      listData[i].fixed = false;
    }

    let minDist = 65536 * 2;
    for (i = 1; i < listData.length; i++) {
      if (listData[i].goodsOrder - listData[i - 1].goodsOrder < minDist) {
        minDist = listData[i].goodsOrder - listData[i - 1].goodsOrder;
      }
    } //获取最小间隔
    if (minDist < this.minRefreshDist) {
      for (i = 0; i < listData.length; i++) {
        listData[i].goodsOrder = (i + 1) * 65536;
      }
    }

    setTimeout(() => {
      this.setData({
        listData,
      });
      this.drag.init();
    }, 300);
  },
  async deleteCategory(e) {
    let { listData } = this.data;
    let shopInfo = {};
    let ind = e.detail.key;
    let cateInfo = listData[ind];
    console.log(cateInfo);
    const modal = await showModal(
      "确定删除？",
      "该分类及其下的所有商品都将被删除"
    );
    if (modal.cancel) {
      return;
    }

    const res = await removeGoodsCateCloud(shopInfo, cateInfo);
    console.log(res);
    if (res) {
      let pages = getCurrentPages(); // 获取页面栈
      let prevPage = pages[pages.length - 2]; //上一个页面
      prevPage.refreshFlag = true;
      prevPage.setData({
        currentIndex: 0,
      });
      listData.splice(ind, 1);
      setTimeout(() => {
        this.setData({
          listData,
        });
        this.drag.init();
      }, 300);
    }
  },
  addInput(e) {
    this.setData({
      add_Info: e.detail.value,
    });
  },

  async save(e) {
    const modal = await showModal("保存排序?");
    if (modal.cancel) {
      return;
    }

    let i = 0;
    let j = 0;
    let changeList = [];
    let listData = this.data.listData;

    for (i = 0; i < listData.length; i++) {
      for (j = 0; j < this.iniListData.length; j++) {
        if (
          listData[i].cateId == this.iniListData[j].cateId &&
          listData[i].cateOrder != this.iniListData[j].cateOrder
        ) {
          changeList.push(listData[i]);
        }
      }
    }
    console.log(changeList);
    if (changeList.length == 0) {
      this.setData({
        editable: false,
      });
      for (i = 0; i < listData.length; i++) {
        listData[i].fixed = true;
      }
      setTimeout(() => {
        this.setData({
          listData,
        });
        this.drag.init();
      }, 300);
      return;
    }
    const res = await updateGoodsCateOrder(changeList);
    console.log(res);
    if (res) {
      let pages = getCurrentPages(); // 获取页面栈
      let prevPage = pages[pages.length - 2]; //上一个页面
      prevPage.refreshFlag = true;
      this.setData({
        editable: false,
      });
      for (i = 0; i < listData.length; i++) {
        listData[i].fixed = true;
      }
    }
    this.iniListData = JSON.parse(JSON.stringify(listData));
    setTimeout(() => {
      this.setData({
        listData,
      });
      this.drag.init();
    }, 300);
  },
  scroll(e) {
    this.setData({
      pageMetaScrollTop: e.detail.scrollTop,
    });
  },

  // 页面滚动
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop,
    });
  },
  tabAdd: function () {
    this.setData({ modalHidden: !this.data.modalHidden });
  },
  async modalBindaconfirm(e) {
    const tapButtonIndex = e.detail.index;

    // 用户点击的是取消
    if (tapButtonIndex === 0) {
      this.setData({ modalHidden: !this.data.modalHidden });
      return;
    }

    const cateName = this.data.add_Info.trim();
    if (!cateName) {
      await showModal("添加分类失败", "无效的类别名称");
      this.setData({ modalHidden: !this.data.modalHidden });
      return;
    }

    this.setData({ modalHidden: !this.data.modalHidden, add_Info: "" });
    let listData = this.data.listData;
    let maxOrderTemp = 0;
    listData.forEach((v) => {
      if (v.cateOrder > maxOrderTemp) {
        maxOrderTemp = v.cateOrder;
      }
    });
    let shopInfo = this.shopInfo;
    let cateInfo = {
      cateName: cateName,
      cateOrder: maxOrderTemp + 65536,
    };
    const res = await addGoodsCateCloud(shopInfo, cateInfo);
    console.log(res);
    if (res) {
      let pages = getCurrentPages(); // 获取页面栈
      let prevPage = pages[pages.length - 2]; //上一个页面
      prevPage.refreshFlag = true;
      listData.push({
        cateId: `item${listData.length}`,
        cateName: cateName,
        cateOrder: maxOrderTemp + 1,
        fixed: true,
      });
      this.setData({ listData });
      this.drag.init();

      // TODO 滚动的bug不好修 先放着
      // 等300ms让setData渲染完再滚动
      // setTimeout(() => {
      //   wx.createSelectorQuery()
      //     .select("#drag")
      //     .boundingClientRect(function (rect) {
      //       // 使页面滚动到底部
      //       wx.pageScrollTo({
      //         scrollTop: rect.bottom,
      //       });
      //     })
      //     .exec();
      // }, 300);
    }
  },

  // 点击某一个类别打开action sheet
  itemClick(e) {
    const index = e.detail.key;
    this.actionOnCateIdx = index;
    this.setData({ showActionsheet: true });
  },

  // 关闭actionSheet
  closeActionSheet() {
    this.setData({
      showActionsheet: false,
    });
  },

  // 选择对类别进行的操作
  handleTapActionSheetItem(e) {
    const actionIndex = e.detail.index;
    switch (actionIndex) {
      case 0:
        // 打开修改类别名称对话框
        this.setData({ openInputDialog: true });
        break;
    }
    this.closeActionSheet();
  },

  // 用户在对话框中输入类别的备注名
  handleChangeDialogInput(e) {
    this.setData({ dialogInputText: e.detail.value });
  },

  // 用户点击编辑类别名称对话框的按钮
  async handleTapInputDialogButton(e) {
    const tapButtonIndex = e.detail.index;
    let listData = this.data.listData;
    let tabCateIndex = this.actionOnCateIdx;
    // 用户点击的是取消
    if (tapButtonIndex === 0) {
      this.setData({ openInputDialog: false });
    }

    if (tapButtonIndex === 1) {
      const newCateName = this.data.dialogInputText.trim();
      if (!newCateName) {
        await showToast("无效名称");
        return;
      }

      //  后台实际的修改操作
      this.setData({ openInputDialog: false });
      let shopInfo = this.shopInfo;
      let cateInfo = listData[tabCateIndex];
      listData[tabCateIndex].cateName = newCateName;
      cateInfo.cateName = newCateName;
      const res = await updateGoodsCateInfoCloud(shopInfo, cateInfo);
      // 如果后台修改成功则前端也手动把当前的用户的备注名改掉
      if (res) {
        let pages = getCurrentPages(); // 获取页面栈
        let prevPage = pages[pages.length - 2]; //上一个页面
        prevPage.refreshFlag = true;
        setTimeout(() => {
          this.setData({
            listData,
          });
          this.drag.init();
        }, 300);
      }
    }
  },

  // ===================================================
  // ===================================================
  // ============     页面生命周期函数     ===============
  // ===================================================
  // ===================================================
  onLoad(option) {
    this.drag = this.selectComponent("#drag");
    this.shopInfo.shopId = option.shopId;


    // 从上一个页面获取商品类别信息
    let pages = getCurrentPages(); // 获取页面栈
    let prevPage = pages[pages.length - 2]; //上一个页面
    let listData = prevPage.data.leftMenuList;
    
    
    listData = listData.map(v=>{return {...v, fixed:true}})
    
    this.iniListData = JSON.parse(JSON.stringify(listData)); //记录初始数据，方便排序完成后比较

    setTimeout(() => {
      this.setData({
        listData: listData,
      });
      this.setData({
        editable: false,
      });
      this.drag.init();
    }, 100);
  },
});
