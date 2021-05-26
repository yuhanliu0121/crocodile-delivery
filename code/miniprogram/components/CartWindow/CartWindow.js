Component({
  properties: {
    tops: {
      type: String, //外部传入数据 content高度值为百分比例如60%
    },
    buyGoods: {
      type: Array,
      value: [
        {
          goodsId: "10000",
          goodsName: "仙宝-水煮莲藕片",
          num: 9999,
          goodsPicUrl:
            "https://hannatiger.com/wp-content/uploads/2020/06/Edit-仙宝-水煮莲藕片-16861901.jpg",
          goodsPrice: 9999.99,
          goodsBuyLimit: 10,
          goodsStock: 100,
          goodsAvailable: true,
          goodsDetail:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt, minus suscipit facilis doloremque nisi necessitatibus. Iste soluta commodi eaque. Fuga vero, nisi officiis omnis alias voluptatem tempore asperiores soluta velit",
        },
        {
          goodsId: "10001",
          goodsName: "红葱头",
          num: 9999,
          goodsPrice: 9999.99,
          goodsPicUrl:
            "https://hannatiger.com/wp-content/uploads/2020/06/红葱头.jpg",
          goodsPrice: 10,
          goodsBuyLimit: 10,
          goodsStock: 100,
          goodsAvailable: false,
          goodsDetail:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Deserunt, minus suscipit facilis doloremque nisi necessitatibus. Iste soluta commodi eaque. Fuga vero, nisi officiis omnis alias voluptatem tempore asperiores soluta velit",
        },
      ],
    },
  },
  data: {
    isShowSheet: false,
    openSheet: "",
    contentAnimate: null,
    masterAnimate: null,
  },

  methods: {

    // 关闭购物车
    closeCart() {
      var that = this;
      this.contentAnimate.top("0%").step();
      this.masterAnimate.opacity(0).step();
      this.setData({
        contentAnimate: this.contentAnimate.export(),
        masterAnimate: this.masterAnimate.export(),
      });
      setTimeout(function () {
        that.setData({
          isShowSheet: false,
        });
      }, 200);
    },

    // 弹出购物车
    showCart() {
      //创建动画  展开
      this.setData({
        isShowSheet: true,
      });
      // 容器上弹
      var contentAnimate = wx.createAnimation({
        duration: 100,
      });
      contentAnimate.top(`-${this.properties.tops}`).step();
      //master透明度
      var masterAnimate = wx.createAnimation({
        duration: 200,
      });
      masterAnimate.opacity(0.5).step();
      this.contentAnimate = contentAnimate;
      this.masterAnimate = masterAnimate;
      this.setData({
        contentAnimate: contentAnimate.export(),
        masterAnimate: masterAnimate.export(),
      });
    },

    // 点击减少商品数量
    handleReduceGoodsNum(e) {
      let goodsInfo = e.currentTarget.dataset.item
      this.triggerEvent("reduceGoodsNum",{goodsInfo});
    },
    
    // 点击增加商品数量
    handleAddGoodsNum(e) {
      let goodsInfo = e.currentTarget.dataset.item
      this.triggerEvent("addGoodsNum",{goodsInfo});
    },

    // 点击清空购物车
    handleClearCart(){
      this.triggerEvent("clearCart");
    }
  },

});
