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
  var $shelf = $('<div class="shelf">');
  shelfWid.$wid.append($shelf);

  var bs = new ds.BookServer(window.location.href+'books');
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
panelWid.loadWid = function() {
  panelWid.$wid.addClass('panel');
  panelWid.$wid.allowScrollingY();
  var $panel = $('<div id="inner-top-panel">');
  panelWid.$wid.append($panel);
}

pageWid.loadWid = function() {
  var book = {};
  var bookFilename = '';
  var $progressBar = $('<div id="progress-bar">23.3%</div>');
  pageWid.$wid.append($progressBar);
  var $innerPage = $('<div id="inner-page">');
  pageWid.$wid.append($innerPage);

  // getting book filename
  // if coming from lib, get bookFilename
  if (typeof pageWid.frm.scr.opt !== 'undefined'){
    console.debug("coming from lib");
    bookFilename = pageWid.frm.scr.opt.bookFilename;
    localStorage.setItem('curBookFilename', bookFilename);
  }
  // else, if user is reading, get bookFilename from local storage
  else if (localStorage.getItem('curBookFilename')) {
    console.debug("currently reading");
    bookFilename = localStorage.getItem('curBookFilename');
  }

  // getting book text
  // if book is saved locally: load book from local storage
  if (localStorage.getItem('localBookDict') &&
      ds.lsto.load('localBookDict')[bookFilename]){
    // viewport unchanged
    if (localStorage.getItem('oldVps') && 
       (JSON.stringify(ds.lsto.load('oldVps')) === JSON.stringify(ds.getVps()))) {
      console.debug("book saved locally, viewport unchanged");
      book = ds.lsto.load('localBookDict')[bookFilename];
      getBookTextDone();
    }
    // viewport changed
    else{
      console.debug("book saved locally, viewport changed");
      book = ds.lsto.load('localBookDict')[bookFilename];
      var oldNumPages = book.pages.length;
      var pg = new ds.Paginator();
      pg.setContainer($innerPage);
      pg.paginate(book);
      ds.repositionPaperclip(book, oldNumPages);
      ds.saveBook(book);
      ds.lsto.save('oldVps', ds.getVps());
      getBookTextDone();
      // clear highlight stuff
      localStorage.removeItem('isHlMode');
      localStorage.removeItem('hlWordId');
      localStorage.removeItem('hlPc');
    }
  }
  // if book not saved locally, load book from server 
  // then save filename; create, paginate, save book; save vps
  else {
    $innerPage.html('<span style="font-size:0.4em">Loading <b>'+bookFilename+'</b> from the server.<br>This might take a while the first time.<br> Please be patient :)</span>');
    console.debug("book not saved locally");
    var bs = new ds.BookServer(window.location.href+'books');
    bs.loadBookText(bookFilename, function(bookText){
      localStorage.setItem('curBookFilename', bookFilename);
      book = new ds.model.Book(bookFilename, bookText);
      var pg = new ds.Paginator();
      pg.setContainer($innerPage);
      pg.paginate(book);
      ds.saveBook(book);
      ds.lsto.save('oldVps', ds.getVps());
      getBookTextDone();
    });
  }

  function getBookTextDone(){
    
    updateProgress();
    showPPTWordByWord();
    bindWordEvents();

    function updateProgress() {
      // var percent = parseFloat(Math.round(book.paperclip/book.pages.length*10000)/100).toFixed(2);
      var fraction = book.paperclip + ' / '+book.pages.length;
      $('#progress-bar').text(fraction);
    }

    function showPPTWordByWord() {
      console.debug("showPPTWordByWord|book:", book);
      var words = ds.getBookPPT(book).trim().replace("\n", "").split(" ");
      $innerPage.empty();
      for (var i = 0, l = words.length; i < l; i++) {
        var word = words[i];
        var $word = $('<span class="word pageword" id="w'+i+'">'+word+'</span>');
        $innerPage.append($word);
        $innerPage.append(' ');
      }
    }

    function bindWordEvents() {
      // delay binding click to prevent auto dictionary search
      setTimeout(function(){
        $('.word').off('click');
        $('.word').click(function(e) {
          // if highlight, click=highlight
          // if highlighted a word
          if (localStorage.getItem('isHlMode')){
            console.debug("Hl mode on");
            // samewordhl
            if(localStorage.getItem('hlWordId')===e.target.id &&
               parseInt(localStorage.getItem('hlPc'))===book.paperclip){
              console.log('highlighted before');
            }
            // 2wordhl
            else if(localStorage.getItem('hlWordId')!==null){
              e.target.style.background = 'yellow';
              console.debug("not highlighted before, getting text in between");
              var wordPosA = [
                parseInt(localStorage.getItem('hlPc')),
                parseInt(localStorage.getItem('hlWordId').replace('w',''))
              ];
              var wordPosB = [
                book.paperclip,
                parseInt(e.target.id.replace('w', ''))
              ];
              // get text in between
              var selections = [wordPosA, wordPosB].sort(function sortByIndex(a, b){
                if (a[0]>b[0]){return 1}
                else if (a[0]<b[0]){return -1}
                else if (a[1]>b[1]){return 1}
                return -1;
              });

              var firstWordPos = selections[0]; 
              var lastWordPos = selections[1];
              var hlText = '';
              // samepc
              if (firstWordPos[0]===lastWordPos[0]){
                var paperclip = firstWordPos[0];
                hlText = book.pages[paperclip -1].
                  replace("\n",' ').
                  split(' ').
                  slice(firstWordPos[1], lastWordPos[1]+1).
                  join(' ');
                console.debug("desc|hlText:", hlText);
              }
              // diffpc
              else{
                var words = '';
                var diffPc = lastWordPos[1] - firstWordPos[1];
                var firstPc = firstWordPos[0];
                var firstPageText = book.pages[firstPc-1].
                  replace("\n", ' ').
                  split(' ').
                  slice(firstWordPos[1]).
                  join(' ');
                var lastPc = lastWordPos[0];
                var lastPageText = book.pages[lastPc-1].
                  replace("\n", ' ').
                  split(' ').
                  slice(0, lastWordPos[1]+1).
                  join(' ');
                var middlePagesText = ' ';
                for (var i = firstPc , l = lastPc -1; i<l; i++){
                  middlePagesText += book.pages[i] + ' ';
                }
                hlText = firstPageText + middlePagesText + lastPageText;
                console.debug("desc|hlText:", hlText);
              }

              // update inner-top-panel
              book.hlTextList.push([firstWordPos, hlText]);
              book.hlTextList.sort(function(a,b){
                if(a[0] > b[0]) return 1;
                else return -1;
              });
              ds.saveBook(book);
              console.debug("desc|hlTextList:", book.hlTextList);
              var panelHTML = '<b>Highlighted Text</b></br>' + hlText;
              $('#inner-top-panel').html(panelHTML);
              

              // switch off hl mode
              console.debug("Hl mode switching OFF");
              localStorage.removeItem('isHlMode');
              localStorage.removeItem('hlPc');
              localStorage.removeItem('hlWordId');
              $('#hltNb').css({'background':''});

            }
            // 1wordhl
            else{
              $('#inner-top-panel').text('Highlight Mode is ON');
              e.target.style.background = 'yellow';
              localStorage.setItem('hlWordId', e.target.id);
              localStorage.setItem('hlPc', book.paperclip);
            }
          }
          // if not highlight, click=dict
          else{
            var pureWord = e.target.innerHTML.replace(/[:., ]+/g, "");
            console.debug("desc|pureWord:", pureWord);
            $panel = $('#inner-top-panel');
            $panel.empty();
            $panel.html('Looking for <b>'+pureWord+'</b> in dictionary...');
            // search for word in dictionary
            var dt = new ds.Dictionary();
            dt.defineWord(pureWord, function(entryList) {
              var panelHTML = '';
              // if word not found in dictionary
              if (entryList.length === 0){
                panelHTML = '<p>Sorry, the word <b>'+pureWord+'</b> is not found in the dictionary.</p>';
              } 
              // if word is found in dictionary
              else {
                for (var i = 0, j = entryList.length; i < j; i++) {
                  panelHTML += '<b>'+entryList[i].ew+'</b>';
                  panelHTML += '<em> '+entryList[i].fl+'</em>';
                  panelHTML += '<br>';
                  for (var k = 0, l = entryList[i].defs.length; k < l; k++) {
                    panelHTML += '<span>: ';
                    // append each def word by word
                    var defWords = entryList[i].defs[k].split(" ");
                    for (var m = 0, n = defWords.length; m < n; m++) {
                      panelHTML += '<span class="word">'+defWords[m]+" </span>";
                    }
                    panelHTML += '</span>';
                    panelHTML += '<br>';
                  }
                  panelHTML += '<br>';
                }
              }
            $panel.html(panelHTML);
            bindWordEvents(); 
            }); // end defineWord callback
          } // end "not highlight"
        }); // end word click handler
      }, 200); // end setTimeout
    }

    // bind page events
    $innerPage.hammer().on('swipeleft', function(){
      if ( book.paperclip < book.pages.length) {
        // reload book;
        book = ds.loadBook();
        book.paperclip++;
        ds.saveBook(book);
        updateProgress();
        showPPTWordByWord();
        bindWordEvents();
      }
    });
    $innerPage.hammer().on('swiperight', function(){
      if ( book.paperclip > 1 ) {
        // reload book;
        book = ds.loadBook();
        book.paperclip--;
        ds.saveBook(book);
        updateProgress();
        showPPTWordByWord();
        bindWordEvents();
      }
    });
  }
}

