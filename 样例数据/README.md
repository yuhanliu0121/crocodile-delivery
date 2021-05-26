本项目数据库包含13个数据表
* advertiseShop	推荐店铺
* advertiseSwiper	首页轮播图广告
* assistant	店员表
* goods	商品表
* goodsCate	商品类别表
* shop	商店表
* order	订单表
* owner	店主表
* registerCode	注册码/邀请码表
* system	系统信息
* ugGoods	跳蚤市场商品表
* ugGoodsCate	跳蚤市场商品类别表
* ugShop	跳蚤市场表

各个数据表的样例数据已在对应的json文件中提供

## advertiseShop	所有用户可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
shopId | 商店的id
shopName | 商店名字
shopRank | 商店排名值 越高越靠前


## advertiseSwiper	所有用户可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
_openid | 设置该轮播图的管理员openid
swiperId | 轮播图id
picUrl | 轮播图图片的URL
detail | 广告语
order | 轮播图顺序 (越小越靠前)
navigatorUrl | 点击轮播图后的页面跳转URL
shopId | 商品所属的商店的id
shopName | 商店名字
cateId | 商品所属类别的id
cateName | 商品所属的类别名称
goodsId | 商品的id
goodsName | 商品名称
isUgShop | 是否是跳蚤市场商品
location | 轮播图所处页面
isExist | 虚拟删除标志位 False表示已被虚拟删除

## assistant	所有用户可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
_openid | 创造这条数据的微信用户openid
shopId | 店员所属的商店id
access | 权限值 
nickName | 店员的微信昵称
noteName | 店员在商店的备注名
watermark | 生成该条数据时的时间戳
isExist | 虚拟删除标志位

权限值转换成30位二进制数后，左15位作为系统权限标志位，后15位为操作权限标志位。目前只用到最后三位，分别表示是否授权处理订单，是否授权修改商品信息，是否授权修改店铺信息

## goods	所有用户可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
_openid | 创造这条数据的微信用户openid
shopId | 商品所属的商店id
cateId | 商品所属的类别id
goodsId | 商品的id
goodsName | 商品名称
goodsOrder | 商品排序值。越高越靠前
goodsPicUrl | 商品图片URL
goodsStock | 库存量
goodsBuyLeastLimit | 起购量
goodsAvailable | 是否上架
goodsBuyLimit | 最多购买量
goodsDetail | 商品详情信息
goodsPrice | 商品价格
isExist | 虚拟删除标志位

## goodsCate	所有用户可读写	
字段名 | 含义 | 
----|---
_id | 云数据库自动生成的id | 
_openid | 创造这条数据的微信用户openid | 
shopId | 类别所属的商店id | 
cateId | 类别的id | 
cateName | 类别名称 | 
cateOrder | 类别排序值。越高越靠前 | 
isExist | 虚拟删除标志位 | 


## shop	所有用户可读，仅创建者可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
_openid | 注册这家商店的微信用户openid
shopId | 商店id
shopCate | 商店类型 <br>0: 超市 <br>1: 餐厅
shopName | 商店名称
shopAnnounce | 商店公告
shopStatus | 商店现在的营业状态 <br>0: 已打烊 <br>1: 营业中
logoUrl | 商家logo图片的URL
startDate | 商店入驻日期
openDay | 一周哪几天开门
openTime | 每天开门时间
closeTime | 每天关门时间
cutOrderTime | 每单截单时间
deliverTimeList | 商家可以配送的时间
minConsumption | 起送消费
deliverFeePercent | 运费占商品总价的百分比
serviceFeePercent | 服务费占商品总价的百分比
geoPoint | 商家地理位置
shopTimezoneOffset | 商店所处时区相对UTC的分钟偏移量
state | 商店所处州份
city | 商店所在城市
shopAddress | 商店街道地址
shopPhoneNumber | 商店联系电话
zipcode | 邮政编码
watermark | 数据生成时的时间戳
isActivated | 商店是否被激活
isExist | 虚拟删除标志位

isActivated表示商店是否被激活。用户在点击“新商入驻”并输入注册码成功注册商店后会跳转到商店信息初始化页面。只有完成了商店信息的初始化商店才算被激活


