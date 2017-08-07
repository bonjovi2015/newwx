import shim from './translator.js';

function request(obj){
  var header = {
    cookie: wx.getStorageSync('cookie'),
    'x-csrf-token': wx.getStorageSync('csrftoken')
  }

  let url = obj.url || obj;

  var headerObj = obj.header || {};
  for (var k in headerObj) {
    if (headerObj.hasOwnProperty(k)){
      header[k] = headerObj[k];
    }
  }

  let promise = new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: obj.data,
      method: obj.method,
      header: header,
      success: (res) => {
        var rescookie = res.header['Set-Cookie'] || res.header['set-cookie'];
        if(rescookie)
          wx.setStorageSync('cookie', rescookie);
        if(res.statusCode > 300) {
          console.error("request failed: ", res)
          if(res.data && res.data.message){
            shim.translate(res.data.message, function (translated) {
              wx.showToast({
                title: translated,
                duration: 3000,
                mask: true
              })
            });
          } else {
            wx.showToast({
              title: '网络请求错误！',
              duration: 3000,
              mask: true
            })
          }
          reject(res);
        } else {
          resolve(res);
        }
      },
      fail: (res) => {
        console.error('request failed: ', res);
        wx.showToast({
          title: '网络错误，请检查网络！',
          duration: 3000,
          mask: true
        })
        reject(res);
      }
    })
  });

  return promise;
}

function uploadFile(obj) {
  var header = {
    cookie: wx.getStorageSync('cookie'),
    'x-csrf-token': wx.getStorageSync('csrftoken')
  }
  var vaobj = obj.header || {};
  for (var k in vaobj) {
    if (vaobj.hasOwnProperty(k)){
      header[k] = vaobj[k];
    }
  }

  let promise = new Promise((resolve, reject) => {
    wx.uploadFile({
      url: obj.url || obj,
      data: obj.data,
      header: header,
      filePath: obj.filePath,
      name: obj.name,
      formData: obj.formData,
      success: function(res){
        if(res.statusCode > 300) {
          console.error("uploadFile failed: ", res)
          if(res.data && res.data.message){
            shim.translate(res.data.message, function (translated) {
              wx.showToast({
                title: translated,
                duration: 3000,
                mask: true
              })
            });
          } else {
            wx.showToast({
              title: '上传错误！',
              duration: 3000,
              mask: true
            })
          }
          reject(res);
        } else {
          resolve(res);
        }
      },
      fail: (res) => {
        console.error('uploadFile failed: ', res);
        wx.showToast({
          title: '网络错误，请检查网络！',
          duration: 3000,
          mask: true
        })
        reject(res);
      }
    })
  });

  return promise;
}

module.exports = {request, uploadFile};
