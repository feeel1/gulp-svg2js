# gulp-svg2js
sprite svg подключение через js

Gulp task
---------
```js
var gulp = require('gulp');
var svgs = require('gulp-svg2js');

gulp.task('svgsprite', function(){
    return gulp.src('icons/*.svg')
        .pipe(svgs({
            jsTmpl: 'tmpl/tmpl.js',
            cssTmpl: 'tmpl/tmpl.css'
        }))
        .pipe(gulp.dest('dest'));
});

gulp.task('default', ['svgsprite']);
```
--------
- `icons.svg` — спрайт из svg
- `icons.js` — скрипт вместе с svg
- `icons.html` — демо фаил для просмотра

- `tmpl.js` — шаблон скрипта
- `tmpl.css` — шаблон стилей его можно дописывать и редоктировать, эти стили попадают icons.js


В разметке объявите заглушку для пиктограммы. У неё два параметра:
- `data-icon` для указания имени пиктограммы
- `data-mod` для добавления модификатора. Несколько модификаторов указываются через запятую.

Html разметка.

```html
<div data-icon="phone" data-mod="size-m,actions-phone"></div>
```

будет преобразована скриптом в это

```html
<div class="icon icon--phone icon--size-m icon--actions-phone"><svg class="icon__cnt"><use xlink:href="#icon-phone"/></svg></div>
```