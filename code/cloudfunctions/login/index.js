// 用户点击以店主身份登录或者以店员身份登录时需要拉取的和用户有关的商店数据
// 云函数入口文件
const cloud = require("wx-server-sdk");
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAcMIC_CURRENT_ENV,
});
const db = cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const _ = db.command;
const $ = db.command.aggregate;
// 获取shop表的引用
const ownerRef = db.collection("owner");
const assistantRef = db.collection("assistant");
const shopRef = db.collection("shop");
// 云函数入口函数
exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const { type } = event;
  switch (type) {
    case "owner":
      return loginAsOwner(openid);
    case "assistant":
      return loginAsAssistant(openid);
  }
};

// 作为店主登录
async function loginAsOwner(openid) {
  /**
   * 登录逻辑：
   * 1 首先去owner表里查看当前用户有没有注册的商店
   * 2.1 如果没有直接返回登录失败
   * 2.2 如果有则拉取相关的注册信息
   * 3 owner注册表中每个owner都有access 其中可能会含有登录权限
   * 4 判断access中是否对用户的登录做出了限制
   * 5.1 如果有登录限制 则执行相应的登录权限拦截
   * 5.2 如果没有登录限制 则以owner作为左表shop作为右表联合查询相关的商店信息
   *
   */
  // 1 首先查询注册信息
  const registShopRes = await ownerRef
    .where({
      _openid: openid,
      isExist: true,
    })
    .field({
      access: true,
      shopId: true,
      shopName: true,
    })
    .get();

  const registShop = registShopRes.data;
  console.log("用户注册的商店信息", registShop);
  // 2 检查当前用户有没有注册商店
  if (registShop.length === 0) {
    console.log("没有与用户相关的商店注册信息");
    return { data: "shop not found", errCode: 103 }; // errCode 103 没有注册的商店
  }

  /** 3 4
   * 当前暂时不对店主登录进行权限拦截 直接跳到5.2
   */
  console.log("拉取与登录用户openId有关的商店以及对该商店的权限");
  // 5.2 拉取与登录用户openId有关的商店以及对该商店的权限
  // owner2shop: owner to shop 表示一个owner对应的shop(一个owner有且只能对应一个shop)
  const owner2shopRes = await ownerRef
    .aggregate()
    // 先在shop表中找到与当前用户openid一致的并且exist的商店
    .match({
      _openid: openid,
      isExist: true,
    })
    // 不要返回_id信息和_openid
    //返回_id方便监听具体记录
    .project({
      _id: true,
      access: true,
      shopId: true,
    })
    // 以owner作为左表 shop作为右表做左联查询
    .lookup({
      from: "shop",
      let: { owner_shopId: "$shopId" },
      pipeline: $.pipeline()
        .match(
          _.expr(
            $.and([
              $.eq(["$shopId", "$$owner_shopId"]),
              $.eq(["$isExist", true]),
            ])
          )
        )
        // 右表中只要access和type数据
        .project({
          _openid: false,
          _id: false,
        })
        .done(),
      // 将联表查询结果命名为shopInfo
      as: "shopInfo",
    })
    .end();
  console.log("owner2shopRes", owner2shopRes);

  let owner2shop = owner2shopRes.list;
  // 注意：返回的shopInfo的值为一个数组（这是由于云端用了联表查询导致的） 而这个数组必然只有一个元素
  // 所以在这里修改一下shopInfo值直接为其第0个元素方便后续的调用
  for (let i = 0, len = owner2shop.length; i < len; i++) {
    owner2shop[i].shopInfo = owner2shop[i].shopInfo[0];
    // 封装一下当前用户的权限角色
    owner2shop[i].role = "owner";
  }

  console.log("用户相关的店主商店详细信息", owner2shop);

  // 将商店信息返回
  return { data: owner2shop, errCode: 201 }; // errCode: 201 店主登录信息拉取成功
}

// 作为店员登录
async function loginAsAssistant(openid) {
  /**
   * 登录逻辑类似作为店主登录
   * 店员只能看到已激活的商店
   * 1 先查询店员注册表
   * 2 检验是否所有登录权限拦截
   * 3 返回商店信息
   *
   */
  //返回_id方便监听具体记录
  const registAssistRes = await assistantRef
    .where({
      _openid: openid,
      isExist: true,
    })
    .field({
      _id: true,
      access: true,
      shopId: true,
      shopName: true,
    })
    .get();
  const registAssist = registAssistRes.data;
  // 检查当前用户有没有注册的店员
  if (registAssist.length === 0) {
    return { data: "no assist found", errCode: 1103 }; // errCode:1103 没有注册的店员信息
  }

  /**
   *
   * 暂时不对店员登录做权限检验
   *
   */

  console.log("拉取与登录用户openId有关的店员信息以及对该商店的权限");
  // 5.2 拉取与登录用户openId有关的商店以及对该商店的权限
  const assistant2shopRes = await assistantRef
    .aggregate()
    // 先在assistant表中找到与当前用户openid一致的并且exist的商店
    .match({
      _openid: openid,
      isExist: true,
    })
    // 不要返回_id信息和_openid
    //返回_id方便监听具体记录
    .project({
      _id: true,
      access: true,
      shopId: true,
    })
    // 以owner作为左表 shop作为右表做左联查询
    .lookup({
      from: "shop",
      let: { assistant_shopId: "$shopId" },
      pipeline: $.pipeline()
        .match(
          _.expr(
            $.and([
              $.eq(["$shopId", "$$assistant_shopId"]),
              $.eq(["$isExist", true]),
            ])
          )
        )
        // 右表中只要access和type数据
        .project({
          _openid: false,
          _id: false,
        })
        .done(),
      // 将联表查询结果命名为shopInfo
      as: "shopInfo",
    })
    .end();

  console.log("assistant2shopRes", assistant2shopRes);

  let assistant2shop = assistant2shopRes.list;
  // 注意：返回的shopInfo的值为一个数组（这是由于云端用了联表查询导致的） 而这个数组必然只有一个元素
  // 所以在这里修改一下shopInfo值直接为其第0个元素方便后续的调用
  for (let i = 0, len = assistant2shop.length; i < len; i++) {
    assistant2shop[i].shopInfo = assistant2shop[i].shopInfo[0];
    // 封装一下当前用户的权限角色
    assistant2shop[i].role = "assistant";
  }

  console.log("用户相关的店员商店详细信息", assistant2shop);

  return { data: assistant2shop, errCode: 2201 }; // errCode:2201 店员登录成功
}
