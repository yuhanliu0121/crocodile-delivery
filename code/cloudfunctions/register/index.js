// 本云函数用于注册商店或者店员
const cloud = require("wx-server-sdk");
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAcMIC_CURRENT_ENV,
});

const db = cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const _ = db.command;
const registerCodeRef = db.collection("registerCode");
const shopRef = db.collection("shop");
const assistantRef = db.collection("assistant");
const ownerRef = db.collection("owner");
const systemRef = db.collection("system");

// 云函数入口函数
exports.main = async (event, context) => {
  console.log("event", event);
  const openid = cloud.getWXContext().OPENID;
  const { code, type, userInfo } = event;
  // 首先验证注册码
  const verifyRes = await registerCodeRef
    .where({
      type: type,
      code: code,
    })
    .get();

  console.log("verifyRes.data", verifyRes.data);

  // 检查验证码是否存在
  if (verifyRes.data.length !== 1) {
    // 验证码不存在 检查是否是管理员登录
    // 管理员登录的密码的前6位字符必须为aadmin 之所以不用admin是为了防止用户猜到
    // 同时这样通过code.substr(0, 5) === "aadmin"的方式可以避免每一个不存在的验证码都要验证它是不是管理员登录密码
    if (code.substr(0, 6) === "aadmin" && (await isAdminLogin(code))) {
      return { data: "admin login", errCode: 900 }; // errCode 900 表示管理员登录
    } else {
      return { data: "invalid code", errCode: 100 }; // errCode 100 表示注册码不存在
    }
  }
  const codeDetail = verifyRes.data[0];

  // 检查验证码是否已经用过
  if (codeDetail.isUsed) {
    return { data: "used code", errCode: 101 }; // errCode 101 表示注册码已经被用过
  }

  // 计算自注册码创建开始到现在过了多少小时
  const watermark = codeDetail.watermark;
  const currentTime = new Date().getTime();
  const pasthours = (currentTime - watermark) / (1000 * 60 * 60);

  // 大于72小时则视为过期
  if (pasthours > 72) {
    return { data: "code expire", errCode: 102 }; // errCode 102 表示注册码已过期
  }

  // 开始注册
  if (type === "owner") {
    const registRes = registerOwner(openid, userInfo);
    await invalidateCode(code)
    return registRes;
  }

  if (type === "assistant") {
    const registRes = registShopAssist(openid, codeDetail.shopId, userInfo);
    await invalidateCode(code)
    return registRes;
  }
};

// ==============================================================
// ==============================================================
// ===================   一些帮助函数   ==========================
// ==============================================================
// ==============================================================

// ===================   注册新商店   ============================
async function registerOwner(openid, userInfo) {
  // 向shop表中注册商店
  const shopId = getId();
  const shopName = "未激活商店";
  const watermark = new Date().getTime();
  const registShopRes = await shopRef.add({
    data: {
      _openid: openid,
      shopName: shopName,
      shopId: shopId,
      isExist: true,
      isActivated: false,
      watermark: watermark,
    },
  });

  // 向owner表中注册店主
  const registOwnerRes = await ownerRef.add({
    data: {
      _openid: openid,
      access: 7, // 如果以后权限增加这里应该做适当的修改
      isExist: true,
      ...userInfo,
      shopId: shopId,
      watermark: watermark,
    },
  });

  return { data: shopId, errCode: 201 }; // errCode 201 注册商店成功
}

// ===============   注册新店员    ======================
async function registShopAssist(openid, shopId, userInfo) {
  const shopInfoRes = await shopRef
    .where({
      shopId: shopId,
    })
    .field({
      shopId: true,
      shopName: true,
      _openid: true,
    })
    .get();
  console.log("shopInfoRes", shopInfoRes);

  const shopInfo = shopInfoRes.data[0];

  // 检查商店是否存在
  if (!shopInfo) {
    return { data: "shop not found", errCode: 103 }; // errCode 103 该店不存在
  }

  // 检查当前用户是否已经是该店店员
  const isAlreadyAssist = await checkIsAssist(shopId, openid);
  if (isAlreadyAssist) {
    return { data: "already assistant", errCode: 104 }; // errCode 104 已经是该店的店员
  }

  // 检查当前用户是否是该店店主
  if (shopInfo._openid === openid) {
    return { data: "already owner", errCode: 105 }; // errCode 105 已经是该店的店主
  }

  // 向assistant表中写入当前的openid
  await assistantRef.add({
    data: {
      _openid: openid,
      access: 0,
      isExist: true,
      ...userInfo,
      noteName: "",
      shopId: shopId,
      watermark: new Date().getTime(),
    },
  });

  return { data: "success", errCode: 202 }; // errCode 202 注册店员成功
}

// 无效化当前注册码
async function invalidateCode(code) {
  const invalidateRes = await registerCodeRef
    .where({
      code: code,
    })
    .update({
      data: {
        isUsed: true,
      },
    });
  return invalidateRes;
}

// 检查要注册的店员是不是已经是店员
async function checkIsAssist(shopId, openid) {
  return await assistantRef
    .where({
      shopId: shopId,
      _openid: openid,
      isExist: true,
    })
    .count()
    .then((res) => {
      console.log("res.total", res.total);
      return res.total > 0;
    });
}

// 检查是否是管理员登录
async function isAdminLogin(pwd) {
  const adminLoginPwdRes = await systemRef
    .where({
      type: "adminLoginPwd",
    })
    .get();
    const adminLoginPwd = adminLoginPwdRes.data[0].value;
  return pwd === adminLoginPwd;
}

// 生成Id的函数
function getId() {
  var ret = "";
  var ms = new Date().getTime();
  ret += base62encode(ms); // 6923年循环一次
  ret += base62encode(Math.ceil(Math.random() * 62 ** 6)); // 冲突概率为每毫秒568亿分之一
  return ret;
}

// base62编码
function base62encode(n) {
  var digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  while (n > 0) {
    result = digits[n % digits.length] + result;
    n = parseInt(n / digits.length, 10);
  }

  return result;
}
