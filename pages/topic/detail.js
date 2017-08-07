import config from '../../config'

let app = getApp();

Page({
  data: {
    loading: false,
    comments: [],
    commentContent: '',
    eventClosed: false
  },

  onLoad(option) {
    this.data.tid = option.id;
    this.getData();
  },

  onShareAppMessage() {
    let name = (app.globalData.userInfo.fullname || app.globalData.userInfo.username) + ' ';
		let act = '围观';
		if (this.data.etid) {
			act = '参加'
		}
    return {
      title: `${name}邀请你${act}“${this.data.title}”`,
			path: `/pages/topic/detail?id=${this.data.tid}`
    }
  },

  getData(page=1) {
    if (!page && this.data.pagination) {
      if (this.data.pagination.currentPage < this.data.pagination.pageCount) {
        page = this.data.pagination.next.page
      } else {
        // no more pages
        return
      }
    }
    this.setData({loading: true})

    app.actions.getTopic(this.data.tid, page)
      .then(data => {
        data.comments = this.data.comments.concat(data.comments);
        data.loading = false;
        data.category.isEvent = data.category.cid == app.globalData.mainCategories.etopic;
        data.category.isDiscuss = data.category.cid == app.globalData.mainCategories.discuss;
        if (data.etopic && data.etopic.closeDate) {
          let cd = new Date(data.etopic.closeDate);
          if (Date.now() > cd.getTime()) {
            data.eventClosed = true
          }
        }
        this.setData(data);
      });
  },
  signup() {
    wx.showModal({
      title: '活动报名',
      content: this.data.title,
      confirmText: "报名",
      cancelText: "取消",

      success: (res) => {
        if (res.confirm) {
					wx.showLoading({
		        title: '提交中, 请稍等',
		        mask: true
		      });
          app.actions.eventSignup(this.data.etid)
            .then((data) => {
							wx.hideLoading();
							this.data.etopic.signed = true;
              let wechat_user = app.globalData.userInfo;
              let user = {
                uid: wechat_user.uid,
                name: wechat_user.fullname || wechat_user.username,
                picture: wechat_user.picture
              };
				  		this.data.etopic.memberCount += 1
	            this.data.etopic.members.push(user);
							this.setData({etopic: this.data.etopic});
					});
        }
      }
    });
  },

  editSignup() {
    wx.showModal({
      title: '修改報名',
      content: '确认要退出报名？',
      confirmText: "退出报名",
      cancelText: "取消",

      success: (res) => {
        if (res.confirm) {
					wx.showLoading({
		        title: '提交中, 请稍等',
		        mask: true
		      });
          app.actions.eventSignupEdit(this.data.etid)
            .then((data) => {
							wx.hideLoading();
							this.data.etopic.signed = false;
							this.data.etopic.memberCount -= 1
              let uid = app.globalData.userInfo.uid;
              this.data.etopic.members = this.data.etopic.members.filter(member=>member.uid!=uid);
							this.setData({etopic: this.data.etopic});
						});
        }
      }
    });
  },
  eventEdit() {
    if (!this.data.mainPost.selfPost) return;
    let isEvent = this.data.etopic ? 1 : 0
    let url = '/pages/topic/edit?id=' + this.data.tid
		if (this.data.etopic) {
      url += '&isEvent=1'
    }
		wx.redirectTo({
      url:  url
    })
  },

  bookmark(e) {
    let type=this.data.mainPost.bookmarked ? 'unbookmark' : 'bookmark';
    let count = this.data.mainPost.bookmarks || 0;
    app.actions.bookmarkPost(this.data.mainPost.pid, app.globalData.userInfo.uid, type).then(res=>{
      this.setData({
        'mainPost.bookmarks': type === 'bookmark' ? count+1 : count-1,
        'mainPost.bookmarked': !this.data.mainPost.bookmarked
      })
    })
  },

  goAttendeePage() {
    wx.navigateTo({
      url: '/pages/topic/attendees?etid='+this.data.etid,
    })
  },

  previewPictures(e) {
    wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: this.data.pictures // 需要预览的图片http链接列表
    })
  },

  openLocation(e) {
    if (this.data.etopic && this.data.etopic.locationDetail) {
      wx.openLocation({
        latitude: this.data.etopic.locationDetail.lat,
        longitude: this.data.etopic.locationDetail.lng,
        name: this.data.etopic.locationDetail.name
      })
    }
  },

  bindNavBack(e) {
    wx.navigateBack();
  },

  showComment(e) {
    this.setData({
      commentShown: !this.data.commentShown
    });
  },

  commentSubmit(e) {
    let content = e.detail.value.comment;
    let wechat_user = app.globalData.userInfo;
    let comment = {
      user: {
        fullname: wechat_user.fullname || wechat_user.username,
        picture: wechat_user.picture
      },
      content: content,
      date: '刚刚',
    };
		wx.showLoading({
			title: '提交中, 请稍等',
			mask: true
		});
    app.actions.addComment(this.data.tid, comment).then((data) => {
      this.data.comments.push(comment);
			wx.hideLoading();
      this.setData({
        commentShown: false,
        commentContent: '',
        comments: this.data.comments,
      });
    });
  },
})
