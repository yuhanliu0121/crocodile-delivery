import { add, subtract, times, divide } from "../calculate/calculate.js";
import { showModal, showToast } from "../../utils/asyncWX.js";
// 本文件集成了对购物车数据的相关操作

/* 购物车数据结构
cart={
        userId: "110011010",      // 用户ID (目前为空)
        totalPrice: 3400,        // 购物车内所有商品总价
        totalNum: 20,           //购物车内所有商品数量
        shopCart:[               //在所有的商店买的商品
            {
                shopId: "10010",             // 商家的ID         -------> shopInfo 必有
                shopName: "xxx商超",         // 商家的名字        ------> shopInfo  必有
                freeDelivery:"满60免费配送"  // 商家配送策略       ------> shopInfo 不一要有 可以根据业务调整
                minConsumption: 50         // 起送费（最低消费）  --------> shopInfo  不一要有 可以根据业务调整
                totalPrice:123             // 在该店的总消费
                totalNum:12                // 在该店购买的商品总数
                goods:[                 // 在该店购买的所有商品     
                    {
                        goodsId: "10002",
                        goodsName: "xxx",
                        goodsPicUrl: "https://xxxx.xxxx",
                        goodsPrice: 1252.79,
                        goodsBuyLimit: 10,          //商品限购量
                        goodsStock: 100,            //商品在商家的库存量
                        goodsAvailable: true,       //商品是否上架中
                        goodsDetail: "some detail",     //商品的其他说明
                        num: 1,              //购买的商品数量
                    }
                ] 
            },

            // 在另一家店的购物车
            {
              shopId:xxxxxx
              shopName:xxxxx
              ...... 同上
            }

        ],             
    }


*/
// 从缓存中获取购物车
// 创建一个全局购物车
function createGlobalCart(userId = "") {
  console.log("createGlobalCart");
  if (typeof userId === "string") {
    let cart = {
      userId: userId,
      totalPrice: 0,
      totalNum: 0,
      shopCart: [],
    };
    wx.setStorageSync("cart", cart);
  } else {
    console.error("UserId has to be string");
  }
}

// 更新总消费和购买总数
function updateConsumption() {
  let cart = wx.getStorageSync("cart");
  // console.log("updateConsumption");
  let totalPrice = 0;
  let totalNum = 0;
  let allShopCart = cart.shopCart;
  if (allShopCart.length !== 0) {
    for (let j = 0, len = allShopCart.length; j < len; j++) {
      totalPrice = add(totalPrice, allShopCart[j].totalPrice);
      totalNum = add(totalNum, allShopCart[j].totalNum);
    }
  }
  cart.totalPrice = totalPrice;
  cart.totalNum = totalNum;

  // console.log("totalPrice: " + totalPrice);
  // console.log("totalNum: " + totalNum);

  wx.setStorageSync("cart", cart);
}

// 检查当前的全局购物车是否含有某个商店的购物车  没有则返回-1 有则返回该购物车在全局购物车的索引
function hasShopCart(shopId) {
  let cart = wx.getStorageSync("cart");
  if (cart.shopCart.length === 0) {
    return -1;
  }
  return cart.shopCart.findIndex((v) => v.shopId === shopId);
}

//  向当前的全局购物车中添加一个该商店的空购物车 并返回它在总购物车中的索引
function addShopCart(shopInfo) {
  let cart = wx.getStorageSync("cart");
  // console.log("addShopCart");
  //shopInfo 定义见购物车数据结构注释
  cart.shopCart.push({
    shopId: shopInfo.shopId,
    shopName: shopInfo.shopName,
    minConsumption: shopInfo.minConsumption,
    totalPrice: 0,
    totalNum: 0,
    goods: [],
  });
  wx.setStorageSync("cart", cart);
  return cart.shopCart.length - 1;
}

// 向全局购物车中删除一个商店的购物车
function removeShopCart(shopId) {
  let cart = wx.getStorageSync("cart");
  // console.log("removeShopCart");
  let shopCartIndex = hasShopCart(shopId);
  if (shopCartIndex !== -1) {
    cart.shopCart.splice(shopCartIndex, 1);
    wx.setStorageSync("cart", cart);
    updateConsumption();
  }
}

// 返回当前的全局购物车中的某商店的购物车
function getShopCart(shopId) {
  let cart = wx.getStorageSync("cart");
  // console.log("getShopCart");
  let shopCartIndex = hasShopCart(shopId);
  if (shopCartIndex === -1) {
    console.log("No cart found for current shop");
    return {};
  } else {
    return cart.shopCart[shopCartIndex];
  }
}