bookNavWid.loadWid = function() {
  bookNavWid.$wid.empty();
  bookNavWid.$wid.addClass('navbar');

  // goLib
  var $goLibNb = $('<div class="navbtn"><img src="'+window.location.href+'/icons/lib.svg"/></div>');
  $goLibNb.hammer().on('click', function(){dx.gotoScr(libScr)});
  bookNavWid.$wid.append($goLibNb);

  // hlt
  var $hltNb = $('<div class="navbtn" id="hlt-nb"><img src="'+window.location.href+'/icons/hlite.svg"/></div>');
  if (localStorage.getItem('isHlMode')){
    $hltNb.css({'background':'yellow'});
  };
  $hltNb.hammer().on('click', function(){
    if( localStorage.getItem('isHlMode') ) {
      console.debug("highlight mode OFF");
      localStorage.removeItem('isHlMode');
      localStorage.removeItem('hlWordId');
      localStorage.removeItem('hlPc');
      $hltNb.css({'background':''});
    } else {
      console.debug("highlight mode ON");
      localStorage.setItem('isHlMode', true);
      $hltNb.css({'background':'yellow'});
    }
  });
  bookNavWid.$wid.append($hltNb);

  // hlText
  var $hlTextNb = $('<div class="navbtn" id="hl-text-nb"><img src="'+window.location.href+'/icons/hlited.svg"/></div>');
  $hlTextNb.hammer().on('click',  function(e) {
    console.debug("clicked");
    $('#outer-mod').show();
    $innerMod = $('#inner-mod');
    (function showHlTextList(){
      $innerMod.empty();
      $innerMod.append('<b>HiLites</b><br><br>');
      var book = ds.loadBook();
      var hlTextList = book.hlTextList;
      for(var i=0, l=hlTextList.length; i<l; i++){
        var hlText = hlTextList[i];
        console.debug("desc|hlText:", hlText);
        $innerMod.append(hlText[1] + '<br>');
        delBtnEl = document.createElement('button');
        delBtnEl.value = hlText[0];
        delBtnEl.textContent = 'Del';
        // delbtn click
        delBtnEl.addEventListener('click', function(e){
          console.debug("desc|e:", e.target.value);
          // find el to delete in hl text list, del, save
          for(var m=0, n=hlTextList.length; m<n; m++){
            if(String(hlTextList[m][0])==e.target.value){
              hlTextList.splice(m, 1);
              console.debug("desc|book:", book);
              ds.saveBook(book);
              showHlTextList();
              break;
            }
          }
        });
        $innerMod.append(delBtnEl);
        $innerMod.append('<br><br>');
      }
    })();
  });
  bookNavWid.$wid.append($hlTextNb);

  // goPage
  var $goPageNb = $('<div class="navbtn" id="go-page-nb"><img src="'+window.location.href+'/icons/gotopage.svg"/></div>');
  $goPageNb.hammer().on('tap', function(e){
    var binSearchPanel = $('<div id="bin-search-panel">');
    var book = ds.loadBook();
  });
  bookNavWid.$wid.append($goPageNb);


}

//////////////////////////////////////////
// runapp
//////////////////////////////////////////

dx.runApp(app);
$(window).resize(function(){dx.runApp(app);});

});
