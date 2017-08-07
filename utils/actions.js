import config from '../config'
import {request, uploadFile} from './request'
import {formatTimestamp, getDateBiff, fixAbsUrl} from './util';

function fixAbsUrls(data, attr) {
  if (!data || !data.length) return data;

  return data.map(item=>{
    item[attr] = fixAbsUrl(item[attr], config.API_URL)
    return item;
  });
};

function getTopics(url, data) {
  return request({url, data}).then((res) => {
      res.data.topics = res.data.topics.filter(topic => !topic.deleted)
      res.data.topics.forEach((topic) => {
          topic.content = topic.teaser && topic.teaser.originalContent
          topic.bookmarks = topic.teaser && topic.teaser.bookmarks
          topic.pictures = topic.teaser && topic.teaser.pictures
          topic.date = formatTimestamp(topic.timestamp)
          topic.bDate = getDateBiff(topic.timestamp)
          topic.absThumb = fixAbsUrl(topic.thumb, config.API_URL)
          topic.postcount = topic.postcount || 1;
      });
      return res.data;
  });
}

let actions = {};

actions.getTopics = (cid, page, isOwner) => {
  let url = config.API_URL + '/api/category/' + cid;
  let data = {
    page: page || 1
  };
  if (isOwner) data.tag='__ownertopic__';
  return getTopics(url, data);
};

actions.getUserTopics = (user, page=1, type='', cid='') => {
  let url = `${config.API_URL}/api/user/${user.userslug}/topics?type=${type}&cid=${cid}`;
  return getTopics(url, {page});
};

actions.getUserTopicsByPosts = (user, page=1, type='bookmarks') => {
  let url = `${config.API_URL}/api/user/${user.userslug}/${type}`;
  let data = {page}
  return request({url, data}).then(res => {
    res.data.topics = res.data.posts.filter(post=>post.isMainPost).map(post=>{
      let topic = post.topic;
      topic.mainPost = post;
      topic.content = post.originalContent;
      topic.user = post.user;
      topic.date = formatTimestamp(post.timestamp)
      topic.bDate = getDateBiff(post.timestamp)
      delete topic.mainPost.topic;
      return topic;
    })
    return res.data;
  })
};

actions.getUserInfo = (user)=> {
  let userslug = user.userslug || user;
  let url = config.API_URL + `/api/user/${userslug}`;
  return request({url}).then(res=>{
    res.data.absCover = fixAbsUrl(res.data['cover:url'], config.API_URL);
    return res;
  });
}

actions.getEtopicMembers = (etid, page=1) => {
  let url = config.API_URL + `/api/v1/etopics/${etid}/members`;
  let data = {page};
  return request({url, data});
}

actions.getBookmarkedUsers = (pid) => {
  let url = config.API_URL + `/api/v1/posts/${pid}/bookmarked-users`;
  return request(url).then(res=>{
    res.data.users = res.data.payload;
    return res;
  });
}

actions.getUserFollowers = (userslug, page=1) => {
  let url = config.API_URL + `/api/user/${userslug}/followers`;
  let data = {page};
  return request({url, data});
}

actions.getUserFollowing = (userslug, page=1) => {
  let url = config.API_URL + `/api/user/${userslug}/following`;
  let data = {page};
  return request({url, data});
}

actions.searchPost = (query, page=1, searchIn="titlesposts") => {
  let url = config.API_URL + `/api/search?term=${query}&in=${searchIn}&page=${page}&showAs=topics`;
  return request({url}).then(res=>{
    var posts = res.data.posts || [];
    posts = posts.filter(post=>post.isMainPost);
    let topics = posts.map(post=>{
      let topic = post.topic;
      topic.content = post.originalContent
      topic.date = formatTimestamp(post.timestamp)
      topic.bDate = getDateBiff(post.timestamp)
      topic.user = post.user;
      return topic;
    });
    res.data.topics = topics;
    return res.data;
  });
};

actions.searchUser = (query, page=1) => {
  let url = config.API_URL + `/api/v1/users/search?q=${query}&page=${page}`;
  return request({url}).then(res=>{
    return res.data.payload;
  });
};

