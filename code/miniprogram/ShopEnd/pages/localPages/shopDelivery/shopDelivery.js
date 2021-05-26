// data里面不能储存新的变量，不然页面就不加载
Page({
  data: {
    modalHidden:true, //是否隐藏对话框 
    minprice:0,
    email_value:0
  },

  //事件处理函数
  bindViewTap: function() {
    this.setData({modalHidden:!this.data.modalHidden})
  },
  //确定按钮点击事件
  modalBindaconfirm:function(){
    this.setData({ modalHidden:!this.data.modalHidden})
  },
  //取消按钮点击事件
  modalBindcancel:function(){
    this.setData({modalHidden:!this.data.modalHidden,})
  },
  sendEmail: function () {
    this.setData({
    email: false, //是否弹出弹框
    focusValue: true, //是否自动获取焦点
    space:130 //上移的高度，单位（px）
    })
    },
    
  cancel: function () {
  this.setData({ email: true,focusValue:false})
  },
    
  email_value: function (e) {
  //绑定的输入框值
  this.setData({
    email_value: e.detail.value, })
  },
})