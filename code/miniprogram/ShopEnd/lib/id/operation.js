// 基于base62编码生成13位的ID字符串
// 优点：短/按时间序/双击可全选/唯一性足够安全
// 来源：https://developers.weixin.qq.com/community/develop/doc/00086eeee5cd587355197fcb751800?_at=1558745513124
function getId() {
  var ret = ''
  var ms = (new Date()).getTime()
  ret += base62encode(ms) // 6923年循环一次
  ret += base62encode(Math.ceil(Math.random() * (62**6))) // 冲突概率为每毫秒568亿分之一
  return ret
}

// base62编码
function base62encode(n) {
  var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = ''; 
  while (n > 0) {
    result = digits[n % digits.length] + result;
    n = parseInt(n / digits.length, 10);
  }
  
  return result;
}

// base62解码
function base62decode(s) {
  var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = 0;
  for (var i=0 ; i<s.length ; i++) {
    var p = digits.indexOf(s[i]);
    if (p < 0) {
      return NaN;
    }
    result += p * Math.pow(digits.length, s.length - i - 1);
  }
  return result;
}

export{getId}

