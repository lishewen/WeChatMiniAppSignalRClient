const app = getApp()

Page({
  RecordSeparatorCode: 0x1e,
  inputValue: '',
  data: {

  },
  bindKeyInput: function(e) {
    this.inputValue = e.detail.value;
  },
  sendMessage: function() {
    let self = this;
    let body = {
      arguments: [{
        message: self.inputValue,
        sent: new Date()
      }],
      target: 'SendMessage',
      type: 1,
    };
    let senddata = `${JSON.stringify(body)}${self.RecordSeparator}`;
    console.log(senddata);
    wx.sendSocketMessage({
      data: senddata,
    });
  },
  connectSignalR: function() {
    let self = this;
    self.RecordSeparator = String.fromCharCode(self.RecordSeparatorCode);
    wx.connectSocket({
      url: "wss://jbwx.lishewen.com/testmessages",
    });
    wx.onSocketOpen(function() {
      console.log('连接成功');
      let handshakeRequest = {
        protocol: 'json',
        version: 1
      };
      let senddata = `${JSON.stringify(handshakeRequest)}${self.RecordSeparator}`;
      wx.sendSocketMessage({
        data: senddata,
      });
    });
    wx.onSocketMessage(function(res) {
      try {
        let jsonstr = String(res.data).replace(RecordSeparator, '');
        if (jsonstr.indexOf('{}{') > -1)
          jsonstr = jsonstr.replace('{}', '');

        let obj = JSON.parse(jsonstr);
        if (obj.type == 1 && obj.target == 'Send') {
          let messages = obj.arguments[0].message;
          //console.log(messages);
          self.setData({
            messages: messages
          });
        }
      } catch (ex) {
        console.log('异常：' + ex);
        console.log('收到服务器内容：' + res.data);
      }
    });
    wx.onSocketError(function() {
      console.log('websocket连接失败！');
    });
  },
  onLoad: function() {
    this.connectSignalR();
  },
})