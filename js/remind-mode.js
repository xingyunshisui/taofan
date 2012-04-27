var RemindMode = (function() {
  var bg = chrome.extension.getBackgroundPage();
  var TaoFan = bg.TaoFan;
  return {
    init: function() {
      var self = this;
      $('#time-setting-link').on('click', function() {
        Main.hide();
        self.showTimeSetting();
        self.hideError();
      });

      $('#set-remind-time').on('click', function() {
        self.submitTimeSetting();
      });

      var remindTime = localStorage.getItem('remind_time') || '11:00';
      $('#remind-time').val(remindTime);

      if (localStorage.getItem('book_mode') == 'remind') {
        this.showLink();
      }
    },

    showLink: function() {
      $('#time-setting-link').show();
    },

    hideLink: function() {
      $('#time-setting-link').hide();
    },

    showTimeSetting: function() {
      $('#remind-booking-setting').show();
    },

    hideTimeSetting: function() {
      $('#remind-booking-setting').hide();
    },

    showError: function() {
      $('#time-setting-error').show();
    },

    hideError: function() {
      $('#time-setting-error').hide();
    },

    setReminder: function() {
      var time = localStorage.getItem('remind_time');
      var hours = parseInt(time.split(':')[0]);
      var minutes = parseInt(time.split(':')[1]);
      TaoFan.setReminder(hours, minutes);
    },

    submitTimeSetting: function() {
      var $remindTime = $('#remind-time');
      var time = $remindTime.val();
      if (!$remindTime.get().validity.patternMismatch) {
        this.hideError();
        this.hideTimeSetting();
        localStorage.setItem('remind_time', time);
        this.setReminder();
        Main.show();
      } else {
        this.showError();
        $remindTime.get().focus();
      }
    }
  }
})();
