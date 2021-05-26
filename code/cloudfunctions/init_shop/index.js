// 本云函数用于注册商店或者店员
const cloud = require("wx-server-sdk");
// 初始化 cloud
// 必须强调的是cloud.init 必须重新确定下环境id 不然上传的文件或者图片并不在小程序初始化的环境中
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: "env-miamielm-5gliunnq19c0a342",
});

const db = cloud.database({
  env: "env-miamielm-5gliunnq19c0a342",
});
const _ = db.command;
const shopRef = db.collection("shop");
const ownerRef = db.collection("owner");
const advertiseShopRef = db.collection("advertiseShop");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const form = event.form;
  const shopId = form.shopId;
  const shopName = form.shopName;

  const fileStream = Buffer.from(form.logoUrl, "base64");

  // 将商品图片上传到云端
  const upLoadLogoRes = await cloud.uploadFile({
    cloudPath:
    form.shopId + "/" + "logo" + (new Date()).getTime() +".jpg",
    fileContent:fileStream, // 文件路径
  });

  console.log("upLoadLogoRes",upLoadLogoRes);

  // 拿到图片的实际云存储地址
  const logoUrlCloud = upLoadLogoRes.fileID;
  form.logoUrl = logoUrlCloud

  // 将商店信息上传到云端
  const initRes = await shopRef.where({
    shopId:shopId
  }).update({
    data:{
      ...form
    }
  })

  // 获取新店主的权限
  const accessInfoRes = await ownerRef
    .where({
      shopId: shopId,
      _openid: openid,
      isExist: true,
    })
    .field({
      _id: false,
      access: true,
    })
    .get();

  let accessInfo = accessInfoRes.data[0];
  // 将用户角色封装进权限控制
  accessInfo.role = "owner";
  // 将shopId也封装进
  accessInfo.shopId = shopId;
  const shopInfo = {
    shopId: shopId,
    shopName: shopName,
  };
  const advertiseRes = await advertiseShopRef.add({
    data: {
      shopId:shopId,
      shopName: shopName,
      shopRank: 0
    },
  });
  return {
    data: {
      shopInfo: shopInfo,
      accessInfo: accessInfo,
    },
    errCode: 200, // errCode 200 初始化成功
  };
};
