Page({
  data: {
    radioItems: [
      { name: 'cell standard', value: '0', checked: true },
      { name: 'cell standard', value: '1' }
    ],
    // checkboxItems: [
    //   { name: 'standard is dealt for u.', value: '0', checked: true },
    //   { name: 'standard is dealicient for u.', value: '1' }
    // ],
    checkboxItems: [
      { value: 'Monday', name: '星期一', checked: true },
      { value: 'Tuesday', name: '星期二', checked: false },
      { value: 'Wednesday', name: '星期三', checked: false },
      { value: 'Thursday', name: '星期四', checked: false },
      { value: 'Friday', name: '星期五', checked: false },
      { value: 'Saturday', name: '星期六', checked: false },
      { value: 'Sunday', name: '星期日', checked: false }
    ],
  },

  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;
      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }
    this.setData({
      checkboxItems: checkboxItems,
      [`formData.checkbox`]: e.detail.value
    });
  },
});

