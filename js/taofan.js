var TaoFan = (function() {
  const MAIN_PAGE = 'http://bjdc.taobao.ali.com/';
  const BOOK_URL = 'http://bjdc.taobao.ali.com/dingcan';
  const UNBOOK_URL = 'http://bjdc.taobao.ali.com/budingcan';
  const MIN_HOUR = 0;
  const MAX_HOUR = 15;

  const BOOKED_SELECTOR = '#block-block-2 .content a[href="/budingcan"]';
  const UNBOOK_SELECTOR = '#block-block-2 .content a[href="/dingcan"]';
  const LOGEDIN_SELECTOR = '';
  const USERNAME_FIELD_ID = 'edit-name';
  const PWD_FIELD_ID = 'edit-pass';
  const BOOK_LATE_SELECTOR = '';
  const DINNER_INFO_SELECTOR = '.article font';

  const LOG_ENABLED = true;
  var log = function(msg) {
    if (LOG_ENABLED)
      console.log(msg);
  };
  
  var ajaxGet = function(url, success, failure) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
      var status = xhr.status;
      if ( status >= 200 && status < 300 || status === 304 ) {
        var response = parseResponse(xhr);
        success(response, status);
      } else {
        failure(status);
      }
    };
    xhr.send(null);
  };

  // Parse response data according to content type of response
  function parseResponse(xhr) {
    var ct = xhr.getResponseHeader("content-type");
    if (typeof ct == 'string') {
      if (ct.indexOf('xml') >= 0)
        return xhr.responseXML;
      else if (ct.indexOf('json') >= 0)
        return JSON.parse(xhr.responseText);
    }
    return xhr.responseText;
  }

  return {
    init: function() {
      var self = this;
      var bookMode = localStorage.getItem('book_mode');
      if (!bookMode) {
        bookMode = 'remind';
        localStorage.setItem('book_mode', 'remind');
        localStorage.setItem('remind_time', '11:00');
        localStorage.setItem('book_pause', false);
      }
      
      this.checkStatus(function(status) {
        self.setStatus(status);
        if (status == 'unbook' && bookMode == 'auto' && self.isValidTime()) {
          self.book();
        }
      });

      this.getDinnerInfo();

      chrome.extension.onRequest.addListener(function(request) {
        var status = request.status;
        self.setStatus(status);
        log('Received status message from content script: ' + status);
      });
    },

    status: null,

    getStatus: function() {
      return this.status;
    },

    setStatus: function(status) {
      this.status = status;
      var titlePrefix = '淘饭：';
      var title;
      switch (status) {
        case 'booked':
          title = '已订餐';
          break;

        case 'unbook':
          title = '未订餐';
          break;

        case 'loged_in':
          title = '已登录';
          break;

        case 'un_loged_in':
          title = '未登录';
          break;

        case 'late':
          title = '订餐时间已过，明天再在公司吃吧~';
          break;
        case 'error':
          title = '出错了:(';
          break;
      }
      this.setTitle(titlePrefix + title);
    },

    checkStatus: function(cb) {
      var self = this;
      ajaxGet(MAIN_PAGE, function(res) {
        var status = self.parseStatus(res);
        cb(status);
      }, function(statusCode) {
        cb(statusCode);
      });
    },

    parseStatus: function(html) {
      var div = document.createElement('div');
      document.body.appendChild(div);
      div.innerHTML = html;
      var status = 'error';
      if (document.getElementById(USERNAME_FIELD_ID) &&
          document.getElementById(PWD_FIELD_ID)) {
        status = 'un_loged_in';
      } else if (div.querySelector(LOGEDIN_SELECTOR)) {
        status = 'loged_in';
      } else if(div.querySelector(BOOK_LATE_SELECTOR)) {
        status = 'late';
      } else if (div.querySelector(BOOKED_SELECTOR)) {
        status = 'booked';
      } else if (div.querySelector(UNBOOK_SELECTOR)) {
        status = 'unbook';
      }
      document.body.removeChild(div);
      return status;
    },

    setTitle: function(text) {
      chrome.browserAction.setTitle({title: text});
    },

    getDinnerInfo: function(cb) {
      var self = this;
      ajaxGet(MAIN_PAGE, function(html) {
        var div = document.createElement('div');
        document.body.appendChild(div);
        div.innerHTML = html;
        var dinnerInfo = div.querySelector(DINNER_INFO_SELECTOR);
        var supplier = dinnerInfo.querySelector('b').innerText.match(/\uff08(.+)\uff09/)[1];
        var dishes = dinnerInfo.lastChild.nodeValue.trim().match(/\u4eca\u65e5\u83dc\u5355\uff1a\s+(.+)/)[1];
        self.supplier = supplier;
        self.dishes = dishes;
        cb && cb(supplier, dishes);
        document.body.removeChild(div);
      }, function(statusCode) {

      });
    },

    book: function(cb) {
      var self = this;
      ajaxGet(BOOK_URL, function(res) {
        var status = self.parseStatus(res);
        cb(status);
        self.setStatus(status);
      }, function (status) {
        // Not signed in returns 403 forbidden.
        if (status == '403') {
          cb('un_loged_in');
          self.setStatus('un_loged_in');
        } else {
          cb('error');
          self.setStatus('error');
        }
      });
    },

    unbook: function(cb) {
      var self = this;
      ajaxGet(UNBOOK_URL, function(res) {
        var status = self.parseStatus(res);
        cb(status);
        self.setStatus(status);
      }, function (status) {
        // Not signed in returns 403 forbidden.
        if (status == '403') {
          cb('un_loged_in');
          self.setStatus('un_loged_in');
        } else {
          cb('error');
          self.setStatus('error');
        }
      });
    },

    /**
     * 判断是否过了订餐时间，依赖客户端时间
     */
    isValidTime: function() {
      var hour = new Date().getHours();
      return hour >= MIN_HOUR && hour < MAX_HOUR;
    },

    showNotification: function() {
      var htmlNotification =
        webkitNotifications.createHTMLNotification('notification.html');
      htmlNotification.show();
    }
  };

  //    // Create a simple text notification:
//var notification = webkitNotifications.createNotification(
//  '48.png',  // icon url - can be relative
//  'Hello!',  // notification title
//  'Lorem ipsum...'  // notification body text
//);
//
//// Or create an HTML notification:
//var notification = webkitNotifications.createHTMLNotification(
//  'notification.html'  // html url - can be relative
//);

// Then show the notification.
//notification.show();
})();
TaoFan.init();