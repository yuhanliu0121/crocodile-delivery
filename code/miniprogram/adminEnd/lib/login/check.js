// 校验表单中是否存在某项
export function validateExist(form, field, fieldText) {
  if (!form[field]) {
    return { isValid: false, message: "未输入" + fieldText };
  }

  return { isValid: true, message: "已输入" + fieldText };
}

// 检验表单某项是否是正确的数学数字
export function validateMathNumber(form, field, fieldText) {
  if (isNaN(Number(form[field]))) {
    return { isValid: false, message: fieldText + "不是合法数字" };
  }

  return { isValid: true, message: fieldText + "是数字" };
}

// 检验表单某项是否是纯整型数字
export function validatePureIntNumber(form, field, fieldText) {
  if (!form[field].match(/^\d+$/)) {
    return { isValid: false, message: fieldText + "格式错误" };
  }
  return { isValid: true, message: fieldText + "是纯整型数字" };
}

// 校验联系电话
export function validatePhone(form, field, fieldText) {
  // 检验是否存在
  const isExistRes = validateExist(form, field, fieldText);
  if (!isExistRes.isValid) {
    return isExistRes;
  }

  // 检验联系电话是否是纯数字
  const isNumberRes = validatePureIntNumber(form, field, fieldText);
  if (!isNumberRes.isValid) {
    return isNumberRes;
  }

  // 检验联系电话是否是10位
  if (form[field].length !== 10) {
    return { isValid: false, message: fieldText + "格式错误" };
  }

  return { isValid: true, message: fieldText + "检验无误" };
}

// 校验zipcode
export function validateZipcode(form, field, fieldText) {
  // 检验是否存在
  const isExistRes = validateExist(form, field, fieldText);
  if (!isExistRes.isValid) {
    return isExistRes;
  }

  // 检验是否是纯数字
  const isNumberRes = validatePureIntNumber(form, field, fieldText);
  if (!isNumberRes.isValid) {
    return isNumberRes;
  }

  // 检验zip code是否是5位
  if (form[field].length !== 5) {
    return { isValid: false, message: fieldText + "格式错误" };
  }

  return { isValid: true, message: fieldText + "检验无误" };
}

// 检验是否是合法的价格
export function validatePrice(form, field, fieldText) {
  // 检验是否存在
  const isExistRes = validateExist(form, field, fieldText);
  if (!isExistRes.isValid) {
    return isExistRes;
  }

  //   检验是否是合法数字
  const isMathNumber = validateMathNumber(form, field, fieldText);
  if (!isMathNumber.isValid) {
    return isMathNumber;
  }

  if (
    form[field].indexOf(".") + 1 > 0 &&
    form[field].split(".")[1].length > 2
  ) {
    return { isValid: false, message: fieldText + "最多两位小数" };
  }

  if (Number(form[field]) < 0) {
    return { isValid: false, message: fieldText + "需大于0" };
  }
  return { isValid: true, message: "价格校验无误" };
}

// 验证开门关门时间是否合法
export function validateOpenCloseTime(openTime, closeTime, message = "") {
  let openTimeHour = Number(openTime.slice(0, 2));
  let openTimeMinute = Number(openTime.slice(-2));
  let closeTimeHour = Number(closeTime.slice(0, 2));
  let closeTimeMinute = Number(closeTime.slice(-2));

  if (openTimeHour * 60 + openTimeMinute >= closeTimeHour * 60 + closeTimeMinute) {
    return { isValid: false, message: "关门时间需晚于开门时间" };
  }
  return { isValid: true, message: "开关门时间校验无误" };
}

// 检验配送时间
export function validateDeliverTimeList(form, field) {
  const deliverTimeList = form[field];
  for (let i = 0; i < deliverTimeList.length; i++) {
    // 如果用户漏填了某个配送时间则报错
    if (!deliverTimeList[i]) {
      return { isValid: false, message: "未填写配送时间" + (i + 1) };
    }
  }
  return { isValid: true, message: "配送时间校验无误" };
}

