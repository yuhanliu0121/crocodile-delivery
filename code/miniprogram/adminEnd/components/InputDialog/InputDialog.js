// components/InputDialog/InputDialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show:{
      type:Boolean,
      value:false
    },
    title: {
      type: String,
      value: "",
    },
    placeholder: {
      type: String,
      value: "",
    },
    type: {
      type: String,
      value: "text",
    },
    maxlength: {
      type: Number,
      value: 140,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    buttons: [{ text: "取消" }, { text: "确定" }],
    dialogInput: "",
  },


  /**
   * 组件的方法列表
   */
  methods: {
     handleTapInputDialogButton(e) {
      const tapButtonIndex = e.detail.index;
      const dialogInput = this.data.dialogInput;
      if (tapButtonIndex === 0) {
        let dialogDetail = { confirm: false, cancel: true, dialogInput: dialogInput }
        this.triggerEvent('dialogEvent', dialogDetail)
        this.setData({dialogInput:""})
      }

      if (tapButtonIndex === 1) {
        let dialogDetail = { confirm: true, cancel: false, dialogInput: dialogInput }
        this.triggerEvent('dialogEvent', dialogDetail)
        this.setData({dialogInput:""})
      }
    },
    handleTapMask() {
      const dialogInput = this.data.dialogInput;
      let dialogDetail = { confirm: false, cancel: true, dialogInput: dialogInput }
      this.triggerEvent('dialogEvent', dialogDetail)
      this.setData({dialogInput:""})
    },
    handleChangeDialogInput(e) {
      this.setData({ dialogInput: e.detail.value });
    },
  },
});
