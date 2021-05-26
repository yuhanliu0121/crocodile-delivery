import { showLoading, hideLoading, showModal, showToast } from "../../../utils/asyncWX.js";
import { CanI } from "../../../lib/accessControl/operation.js";
import {
  removeManyGoodsCloud,
  updateGoodsOrder,
} from "../../../lib/goods/operation.js";
const app = getApp();

Page({
  data: {
    add_tab: false, //是否弹出弹框
    add_value: "",
    add_Info: "",
    focusValue: true, //是否自动获取焦点
    space: 130,
    modalHidden: true,
    sortAble: false,
    deleteAble: false,
    isIphoneX: app.globalData.isIphoneX,
    size: 1,
    listData: [],
    pageMetaScrollTop: 0,
    scrollTop: 0,
  },
  iniListData: [],
  minRefreshDist: 20,
  sortEnd(e) {
    let listData = e.detail.listData;
    let i = 0;
    let w_index = -1; //记录发生变化的位置
    if (listData.length > 1) {
      for (i = 0; i < listData.length - 1; i++) {
        if (listData[i].goodsOrder > listData[i + 1].goodsOrder) {
          w_index = i;
        }
      }
      console.log(w_index);
      if (w_index >= 0) {
        if (w_index == 0) {
          //移到队里嗯头部情况
          listData[0].goodsOrder = listData[1].goodsOrder / 2;
        } else if (w_index == listData.length - 2) {
          //移到队列尾部情况
          listData[w_index + 1].goodsOrder =
            listData[w_index].goodsOrder + 65536;
        } else {
          if (
            listData[w_index + 1].goodsOrder > listData[w_index - 1].goodsOrder
          ) {
            //凸起型
            listData[w_index].goodsOrder =
              (listData[w_index - 1].goodsOrder +
                listData[w_index + 1].goodsOrder) /
              2;
          } else {
            //凹陷型
            listData[w_index + 1].goodsOrder =
              (listData[w_index].goodsOrder +
                listData[w_index + 2].goodsOrder) /
              2;
          }
        }
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
    }

    this.setData({
      listData: e.detail.listData,
    });
  },
  change(e) {
    console.log("change", e.detail.listData);
  },
  sizeChange(e) {
    wx.pageScrollTo({
      scrollTop: 0,
    });
    this.setData({
      size: e.detail.value,
    });
    this.drag.init();
  },
  itemClick(e) {
    console.log(e);
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
  addInput(e) {
    this.setData({
      add_Info: e.detail.value,
    });
  },

  add(e) {
    let listData = this.data.listData;
    listData.push({
      dragId: `item${listData.length}`,
      title: "奇幻妙妙屋",
      fixed: true,
    });
    setTimeout(() => {
      this.setData({
        listData,
      });
      this.drag.init();
    }, 300);
  },
  check(e) {
    console.log(e);
    let index = e.detail.key;
    let listData = this.data.listData;
    listData[index].checked = true;
    setTimeout(() => {
      this.setData({
        listData,
      });
      this.drag.init();
    }, 300);
  },
  uncheck(e) {
    console.log(e);
    let index = e.detail.key;
    let listData = this.data.listData;
    listData[index].checked = false;
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
  async deleteItem(e){
    console.log(e);
    let index = e.detail.key;
    let listData = this.data.listData;
    if (!(await CanI("goods"))) {
      // console.log("无操作权限");
      return;
    }
    const modal = await showModal("确定删除？");
    if (modal.cancel) {
      return;
    }
    let goodsInfoList = [];
    goodsInfoList.push(listData[index])
    const res = await removeManyGoodsCloud(goodsInfoList);
    if (res) {
      let pages = getCurrentPages(); // 获取页面栈
      let prevPage = pages[pages.length - 2]; //上一个页面
      prevPage.refreshFlag = true;
      listData.splice(index, 1);
      setTimeout(() => {
        this.setData({
          listData,
        });
        this.drag.init();
      }, 300);
    }
  },


  async sortGoods() {
    if (!(await CanI("goods"))) {
      // console.log("无操作权限");
      return;
	}
	
	wx.showToast({title: "长按拖动排序",icon:"none"})

    this.setData({
      sortAble: true,
    });
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
  async saveSort() {
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
          listData[i].goodsId == this.iniListData[j].goodsId &&
          listData[i].goodsOrder != this.iniListData[j].goodsOrder
        ) {
          delete listData[i]._id;
          changeList.push(listData[i]);
        }
      }
    }
    console.log(changeList);
    if (changeList.length == 0) {
      this.setData({
        sortAble: false,
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
    const res = await updateGoodsOrder(changeList);
    console.log(res);
    if (res) {
      let pages = getCurrentPages(); // 获取页面栈
      let prevPage = pages[pages.length - 2]; //上一个页面
      prevPage.refreshFlag = true;
      this.iniListData = JSON.parse(JSON.stringify(listData));
      this.setData({
        sortAble: false,
      });
      for (i = 0; i < listData.length; i++) {
        listData[i].fixed = true;
      }
    }
    setTimeout(() => {
      this.setData({
        listData,
      });
      this.drag.init();
    }, 300);
  },
  async deleteGoods() {
    if (!(await CanI("goods"))) {
      // console.log("无操作权限");
      return;
    }
    this.setData({
      deleteAble: true,
    });
    let i = 0;
    let { listData } = this.data;
    for (i = 0; i < listData.length; i++) {
      listData[i].checkAble = true;
    }
    setTimeout(() => {
      this.setData({
        listData,
      });
      this.drag.init();
    }, 300);
  },
  async saveDelete() {
    const modal = await showModal("确定删除？");

    //
    if (modal.cancel) {
      return;
    }

    let { listData } = this.data;

    // 删除商品的代码
    //  1 实际的执行删除
    // 2 删除listData的对应的索引的元素
    let goodsInfoList = [];
    listData.forEach((v) => {
      if (v.checked) {
        goodsInfoList.push(v);
      }
    });
    console.log(goodsInfoList);

    const res = await removeManyGoodsCloud(goodsInfoList);
    console.log(res);
    if (res) {
      let pages = getCurrentPages(); // 获取页面栈
      let prevPage = pages[pages.length - 2]; //上一个页面
      prevPage.refreshFlag = true;
      for (i = listData.length - 1; i >= 0; i--) {
        //删除对应的前端数据
        if (listData[i].checked) {
          listData.splice(i, 1);
        }
      }
    }

    // ========
    this.setData({
      deleteAble: false,
    });
    let i = 0;

    for (i = 0; i < listData.length; i++) {
      listData[i].checkAble = false;
    }
    setTimeout(() => {
      this.setData({
        listData,
      });
      this.drag.init();
    }, 300);
  },
  // 页面滚动
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop,
    });
  },

  onLoad(option) {
    // 从上一个页面获取商品信息
    let pages = getCurrentPages(); // 获取页面栈
    let prevPage = pages[pages.length - 2]; //上一个页面
    let listData = prevPage.data.rightContent;

    listData = listData.map((v) => {
      return { ...v, fixed: true, checkAble: false, checked: false,  };
    });

    this.setData({
      sortAble: false,
      deleteAble: false,
    });
    this.drag = this.selectComponent("#drag");
    // let listData = JSON.parse(option.editGoods);
    // console.log(listData);
	this.iniListData = JSON.parse(JSON.stringify(listData)); //记录初始数组，为后续排序比较做准备
	
	
    // let i = 0;
    // for (i = 0; i < listData.length; i++) {
    //   listData[i].fixed = true;
    // }
    setTimeout(() => {
      this.setData({
        listData: listData,
      });
      this.drag.init();
    }, 100);
  },
});
