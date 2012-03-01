var ajaxGet = (function() {
  return function(url, success, complete) {
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
        complete && complete(xhr);
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
})();