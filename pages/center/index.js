import config from '../../config'

let app = getApp();

Page({
  data: {
    loading: true,
    personalTopicCount: 0,
    globalData: app.globalData
  },

  followUser (e) {
    app.actions.followUser(this.data.user.uid).then(res=>{
      this.setData({
        'user.followerCount': this.data.user.followerCount+1,
        'user.isFollowing': true
      })
      app.globalData.userInfo.followingCount += 1;
    });
  },

  unfollowUser (e) {
    app.actions.unfollowUser(this.data.user.uid).then(res=>{
      this.setData({
        'user.followerCount': this.data.user.followerCount-1,
        'user.isFollowing': false
      })
      app.globalData.userInfo.followingCount -= 1;
    });
  },

  onLoad: function (options) {
    // for tabbar initiation
    let promise = Promise.resolve();
    if (options && options.userslug) {
      promise = app.actions.getUserInfo(options.userslug);
    }
    promise.then(res=>{
      let user = app.globalData.userInfo;
      if (res && res.data) {
        user = res.data;
      }
      this.setData({
        loading: false,
        user: user
      })

      if (user.personalCid) {
        app.actions.getTopics(user.personalCid).then(data=>{
          this.setData({
            personalTopicCount: data.totalTopicCount
          })
        });
      }
    })

  }
})
