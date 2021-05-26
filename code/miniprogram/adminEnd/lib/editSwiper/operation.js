import { showLoading, hideLoading, showToast, showModal } from "../../utils/asyncWX";
import { getId } from "../id/operation";

const db = wx.cloud.database();
const advertiseSwiperRef = db.collection("advertiseSwiper");
const shopRef = db.collection("shop");
const goodsCateRef = db.collection("goodsCate");
const goodsRef = db.collection("goods");
const ugShopRef = db.collection("ugShop");
const ugGoodsCateRef = db.collection("ugGoodsCate");
const ugGoodsRef = db.collection("ugGoods");

// 获取轮播图数据
export async function getSwiperCloud() {
  showLoading("刷新中");
  const swiperListRef = await advertiseSwiperRef.where({ location: "home", isExist: true }).field({ _id: false, _openid: false }).orderBy("order", "asc").get();
  hideLoading();
  return swiperListRef.data;
}

// 返回一个空的swiper数据
export function getEmptySwiper(index) {
  let emptySwiper = {
    swiperId: getId(),
    order: index + 1,
    detail: "",
    picUrl: "",
    location: "home",
    shopName: "",
    shopId: "",
    cateName: "",
    cateId: "",
    goodsName: "",
    goodsId: "",
    navigatorUrl: "",
    isUgShop: false,
    isExist: true,
  };
  return emptySwiper;
}

// 检查提交轮播图数据的合法性
export function verifySwiperList(swiperList) {
  for (let i = 0; i < swiperList.length; i++) {
    let hasPicUrl = swiperList[i].picUrl !== "";
    let hasShopId = swiperList[i].shopId !== "";
    let hasShopName = swiperList[i].shopName !== "";
    let hasCateName = swiperList[i].cateName !== "";
    let hasGoodsName = swiperList[i].goodsName !== "";

    if (!hasPicUrl) {
      showModal("错误", "轮播图" + String(i + 1) + "没有图片");
      return;
    }

    if (!hasShopId) {
      showModal("错误", "轮播图" + String(i + 1) + "没有商店ID");
      return;
    }

    if (!hasShopName) {
      showModal("错误", "轮播图" + String(i + 1) + "没有商店名称");
      return;
    }

    if (hasGoodsName === true && hasCateName === false) {
      showModal("错误", "轮播图" + String(i + 1) + "未填写类别名称");
      return;
    }
  }

  return true;
}

// 将商品图片上传到云端
async function uploadSwiperPicCloud(swipter) {
  // 将商品图片上传到云端并拿到云端的地址 云端的图片的命名为当前时间戳
  const res = await wx.cloud.uploadFile({
    cloudPath: "swiper" + "/" + swipter.location + "/" + Date.now().toString() + ".jpg",
    filePath: swipter.picUrl, // 文件路径
  });
  return res;
}

// 构造跳转URL
function constructNavigatorUrl(swiper) {
  let navigatorUrl = "";

  if (!swiper.isUgShop) {
    navigatorUrl = "/pages/localPages/shopDetail/shopDetail?shopId=_shopId&cateId=_cateId&goodsId=_goodsId";
  }

  if (swiper.isUgShop) {
    navigatorUrl = "/pages/localPages/ugShopDetail/ugShopDetail?shopId=_shopId&cateId=_cateId&goodsId=_goodsId";
  }

  navigatorUrl = navigatorUrl.replace("_shopId", swiper.shopId);
  navigatorUrl = navigatorUrl.replace("_cateId", swiper.cateId);
  navigatorUrl = navigatorUrl.replace("_goodsId", swiper.goodsId);

  return navigatorUrl;
}

