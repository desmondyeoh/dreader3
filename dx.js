function dx() {}
function dh() {} // helper


//////////////////////////////////////////
// dxapp
//////////////////////////////////////////

dx.createApp = function() {
  var app = {};
  app.type = 'app';
  app.$app = $('<div class="app">');
  app.screens = {};
  app.homeScr = '';
  return app;
}

dx.setAppHomeScr = function(app, scrName) {
  app.homeScr = scrName;
}

dx.runApp = function(app) {
  localStorage.clear();
  if (localStorage.getItem('curScrName')) {
    var curScr = app.screens[ds.lsto.load('curScrName')];
    dx.gotoScr(curScr);
  }
  else {
    dx.gotoScr(app.screens[app.homeScr]);
  }
}


//////////////////////////////////////////
// dxscreen
//////////////////////////////////////////

dx.createScr = function (app) {
  var scr = {};
  scr.app = app;
  scr.type = 'scr';
  scr.$scr = $('<div class="scr">');
  scr.name = '';
  scr.rFrm = null;
  scr.opt  = {};
  return scr;
}

dx.setScrName = function(scr, name) {
  scr.name = name;
}

dx.addScrToApp = function(scr, app) {
  var scrName = scr.name;
  app.screens[scrName] = scr;
}

dx.gotoScr = function(scr, opt) {
  ds.lsto.save('curScrName', scr.name);
  scr.opt = opt;
  $('body').empty().append(scr.$scr);
  dh.initMod();
  dh.initFrm(scr.rFrm);
}

//////////////////////////////////////////
// dxframe
//////////////////////////////////////////

dx.createVertFrm = function(scr) {
  var frm = {};
  frm.scr = scr;
  frm.type = 'vertFrm';
  frm.ttlWgt = 0;
  frm.width = 0;
  frm.height = 0;
  frm.children = [];
  return frm;
}

dx.createHoriFrm = function(scr) {
  var frm = {};
  frm.type = 'horiFrm';
  frm.scr = scr;
  frm.ttlWgt = 0;
  frm.width = 0;
  frm.height = 0;
  frm.children = [];
  return frm;
}

dx.setFrmTtlWgt = function(frm, ttlWgt) {
  frm.ttlWgt = ttlWgt;
}

dx.addItemAboveFrm = function(item, frm, wgt) {
  frm.children.unshift( { item, wgt } );
}

dx.addItemBelowFrm = function(item, frm, wgt) {
  frm.children.push( { item, wgt } );
}

dx.addItemLeftFrm = function(item, frm, wgt) {
  frm.children.unshift( { item, wgt } );
}

dx.addItemRightFrm = function (item, frm, wgt) {
  frm.children.push( { item, wgt } );
}

dx.addRFrmToScr = function(rFrm, scr) {
  scr.rFrm = rFrm;
}

//////////////////////////////////////////
// dxwidget
//////////////////////////////////////////

dx.createWid = function (frm) {
  var wid = {};
  wid.frm = frm;
  wid.type = 'wid';
  wid.width = 0;
  wid.height = 0;
  wid.$wid = $('<div class="wid">');
  wid.loadWid = function() {};

  return wid;
}


//////////////////////////////////////////
// initer
//////////////////////////////////////////

dh.initFrm = function(parentFrm, parentSize) {
  for (var i = 0, l = parentFrm.children.length; i < l; i++) {
    var child = parentFrm.children[i];
    var parentSize = parentSize || ds.getVps();
    var childSize = dh.getChildSize(child, parentFrm, parentSize);

    if (child.item.type === 'vertFrm' || child.item.type === 'horiFrm') {
      dh.initFrm(child.item, childSize);
    }
    else if (child.item.type === 'wid') {
      dh.initWid(child.item, childSize);
    }
  }
}

dh.initWid = function(wid, size) {
  wid.$wid.empty();
  wid.$wid.outerWidth(size.width);
  wid.$wid.outerHeight(size.height);
  wid.frm.scr.$scr.append(wid.$wid);
  wid.loadWid();
}

dh.getChildSize = function (child, parentFrm, parentSize) {
  var wgt = child.wgt;
  var ttlWgt = parentFrm.ttlWgt;
  if (parentFrm.type === 'vertFrm') {
    var width = parentSize.width;
    var height = Math.floor(parentSize.height * wgt / ttlWgt);
  }
  else if (parentFrm.type === 'horiFrm') {
    var width = Math.floor(parentSize.width * wgt / ttlWgt);
    var height = parentSize.height;
  }
  return {width, height};
}

dh.initMod = function(){
  $mod = $('<div id="mod">');
  $innerMod = $('<div id="inner-mod">');
  $mod.allowScrollingY();
  $mod.append($innerMod);
  $mod.hide();
  $mod.hammer().on('swipe', function(e) {
    $mod.hide();
  });
  $('body').append($mod);
}

//////////////////////////////////////////
// globalutil
//////////////////////////////////////////



//////////////////////////////////////////
// jqext
//////////////////////////////////////////

// $.allowScrolling: depends on iNoBounce.js
jQuery.fn.allowScrollingX = function() {
  var $el = this;
  $el.css({
    'overflow-x':'auto', 
    'overflow-y':'hidden', 
    '-webkit-overflow-scrolling':'touch'
  });
  return $el;
}
jQuery.fn.allowScrollingY = function() {
  var $el = this;
  $el.css({
    'overflow-x':'hidden', 
    'overflow-y':'auto', 
    '-webkit-overflow-scrolling':'touch'
  });
  return $el;
}
jQuery.fn.allowScrolling = function() {
  var $el = this;
  $el.css({
    'overflow':'auto', 
    '-webkit-overflow-scrolling':'touch'
  });
  return $el;
}
