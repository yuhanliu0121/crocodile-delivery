import {
  getId
} from "../id/operation.js";
import {
  CanI
} from "../accessControl/operation.js";
import {
  showLoading,
  hideLoading,
  showModal,
  showToast,
} from "../../utils/asyncWX.js";
// 初始化云环境
const db = wx.cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
// 这里只获取shop和goodsCate的索引 goods通过云函数获得
const shopRef = db.collection("shop");
const goodsRef = db.collection("goods");
const goodsCateRef = db.collection("goodsCate");
let app = getApp();

/**
 * 向云端新建一个分类 并返回从云端发来的新建结果
 * @param {*object} shopInfo 商店信息 至少需要含有shopId属性
 * @param {*object} cateInfo 类别信息 至少需要包含cateName以及cateOrder
 */
async function addGoodsCateCloud(shopInfo, cateInfo) {
  if (!await CanI("goods")) {
    // console.log("无操作权限");
    return
  }
  // 每个商店最多可以建100个类 这里需要检查当前的商店是否有100个类
  try {
    await showLoading("保存中");
    const cateNumRes = await goodsCateRef.where({
      shopId: shopInfo.shopId,
      isExist: true
    }).count()

    const cateNum = cateNumRes.total
    console.log(cateNum);
    if (cateNum >= 100) {
      await hideLoading()
      await showModal("分类数量不能超过100个")
      return;
    }

    const newCate = {
      ...cateInfo,
      isExist: true,
      shopId: shopInfo.shopId,
      cateId: getId(),
    };

    console.log("新建分类中");
    const res = await goodsCateRef.add({
      data: {
        ...newCate
      },
    });
    console.log("新建分类结束", res);
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false
  } finally {
    hideLoading();
  }
}

/**
 * 向云端新建一个分类 并返回从云端发来的新建结果
 * @param {*object} shopInfo 商店信息 至少需要含有shopId属性
 * @param {*object} cateInfo 要修改的类别信息 必须含有cateId属性
 */
async function updateGoodsCateInfoCloud(shopInfo, cateInfo) {
  if (!await CanI("goods")) {
    // console.log("无操作权限");
    return
  }
  try {
    await showLoading("保存中");
    const res = await goodsCateRef.where({
        cateId: cateInfo.cateId
      })
      .update({
        data: {
          ...cateInfo
        }
      })

    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false
  } finally {
    hideLoading();
  }

}

/**
 * 修改商品类别的展示顺序
 * @param catesList 一个对象数组，包含需要修改的所有分类排序信息
 */
async function updateGoodsCateOrder(catesList) {
  if (!await CanI("goods")) {
    // console.log("无操作权限");
    return
  }

  try {
    console.log("正在更新排序信息");
    await showLoading("正在保存")
    console.log("更改信息", catesList);
    const updateRes = await wx.cloud.callFunction({
      name: "update_cates_order",
      data: {
        catesList: catesList
      }
    })
    console.log("排序保存完成", updateRes);
    return updateRes;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false
  } finally {
    hideLoading();
  }


}

/**
 * 向云端虚拟删除一个分类 并返回从云端发来的新建结果
 * 虚拟删除分类的同时会连同该类下的所有商品一起虚拟删除
 * @param {*object} shopInfo 暂时不需要
 * @param {*object} cateInfo 类别信息 至少需要包含cateId
 */
async function removeGoodsCateCloud(shopInfo, cateInfo) {
  if (!await CanI("goods")) {
    // console.log("无操作权限");
    return
  }
  console.log(cateInfo);
  try {
    // 第一个任务 虚拟删除商品类
    const task1 = goodsCateRef
      .where({
        cateId: cateInfo.cateId,
      })
      .update({
        data: {
          isExist: false,
        }
      });

    // 第二个任务 虚拟删除该类下的商品
    const task2 = goodsRef
      .where({
        cateId: cateInfo.cateId,
      })
      .update({
        data: {
          isExist: false,
        }
      });

    // 新建一个promise数组
    const tasks = [task1, task2];

    await showLoading("删除中");
    // 等待所有
    const res = (await Promise.all(tasks))
    // .reduce((acc, cur) => {
    //   return {
    //     data: acc.stats,
    //     errMsg: acc.errMsg,
    //   };
    // });
    return res;
  } catch (error) {
    console.log("error", error);
    showModal("错误", "请检查网络状态后重试");
    return false
  } finally {
    hideLoading();
  }
}

export {
  addGoodsCateCloud,
  removeGoodsCateCloud,
  updateGoodsCateInfoCloud,
  updateGoodsCateOrder
};