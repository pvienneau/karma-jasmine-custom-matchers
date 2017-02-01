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
