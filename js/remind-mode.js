var RemindMode = (function() {
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

    submitTimeSetting: function() {
      var $remindTime = $('#remind-time');
      var time = $remindTime.val();
      if (!$remindTime.get().validity.patternMismatch) {
        this.hideError();
        this.hideTimeSetting();
        localStorage.setItem('remind_time', time);
        Main.show();
      } else {
        this.showError();
        $remindTime.get().focus();
      }
    }
  }
})();
