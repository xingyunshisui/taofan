// Page status monitor.
;(function() {
  const BOOKED_SELECTOR = '#block-block-2 .content a[href="/budingcan"]';
  const UNBOOK_SELECTOR = '#block-block-2 .content a[href="/dingcan"]';
  const LOGEDIN_SELECTOR = '';
  const USERNAME_FIELD_ID = 'edit-name';
  const PWD_FIELD_ID = 'edit-pass';
  const BOOK_LATE_SELECTOR = '';

  var body = document.body;
  var status = 'error';

  if (body.querySelector(BOOKED_SELECTOR)) {
    status = 'booked';
  } else if (body.querySelector(UNBOOK_SELECTOR)) {
    status = 'unbook';
  } else if (document.getElementById(USERNAME_FIELD_ID) &&
             document.getElementById(PWD_FIELD_ID)) {
    status = 'un_loged_in';
  } else if (body.querySelector(LOGEDIN_SELECTOR)) {
    status = 'loged_in';
  } else if (body.querySelector(BOOK_LATE_SELECTOR)) {
    status = 'late';
  }

  chrome.extension.sendRequest({status: status});
})();