## order    所有用户可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
_openid | 生成这份订单的微信用户openid
orderId | 订单id
shopId | 订单所属商店的id
shopName | 商店名称
shopPhoneNumber | 商店联系方式
minConsumption | 订单所属商店的最低消费
totalPrice | 订单总价
totalNum | 订单含有的商品数目
validGoods | 有效商品
inValidGoods | 已经被删除的商品
unAvailableGoods | 已经下架的商品
shortOfStockGoods | 购买量大于库存的商品
note | 订单备注
isCheckOutActive | 订单是否达到结算标准
serviceFee | 服务费
deliverFee | 配送费
status | 订单状态 <br>-1:已取消 0: 等待接单 <br>1: 已接单 2: 配送中 <br>3: 已送达
addressId | 订单配送地址的id（已弃用）
phoneNumber | 顾客联系电话
receiverName | 收货人姓名
state | 配送地址所在州份
city | 配送地址的城市
street | 配送地址所在街道
zipcode | 配送地址邮政编码
createTime | 订单创建时间戳
payTime | 订单支付时间
selDeliverTime | 顾客选择的预定配送时间
handleTime | 接单时间
deliverTime | 开始配送时间
completeTime | 完成配送时间
isExist | 虚拟删除标志位

顾客端的商品数据在两种情况下会与数据库中数据冲突。

1. 顾客在挑选商品时商店恰好修改了商品数据 
2. 顾客在很久之前放进购物车的商品数据已经改变

因此顾客点击结算时必须对顾客端商品进行检查。保证数据一致性

完成检查后的商品有4种情况：
1. 商品已经被删除 (inValidGoods)
2. 商品没有删除但已经下架 (unAvailableGoods)
3. 商品正上架但是商品购买量大于库存量 (shortOfStockGoods)
4. 没问题 (validGoods)
* 这里并没有考虑goodsBuyLeastLimit 和 goodsBuyLimit的更改，后面有空再改

重新计算validGoods的总价后若高于商店最低消费时此订单才可以被结算，才可将isCheckOutActive置为true


## owner	仅创建者可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
shopId | 店主的商店id
_openid | 注册商店的微信用户的openid
nickName | 店主的微信昵称
access | 店主的权限值 (店主拥有所有权限，因此初始化为7)
watermark | 店主注册时的时间戳
isExist | 虚拟删除标志位

## registerCode	仅创建者可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
_openid | 生成这条数据的微信用户openid
code | 注册码/邀请码
type | 类型 <br>"owner": 商店注册码<br> “assistant”: 店员邀请码
watermark | 数据生成时的时间戳
isUsed | 是否已被使用

若type为assistant则还将有以下字段 
* shopName 商店名字

此字段并不会被使用到 只是为了方便浏览后台数据时知道注册码所对应的商店名字

## system	所有用户不可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
detail | 登录A端所用的密码
type | 类型
value | aadminlogin1017

## ugGoods	所有用户可读仅创建者可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
_openid | 生成这条数据的微信用户openid
shopId | 跳蚤商店的id
cateId | 商品所属类别id
cateName | 商品所属类别名称
contactInfo | 联系信息
goodsId | 商品id
goodsName | 商品名称
goodsPicUrl | 商品图片URL
goodsOrder | 商品排序
goodsStock | 出售数量
goodsDetail | 商品详情
goodsPrice | 商品价格
contactType | 联系方式 <br>0: 微信号 <br>1: 手机号 <br>2: 邮箱 <br>3: QQ号
status | 审核状态 <br>0: 审核中 <br>1: 通过审核 <br>2: 审核不通过
watermark | 提交审核时间
passTime | 过审时间
expireTime | 商品过期时间
rejectReason | 未过审原因
isExist | 虚拟删除标志位

现阶段我们无法检测用户的二手商品是否被卖出，因此当过了expireTime后商品将被自动虚拟删除


## ugGoodsCate	所有用户可读仅创建者可读写
字段名 | 含义
----|---
_id | 云数据库自动生成的id
shopId | 类别所属商店id
cateId | 类别id
cateName | 类别名称
cateOrder | 类别排序值
isExist | 虚拟删除标志位

## ugShop	所有用户可读仅创建者可读写
同shop	








