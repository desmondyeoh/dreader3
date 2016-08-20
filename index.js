$(document).ready(function(){

function dp(){};
var app = dx.createApp();
dx.setAppHomeScr(app, 'lib');


//////////////////////////////////////////
// libscr
//////////////////////////////////////////

var libScr = dx.createScr(app);
dx.setScrName(libScr, 'lib');
dx.addScrToApp(libScr, app);

var vFrm = dx.createVertFrm(libScr);
dx.setFrmTtlWgt(vFrm, 12);

var shelfWid = dx.createWid(vFrm);
dx.addItemBelowFrm(shelfWid, vFrm, 11);

var libNavWid = dx.createWid(vFrm);
dx.addItemBelowFrm(libNavWid, vFrm, 1);

dx.addRFrmToScr(vFrm, libScr);


//////////////////////////////////////////
// bookscr
//////////////////////////////////////////

var bookScr = dx.createScr(app);
dx.setScrName(bookScr, 'book');
dx.addScrToApp(bookScr, app);

var bvFrm = dx.createVertFrm(bookScr);
dx.setFrmTtlWgt(bvFrm, 12);

var panelWid = dx.createWid(bvFrm);
dx.addItemBelowFrm(panelWid, bvFrm, 3);

var pageWid = dx.createWid(bvFrm);
dx.addItemBelowFrm(pageWid, bvFrm, 8);

var bookNavWid = dx.createWid(bvFrm);
dx.addItemBelowFrm(bookNavWid, bvFrm, 1);
console.debug("desc|bvFrm:", bvFrm);

dx.addRFrmToScr(bvFrm, bookScr);


//////////////////////////////////////////
// loadwids
//////////////////////////////////////////

/* libloadwids
*****************************************/
shelfWid.loadWid = function(){
  var bs = new ds.BookServer('http://'+location.host+'/books');
  var $shelf = $('<div class="shelf">');
  shelfWid.$wid.append($shelf);

  bs.loadBookFilenames(function(bookFilename){
    $book = $('<div class="book">');
    $book.text(bookFilename);
    $shelf.append($book);
    // booktap
    $book.hammer().on('tap', function(){
      dx.gotoScr(bookScr, {bookFilename});
    });
  });
}

/* bookloadwids
*****************************************/
pageWid.loadWid = function() {
  var bs = new ds.BookServer('http://'+location.host+'/books');
  var pg = new ds.Paginator();
  var book = {};
  var bookFilename = '';
  var $page = $('<div class="page">');
  pageWid.$wid.append($page);

  // getting book filename
  if (typeof pageWid.frm.scr.opt !== 'undefined'){
    bookFilename = pageWid.frm.scr.opt.bookFilename;
  }
  else if (ds.lsto.isExist('curBookFilename')) {
    bookFilename = ds.lsto.load('curBookFilename');
  }

  // getting book text
  // if saved locally: load book from local storage
  if (ds.lsto.isExist('curBook') && ds.lsto.isExist('oldVps') && (JSON.stringify(ds.lsto.load('oldVps')) === JSON.stringify(ds.getVps()))) {
    book = ds.lsto.load('curBook');
    getBookTextDone();
  }
  // else: load book; save filename; create, paginate, save book; save vps
  else {
    bs.loadBookText(bookFilename, function(bookText){
      ds.lsto.save('curBookFilename', bookFilename);
      book = new ds.model.Book(bookFilename, bookText);
      pg.setContainer($page);
      pg.paginate(book);
      ds.lsto.save('curBook', book);
      ds.lsto.save('oldVps', ds.getVps());
      getBookTextDone();
    });
  }

  function getBookTextDone(){
    
    // show paperclipped page 
    $page.text( ds.getBookPPT(book) );

    // bind page events
    $page.hammer().on('swipeleft', function(){
      if ( book.paperclip < book.pages.length) book.paperclip++;
      ds.lsto.save('curBook', book);
      console.debug("desc|ds.lsto.load('curBook'):", ds.lsto.load('curBook'));
      $page.text( ds.getBookPPT(book) );
    });
    $page.hammer().on('swiperight', function(){
      if ( book.paperclip > 1 ) book.paperclip--;
      ds.lsto.save('curBook', book);
      console.debug("desc|ds.lsto.load('curBook'):", ds.lsto.load('curBook'));
      $page.text( ds.getBookPPT(book) );
    });
  }
}

//////////////////////////////////////////
// runapp
//////////////////////////////////////////

dx.runApp(app);
$(window).resize(function(){dx.runApp(app);});

});
