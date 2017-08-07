import config from '../config'
import {request} from './request'
import {formatTimestamp, fixAbsUrl} from './util';

function auth(app) {
  if (app.globalData.userInfo) {
    return Promise.resolve(app.globalData.userInfo);
  }

  let getWechatInfo = getWechatCode().then(code => {
      return getWechatUserInfo(code);
    });

  return Promise.all([getWechatInfo, getCsrfToken()]) // run this two jobs at same time
    .then(values => {
      let data = {
        code: values[0].code,
        userInfo: values[0].userInfo,
        csrftoken: values[1],
      };
      return getNodeBBToken(app, data.code, data.csrftoken, data.userInfo);
    })
    .catch((error) => {
        console.log(error);
    });
}

function getWechatCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (!res || !res.code) {
          reject('get login code failed.');
        } else {
          resolve(res.code);
        }
      },
      fail: (res) => {
        reject(res);
      }
    });
  });
}

function getWechatUserInfo(code) {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      success: (res) => {
        resolve({code, userInfo:res});
      },
      fail: (res) => {
        reject(res);
      }
    });
  });
}

function getCsrfToken() {
	return request({
  		url: `${config.API_URL}/api/config`,
  		method: 'GET',
  	}).then((res) => {
      return res.data.csrf_token;
    });
}

function getUserInfo(app, userslug) {
  return request(`${config.API_URL}/api/user/${userslug}`).then(res=>{
    res.data.absCover = fixAbsUrl(res.data['cover:url'], config.API_URL);
    app.globalData.userInfo = res.data;
    return res.data;
  })
}

function getNodeBBToken(app, code, csrftoken, userInfo) {
	return request({
      url: `${config.API_URL}/weapp/login`,
      method: 'POST',
      noToken: true,
      header: {
        'x-csrf-token': csrftoken
      },
      data: {
        'code': code,
        'isFake': code === "the code is a mock one",
        'iv': userInfo.iv || 'fake',
        'encryptedData': userInfo.encryptedData || 'fake'
      },
    })
    .then((res) => {
      // set token to global
      // wx.setStorageSync('token', res.data.token)
      wx.setStorageSync('userInfo', res.data.user)
      wx.setStorageSync('csrftoken', csrftoken)
      app.globalData.userInfo = res.data.user
      app.globalData.mainCategories = res.data.mainCategories;
      return getUserInfo(app, res.data.user.userslug)

    })
    .catch((error) => {
      console.error(error);
    });
}

export default auth;
