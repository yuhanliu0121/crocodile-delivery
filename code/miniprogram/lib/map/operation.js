// 引入SDK核心类
let QQMapWX = require("../qqmap-wx-jssdk1.2/qqmap-wx-jssdk.js");

// 实例化API核心类
let qqmapsdk = new QQMapWX({
  key: "NFRBZ-5VDW4-ZKOU6-D66UO-LVEWO-2PFUG",
});

// 通过经纬度解析当前位置名称
export const reverseGeocoder = (latitude, longitude) => {
  return new Promise((resolve, reject) => {
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude,
      },
      get_poi: 1,
      poi_options: "page_index=1;page_size=20;policy=1",
      success: (res) => {
        console.log("通过经纬度解析当前位置名称", res);
        let pois = res.result.pois;
        let availableAddr = [];
        for (let i = 0; i < pois.length; i++) {
          availableAddr.push({
            // 获取返回结果，放到sug数组中
            title: pois[i].title,
            addr: pois[i].address,
            id: pois[i].id,
            latitude: pois[i].location.lat,
            longitude: pois[i].location.lng,
          });
        }
        resolve(availableAddr);
      },
      fail: (err) => {
        reject([]);
      },
    });
  });
};

// 通过关键词获取地理位置提示
export const getSuggestion = (keyword) => {
  return new Promise((resolve, reject) => {
    qqmapsdk.getSuggestion({
      //获取输入框值并设置keyword参数
      keyword: keyword, //用户输入的关键词（希望获取后续提示的关键词）
      page_size: 7, //每页条目数，最大限制为20条
      success: (res) => {
        console.log("通过关键词获取地理位置提示",res);
        //搜索成功后的回调
        let sug = [];
        for (let i = 0; i < res.data.length; i++) {
          sug.push({
            // 获取返回结果，放到sug数组中
            title: res.data[i].title,
            id: res.data[i].id,
            addr: res.data[i].address,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
          });
        }
        resolve(sug);
      },
      fail: (err) => {
        reject([]);
      },
    });
  });
};
