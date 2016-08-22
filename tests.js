
QUnit.test( "hello test", function( assert ) {
  assert.ok( 1 == "1", "Passed!" );
});


//////////////////////////////////////////
// dxtests
//////////////////////////////////////////

QUnit.test("createApp", function( assert ){
  var app = dx.createApp();
  assert.deepEqual(app['screens'], {});
});

QUnit.test("createScr", function( assert ){
  var app = dx.createApp();
  var scr = dx.createScr(app);
  assert.deepEqual(scr.name, '');
  assert.deepEqual(scr.app.screens, {});
});

QUnit.test("createHoriFrm", function( assert ){
  var app = dx.createApp();
  var scr = dx.createScr(app);
  var frm = dx.createHoriFrm(scr);
  assert.deepEqual(frm.scr.name, '');
  assert.deepEqual(frm.scr.app.screens, {});
});

QUnit.test("createVertFrm", function( assert ){
  var app = dx.createApp();
  var scr = dx.createScr(app);
  var frm = dx.createVertFrm(scr);
  assert.deepEqual(frm.scr.name, '');
  assert.deepEqual(frm.scr.app.screens, {});
});

QUnit.test("createWid", function( assert ){
  var app = dx.createApp();
  var scr = dx.createScr(app);
  var frm = dx.createHoriFrm(scr);
  var wid = dx.createWid(frm);
  assert.deepEqual(wid.frm.scr.app.screens, {});
  assert.deepEqual(wid.frm.scr.name, '');
});

QUnit.test("set screen name", function( assert ){
  var scr = dx.createScr();
  dx.setScrName(scr, 'hello');
  assert.deepEqual(scr.name,'hello' );
});

QUnit.test("$el in app", function( assert ){
  var app = dx.createApp();
  assert.deepEqual(app.$app.attr("class"),"app" );
});

QUnit.test("$el in screen", function( assert ){
  var scr = dx.createScr();
  assert.deepEqual(scr.$scr.attr("class"),"scr" );
});

QUnit.test("$el in widget", function( assert ){
  var wid = dx.createWid();
  assert.deepEqual(wid.$wid.attr("class"),"wid" );
});

QUnit.test("add screen to app", function( assert ){
  var app = dx.createApp();
  var scr = dx.createScr();
  dx.setScrName(scr, 'scrName');
  dx.addScrToApp(scr, app);
  assert.deepEqual(app.screens['scrName'].name,'scrName' );
});

QUnit.test("widget in hori frame", function( assert ){
  var app = dx.createApp();
  var scr = dx.createScr(app);
  var frm = dx.createHoriFrm(scr);
  var wid = dx.createWid(frm);
  
  dx.setFrmTtlWgt(frm, 10);
  dx.addItemBelowFrm(wid, frm, 10);

  assert.deepEqual(frm.ttlWgt, 10);
  assert.deepEqual(frm.children[0].wgt, 10);
});

QUnit.test("setAppHomeScr", function( assert ){
  var app = dx.createApp();
  dx.setAppHomeScr(app, 'bookScr');
  assert.deepEqual(app.homeScr, 'bookScr');
});

QUnit.test("add root frame to screen", function( assert ){
  var scr = dx.createScr();
  var rFrm = dx.createHoriFrm(scr);
  dx.addRFrmToScr(rFrm, scr);
  assert.deepEqual(scr.rFrm, rFrm);
});

QUnit.test("test type", function( assert ){
  var app = dx.createApp();
  assert.deepEqual(app.type, 'app');
  var scr = dx.createScr();
  assert.deepEqual(scr.type, 'scr');
  var frm = dx.createHoriFrm();
  assert.deepEqual(frm.type, 'horiFrm');
});


//////////////////////////////////////////
// dstests
//////////////////////////////////////////

QUnit.test("test getViewportSize", function( assert ){
  var vps = ds.getVps();
  assert.deepEqual(vps.height, $(window).height());
  assert.deepEqual(vps.width, $(window).width());
});

QUnit.test("test loadBook", function( assert ){
  localStorage.clear();
  localStorage.setItem('localBookDict', JSON.stringify({'dummyBook':'content'}));
  localStorage.setItem('curBookFilename', 'dummyBook') ;
  assert.deepEqual(ds.loadBook(), 'content');
  localStorage.clear();
});

QUnit.test("test saveBook", function( assert ){
  localStorage.clear();
  book = {'bookFilename':'dummyBookFilename'};
  ds.saveBook(book);
  assert.deepEqual(
    JSON.parse(localStorage.getItem('localBookDict'))['dummyBookFilename'], 
    book
  );
});
