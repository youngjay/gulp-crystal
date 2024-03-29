'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var Buffer = require('buffer').Buffer;

var buildTagReg = function(tag) {
    return new RegExp('<' + tag + '(?:[^>]*)>([\\s\\S]*?)<\\/' + tag + '>', 'ig');
};

var REG_SCRIPT_TAG = buildTagReg('script');
var REG_STYLE_TAG = buildTagReg('style');


module.exports = function() {
    return through.obj(function(file, enc, callback) {
        file.path = gutil.replaceExtension(file.path, '.js');

        var html = file.contents.toString();
        var src = '';

        // extract script
        var scriptText = '';
        html = html.replace(REG_SCRIPT_TAG, function(a, b) {
            scriptText += '\n' + b.trim();
            return '';
        });

        if (scriptText) {
            // strip indent
            src += scriptText.replace(/\n    /g, '\n');
        }

        // extract style
        var cssText = '';
        html = html.replace(REG_STYLE_TAG, function(a, b) {
            cssText += '\n' + b.trim();
            return '';
        });

        if (cssText) {
            src += '\nexports.style = ' + JSON.stringify(cssText);
        }

        // extract html
        html = html.trim();

        if (html) {
            src += '\nexports.view = ' + JSON.stringify(html);
        }

        // add path
        src += '\nexports.path = ' + JSON.stringify(file.relative.substring(0, file.relative.indexOf('.')));


        file.contents = new Buffer(src);

        this.push(file)
        callback()
    })
};