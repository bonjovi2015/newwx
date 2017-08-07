import config from '../../config'

let app = getApp();

Page({
  data: {
    loading: false,
    type: 'topics'
  },

  scrolltolower() {
    console.log('scrolltolower...')
    if (this.data.pagination && this.data.pagination.currentPage < this.data.pagination.pageCount)
      this.search(this.data.query);
  },

  switchSearchType (e) {
    this.setData({
      type: this.data.type === 'topics' ? 'users' : 'topics'
    })
  },

  saveQuery (e) {
    this.data.query = e.detail.value;
  },

  bindSearch (e) {
    var query = e.detail.value || this.data.query;
    if (query) {
      this.search(query);
    }
  },

  search(query) {
    this.setData({
        loading: true,
        query: query,
        topics: [],
        users: []
    });
    let page=1
    if (this.data.pagination) {
      page = this.data.pagination.next.page;
    }
    var func = this.data.type === 'topics' ? app.actions.searchPost : app.actions.searchUser;
    func(query, page)
      .then(data => {
        data.loading = false;
        this.setData(data);
      });
  },

  onLoad(option) {
    this.data.option = option;
    // for tabbar initiation
    wx.setNavigationBarTitle({
      title: '搜索'
    })

    if (option && option.query) this.search(option.query);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {
      this.onLoad(this.data.option);
  }

})
