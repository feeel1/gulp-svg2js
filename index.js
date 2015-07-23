var fs = require('fs');
var path = require('path');

var through2 = require('through2');
var cheerio = require('cheerio');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var SVGO = require('svgo');
var svgo = new SVGO({
  plugins: [{
    mergePaths: false
  }]
});


function svg2js (opts) {

  const PLUGIN_NAME = 'gulp-svg2js';
  const FILES_NAME = 'icons';
  const LINE_LENGTH = 60;

  var filePath = 'node_modules/'+ PLUGIN_NAME + '/';

  if (!opts) {
    var opts = {};
  };

  opts.cssTmpl = opts.cssTmpl || filePath +'tmpl.css';
  opts.jsTmpl = opts.jsTmpl || filePath +'tmpl.js';

  var ids = {};

  var $ = cheerio.load('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: none" />', { xmlMode: true });
  var combinedSvg = $('svg');

  var stream = through2.obj(

    function transform (file, encoding, cb) {

      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      };

      file.path = 'icon-'+ path.basename(file.path);

      svgo.optimize(String(file.contents), function(result) {
        if (!file.cheerio) {
          file.cheerio = cheerio.load(new Buffer(result.data), { xmlMode: true });
        };
      });

      var svg = file.cheerio('svg');
      var idAttr = path.basename(file.relative, path.extname(file.relative));
      var viewBoxAttr = svg.attr('viewBox');
      var symbol = $('<symbol/>');

      if (idAttr in ids) {
        return cb(new PluginError(PLUGIN_NAME, 'File name should be unique: ' + idAttr));
      };

      ids[idAttr] = true;

      symbol.attr('id', idAttr);
      
      if (viewBoxAttr) {
        symbol.attr('viewBox', viewBoxAttr);
      };

      symbol.append(svg.contents());
      combinedSvg.append(symbol);
      cb();
    },

    function flush (cb) {
      var svg = closeTags($.html());
      var sprite = new gutil.File({
        path: FILES_NAME +'.svg',
        contents: new Buffer(svg)
      });

      fs.readFile(opts.jsTmpl, function (err, script)
      {
        if (err) {
          throw err;
        };

        script = script.toString();
        script = script.replace(/%SVG_SPRITE%/, svgPrepare(svg));

        fs.readFile(opts.cssTmpl, function (err, style)
        {
          if (err) {
            throw err;
          };

          style = style.toString();
          script = script.replace(/%STYLE%/, stylesPrepare(style));

          finish(sprite, script, cb);
        });
      });
    }
  );

  // финальное создание файлов и окончание работы задачи
  function finish(sprite, script, cb) {
    stream.push(new gutil.File({
      path: FILES_NAME +'.html',
      contents: new Buffer(demoPrepare(ids, script))
    }));

    stream.push(new gutil.File({
      path: FILES_NAME +'.js',
      contents: new Buffer(script)
    }));

    sprite.cheerio = $;
    stream.push(sprite);
    cb();
  };

  // подготовка к встраиванию свг
  function svgPrepare(data) {
    var svg = [], i, l;

    data = data.replace(/'/g, "\\'");
    data = data.replace(/>\s+</g, "><").trim();
    l = Math.ceil(data.length / LINE_LENGTH);

    for (i = 0; i < l; i++)
    {
      svg.push("'" + data.substr(i * LINE_LENGTH, LINE_LENGTH) + "'");
    };

    return svg.join('+\n');
  };

  // подготовка к встраиванию стилей
  function stylesPrepare(data) {
    var styles = [], i, l;

    data = '<style>'+ data +'</style>';
    data = data.replace(/\n/g, "");
    data = data.replace(/\s+/g, " ");
    data = data.replace(/'/g, "\\'");
    data = data.replace(/>\s+</g, "><").trim();
    l = Math.ceil(data.length / LINE_LENGTH);

    for (i = 0; i < l; i++)
    {
      styles.push("'" + data.substr(i * LINE_LENGTH, LINE_LENGTH) + "'");
    };

    return styles.join('+\n');
  };

  // подготовка демонстрационного файла
  function demoPrepare(ids, script) {
    var result =
    '<!DOCTYPE html>'+
      '<html>'+
        '<head>'+
          '<meta charset="UTF-8">'+
          '<title>Icons preview</title>'+
          '<script type="text/javascript" src="js/jquery-2.1.1.js"></script>'+
          '<script type="text/javascript" src="js/jquery.browser.min.js"></script>'+
          '<script>'+ script +'</script>'+
          '<style>html {font-family: sans-serif;} .Preview {display: inline-block; margin: 1em; text-align: center; vertical-align: top;}</style>'+
        '</head>'+
        '<body>';

    for (var id in ids) {
      result += '<div class="Preview"><div data-icon="'+ id.replace('icon-', '') +'"></div><div class="Preview__label">'+ id.replace('icon-', '') +'</div></div>';
    };
    result += '</body></html>';

    return result;
  };

  // добавление закрывающего тега для самозакрывающихся
  function closeTags(data) {
    var split = data.split("/>");
    var result = "";

    for (var i = 0; i < split.length - 1;i++) {
      var edsplit = split[i].split("<");
      result += split[i] + "></" + edsplit[edsplit.length - 1].split(" ")[0] + ">";
    };
    return result + split[split.length - 1];
  };

  return stream;
};

module.exports = svg2js;
