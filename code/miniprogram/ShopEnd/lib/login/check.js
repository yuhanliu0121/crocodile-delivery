export function validateOpenDay(openDay) {
  let sum = 0;
  openDay.forEach((v) => {
    sum += v;
  });
  if (sum === 0) {
    return { isValid: false, message: "未选择营业日" };
  }
  return { isValid: true, message: "营业日验证通过" };
}

export function validateOpenCloseTime(openTime, closeTime) {
  if (!openTime) {
    return { isValid: false, message: "未填写开门时间" };
  }
  if (!closeTime) {
    return { isValid: false, message: "未填写关门时间" };
  }

  let openTimeHour = Number(openTime.slice(0, 2));
  let openTimeMinute = Number(openTime.slice(-2));
  let closeTimeHour = Number(closeTime.slice(0, 2));
  let closeTimeMinute = Number(closeTime.slice(-2));

  if (openTimeHour * 60 + openTimeMinute >= closeTimeHour * 60 + closeTimeMinute) {
    return { isValid: false, message: "关门时间需晚于开门时间" };
  }
  return { isValid: true, message: "开关门时间校验无误" };
}

// 对配送时间按照从早到晚排序并只返回时间
export function getSortedDeliverTime(deliverTimeList) {
  let sortedDeliverTimeList = deliverTimeList.sort(function (v1, v2) {
    return parseInt(v1.slice(0, 2)) * 60 + parseInt(v1.slice(-2)) - parseInt(v2.slice(0, 2)) * 60 - parseInt(v2.slice(-2));
  });
  return sortedDeliverTimeList;
}

export function validateDeliverTimeList(deliverTimeList) {
  for (let i = 0; i < deliverTimeList.length; i++) {
    // 如果用户漏填了某个配送时间则报错
    if (!deliverTimeList[i]) {
      return { isValid: false, message: "未填写配送时间" + (i + 1) };
    }
  }
  return { isValid: true, message: "配送时间校验无误" };
}

export function validateCutOrderTime(cutOrderTime) {
  let res = cutOrderTime !== -1;
  return { isValid: res, message: res ? "有效截单时间" : "无效截单时间" };
}

export function validateMinConsumption(minConsumption) {
  let validNum = /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/.test(minConsumption);
  if (!validNum || Number(minConsumption) > 9999 || Number(minConsumption) === 0) {
    return { isValid: false, message: "无效起送消费" };
  }
  return { isValid: true, message: "有效起送消费" };
}

export function validateServiceFeePercent(serviceFeePercent) {
  let res = serviceFeePercent !== -1;
  return { isValid: res, message: res ? "有效服务费比例" : "无效服务费比例" };
}
export function validateDeliverFeePercent(deliverFeePercent) {
  let res = deliverFeePercent !== -1;
  return { isValid: res, message: res ? "有效配送费比例" : "无效配送费比例" };
}

export function validateShopAnnounce(shopAnnounce) {
  let res = shopAnnounce !== "";
  return { isValid: res, message: res ? "有效商店公告" : "无效商店公告" };
}

// =================================================
// =================================================
// ================= 总的检验函数 ===================
// =================================================
// =================================================

export function validateInitShopSetting(formData, formText) {
  console.log("formData", formData);
  let validateRes = {};
  //校验商店头像
  if (!formData.logoUrl) {
    return { isValid: false, message: "未上传商店logo" };
  }

  // 校验商店名称
  if (!formData.shopName) {
    return { isValid: false, message: "未填写商店名称" };
  }
  // 校验营业类型
  if (formData.shopCate === -1) {
    return { isValid: false, message: "未选择营业类型" };
  }
  // 校验联系电话
  if (!/^[\d]{10}$/.test(formData.shopPhoneNumber)) {
    return { isValid: false, message: "无效联系电话" };
  }
  // 校验Address
  if (!formData.shopAddress) {
    return { isValid: false, message: "未填写Address" };
  }
  // 校验City
  if (!formData.city) {
    return { isValid: false, message: "未填写City" };
  }
  // 校验State
  if (!formData.state) {
    return { isValid: false, message: "未填写State" };
  }
  // 校验Postal
  if (!/^\d{5}(?:[-\s]\d{4})?$/.test(formData.zipcode)) {
    return { isValid: false, message: "无效Postal" };
  }
  // 校验营业日
  validateRes = validateOpenDay(formData.openDay);
  if (!validateRes.isValid) {
    return validateRes;
  }

  // 校验开关门时间
  validateRes = validateOpenCloseTime(formData.openTime, formData.closeTime);
  if (!validateRes.isValid) {
    return validateRes;
  }

  // 检验起送消费
  validateRes = validateMinConsumption(formData.minConsumption);
  if (!validateRes.isValid) {
    return validateRes;
  }
  // 检验配送时间
  validateRes = validateDeliverTimeList(formData.deliverTimeList);
  if (!validateRes.isValid) {
    return validateRes;
  }
  formData.deliverTimeList = getSortedDeliverTime(formData.deliverTimeList);

  // 检验截单时间
  validateRes = validateCutOrderTime(formData.cutOrderTime);
  if (!validateRes.isValid) {
    return validateRes;
  }

  // 检验服务费比例
  validateRes = validateServiceFeePercent(formData.serviceFeePercent);
  if (!validateRes.isValid) {
    return validateRes;
  }

  // 检验配送费比例
  validateRes = validateDeliverFeePercent(formData.deliverFeePercent);
  if (!validateRes.isValid) {
    return validateRes;
  }

  // 校验商店公告
  validateRes = validateShopAnnounce(formData.shopAnnounce);
  if (!validateRes.isValid) {
    return validateRes;
  }

  return { isValid: true, message: formText + "校验通过" };
}
