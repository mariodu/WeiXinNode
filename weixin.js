var url = require('url');
var crypto = require('crypto');
var xml2js = require('xml2js');
var events = require('events');
var emitter = new events.EventEmitter();
var WeiXin;

module.exports = (function() {
  function WeiXin() {
    this.data = '';
    this.msgType = 'text';
    this.fromUserName = '';
    this.toUserName = '';
    this.funcFlag = 0;
    this.token = '';
  }

  WeiXin.prototype.setToken = function(token) {
    this.token = token;
  };

  WeiXin.prototype.checkSignature = function(signature, timestamp, nonce) {
    var string = [this.token, timestamp, nonce].sort().join('');
    var sha1 = crypto.createHash('sha1');
    sha1.update(string);
    var nowsign = sha1.digest('hex');
    return (nowsign === signature ? true : false);
  };

  //处理消息
  WeiXin.prototype.parseTextMsg = function() {
    var msg = {
      toUserName: this.data.ToUserName[0],
      fromUserName: this.data.FromUserName[0],
      createTime: this.data.CreateTime[0],
      msgType: this.data.MsgType[0],
      content: this.data.Content[0],
      msgId: this.data.MsgId[0]
    };

    emitter.emit("weixinTextMsg", msg);

    return this;
  };

  WeiXin.prototype.parseImgMsg = function() {
    var msg = {
      toUserName: this.data.ToUserName[0],
      fromUserName: this.data.FromUserName[0],
      createTime: this.data.CreateTime[0],
      msgType: this.data.MsgType[0],
      picUrl: this.data.PicUrl[0],
      msgId: this.data.MsgId[0]
    };

    emitter.emit("weixinImgMsg", msg);

    return this;
  };

  WeiXin.prototype.parseGeoMsg = function() {
    var msg = {
      toUserName: this.data.ToUserName[0],
      fromUserName: this.data.FromUserName[0],
      createTime: this.data.CreateTime[0],
      msgType: this.data.MsgType[0],
      location_X: this.data.Location_X[0],
      location_Y: this.data.Location_Y[0],
      scale: this.data.Scale[0],
      label: this.data.Label[0],
      msgId: this.data.MsgId[0]
    };

    emitter.emit("weixinGeoMsg", msg);

    return this;
  };

  WeiXin.prototype.parseLinkMsg = function() {
    var msg = {
      toUserName: this.data.ToUserName[0],
      fromUserName: this.data.FromUserName[0],
      createTime: this.data.CreateTime[0],
      msgType: this.data.MsgType[0],
      title: this.data.Title[0],
      description: this.data.Description[0],
      url: this.data.Url[0],
      msgId: this.data.MsgId[0]
    };

    emitter.emit("weixinLinkMsg", msg);

    return this;
  };

  WeiXin.prototype.parseEventMsg = function() {
    var msg = {
      toUserName: this.data.ToUserName[0],
      fromUserName: this.data.FromUserName[0],
      createTime: this.data.CreateTime[0],
      msgType: this.data.MsgType[0],
      event: this.data.Event[0],
      eventKey: this.data.EventKey[0]
    };

    emitter.emit("weixinEventMsg", msg);

    return this;
  };

  //创建消息
  WeiXin.prototype.createMsg = function(msg) {
    var type = msg.msgType;
    var time = Math.round(new Date().getTime() / 1000);

    var funcFlag = msg.funcFlag ? msg.funcFlag : this.funcFlag;

    var remsg = ["<xml>"];
    remsg.push("<ToUserName><![CDATA[" + msg.toUserName + "]]></ToUserName>");
    remsg.push("<FromUserName><![CDATA[" + msg.fromUserName + "]]></FromUserName>");
    remsg.push("<CreateTime>" + time + "</CreateTime>");
    remsg.push("<MsgType><![CDATA[" + type + "]]></MsgType>");

    switch (type) {
      case 'text':
        remsg.push("<Content><![CDATA[" + msg.content + "]]></Content>");
        remsg.push("<FuncFlag>0</FuncFlag></xml>");
        break;
      case 'music':
        remsg.push("<Music><Title><![CDATA[" + msg.title + "]]></Title><Description><![CDATA[" + msg.description + "]]></Description><MusicUrl><![CDATA[" + msg.music_url + "]]></MusicUrl><HQMusicUrl><![CDATA[" + msg.hq_music_url + "]]></HQMusicUrl></Music>");
        remsg.push("<FuncFlag>0</FuncFlag></xml>");
        break;
      case 'news':
        var count = msg.count;
        remsg.push("<ArticleCount>" + count + "</ArticleCount><Articles>");
        for (var i = 0; i < count; i++) {
          remsg.push("<item><Title><![CDATA[" + msg.article[0].title + "]]></Title><Description><![CDATA[" + msg.article[0].description + "]]></Description><PicUrl><![CDATA[" + msg.article[0].picurl + "]]></PicUrl><Url><![CDATA[" + msg.article[0].url + "]]></Url></item>");
        }
        remsg.push("</Articles>");
        remsg.push("<FuncFlag>1</FuncFlag></xml>");
        break;
      default:
        throw "unkown msg type!";
    }

    return remsg.join('');
  };

  // ------------------ 监听 ------------------------
  // 监听文本消息
  WeiXin.prototype.textMsg = function(callback) {

    emitter.on("weixinTextMsg", callback);

    return this;
  };

  // 监听图片消息
  WeiXin.prototype.imgMsg = function(callback) {

    emitter.on("weixinImgMsg", callback);

    return this;
  };

  // 监听地理位置消息
  WeiXin.prototype.GeoMsg = function(callback) {

    emitter.on("weixinGeoMsg", callback);

    return this;
  };

  // 监听链接消息
  WeiXin.prototype.urlMsg = function(callback) {

    emitter.on("weixinUrlMsg", callback);

    return this;
  };

  // 监听事件
  WeiXin.prototype.eventMsg = function(callback) {

    emitter.on("weixinEventMsg", callback);

    return this;
  };
  return new WeiXin();
})();