actions.getTopic = (tid, page) => {
  let url = config.API_URL + '/api/topic/' + tid;
  let data = {page};

  // wx.showLoading({
  //   title: '加载中',
  // })

  return request({url, data}).then((res) => {
    // wx.hideLoading()
    let data = res.data;
    data.posts.forEach((post)=>{
        post.content = post.originalContent
        post.date = formatTimestamp(post.timestamp)
        post.bDate = getDateBiff(post.timestamp)
        post.user.picture = post.user.picture || 'http://placehold.it/60x60'
    });
    data.mainPost = data.posts[0]
    data.comments = data.posts.slice(1)
    data.absThumb = fixAbsUrl(data.thumb, config.API_URL)
    return data
  });
};

actions.addTopic = (topic, cid) => {
  let url = config.API_URL + '/api/v1/topics/';
  let data = {
    cid: cid,
    title: topic.title,
    content: topic.content,
    pictures: topic.pictures,
    etopic: topic.etopic,
    pollData: topic.pollData,
    thumb: topic.thumb,
  };
  let method = 'POST';

  // wx.showLoading({
  //   title: '表单提交中',
  //   mask: true
  // })
  return request({url, data, method});
};

actions.editTopic = (topic) => {
  let url = config.API_URL + '/api/v1/topics/' + topic.tid;
  let data = {
    // cid: config.EVENTS_CATEGORY_ID,
    pid: topic.mainPost && topic.mainPost.pid,
    title: topic.title,
    content: topic.content,
    etopic: topic.etopic,
    pollData: topic.pollData,
    thumb: topic.thumb,
    etid: topic.etid,
    pictures: topic.pictures
  }; console.log('edit topic action data', data)
  let method = 'PUT';
  return request({url, data, method});
};

actions.delTopic = (topic) => {

  let url = config.API_URL + '/api/v1/topics/' + topic.tid;
  let data = {};
  let method = 'DELETE';

  return request({url, data, method});
};

actions.bookmarkPost = (pid, uid, type='bookmark') => {
  let url = `${config.API_URL}/api/v1/posts/${pid}/${type}`;
  let method = 'POST';
  return request({url, method});
};

actions.eventSignup = (etid) => {
  let url = config.API_URL + '/api/v1/etopics/' + etid + '/signup';
  let data = {};
  let method = 'POST';
  return request({url, data, method});
};

actions.eventSignupEdit = (etid) => {
  let url = config.API_URL + '/api/v1/etopics/' + etid + '/unsignup';
  let data = {};
  let method = 'POST';

  return request({url, data, method});
};

actions.addComment = (topicId, comment) => {
  let url = config.API_URL + '/api/v1/topics/' + topicId;
  let data = {
    content: comment.content,
    timestamp: Date.now(),
  };
  let method = 'POST';
  return request({url, data, method});
};

actions.uploadPostFile = (tempFilePaths, cid) => {
  let url = config.API_URL + '/api/post/upload';
  let formData = {cid};
  let name = 'files[]';
  let promises = [];
  wx.showLoading({
    title: `图片上传中 0/${tempFilePaths.length}`,
    mask: true
  });

  let completed = 0;
  let ret = [];
  function _upload(i=0) {
    let filePath = tempFilePaths[i];
    if (!filePath) {
      return Promise.resolve(ret)
    } else {
      return uploadFile({url, filePath , formData, name}).then((res) => {
        wx.showLoading({
          title: `图片上传中 ${i+1}/${tempFilePaths.length}`,
          mask: true
        });
        if (res.data && res.data.search("url") >= 0) ret.push(JSON.parse(res.data));
        return _upload(i+1);
      });
    }
  }
  return _upload(0);
};

actions.uploadThumbImg = (filePath) => {
  let url = config.API_URL + '/api/topic/thumb/upload';
  let name = 'files[]';
  let formData = {};
  wx.showLoading({
    title: '题图上传中',
    mask: true
  })

  let promise = uploadFile({url, filePath, formData, name}).then((res) => {
    console.log('upload return: ', res)
    if (res.data && res.data.search("url") >= 0) return JSON.parse(res.data);
  });

  return promise;
};

actions.followUser = (uid) => {
  let url = config.API_URL + '/api/v1/users/' + uid + '/follow';
  let method = 'POST';
  return request({url, method});
};

actions.unfollowUser = (uid) => {
  let url = config.API_URL + '/api/v1/users/' + uid + '/follow';
  let method = 'DELETE';
  return request({url, method});
};

module.exports = actions;
