import XRegExp from './xregexp'

let utils = {
    formatTimestamp (timestamp, sep) {
      return utils.formatTime(new Date(timestamp), sep);
    },

    formatNumber (n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    },

    formatTime (date, sep) {
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()

      var hour = date.getHours()
      var minute = date.getMinutes()
      var second = date.getSeconds()

      return [year, month, day].map(utils.formatNumber).join(sep || '/') + ' ' + [hour, minute].map(utils.formatNumber).join(':')
    },

    getDateDiff (dateTimeStamp) {
    	var minute = 1000 * 60;
    	var hour = minute * 60;
    	var day = hour * 24;
    	var halfamonth = day * 15;
    	var month = day * 30;
    	var now = new Date().getTime();
    	var diffValue = dateTimeStamp - now;
    	if(diffValue < 0){return;}
    	var monthC =diffValue/month;
    	var weekC =diffValue/(7*day);
    	var dayC =diffValue/day;
    	var hourC =diffValue/hour;
    	var minC =diffValue/minute;
    	if(monthC>=1){
    		result="" + parseInt(monthC) + "月后";
    	}
    	else if(weekC>=1){
    		result="" + parseInt(weekC) + "周后";
    	}
    	else if(dayC>=1){
    		result=""+ parseInt(dayC) +"天后";
    	}
    	else if(hourC>=1){
    		result=""+ parseInt(hourC) +"小时后";
    	}
    	else if(minC>=1){
    		result=""+ parseInt(minC) +"分钟后";
    	}else
    	result="刚刚";
    	return result;
    },

    getDateBiff (dateTimeStamp){
    	var minute = 1000 * 60;
    	var hour = minute * 60;
    	var day = hour * 24;
    	var halfamonth = day * 15;
    	var month = day * 30;
    	var now = new Date().getTime();
    	var diffValue = now - dateTimeStamp;
    	if(diffValue < 0){return;}
    	var monthC =diffValue/month;
    	var weekC =diffValue/(7*day);
    	var dayC =diffValue/day;
    	var hourC =diffValue/hour;
    	var minC =diffValue/minute;
    	if(monthC>=1){
    		result="" + parseInt(monthC) + "月前";
    	}
    	else if(weekC>=1){
    		result="" + parseInt(weekC) + "周前";
    	}
    	else if(dayC>=1){
    		result=""+ parseInt(dayC) +"天前";
    	}
    	else if(hourC>=1){
    		result=""+ parseInt(hourC) +"小时前";
    	}
    	else if(minC>=1){
    		result=""+ parseInt(minC) +"分钟前";
    	}else
    	result="刚刚";
    	return result;
    },

    fixAbsUrl (url, host) {
      if (url && !url.startsWith('http')) {
        return host + url;
      }
      return url;
    },

    invalidUnicodeChars: XRegExp('[^\\p{L}\\s\\d\\-_]', 'g'),
	invalidLatinChars: /[^\w\s\d\-_]/g,
	trimRegex: /^\s+|\s+$/g,
	collapseWhitespace: /\s+/g,
	collapseDash: /-+/g,
	trimTrailingDash: /-$/g,
	trimLeadingDash: /^-/g,
	isLatin: /^[\w\d\s.,\-@]+$/,
	languageKeyRegex: /\[\[[\w]+:.+\]\]/,

	// http://dense13.com/blog/2009/05/03/converting-string-to-slug-javascript/
	slugify (str, preserveCase) {
		if (!str) {
			return '';
		}
		str = str.replace(utils.trimRegex, '');
		if (utils.isLatin.test(str)) {
			str = str.replace(utils.invalidLatinChars, '-');
		} else {
			str = XRegExp.replace(str, utils.invalidUnicodeChars, '-');
		}
		str = !preserveCase ? str.toLocaleLowerCase() : str;
		str = str.replace(utils.collapseWhitespace, '-');
		str = str.replace(utils.collapseDash, '-');
		str = str.replace(utils.trimTrailingDash, '');
		str = str.replace(utils.trimLeadingDash, '');
		return str;
	},

  tellReload () { // tell last page to reload
    let pages = getCurrentPages();
    for (var i = 0; i < pages.length-1; i++) {
      pages[i].setData({reload: true});
    }
  }
}

module.exports = utils;
