(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var addMatchers = require('add-matchers');

addMatchers({
    toHaveSubset: function(expected, actual) {
        var compare = function(expected, actual){

            if (typeof expected === 'object') {
                const keys = Object.keys(expected);

                for (var ii = 0; ii < keys.length; ii++) {
                    var key = keys[ii];

                    if (!(key in actual)) return false;

                    var result = compare(actual[key], expected[key]);

                    if (!result) return false;
                }
            } else {
                if (actual !== expected) return false;
            }

            return true;
        }

        return compare(actual, expected);
    },
});

},{"add-matchers":2}],2:[function(require,module,exports){
(function (global){
// modules
var createRegister = require('./src/createRegister');
var jasmineV1 = require('./src/jasmine-v1');
var jasmineV2 = require('./src/jasmine-v2');
var jest = require('./src/jest');

// public
module.exports = createRegister({
  jasmineV1: jasmineV1,
  jasmineV2: jasmineV2,
  jest: jest
}, global);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/createRegister":3,"./src/jasmine-v1":4,"./src/jasmine-v2":5,"./src/jest":8}],3:[function(require,module,exports){
// public
module.exports = createRegister;

// implementation
function createRegister(frameworks, globals) {
  var adaptersByNumberOfArgs;

  if (globals.expect && globals.expect.extend) {
    adaptersByNumberOfArgs = frameworks.jest.getAdapters(globals);
  } else if (globals.jasmine && globals.jasmine.addMatchers) {
    adaptersByNumberOfArgs = frameworks.jasmineV2.getAdapters(globals);
  } else if (globals.jasmine) {
    adaptersByNumberOfArgs = frameworks.jasmineV1.getAdapters(globals);
  } else {
    throw new Error('jasmine-expect cannot find jest, jasmine v2.x, or jasmine v1.x');
  }

  return function (matchersByName) {
    for (var name in matchersByName) {
      var matcherFunction = matchersByName[name];
      var numberOfArgs = matcherFunction.length;
      var adapter = adaptersByNumberOfArgs[numberOfArgs];
      adapter(name, matcherFunction);
    }
  };
}

},{}],4:[function(require,module,exports){
module.exports = {
  getAdapters: function (globals) {
    return {
      1: createFactory(adapterForActual),
      2: createFactory(adapterForActualAndExpected),
      3: createFactory(adapterForActualAndTwoExpected),
      4: createFactory(adapterForKeyAndActualAndTwoExpected)
    };

    function createFactory(adapter) {
      return function (name, matcher) {
        var matchersByName = {};
        matchersByName[name] = adapter(name, matcher);
        globals.beforeEach(function () {
          this.addMatchers(matchersByName);
        });
        return matchersByName;
      };
    }

    function adapterForActual(name, matcher) {
      return function (optionalMessage) {
        return matcher(this.actual, optionalMessage);
      };
    }

    function adapterForActualAndExpected(name, matcher) {
      return function (expected, optionalMessage) {
        return matcher(expected, this.actual, optionalMessage);
      };
    }

    function adapterForActualAndTwoExpected(name, matcher) {
      return function (expected1, expected2, optionalMessage) {
        return matcher(expected1, expected2, this.actual, optionalMessage);
      };
    }

    function adapterForKeyAndActualAndTwoExpected(name, matcher) {
      return function (key, expected1, expected2, optionalMessage) {
        return matcher(key, expected1, expected2, this.actual, optionalMessage);
      };
    }
  }
};

},{}],5:[function(require,module,exports){
var matcherFactory = require('./matcherFactory');
var memberMatcherFactory = require('./memberMatcherFactory');

module.exports = {
  getAdapters: function (globals) {
    return {
      1: createFactory(getAdapter(1)),
      2: createFactory(getAdapter(2)),
      3: createFactory(getAdapter(3)),
      4: createFactory(getAdapter(4))
    };

    function createFactory(adapter) {
      return function (name, matcher) {
        var matchersByName = {};
        matchersByName[name] = adapter(name, matcher);
        globals.beforeEach(function () {
          globals.jasmine.addMatchers(matchersByName);
        });
        return matchersByName;
      };
    }

    function getAdapter(argsCount) {
      return function (name, matcher) {
        var factory = isMemberMatcher(name) ? memberMatcherFactory : matcherFactory;
        return factory[argsCount](name, matcher);
      };
    }

    function isMemberMatcher(name) {
      return name.search(/^toHave/) !== -1;
    }
  }
};

},{"./matcherFactory":6,"./memberMatcherFactory":7}],6:[function(require,module,exports){
module.exports = {
  1: forActual,
  2: forActualAndExpected,
  3: forActualAndTwoExpected
};

function forActual(name, matcher) {
  return function (util) {
    return {
      compare: function (actual, optionalMessage) {
        var passes = matcher(actual);
        return {
          pass: passes,
          message: (
            optionalMessage ?
            util.buildFailureMessage(name, passes, actual, optionalMessage) :
            util.buildFailureMessage(name, passes, actual)
          )
        };
      }
    };
  };
}

function forActualAndExpected(name, matcher) {
  return function (util) {
    return {
      compare: function (actual, expected, optionalMessage) {
        var passes = matcher(expected, actual);
        return {
          pass: passes,
          message: (
            optionalMessage ?
            util.buildFailureMessage(name, passes, actual, expected, optionalMessage) :
            util.buildFailureMessage(name, passes, actual, expected)
          )
        };
      }
    };
  };
}

function forActualAndTwoExpected(name, matcher) {
  return function (util) {
    return {
      compare: function (actual, expected1, expected2, optionalMessage) {
        var passes = matcher(expected1, expected2, actual);
        return {
          pass: passes,
          message: (
            optionalMessage ?
            util.buildFailureMessage(name, passes, actual, expected1, expected2, optionalMessage) :
            util.buildFailureMessage(name, passes, actual, expected1, expected2)
          )
        };
      }
    };
  };
}

},{}],7:[function(require,module,exports){
module.exports = {
  2: forKeyAndActual,
  3: forKeyAndActualAndExpected,
  4: forKeyAndActualAndTwoExpected
};

function forKeyAndActual(name, matcher) {
  return function (util) {
    return {
      compare: function (actual, key, optionalMessage) {
        var passes = matcher(key, actual);
        return {
          pass: passes,
          message: util.buildFailureMessage(name, passes, actual, optionalMessage || key)
        };
      }
    };
  };
}

function forKeyAndActualAndExpected(name, matcher) {
  return function (util) {
    return {
      compare: function (actual, key, expected, optionalMessage) {
        var passes = matcher(key, expected, actual);
        var message = (optionalMessage ?
          util.buildFailureMessage(name, passes, actual, expected, optionalMessage) :
          util.buildFailureMessage(name, passes, actual, expected)
        );
        return {
          pass: passes,
          message: formatErrorMessage(name, message, key)
        };
      }
    };
  };
}

function forKeyAndActualAndTwoExpected(name, matcher) {
  return function (util) {
    return {
      compare: function (actual, key, expected1, expected2, optionalMessage) {
        var passes = matcher(key, expected1, expected2, actual);
        var message = (optionalMessage ?
          util.buildFailureMessage(name, passes, actual, expected1, expected2, optionalMessage) :
          util.buildFailureMessage(name, passes, actual, expected1, expected2)
        );
        return {
          pass: passes,
          message: formatErrorMessage(name, message, key)
        };
      }
    };
  };
}

function formatErrorMessage(name, message, key) {
  if (name.search(/^toHave/) !== -1) {
    return message
      .replace('Expected', 'Expected member "' + key + '" of')
      .replace(' to have ', ' to be ');
  }
  return message;
}

},{}],8:[function(require,module,exports){
var matcherFactory = require('./matcherFactory');
var memberMatcherFactory = require('./memberMatcherFactory');

module.exports = {
  getAdapters: function (globals) {
    return {
      1: createFactory(getAdapter(1)),
      2: createFactory(getAdapter(2)),
      3: createFactory(getAdapter(3)),
      4: createFactory(getAdapter(4))
    };

    function createFactory(adapter) {
      return function (name, matcher) {
        var matchersByName = {};
        matchersByName[name] = adapter(name, matcher);
        globals.expect.extend(matchersByName);
        return matchersByName;
      };
    }

    function getAdapter(argsCount) {
      return function (name, matcher) {
        var factory = isMemberMatcher(name) ? memberMatcherFactory : matcherFactory;
        return factory[argsCount](name, matcher);
      };
    }

    function isMemberMatcher(name) {
      return name.search(/^toHave/) !== -1;
    }
  }
};

},{"./matcherFactory":9,"./memberMatcherFactory":10}],9:[function(require,module,exports){
module.exports = {
  1: adapterForActual,
  2: adapterForActualAndExpected,
  3: adapterForActualAndTwoExpected
};

function adapterForActual(name, matcher) {
  return function (received) {
    var pass = matcher(received);
    var infix = pass ? ' not ' : ' ';
    var message = 'expected ' + this.utils.printReceived(received) + infix + getLongName(name);
    return {
      message: function () {
        return message;
      },
      pass: pass
    };
  };
}

function adapterForActualAndExpected(name, matcher) {
  return function (received, expected) {
    var pass = matcher(expected, received);
    var infix = pass ? ' not ' : ' ';
    var message = 'expected ' + this.utils.printReceived(received) + infix + getLongName(name) + ' ' + this.utils.printExpected(expected);
    return {
      message: function () {
        return message;
      },
      pass: pass
    };
  };
}

function adapterForActualAndTwoExpected(name, matcher) {
  return function (received, expected1, expected2) {
    var pass = matcher(expected1, expected2, received);
    var infix = pass ? ' not ' : ' ';
    var message = 'expected ' + this.utils.printReceived(received) + infix + getLongName(name) + ' ' + this.utils.printExpected(expected1) + ', ' + this.utils.printExpected(expected2);
    return {
      message: function () {
        return message;
      },
      pass: pass
    };
  };
}

function getLongName(name) {
  return name.replace(/\B([A-Z])/g, ' $1').toLowerCase();
}

},{}],10:[function(require,module,exports){
module.exports = {
  2: forKeyAndActual,
  3: forKeyAndActualAndExpected,
  4: forKeyAndActualAndTwoExpected
};

function forKeyAndActual(name, matcher) {
  return function (received, key) {
    var pass = matcher(key, received);
    var infix = pass ? ' not ' : ' ';
    var message = 'expected member "' + key + '" of ' + this.utils.printReceived(received) + infix + getLongName(name);
    return {
      message: function () {
        return message;
      },
      pass: pass
    };
  };
}

function forKeyAndActualAndExpected(name, matcher) {
  return function (received, key, expected) {
    var pass = matcher(key, expected, received);
    var infix = pass ? ' not ' : ' ';
    var message = 'expected member "' + key + '" of ' + this.utils.printReceived(received) + infix + getLongName(name) + ' ' + this.utils.printExpected(expected);
    return {
      message: function () {
        return message;
      },
      pass: pass
    };
  };
}

function forKeyAndActualAndTwoExpected(name, matcher) {
  return function (received, key, expected1, expected2) {
    var pass = matcher(key, expected1, expected2, received);
    var infix = pass ? ' not ' : ' ';
    var message = 'expected member "' + key + '" of ' + this.utils.printReceived(received) + infix + getLongName(name) + ' ' + this.utils.printExpected(expected1) + ', ' + this.utils.printExpected(expected2);
    return {
      message: function () {
        return message;
      },
      pass: pass
    };
  };
}

function getLongName(name) {
  return name.replace(/\B([A-Z])/g, ' $1').toLowerCase();
}

},{}]},{},[1]);
