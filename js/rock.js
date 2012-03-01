(function(){
  function Rock(selector, context) {
    if (!context)
      context = document;
    else if (typeof context == 'string')
      context = document.querySelector(context);
    else if (context instanceof Rock)
      context = context.get();
    
    if (typeof selector == 'string') {
      this.elements = context.querySelectorAll(selector);
    } else if (selector instanceof Rock) {
      var tmpElements = [];
      selector.each(function(element) {
        tmpElements.push(element);
      });
      this.elements = tmpElements;
    } else {
      this.elements = [selector];
    }
  }

  Rock.prototype = {
    constructor: Rock,
    
    get: function(index) {
      index = index || 0;
      return this.elements[index];
    },

    each: function(callback) {
      var length = this.elements.length;
      for (var i = 0; i < length; i++) {
        callback(this.elements[i], i);
      }
    },

    show: function() {
      this.each(function(element) {
        if (getStyle(element, 'display') == 'none') {
          // Set display value to be defined by style sheet
          var cssRules = window.getMatchedCSSRules(element, '', true);
          if (cssRules) {
            var ruleLength = cssRules.length;
            var display;
            for (var i = ruleLength - 1; i >= 0 ; --i) {
              display = cssRules[i].style.display;
              if (display && display != 'none') {
                element.style.display = display;
                return;
              }
            }
          }

          // Set display value to be UA default value
          var tmpElement = document.createElement(element.nodeName);
          document.body.appendChild(tmpElement);
          display = getStyle(tmpElement, 'display');
          document.body.removeChild(tmpElement);
          element.style.display = display;
        }
      });
      return this;
    },

    hide: function() {
      this.each(function(element) {
        element.style.display = 'none';
      });
      return this;
    },

    css: function(propertyOrPropertyMap, value) {
      var element = this.get();
      if (typeof propertyOrPropertyMap == 'string' && arguments.length == 1) {
        return getStyle(element, propertyOrPropertyMap);
      }
      this.each(function(element) {
        setStyle(element, propertyOrPropertyMap, value);
      });
      return this;
    },

    addClass: function(className) {
      this.each(function(element) {
        if (window.DOMTokenList) {
          element.classList.add(className);
        } else {
          element.className += ' ' + className;
        }
      });
      return this;
    },

    removeClass: function(className) {
      this.each(function(element) {
        if (window.DOMTokenList) {
          element.classList.remove(className);
        } else {
          var cName = element.className;
          var regexp = new RegExp('\\s?' + className + '\\s?');
          element.className = cName.replace(regexp, ' ');
        }
      });
      return this;
    },

    hasClass: function(className) {
      return this.get().classList.contains(className);
    },

    toggleClass: function(className) {
      this.each(function(element) {
        element.classList.toggle(className);
      });
      return this;
    },

    attr: function(attributeOrAttributeMap, value) {
      if (typeof attributeOrAttributeMap == 'string' && arguments.length == 1)
        return getAttribute(this.get(), attributeOrAttributeMap);
      this.each(function(element) {
        setAttribute(element, attributeOrAttributeMap, value);
      });
      return this;
    },

    html: function(html) {
      if (arguments.length == 0)
        return this.get().innerHTML;
      this.each(function(element) {
        element.innerHTML = html;
      });
      return this;
    },

    text: function(text) {
      if (arguments.length == 0)
        return this.get().innerText;
      this.each(function(element) {
        element.innerText = text;
      });
      return this;
    },

    on: function(type, listener, capture) {
      capture = capture || false;
      this.each(function(element) {
        element.addEventListener(type, listener, capture);
      });
      return this;
    },

    trigger: function(eventName) {
      var event = document.createEvent('Event');
      event.initEvent(eventName, true, true);
      this.each(function(element) {
        element.dispatchEvent(event);
      });
    },

    val: function(value) {
      if (arguments.length == 0)
        return this.get().value;
      this.each(function(element) {
        element.value = value;
      });
      return this;
    },

    append: function(child) {
      if (!child)
        return;
      if (child.constructor === Rock)
        child = child.get();
      this.each(function(element) {
        element.appendChild(child);
      });
      return this;
    },

    prepend: function(child) {
      if (!child)
        return;
      if (child.constructor === Rock)
        child = child.get();
      this.each(function(element) {
        element.insertBefore(child, element.firstChild);
      });
      return this;
    },
    
    removeChild: function(child) {
      if (!child)
        return;
      if (child.constructor === Rock)
        child = child.get();
      this.get().removeChild(child);
      return this;
    }
  };

  var $ = window.$ = window.Rock = function(selector, context) {
    return new Rock(selector, context);
  };

  function setAttribute(element, attributeOrAttributeMap, value) {
    if (typeof attributeOrAttributeMap == 'string' && arguments.length == 3) {
      element.setAttribute(attributeOrAttributeMap, value);
    } else if (typeof attributeOrAttributeMap == 'object') {
      for (var attribute in attributeOrAttributeMap)
        element.setAttribute(attribute, attributeOrAttributeMap[attribute]);
    }
  }

  function getAttribute(element, attribute) {
    return element.getAttribute(attribute);
  }
  
  function setStyle(element, propertyOrPropertyMap, value) {
    if (typeof propertyOrPropertyMap == 'object') {
      for (var prop in propertyOrPropertyMap) {
        var camelCasedProp = prop.replace(/-([a-z])/gi, function(n, letter) {
          return letter.toUpperCase();
        });
        element.style[camelCasedProp] = propertyOrPropertyMap[prop];
      }
    } else if (typeof propertyOrPropertyMap == 'string' &&
        arguments.length == 3)
      element.style[propertyOrPropertyMap] = value;
  }

  function getStyle(element, property) {
    return window.getComputedStyle(element)[property];
  }
})();

$.ENABLE_LOG = true;
$.log = function(message) {
  $.ENABLE_LOG && console.log(message);
};

$.addStyleSheet = function(path) {
  var link = document.createElement('link');
  link.setAttribute('type', 'text/css');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', path);
  document.head.appendChild(link);
};

$.setDialogPosition = function(dialog) {
  var $dialog = $(dialog);
  var isHidden = $dialog.css('display') == 'none';
  if (isHidden) {
    $dialog.show();
  }
  // Reset upload wrapper position
  var viewportWidth = window.innerWidth;
  var viewportHeight = window.innerHeight;
  var wrapperWidth = dialog.offsetWidth;
  var wrapperHeight = dialog.offsetHeight;

  var left = (viewportWidth - wrapperWidth) / 2;
  var top = (viewportHeight - wrapperHeight) / 2;
  left = left < 0 ? 0 : left;
  top = top < 0 ? 0 : top;

  var scrollTop = document.body.scrollTop;
  var scrollLeft = document.body.scrollLeft;

  $dialog.css({
    top: top + scrollTop + 'px',
    left: left + scrollLeft + 'px'
  });
  if (isHidden)
    $dialog.hide();
};

$.type = function(obj) {
  if (obj === undefined)
    return 'undefined';
  if (obj === null)
    return 'null';
  if (obj.constructor === RegExp)
    return 'regexp';
  var type = typeof obj;
  var regexp = /^function\s(.+)\(\)/;
  if (type == 'object')
    return regexp.exec(obj.constructor.toString())[1].toLowerCase();
  return type;
};

$.mergeObject = function(obj1, obj2) {
  if (!obj1 || !obj2 || $.type(obj1) != 'object' || $.type(obj2) != 'object')
    return null;
  var result = {};
  var key;
  for (key in obj1)
    result[key] = obj1[key];
  for (key in obj2)
    result[key] = obj2[key];
  return Object.keys(result).length == 0 ? null : result;
};