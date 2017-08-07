import auth from './utils/auth'
import actions from './utils/actions'


App({
  onLaunch() {
    auth(this)
    	.then(res =>{
            if (getCurrentPages().length != 0) {
                getCurrentPages()[getCurrentPages().length - 1].onLoad()
            }
        });
  },
  globalData: {
  	appName: '会员俱乐部',
    csrftoken: null,
    userInfo: null,
    cid:'0'
  },
  actions: actions
})
