var path = require('path');

(function() {
    'use strict';
    function JasmineMatchers(files, basePath, matcherPaths) {
        if (matcherPaths) {
            matcherPaths.forEach(function(matcherPath) {
                /*var filePath = false;
                try{
                    filePath = require.resolve(matcherPath);
                }catch(e){
                    try{
                        filePath = require.resolve(path.join(basePath, 'node_modules', matcherPath));
                    }catch(e){

                    }
                }*/

                /*if (filePath) {
                    files.push({
                        pattern: filePath,
                        included: true,
                        served: true,
                        watched: false,
                    });
                }*/

                files.push({
                    pattern: path.join(__dirname, 'dist/index.js'),
                    included: true,
                    served: true,
                    watched: false,
                });
            });
        }
        console.log(files);
    }

    JasmineMatchers.$inject = ['config.files', 'config.basePath', 'config.jasmineMatchers'];

    module.exports = {
        'framework:jasmine-matchers': ['factory', JasmineMatchers]
    };

}());