export function validateCutOrderTime(form, field) {
  // 检验是否存在
  const isExistRes = validateExist(form, field, "截单时间");
  if (!isExistRes.isValid) {
    return isExistRes;
  }

  // 检验截单时间是否是纯整型数字
  const isNumberRes = validatePureIntNumber(form, field, "截单时间");
  if (!isNumberRes.isValid) {
    return isNumberRes;
  }

  // 检验截单时间是否小于60
  const cutOrderTIme = form[field];
  if (parseInt(cutOrderTIme) >= 60) {
    return { isValid: false, message: "截单时间需小于60分钟" };
  }

  return { isValid: true, message: "截单时间校验无误" };
}
// =================================================
// =================================================
// ================= 总的检验函数 ===================
// =================================================
// =================================================

export function validateInitShopSetting(formData, formText) {
  // console.log("formData", formData);
  //校验商店头像("formData",formData);
  let valislogoUrl = validateExist(formData, "logoUrl", "商店头像");
  if (!valislogoUrl.isValid) {
    // await showToast( valislogoUrl.messreturn valislogrl;
    return valislogoUrl;
  }
  // 校验商店名称
  let valishopName = validateExist(formData, "shopName", "商店名称");
  if (!valishopName.isValid) {
    // await showToast(valishopName.message);
    return valishopName;
  }
  // 校验营业类型
  let valishopCate = validateExist(formData, "shopCate", "营业类型");
  if (!valishopCate.isValid) {
    // await showToast(valishopCate.message);
    return valishopCate;
  }
  // 校验联系电话
  let valishopPhoneNumber = validatePhone(
    formData,
    "shopPhoneNumber",
    "联系电话"
  );
  if (!valishopPhoneNumber.isValid) {
    // await showToast(valishopPhoneNumber.message);
    return valishopPhoneNumber;
  }
  // 校验Address
  let valishopAddress = validateExist(formData, "shopAddress", "Address");
  if (!valishopAddress.isValid) {
    // await showToast(valishopAddress.message);
    return valishopAddress;
  }
  // 校验City
  let valicity = validateExist(formData, "city", "City");
  if (!valicity.isValid) {
    // await showToast(valicity.message);
    return valicity;
  }
  // 校验State
  let valistate = validateExist(formData, "state", "State");
  if (!valistate.isValid) {
    // await showToast(valistate.message);
    return valistate;
  }
  // 校验Postal
  let valizipcode = validateZipcode(formData, "zipcode", "Postal Code");
  if (!valizipcode.isValid) {
    // await showToast(valizipcode.message);
    return valizipcode;
  }
  // 校验营业日
  let valiopenDay = validateExist(formData, "openDay", "营业日");
  if (!valiopenDay.isValid) {
    // await showToast(valiopenDay.message);
    return valiopenDay;
  }
  // 校验开门时间
  let valiopenTime = validateExist(formData, "openTime", "开门时间");
  if (!valiopenTime.isValid) {
    // await showToast(valiopenTime.message);
    return valiopenTime;
  }
  // 校验开门时间
  let valicloseTime = validateExist(formData, "closeTime", "关门时间");
  if (!valicloseTime.isValid) {
    // await showToast(valicloseTime.message);
    return valicloseTime;
  }
  // 联合检验开关门时间
  let valiOpenCloseTime = validateOpenCloseTime(
    formData["openTime"],
    formData["closeTime"]
  );
  if (!valiOpenCloseTime.isValid) {
    // await showToast(valiOpenCloseTime.message);
    return valiOpenCloseTime;
  }

  // 检验配送时间
  let valideliverTimeList = validateDeliverTimeList(
    formData,
    "deliverTimeList"
  );
  if (!valideliverTimeList.isValid) {
    // await showToast(valideliverTimeList.message);
    return valideliverTimeList;
  }

  // 检验截单时间
  let valicutOrderTime = validateCutOrderTime(formData, "cutOrderTime");
  if (!valicutOrderTime.isValid) {
    // await showToast(valicutOrderTime.message);
    return valicutOrderTime;
  }

  // 检验起送消费
  let valiprice = validatePrice(formData, "minConsumption", "起送消费");
  if (!valiprice.isValid) {
    // await showToast(valiprice.message);
    return valiprice;
  }
  // 校验商店公告
  let valishopAnnounce = validateExist(formData, "shopAnnounce", "商店公告");
  if (!valishopAnnounce.isValid) {
    // await showToast(valishopAnnounce.message);
    return valishopAnnounce;
  }

  return { isValid: true, message: formText + "校验通过" };
}