// 将所有商店的购物车以数组形式返回
function getAllShopCart() {
  let cart = wx.getStorageSync("cart");
  // console.log("getAllShopCart");
  // 如果某个购物车中没有商品 则先将他从总购物车中移除
  for (let j = 0, len = cart.shopCart.length; j < len; j++) {
    if (cart.shopCart[j].totalNum === 0) {
      removeShopCart(cart.shopCart[j].shopId);
    }
  }
  return wx.getStorageSync("cart").shopCart;
}

//  清空全局购物车
function clearAllShopCart() {
  let cart = wx.getStorageSync("cart");
  // console.log("clearAllShopCart");
  cart.shopCart = [];
  updateConsumption();
}

// 重置某个商店的购物车
function setShopCart(shopCart) {
  // console.log("setShopCart");

  let cart = wx.getStorageSync("cart");

  if (cart.shopCart.length === 0) {
    cart.shopCart.push(shopCart);
  } else {
    let shopCartIndex = cart.shopCart.findIndex((v) => v.shopId === shopCart.shopId);
    cart.shopCart[shopCartIndex] = shopCart;
  }
  wx.setStorageSync("cart", cart);
  updateConsumption();
}

// ========================= 对某一个商店的购物车进行操作 ================

// 检查当前商店的购物车中是否有某个商品
function hasGoods(shopId, goodsId, _shopCart) {
  // console.log("hasGoods");
  let shopCart = _shopCart.shopId === undefined ? getShopCart(shopId) : _shopCart;
  let goodsIndex = shopCart.goods.findIndex((v) => v.goodsId === goodsId);
  // console.log("goodsIndex: " + goodsIndex);
  return goodsIndex;
}

// 更新在某个商店的总消费和购买总数
function updateShopConsumption(shopId, _shopCart) {
  // console.log("updateShopConsumption");
  let shopCart = _shopCart.shopId === undefined ? getShopCart(shopId) : _shopCart;
  let goods = shopCart.goods;

  let totalPrice = 0;
  let totalNum = 0;

  if (goods.length !== 0) {
    for (let j = 0, len = goods.length; j < len; j++) {
      totalPrice = add(totalPrice, times(goods[j].goodsPrice, goods[j].num));
      totalNum = add(totalNum, goods[j].num);
    }
  }

  // console.log("totalPrice: " + totalPrice);
  // console.log("totalNum: " + totalNum);

  shopCart.totalPrice = totalPrice;
  shopCart.totalNum = totalNum;
  setShopCart(shopCart);
}

// 清空一个商店的购物车(注意清空和删除的区别 清空只是将shopCart的goods数组设为[]，而删除则是从全局购物车的shopCart中将这个购物车删除)
function clearShopCart(shopId, _shopCart = {}) {
  let shopCart = _shopCart.shopId === undefined ? getShopCart(shopId) : _shopCart;
  shopCart.goods = [];
  updateShopConsumption(shopId, shopCart);
}

// 向购物车中添加商品
/*
  注意:表面上看上去增加一个商品的数量只要知道商品的goodsId然后在购物车里找到这个Id再给goodsNum加一并重新计算总价就完事
  但实际上这样的后期扩展性就会很差 比如卖烤串的要求三串起购买 我们就不能单纯的每次用户点"+" 的时候就加一 而是要对商品加入购物车做一系列其他的逻辑判断
  由此我们需要将整个商品的信息传进方法中方便后期拓展
*/
function addGoods(shopId, goodsInfo, _shopCart = {}) {
  // console.log("addGoods");
  /**
   * 1 还没买过当前的商品 要+1
   * 2 买过当前的商品 要+1 (1. 欲买数量<=限购 2 欲买数量<=库存 3 欲买数量>=最少购买 || 欲买数量=0)
   */
  let shopCart = _shopCart.shopId === undefined ? getShopCart(shopId) : _shopCart;
  let goodsId = goodsInfo.goodsId;
  let goodsIndex = hasGoods(shopId, goodsId, shopCart);

  let oldGoodsNum = goodsIndex === -1 ? 0 : shopCart.goods[goodsIndex].num;
  let newGoodsNum = oldGoodsNum >= goodsInfo.goodsBuyLeastLimit ? oldGoodsNum + 1 : goodsInfo.goodsBuyLeastLimit;

  // 检验是否小于库存
  if (newGoodsNum > goodsInfo.goodsStock) {
    showToast("已无更多库存");
    return;
  }

  // 检验是否小于限购
  if (newGoodsNum > goodsInfo.goodsBuyLimit) {
    showToast("已达每单限购量");
    return;
  }

  if (goodsIndex === -1) {
    // 还没买过当前的商品 则连同商品信息和num一起添加到购物车
    shopCart.goods.push({ ...goodsInfo, num: newGoodsNum });
    updateShopConsumption(shopId, shopCart);
    return;
  }

  if (goodsIndex !== -1) {
    // 已经买过当前的商品 则重置商品的数量
    shopCart.goods[goodsIndex].num = newGoodsNum;
    updateShopConsumption(shopId, shopCart);
    return;
  }
}

