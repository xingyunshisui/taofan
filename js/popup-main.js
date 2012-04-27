var Main = (function() {
  var bg = chrome.extension.getBackgroundPage();
  var TaoFan = bg.TaoFan;
  return {
    init: function() {
      var self = this;

      this.setDinnerInfo(TaoFan.supplier, TaoFan.dishes);
      // Get dinner info.
      TaoFan.getDinnerInfo(self.setDinnerInfo);

      var status = TaoFan.getStatus();
      if (status == 'un_loged_in') {
        this.hide();
        this.showUnlogedinMsg();
      } else if (status != 'error') {
        this.show();
        if (status == 'unbook') {
          this.showUnBooked();
        } else if (status == 'booked' || status == 'can_not_unbook') {
          this.showBooked();
        } else if (status == 'late') {
          this.showMainMsg('订餐时间已过，明天再在公司吃吧~');
        }
      } else {
        this.hide();
        this.showMainMsg('Errorrrrrrrrrrrrr...');
      }

      var bookMode = localStorage.getItem('book_mode');
      if (bookMode == 'auto') {
        $('#auto-book').get().checked = true;
        RemindMode.hideLink();
      } else {
        $('#remind-book').get().checked = true;
        RemindMode.showLink();
      }

      var bookPause = localStorage.getItem('book_pause');
      if (bookPause == 'true') {
        this.showResumeBook();
      } else {
        this.showPauseBook();
      }

      $('#remind-book').on('click', function() {
        localStorage.setItem('book_mode', 'remind');
        RemindMode.showLink();
        RemindMode.setReminder();
      });

      $('#auto-book').on('click', function() {
        localStorage.setItem('book_mode', 'auto');
        RemindMode.hideLink();
        TaoFan.removeReminder();
        if (TaoFan.getStatus() != 'booked') {
          TaoFan.book();
        }
      });

      $('#book').on('click', function() {
        self.showLoading();
        TaoFan.book(function(status) {
          self.hideLoading();
          if (status == 'booked') {
            self.showBooked();
            self.hideUnBooked();
          } else if (status == 'un_loged_in') {
            self.hide();
            self.showUnlogedinMsg();
          } else if (status == 'late') {
            self.showMainMsg('订餐时间已过，明天再在公司吃吧~');
          } else {
            self.showMainMsg('Errorrrrrrrrrrr...');
          }
        });
      });

      $('#unbook').on('click', function() {
        self.showLoading();
        TaoFan.unbook(function(status) {
          self.hideLoading();
          if (status == 'unbook') {
            self.showUnBooked();
            self.hideBooked();
          } else if (status == 'un_loged_in') {
            self.hide();
            self.showUnlogedinMsg();
          } else if (status == 'booked') {
            self.showBooked();
          } else if (status == 'can_not_unbook') {
            self.showBooked();
            self.showMainMsg('已过订餐时间，无法取消。');
          } else {
            self.showMainMsg('Errorrrrrrrrrrr...');
          }
        });
      });

      $('#pause-book').on('click', function() {
        localStorage.setItem('book_pause', true);
        self.showResumeBook();
        self.hidePauseBook();
      });

      $('#resume-book').on('click', function() {
        localStorage.setItem('book_pause', false);
        self.showPauseBook();
        self.hideResumeBook();
      });

      $('#about-link').on('click', function() {

      });

      RemindMode.init();
    },

    setDinnerInfo: function(supplier, dishes) {
      supplier && $('#supplier').html(supplier);
      dishes && $('#dishes').html(dishes);
    },

    show: function() {
      $('#wrapper').show();
    },

    hide: function() {
      $('#wrapper').hide();
    },

    showUnlogedinMsg: function() {
      $('#unlogedin-msg').show();
    },

    showMainMsg: function(msg) {
      $('#main-info').html(msg).show();
    },

    hideMainMsg: function() {
      $('#main-info').hide();
    },

    showBooked: function() {
      $('#booking-status').show().html('已订餐。').removeClass('not-booked');
      $('#unbook').show();
    },

    hideBooked: function() {
      $('#unbook').hide();
    },

    showUnBooked: function() {
      $('#booking-status').show().html('未订餐。').addClass('not-booked');
      $('#book').show();
    },

    hideUnBooked: function() {
      $('#book').hide();
    },

    showPauseBook: function() {
      $('#pause-book').show();
    },

    hidePauseBook: function() {
      $('#pause-book').hide();
    },

    showResumeBook: function() {
      $('#resume-book').show();
    },

    hideResumeBook: function() {
      $('#resume-book').hide();
    },

    showLoading: function() {
      $('#booking-status').show().html('进行中...').addClass('loading');
    },
    
    hideLoading: function() {
      $('#booking-status').removeClass('loading');
    }
  }
})();