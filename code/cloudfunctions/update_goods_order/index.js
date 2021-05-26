// TODO 写清楚函数用途

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
const shopRef = db.collection("shop");
const goodsCateRef = db.collection("goodsCate");
const goodsRef = db.collection("goods");
// 云函数入口函数
exports.main = async (event, context) => {
  const{goodsList} = event;
  console.log("云函数商品列表",goodsList);
  
  const wxContext = cloud.getWXContext();
  const tasks = []//记录所有的promise到一个数组
  for(let i=0;i<goodsList.length;i++){
    const promise = goodsRef.where({
      goodsId:goodsList[i].goodsId
    })
    .update({
      data:{
        ...goodsList[i]
      }
    })
    tasks.push(promise)
  }
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    
    return {
      errMsg: acc.errMsg,
    }
  })



  /**
   *   const res2 = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
   */
};