// 从购物车中减少商品
async function reduceGoods(shopId, goodsInfo, _shopCart = {}) {

  let shopCart = _shopCart.shopId === undefined ? getShopCart(shopId) : _shopCart;
  let goodsId = goodsInfo.goodsId;
  let goodsIndex = hasGoods(shopId, goodsId, shopCart);

  if (goodsIndex === -1) {
    returm;
  }

  let oldGoodsNum = shopCart.goods[goodsIndex].num;
  let newGoodsNum = oldGoodsNum > goodsInfo.goodsBuyLeastLimit ? oldGoodsNum - 1 : 0;

  if (newGoodsNum !== 0) {
    // 3.1
    shopCart.goods[goodsIndex].num = newGoodsNum;
    updateShopConsumption(shopId, shopCart);
    return;
  }

  // 提示一下要不要删除商品
  if (newGoodsNum === 0) {
    // 3.2
    const res = await showModal("确认删除商品?");
    if (res.confirm) {
      shopCart.goods.splice(goodsIndex, 1);
      updateShopConsumption(shopId, shopCart);
    }
  }
}

// 从购物车直接删除商品
function removeGoods(shopId, goodsInfo, _shopCart = {}) {
  console.log("removeGoods", goodsInfo.goodsName);
  let shopCart = _shopCart.shopId === undefined ? getShopCart(shopId) : _shopCart;
  let goodsId = goodsInfo.goodsId;
  let goodsIndex = hasGoods(shopId, goodsId, shopCart);
  if (goodsIndex !== -1) {
    shopCart.goods.splice(goodsIndex, 1);
    updateShopConsumption(shopId, shopCart);
  }
}

function changeGoodsNum(shopId, goodsInfo, newNum, _shopCart = {}) {
  console.log("changeGoodsNum", goodsInfo.goodsName, newNum);
  let shopCart = _shopCart.shopId === undefined ? getShopCart(shopId) : _shopCart;
  let goodsId = goodsInfo.goodsId;
  let goodsIndex = hasGoods(shopId, goodsId, shopCart);
  if (goodsIndex !== -1) {
    shopCart.goods[goodsIndex].num = newNum;
    updateShopConsumption(shopId, shopCart);
  }
}

export {
  createGlobalCart,
  updateConsumption,
  hasShopCart,
  addShopCart,
  removeShopCart,
  getShopCart,
  getAllShopCart,
  clearAllShopCart,
  hasGoods,
  updateShopConsumption,
  addGoods,
  reduceGoods,
  clearShopCart,
  removeGoods,
  changeGoodsNum,
  setShopCart,
};

//===================测试数据
// let agood = {
//   goodsId: "10002",
//   goodsName: "xxx",
//   goodsPicUrl: "https://xxxx.xxxx",
//   goodsPrice: 1252.79,
//   goodsBuyLimit: 10, //商品限购量
//   goodsStock: 100, //商品在商家的库存量
//   goodsAvailable: true, //商品是否上架中
//   goodsDetail: "some detail", //商品的其他说明
//   num: 1, //购买的商品数量
// };

//   goods = {
//     //购买的商品详情
//     "10002": {
//       goodsId: "10002",
//       goodsName: "xxx",
//       goodsPicUrl: "https://xxxx.xxxx",
//       goodsPrice: 1252.79,
//       goodsBuyLimit: 10, //商品限购量
//       goodsStock: 100, //商品在商家的库存量
//       goodsAvailable: true, //商品是否上架中
//       goodsDetail: "some detail", //商品的其他说明
//       num: 1, //购买的商品数量
//     },
//     "10002": {
//       goodsId: "10002",
//       goodsName: "xxx",
//       goodsPicUrl: "https://xxxx.xxxx",
//       goodsPrice: 1252.79,
//       goodsBuyLimit: 10, //商品限购量
//       goodsStock: 100, //商品在商家的库存量
//       goodsAvailable: true, //商品是否上架中
//       goodsDetail: "some detail", //商品的其他说明
//       num: 1, //购买的商品数量
//     },
//   };
