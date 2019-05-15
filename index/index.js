const app = getApp()

Page({
  RecordSeparatorCode: 0x1e,
  inputValue: '',
  data: {

  },
  bindKeyInput(e) {
    this.inputValue = e.detail.value;
  },
  sendMessage() {
    let self = this;
    let RecordSeparator = String.fromCharCode(self.RecordSeparatorCode);
    let body = {
      arguments: [{
        message: self.inputValue,
        sent: new Date()
      }],
      target: 'SendMessage',
      type: 1,
    };
    let senddata = `${JSON.stringify(body)}${RecordSeparator}`;
    console.log(senddata);
    wx.sendSocketMessage({
      data: senddata,
    });
  },
  connectSignalR() {
    let self = this;
    let RecordSeparator = String.fromCharCode(self.RecordSeparatorCode);
    wx.connectSocket({
      url: "wss://jbwx.lishewen.com/testmessages",
    });
    wx.onSocketOpen(() => {
      console.log('连接成功');
      let handshakeRequest = {
        protocol: 'json',
        version: 1
      };
      let senddata = `${JSON.stringify(handshakeRequest)}${RecordSeparator}`;
      wx.sendSocketMessage({
        data: senddata,
      });
    });
    wx.onSocketMessage(res => {
      try {
        let jsonstrs = String(res.data).split(RecordSeparator);
        jsonstrs.forEach(jsonstr => {
          if (jsonstr) {
            let obj = JSON.parse(jsonstr);
            if (obj.type == 1 && obj.target == 'Send') {
              let messages = obj.arguments[0].message;
              //console.log(messages);
              self.setData({
                messages: messages
              });
            }
          }
        });
      } catch (ex) {
        console.log('异常：' + ex);
        console.log('收到服务器内容：' + res.data);
      }
    });
    wx.onSocketError(() => {
      console.log('websocket连接失败！');
    });
  },
  onLoad() {
    this.connectSignalR();
  },
})