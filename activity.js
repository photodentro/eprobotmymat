/*
Copyright (C) 2018 Alkis Georgopoulos <alkisg@gmail.com>.
SPDX-License-Identifier: CC-BY-SA-4.0*/

function onError(message, source, lineno, colno, error) {
  alert(sformat('Σφάλμα προγραμματιστή!\n'
    + 'message: {}\nsource: {}\nlineno: {}\ncolno: {}\nerror: {}',
  message, source, lineno, colno, error));
}

// ES6 string templates don't work in old Android WebView
function sformat(format) {
  var args = arguments;
  var i = 0;
  return format.replace(/{(\d*)}/g, function sformatReplace(match, number) {
    i += 1;
    if (typeof args[number] !== 'undefined') {
      return args[number];
    }
    if (typeof args[i] !== 'undefined') {
      return args[i];
    }
    return match;
  });
}

// Return an integer from 0 to num-1.
function random(num) {
  return Math.floor(Math.random() * num);
}

// Return a shuffled copy of an array.
function shuffle(a) {
  var result = a;
  var i;
  var j;
  var temp;

  for (i = 0; i < result.length; i += 1) {
    j = random(result.length);
    temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

function ge(element) {
  return document.getElementById(element);
}

function onResize(event) {
  var w = window.innerWidth;
  var h = window.innerHeight;
  if (w / h < 640 / 360) {
    document.body.style.fontSize = sformat('{}px', 10 * w / 640);
  } else {
    document.body.style.fontSize = sformat('{}px', 10 * h / 360);
  }
}

function doPreventDefault(event) {
  event.preventDefault();
}

function onHome(event) {
  window.history.back();
}

function onHelp(event) {
  ge('help').style.display = 'flex';
}

function onHelpHide(event) {
  ge('help').style.display = '';
}

function onAbout(event) {
  window.open('credits/index_DS_II.html');
}

function onFullScreen(event) {
  var doc = window.document;
  var docEl = doc.documentElement;
  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen
    || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen
    || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement
    && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
}

//--------------------------------------END OF VISUAL----------------------------
//--------------------------------------START LOGIC------------------------------
const FD = 0
const RT = 1
const BK = 2
const LT = 3
var imgName = ['./resource/go-fd.png','./resource/go-rt.png','./resource/go-bk.png','./resource/go-lt.png'];
var act = {
  numOfCommands: 0,
  program: [],
  position: [0,0],
  orientation: FD,
}
function bindCommand(cmdName,cmdCode){
  ge(cmdName).onclick = function(event){
    if (act.numOfCommands<=40){
    	var cell = act.numOfCommands%10;
    	var row  = Math.floor(act.numOfCommands/10);
    	act.numOfCommands++;
    	ge('cell'+row.toString()+cell.toString()).innerHTML = "<img src='" + imgName[cmdCode] + "'/>";
      act.program.push(cmdCode);
    }
  }
}

function setOrientation(){
  switch (act.orientation){
    case FD: ge('eprobot').style.transform = 'rotate(0deg)'; break;
    case RT: ge('eprobot').style.transform = 'rotate(90deg)'; break;
    case BK: ge('eprobot').style.transform = 'rotate(180deg)'; break;
    case LT: ge('eprobot').style.transform = 'rotate(270deg)'; break;
  }
}
function moveUp(){
  if (act.position[1] > 0){
    act.position[1]--;
    ge('eprobot').style.marginTop = sformat('{}em',act.position[1]*6);
  }
}
function moveDown(){
  if (act.position[1] < 4){
    act.position[1]++;
    ge('eprobot').style.marginTop = sformat('{}em',act.position[1]*6);
  }
}
function moveRight(){
  if (act.position[0] < 4){
    act.position[0]++;
    ge('eprobot').style.marginLeft = sformat('{}em',act.position[0]*6);
  }  
}
function moveLeft(){
 if (act.position[0] > 0){
    act.position[0]--;
    ge('eprobot').style.marginLeft = sformat('{}em',act.position[0]*6);
  } 
}

function animation(cmdCode){
  switch (cmdCode){
    case FD:
      switch (act.orientation){
        case FD: moveUp(); break;
        case RT: moveRight(); break;
        case LT: moveLeft(); break;
        case BK: moveDown(); break;
      }
    break;
    case BK:
      switch (act.orientation){
        case FD: moveDown(); break;
        case RT: moveLeft(); break;
        case LT: moveRight(); break;
        case BK: moveUp(); break;
      }    
    break;
    case RT:
      act.orientation = (act.orientation + 1) % 4;
      setOrientation();
    break;
    case LT:
      act.orientation = (act.orientation + 3) % 4;
      setOrientation();
    break;
  }
}


function init(){
  // Internal level number is zero-based; but we display it as 1-based.
  // We allow/fix newLevel if it's outside its proper range.
  onResize();
  // Create a <style> element for animations, to avoid CORS issues on Chrome
  // TODO: dynamically? document.head.appendChild(document.createElement('style'));
  // Install event handlers
  document.body.onresize = onResize;
  ge('bar_home').onclick = onHome;
  ge('bar_help').onclick = onHelp;
  ge('help').onclick = onHelpHide;
  ge('bar_about').onclick = onAbout;
  ge('bar_fullscreen').onclick = onFullScreen;
  for (i = 0; i < document.images.length; i += 1) {
    document.images[i].ondragstart = doPreventDefault;
  }

  bindCommand('cforward',FD);
  bindCommand('cbackward',BK);
  bindCommand('cleft',LT);
  bindCommand('cright',RT);
  ge('cgo').addEventListener('click',function(event){
    for (let i=0; i<act.program.length; i++){
      setTimeout(function(){animation(act.program[i])}, i*1000);
    }
  });
  
}

window.onerror = onError;
window.onload = init;
// Call onResize even before the images are loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onResize);
} else {  // `DOMContentLoaded` already fired
  onResize();
}


