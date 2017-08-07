var app = getApp()

Page({
  data: {
    loading: true,
    users: []
  },
  getData () {
    let page=1
    if (this.data.pagination) {
      if (this.data.pagination.currentPage < this.data.pagination.pageCount) {
        page = this.data.pagination.next.page
      } else {
        // no more pages
        return
      }
    }
    this.setData({loading: true});
    let cb = (res) => {
      let data = res.data
      data.users = this.data.users.concat(data.users);
      // while (data.users.length < 20) {
      //   data.users = data.users.concat(data.users);
      // }
      data.loading = false;
      this.setData(data);
    };

    if (this.data.etid) {
      app.actions.getEtopicMembers(this.data.etid, page).then(cb);
    } else if (this.data.pid) {
      app.actions.getBookmarkedUsers(this.data.pid).then(cb);
    } else if (this.data.userslug && this.data.type === 'follower') {
      app.actions.getUserFollowers(this.data.userslug, page).then(cb);
    } else if (this.data.userslug && this.data.type === 'following') {
      app.actions.getUserFollowing(this.data.userslug, page).then(cb);
    }
  },
  onLoad(options) {
    this.data.etid = options.etid;
    this.data.userslug = options.userslug;
    this.data.pid = options.pid;
    this.data.type = options.type;
    this.getData();
  }
})
