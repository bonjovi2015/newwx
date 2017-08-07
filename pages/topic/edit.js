import config from '../../config'
import {formatTimestamp, tellReload} from '../../utils/util'

let app = getApp();

Page({
  data: {
    loading: true,
    dateStart: "",
    timeStart: '',
    dateEnd: '',
    timeEnd: '',
    etopic: {
      canSignup: true
    },

    pictures: [],
    localThumb: null
  },
  bindDateTimeChange(e) {
    let data = {};
    data[e.currentTarget.id] = e.detail.value;
    this.setData(data);
  },
  chooseThumb: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
          that.setData({
            localThumb: res.tempFilePaths[0]
          })
      }
    })
  },
  choosePicture: function (e) {
    wx.chooseImage({
      count: 9, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          this.setData({
            pictures: this.data.pictures.concat(res.tempFilePaths),
          });
      }

    })
  },
  previewThumb(e) {
    wx.previewImage({
        current: this.data.localThumb || this.data.absThumb // 当前显示图片的http链接
        // urls: this.data.files // 需要预览的图片http链接列表
    })
  },
  previewPictures(e) {
    wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: this.data.pictures // 需要预览的图片http链接列表
    })
  },

  deleteThumb(e) {
    wx.showModal({
      title: '删除确认',
      content: '确认删除标题图片',
      confirmText: "删除",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.setData({
            localThumb: null,
            absThumb: null,
            thumb: null,
          });
        }
      }
    });
  },

  deletePictures(e) {
    let index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '删除确认',
      content: '确认删除描述图片',
      confirmText: "删除",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.setData({
            pictures: this.data.pictures.filter((url,idx) => idx!==index),
          });
        }
      }
    });
  },
  bindDelEvent(e) {
    wx.showModal({
      title: '删除确认',
      content: '确认删除此帖?',
      confirmText: "删除",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中, 请稍等',
            mask: true
          });
          app.actions.delTopic(this.data).then((data) => {
            wx.hideLoading();
            wx.redirectTo({url: '/pages/topic/index'});
          });
        }
      }
    });

  },
  bindNavBack(e) {
    if (this.data.tid) {
      wx.redirectTo({
        url: '/pages/topic/detail?id='+this.data.tid
      })
    } else {
      wx.navigateBack();
    }
  },

  formSubmit(e) {
    // submit pictures first
    let uploadPromise = Promise.resolve();
    if (this.data.localThumb) {
      uploadPromise = app.actions.uploadThumbImg(this.data.localThumb)
        .then((data)=>{
          this.data.thumb = data[0].url;
          this.data.absThumb = config.API_URL + data[0].url;
        })
    }

    let localPictures = this.data.pictures.filter(url => url.indexOf('http')!==0);
    if (localPictures.length > 0) {
      uploadPromise = uploadPromise.then(()=>{
        return app.actions.uploadPostFile(localPictures, this.data.cid)
          .then((data)=>{
            let pictures = data.map((item) => (config.API_URL + item[0].url));
            this.data.pictures = this.data.pictures.filter(url => url.indexOf('http')==0); // remove local
            this.data.pictures = this.data.pictures.concat(pictures); // add uploaded url
          })
      })
    }

    uploadPromise.then(() => {
      wx.showLoading({
        title: '提交中, 请稍等',
        mask: true
      });
      tellReload();
      // submit topic
      this.data.title = e.detail.value.title
      if (this.data.isPersonal) {
        this.data.title = (new Date()).toString();
      }
      this.data.content = e.detail.value.content

      if (this.data.isEvent) {
        this.data.etopic.date = this.data.dateStart + ' ' + this.data.timeStart;
        this.data.etopic.closeDate = this.data.dateEnd + ' ' + this.data.timeEnd;

      } else if (this.data.etopic) {
        delete this.data.etopic;
      }

      if (!this.data.tid) {
        app.actions.addTopic(this.data, this.data.cid).then((data) => {
          wx.hideLoading();
          wx.redirectTo({url: '/pages/topic/detail?id=' + data.data.payload.postData.tid})
        });
      } else {
        delete this.data.comments
        app.actions.editTopic(this.data).then((data) => {
          wx.hideLoading();
          wx.redirectTo({url: '/pages/topic/detail?id=' + data.data.payload.post.tid})
        });
      }
    })
  },
  onLoad(option) {
    let name = '话题'

    if (option.isEvent) {
      name = '活动'
    } else if (option.isPersonal) {
      name = "动态"
    }
    let title = '发布新' + name;
    let id = option.id;

    function _getDate (date, defaultSpanDay=0) {
      if (date) {
        return date.split(' ')
      } else {
        let defaultDate = Date.now() + defaultSpanDay * 24 * 60 * 60 * 1000;
        return formatTimestamp(defaultDate, '-').split(' ');
      }
    }

    if (id) {
      app.actions.getTopic(id).then((data) => {
        if (data.etopic) {
          let [dateStart, timeStart] = _getDate(data.etopic.date);
          let [dateEnd, timeEnd] = _getDate(data.etopic.closeDate, 1);

          data.dateStart = dateStart
          data.dateEnd = dateEnd
          data.timeStart = timeStart
          data.timeEnd = timeEnd
        }
        data.isEvent = data.etopic || option.isEvent;
        data.isPersonal = data.isPersonal || option.isPersonal;
        data.isDiscuss = data.isDiscuss || option.isDiscuss;
        data.name = name;
        this.setData(data);
      });
      title = '斒辑' + name;
    } else {
      let [dateStart, timeStart] = _getDate();
      let [dateEnd, timeEnd] = _getDate(null, 1);

      this.setData({
        name: name,
        cid: option.cid,
        isEvent: option.isEvent,
        isDiscuss: option.isDiscuss,
        isPersonal: option.isPersonal,
        etopic: option.isEvent ? this.data.etopic : null,
        dateStart: dateStart,
        dateEnd: dateEnd,
        timeStart: timeStart,
        timeEnd: timeEnd
      });
    }

    wx.setNavigationBarTitle({
      title: title
    })

  }
})