// 向swiper中添加相关的ID 并修改图片地址为云端ID
async function addRelevantInfo(swiper) {
  // console.log("addRelevantInfo", swiper);

  const shopRes = await shopRef.where({ shopId: swiper.shopId }).get();
  const ugShopRes = await ugShopRef.where({ shopId: swiper.shopId }).get();

  if (shopRes.data.length !== 1 && ugShopRes.data.length !== 1) {
    showModal("错误", swiper.shopId + "\n找不到对应的商店ID");
    return;
  }

  if (ugShopRes.data.length === 1) {
    swiper.isUgShop = true;
  }

  let _goodsCateRef;
  let _goodsRef;
  if (swiper.isUgShop) {
    _goodsCateRef = ugGoodsCateRef;
    _goodsRef = ugGoodsRef;
  } else {
    _goodsCateRef = goodsCateRef;
    _goodsRef = goodsRef;
  }

  if (swiper.cateName !== "" && swiper.cateId == "") {
    const cateIdRef = await _goodsCateRef
      .where({
        shopId: swiper.shopId,
        cateName: swiper.cateName,
        isExist: true,
      })
      .get();

    if (cateIdRef.data.length !== 1) {
      showModal("错误", swiper.cateName + "\n找不到对应的商品类别ID或有重名的类别名");
      return;
    }
    swiper.cateId = cateIdRef.data[0].cateId;
  }

  if (swiper.goodsName !== "" && swiper.goodsId == "") {
    const goodsIdRef = await _goodsRef
      .where({
        shopId: swiper.shopId,
        cateId: swiper.cateId,
        goodsName: swiper.goodsName,
        isExist: true,
      })
      .get();

    if (goodsIdRef.data.length !== 1) {
      showModal("错误", swiper.goodsName + "\n找不到对应的商品ID或有重名的商品名");
      return;
    }

    swiper.goodsId = goodsIdRef.data[0].goodsId;
  }

  swiper.navigatorUrl = constructNavigatorUrl(swiper);

  return swiper;
}

// 检查两个swiper是否完全一样
function isSameSwiper(swiperA, swiperB) {
  const swiperAItem = Object.values(swiperA);
  const swiperBItem = Object.values(swiperB);
  if (swiperAItem.length !== swiperBItem.length) {
    return;
  }
  for (let i = 0; i < swiperAItem.length; i++) {
    if (swiperAItem[i] !== swiperBItem[i]) {
      return;
    }
  }
  return true;
}

// 更新云端的轮播图数据
export async function updateSwiperListCloud(newSwiperList, oldSwiperList) {
  let taskList = [];

  // 处理newSwiperList
  for (let i = 0; i < newSwiperList.length; i++) {
    await showLoading("处理轮播图" + String(i + 1));
    let idx = oldSwiperList.findIndex((v) => v.swiperId === newSwiperList[i].swiperId);

    if (idx !== -1 && isSameSwiper(newSwiperList[i], oldSwiperList[idx])) {
      // 完全一样 则直接跳过当前循环
      console.log("轮播图" + String(i + 1) + "完全一样");
      continue;
    }

    if (idx !== -1) {
      // id一样 但具体内容不一样
      console.log("轮播图" + String(i + 1) + "内容发生变化");

      // 先清理一下之前可能残留的ID信息
      newSwiperList[i].cateId = "";
      newSwiperList[i].goodsId = "";
      // 验证相关信息正确性
      newSwiperList[i] = await addRelevantInfo(newSwiperList[i]);
      if (!newSwiperList[i]) {
        hideLoading();
        return;
      }

      if (newSwiperList[i].picUrl !== oldSwiperList[idx].picUrl) {
        // 如果图片不一样则重新上传图片
        console.log("轮播图" + String(i + 1) + "重新上传图片");
        let res1 = await uploadSwiperPicCloud(newSwiperList[i]);
        newSwiperList[i].picUrl = res1.fileID;

        // 删除旧图片
        let deleteOldSwiperPicTask = wx.cloud.deleteFile({
          fileList: [oldSwiperList[idx].picUrl],
        });
        taskList.push(deleteOldSwiperPicTask);
      }

      // 更新信息
      let updateTask = advertiseSwiperRef
        .where({
          swiperId: newSwiperList[i].swiperId,
        })
        .update({
          data: { ...newSwiperList[i] },
        });

      taskList.push(updateTask);
    }

    if (idx === -1) {
      // 这是一个新的swiper
      console.log("轮播图" + String(i + 1) + "是一个全新的轮播图");
      newSwiperList[i] = await addRelevantInfo(newSwiperList[i]);
      if (!newSwiperList[i]) {
        hideLoading();
        return;
      }
      let res2 = await uploadSwiperPicCloud(newSwiperList[i]);
      newSwiperList[i].picUrl = res2.fileID;
      let addTask = advertiseSwiperRef.add({ data: { ...newSwiperList[i] } });
      taskList.push(addTask);
    }
    await hideLoading();
  }

  // 处理oldSwiperList
  for (let i = 0; i < oldSwiperList.length; i++) {
    let idx = newSwiperList.findIndex((v) => v.swiperId === oldSwiperList[i].swiperId);
    if (idx === -1) {
      let deleteSwiperTask = advertiseSwiperRef.where({ swiperId: oldSwiperList[i].swiperId }).update({ data: { isExist: false } });
      taskList.push(deleteSwiperTask);
    }
  }

  await showLoading("上传中");
  const resAll = await Promise.all(taskList);
  console.log("resAll", resAll);
  await hideLoading();
}
