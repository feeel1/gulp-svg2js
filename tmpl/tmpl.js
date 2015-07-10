/*
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
 * Copyright 2014-2015 Alexander Madyankin <alexander@madyankin.name>, Roman Shamin <al4emist.artway@gmail.com>, Sergei Vasilev <sergen-vas@yandex.ru>
 */

(function(document){
  "use strict";

  function renderData() {
    var SVG = %SVG_SPRITE%;
    var STYLE = %STYLE%;

    document.querySelector("head").insertAdjacentHTML("afterbegin", STYLE);
    document.querySelector("body").insertAdjacentHTML("afterbegin", SVG);
  };

  function mods(mod) {
    var mods = mod.split(',');
    var result = "";

    for (var i = 0; i < mods.length; i++) {
      result += " icon--"+ mods[i];
    };
    
    return result;
  };

  function icon(name, options) {
    var options = options || {};
    var mod    = options.mod ? mods(options.mod) : "";
    var klass   = "icon icon--"+ name +" "+ mod +" "+ (options['class'] || "");


    var icon =  "<svg class='icon__cnt'>"+
                  "<use xlink:href='#icon-"+ name +"' />"+
                "</svg>";

    var html =  "<div class='" + klass + "'>"+
                  wrapSpinner(icon, klass) +
                "</div>";

    return html;
  };

  function wrapSpinner(html, klass) {
    if (klass.indexOf("spinner") > -1) {
      return "<div class='icon__spinner'>"+ html +"</div>";
    } else {
      return html;
    };
  };

  function renderIcons() {
    var render = true;
    var icons = document.querySelectorAll("[data-icon]");

    for (var i = 0; i < icons.length; i++) {
      var currentIcon = icons[i];
      var name        = currentIcon.getAttribute("data-icon");
      var options = {
        'class':  currentIcon.className,
        mod:   currentIcon.getAttribute("data-mod")
      };

      currentIcon.insertAdjacentHTML("beforebegin", icon(name, options));
      currentIcon.parentNode.removeChild(currentIcon);
    };
  };

  function ready() {
    renderData();
    renderIcons();
  };

  if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", ready, false);
  };

})(window.document);
