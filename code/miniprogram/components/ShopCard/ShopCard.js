// components/ShopCard/ShopCard.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shopInfo: {
      type: Object,
      value: {
        // 商店在数据库的全局唯一标识
        shopId: 0,

        // 商店名称
        shopName: "KFC",

        // 商店logo链接
        logoUrl: "https://s1.ax1x.com/2020/07/30/aninvq.png",

        // 商店状态 0表示关门中 1表示营业中
        shopStatus: 0,

        // 最低消费金额 (也可以说是最低起配送金额)
        minConsumption: 60,

        // 免费配送消费金额
        freeDeliveryCondition: 100,
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {},
});
