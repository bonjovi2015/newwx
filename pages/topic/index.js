import config from '../../config'

let app = getApp();

Page({
  data: {
    loading: true,
    topics: []
  },
  scrolltolower() {
    if (this.data.pagination.currentPage < this.data.pagination.pageCount)
      this.getList();
  },

  deleteTopic(e) {
    wx.showModal({
      title: '删除确认',
      content: '确认删除?',
      confirmText: "删除",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中, 请稍等',
            mask: true
          });
          app.actions.delTopic(e.currentTarget.dataset.topic).then((data) => {
            wx.hideLoading();
            let topics = this.data.topics.filter(topic=>{
              return topic.tid !== e.currentTarget.dataset.topic.tid;
            });
            this.setData({
              topics: topics
            })
          });
        }
      }
    });
  },

  getList() {
    this.data.loading = true;
    this.setData(this.data);
    let page=1
    if (this.data.pagination) {
      page = this.data.pagination.next.page
    }

    let cb = (data) => {
        data.topics.forEach(topic=>{
          if (topic.pictures && topic.pictures.length) {
            if (topic.pictures.length === 1) {
              topic.pictureItemClass = 'picture-item-1';
            } else if (topic.pictures.length === 2 || topic.pictures.length === 4) {
              topic.pictureItemClass = 'picture-item-2';
            } else {
              topic.pictureItemClass = 'picture-item-3';
            }
          }

          if (topic.etopic && topic.etopic.closeDate) {
            let cd = new Date(topic.etopic.closeDate);
            if (Date.now() > cd.getTime()) {
              topic.eventClosed = true
            }
          }
        });
        data.topics = this.data.topics.concat(data.topics)
        data.loading = false
        data.isOwner = this.data.isOwner;
        let title = data.name;
        if (!data.cid) {
          title = '我发布的主题';
        }

        // 活动审核
        if (!this.data.type && data.children && data.children.length) {
          data.subCid = data.children[0].cid;
        }

        this.setData(data);
        if (this.data.pagination.currentPage == 1) {
          wx.setNavigationBarTitle({
            title: title
          })
        }
      };

      if (!this.data.type) {
        let cid = this.data.cid || app.globalData.mainCategories.etopic;
        app.actions.getTopics(cid, page, this.data.isOwner).then(cb);
      } else {
        let type = this.data.type;
        if (type === 'center') {
          app.actions.getUserTopics(app.globalData.userInfo, page).then(cb);
        } else if (type === 'topics') {
          app.actions.getUserTopics(app.globalData.userInfo, page, type, this.data.cid).then(cb);
        } else if (type === 'bookmarks') {
          app.actions.getUserTopicsByPosts(app.globalData.userInfo, page, type).then(cb);
        } else {
          app.actions.getUserTopics(app.globalData.userInfo, page, this.data.type).then(cb);
        }
      }
  },

  onLoad(option) {
    if (!app.globalData.userInfo) return;
    if(!option) option = {};
    this.data.reload = false;
    this.data.option = option;
    this.data.cid = option.cid;
    this.data.isOwner = option.isOwner
    this.data.type = option.type;
    //add by bonjovi--------
    app.globalData.cid = option.cid;
    //---------
    this.data.globalData = app.globalData

    // wx.navigateTo({
    //   url: '/pages/topic/edit?cid=1&isEvent=true'
    // })
    this.getList();
  },

  onShow() {
    if (this.data.reload){
      this.data.pagination = null;
      this.data.topics = [];
      this.onLoad(this.data.option);
    }
  }

})
