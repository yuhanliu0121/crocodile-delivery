Component({
  properties: {
    tops:{
      type: String  //外部传入数据 content高度值为百分比例如60%
    },
    title:{
      type: String  //外部传入数据
    }
  },
  data: {
    isShowSheet: false,
    openSheet: '',
    contentAnimate: null,
    masterAnimate: null,
  },
  methods: {
    // 这是一个空方法用来截取用户在蒙版上的滑动从而防止滚动穿透
    preventTouchMove(){},
    __closeMaster(){
      var that = this;
      this.contentAnimate.top("0%").step();
      this.masterAnimate.opacity(0).step();
      this.setData({
        contentAnimate: this.contentAnimate.export(),
        masterAnimate: this.masterAnimate.export(),
      });
      setTimeout(function(){
        that.setData({
          isShowSheet: false,
        })
      },200)
    },
    __showMaster(){
      //创建动画  展开
      this.setData({
        isShowSheet: true,
      });
      // 容器上弹
      var contentAnimate = wx.createAnimation({
        duration: 100,
      })
      contentAnimate.top(`-${this.properties.tops}`).step();
      //master透明度
      var masterAnimate = wx.createAnimation({
        duration: 200,
      })
      masterAnimate.opacity(.5).step();
      this.contentAnimate = contentAnimate;
      this.masterAnimate = masterAnimate;
      this.setData({
        contentAnimate: contentAnimate.export(),
        masterAnimate: masterAnimate.export(),
      })
    }
  }
})