/*
Copyright (C) 2019 Dimitris Nikolos <dnikolos@gmail.com>.
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

function ge(id) {
  return document.getElementById(id);
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
var act = {};
var inter,inter1,inter2;

const allCommands = 20;
function showCommand(cmdCode,cell){
  var idSuffix = ['fd','rt','bk','lt'];
  for (var i=0; i<4; i++){//for all cmdCodes
    if (i==cmdCode){
      ge('cell'+cell.toString()+idSuffix[i]).style.display = '';

    }
    else{
      ge('cell'+cell.toString()+idSuffix[i]).style.display = 'none';
    }
  }
}

function highlightCommand(i){
  //highlightCommand(-1) highlights none
  for (var cell = 0; cell<allCommands; cell++){
      ge('cell'+cell.toString()).classList.remove('cellHighlight');
    }
  if (i!=-1){
    cell = i;
    ge('cell'+cell.toString()).classList.add('cellHighlight');
  }
}

function bindCommand(cmdName,cmdCode){
  ge(cmdName).onclick = function(event){
    if (!act.play){//only add command if not in play
    if (act.selected==-1){
      if (act.program.length<allCommands){
        cell = act.program.length;
        showCommand(cmdCode,cell);
        act.program.push(cmdCode);
      }
    }
    else{
    	cell = act.selected + 1;
    	act.program.splice(cell,0,cmdCode);//insert cmdCode in index cell
    	for (var i=cell; i<act.program.length; i++){
    		showCommand(act.program[i],i);
    	}
    }
  }
}
}

function deleteProgram(){
  var idSuffix = ['fd','rt','bk','lt'];
  act.program = [];
  for (var cell=act.program.length; cell<allCommands; cell++){
    for (var i=0; i<4; i++){
         ge('cell'+cell.toString()+idSuffix[i]).style.display = 'none';
    }    
  }
}

function deleteCommand(cmdNum){
  var idSuffix = ['fd','rt','bk','lt'];
  act.program.splice(cmdNum,1);
  for (var cell=0; cell<act.program.length; cell++){
  	showCommand(act.program[cell],cell);
  }
  for (var cell=act.program.length; cell<allCommands; cell++){
    for (var i=0; i<4; i++){
         ge('cell'+cell.toString()+idSuffix[i]).style.display = 'none';
    }    
  }
  if (cmdNum>0){
  	highlightCommand(cmdNum-1);
  	runFast(cmdNum-1);
  	act.cmdExec = cmdNum-1;
  	act.selected = cmdNum-1;
  }
  else{//go to start without deleting the program
	act.position = [0,4];
	act.orientation = FD;
	act.cmdExec =  0;
	act.play = false;
	act.pause = false;
	act.selected = -1;
    setOrientation();
    setSquare();
  	highlightCommand(-1);
  }
}

function setSquare(){
  ge('eprobot').style.marginTop = sformat('{}em',act.position[1]*6);
  ge('eprobot').style.marginLeft = sformat('{}em',act.position[0]*6);
}

function setOrientation(){
  switch (act.orientation){
    case FD: ge('eprobot').style.transform = 'rotate(0deg)'; break;
    case RT: ge('eprobot').style.transform = 'rotate(90deg)'; break;
    case BK: ge('eprobot').style.transform = 'rotate(180deg)'; break;
    case LT: ge('eprobot').style.transform = 'rotate(270deg)'; break;
  }
}


function animationNo(curPos,dir,hor){
  /*animation with set interval 
    curPos is in ems
    ladybug moves in dir and returns back in curPos
    when hor = true marginLeft
    when hor = false marginTop
    when dir = true right/down
    when dir = false left/up
  */
  var endPos;
  if (dir){
    endPos = curPos + 3; //grid is 6em 3em is half block of grid
  }
  else{
    endPos = curPos - 3;
  }
  var startPos = curPos;
  var diff = (endPos - startPos)/5;
  let i=0; 
  inter1 = setInterval(function(){
      if (act.play){
        if (Math.abs((startPos + i*diff - endPos)) < 0.01){
          if (hor){
            ge('eprobot').style.marginLeft = sformat("{}em",endPos);
          }
          else{
            ge('eprobot').style.marginTop = sformat("{}em",endPos);
          }
          clearInterval(inter1);
        }
        else{
          if (hor){
            ge('eprobot').style.marginLeft = sformat("{}em",startPos + i*diff);
          }
          else{
           ge('eprobot').style.marginTop = sformat("{}em",startPos + i*diff); 
          }
          i++;
      }
    }
  },100);
  setTimeout(function(){
  //go back
  startPos = endPos;
  endPos = curPos;
  diff = (endPos - startPos) / 5;
  inter2 = setInterval(function(){
    if (act.play){
      if (Math.abs((startPos + i*diff - endPos)) < 0.01){
        if (hor){
          ge('eprobot').style.marginLeft = sformat("{}em",endPos);
        }
        else{
          ge('eprobot').style.marginTop = sformat("{}em",endPos);
        }
        clearInterval(inter2);
        if (act.cmdExec < act.program.length){
          act.cmdExec += 1
          setTimeout(nextCommand,100);
        }
      }
      else{
        if (hor){
          ge('eprobot').style.marginLeft = sformat("{}em",startPos + i*diff);
        }
        else{
         ge('eprobot').style.marginTop = sformat("{}em",startPos + i*diff); 
        }
        i++;
    }
  }
},100);
},500);


}

function animationSi(startPos,endPos,hor){
  /*animation with set interval 
    startpos is in ems
    endpos is in ems
    when hor = true marginLeft
    when hor = false marginTop
  */

  var diff = (endPos - startPos)/10;
  let i=0; 
  inter = setInterval(function(){
    if (act.play){
      if (Math.abs((startPos + i*diff - endPos)) < 0.01){
        if (hor){
          ge('eprobot').style.marginLeft = sformat("{}em",endPos);
        }
        else{
          ge('eprobot').style.marginTop = sformat("{}em",endPos);
        }
        clearInterval(inter);
        if (act.cmdExec < act.program.length){
          act.cmdExec += 1
          setTimeout(nextCommand,100);
        }
      }
      else{
        if (hor){
          ge('eprobot').style.marginLeft = sformat("{}em",startPos + i*diff);
        }
        else{
         ge('eprobot').style.marginTop = sformat("{}em",startPos + i*diff); 
        }
        i++;
    }
  }
},100);
}
function animationAn(startAngle,endAngle,clock){
  /*angle animation startAngle and endAngle are in FD,LT,RT,BK format*/
  var startAngleDeg,endAngleDeg;
  switch (startAngle){
    case FD: startAngleDeg = 0; break;
    case RT: startAngleDeg = 90; break;
    case BK: startAngleDeg = 180; break;
    case LT: startAngleDeg = 270; break;
  }
  switch (endAngle){
    case FD: endAngleDeg = 0; break;
    case RT: endAngleDeg = 90; break;
    case BK: endAngleDeg = 180; break;
    case LT: endAngleDeg = 270; break;
  }
  var diff;
  if (clock){
    diff = 9; // 90 / 10 is 9 degrees for 1/10 of a second
  }
  else{
    diff = -9;
  }

  let i=0; 
  inter = setInterval(function(){
      newAngle = startAngleDeg + i*diff;
      if (Math.abs((360 + startAngleDeg + i*diff)%360 - endAngleDeg) < 0.01){
        ge('eprobot').style.transform = sformat('rotate({}deg)',endAngleDeg);
        clearInterval(inter);
        if (act.cmdExec < act.program.length){
          act.cmdExec += 1
          setTimeout(nextCommand,100);
        }
        else{
          highlightCommand(-1);
          act.play = false;
          act.selected = -1;
        }
      }
      else{
        ge('eprobot').style.transform = sformat('rotate({}deg)',startAngleDeg + i*diff);
        i++;
    }
  },100);
}

function moveUp(){
  if (act.position[1] > 0){
    animationSi(act.position[1]*6,(--act.position[1])*6,false);
  }
  else{
    animationNo(act.position[1]*6,false,false);
  }
}
function moveDown(){
  if (act.position[1] < 4){
    animationSi(act.position[1]*6,(++act.position[1])*6,false);
  }
  else{
    animationNo(act.position[1]*6,true,false);
  }
}
function moveRight(){
  if (act.position[0] < 6){//grid is 6 cells wide
    animationSi(act.position[0]*6,(++act.position[0])*6,true);
  }
  else{
    animationNo(act.position[0]*6,true,true);
  }
}
function moveLeft(){
 if (act.position[0] > 0){
    animationSi(act.position[0]*6,(--act.position[0])*6,true);
  } 
  else{
    animationNo(act.position[0]*6,false,true);
  }
}

function nextCommand(){
  if (act.play){
    setSquare();
    setOrientation();
    cmdCode = act.program[act.cmdExec];
    if (act.cmdExec<act.program.length)
      {highlightCommand(act.cmdExec);
      }
    else{
      highlightCommand(-1);
      act.play = false;
      act.cmdExec = 0;
      act.position = [0,4];
      act.orientation = FD;
      act.selected = -1;
    }
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
        var startAngle = act.orientation;
        act.orientation = (act.orientation + 1) % 4;
        var endAngle = act.orientation;
        animationAn(startAngle,endAngle,true);
      break;
      case LT:
        var startAngle = act.orientation;
        act.orientation = (act.orientation + 3) % 4;
        var endAngle = act.orientation;
        animationAn(startAngle,endAngle,false);
      break;
    }
  }
}

function restart(){
    act = {
      program: [],
      position: [0,4],
      orientation: FD,
      cmdExec: 0,
      play: false,//play means that the program is executed but may be it is paused
      pause: false,
      selected: -1,
    }
    setOrientation();
    setSquare();
    deleteProgram();
    highlightCommand(-1);//-1 means none
}

function stop(){
  act.position = [0,4];
  act.orientation = FD;
  act.cmdExec = 0;
  act.play = false;//play means that the program is executed but may be it is paused
  act.pause = false;
  act.selected = -1;
  setOrientation();
  setSquare();
  highlightCommand(-1);//-1 means none
  clearInterval(inter);
  clearInterval(inter1);
  clearInterval(inter2);
}

function runFast(currentCommand){
  if (!act.play){
    act.position = [0,4];
    act.orientation = FD;
    for (i=0; i<=currentCommand; i++){
      switch (act.program[i]){
        case FD:
          switch (act.orientation){
            case FD: if (act.position[1]>0) act.position[1]--; break;
            case RT: if (act.position[0]<6) act.position[0]++; break;//grid is 6 cells wide
            case LT: if (act.position[0]>0) act.position[0]--; break;
            case BK: if (act.position[1]<4) act.position[1]++; break;
          }
        break;
        case BK:
          switch (act.orientation){
            case FD: if (act.position[1]<4) act.position[1]++; break;
            case RT: if (act.position[0]>0) act.position[0]--; break;
            case LT: if (act.position[0]<6) act.position[0]++; break;//grid is 6 cells wide
            case BK: if (act.position[1]>0) act.position[1]--; break;
          }    
        break;
        case RT:
          act.orientation = (act.orientation + 1) % 4;
        break;
        case LT:
          act.orientation = (act.orientation + 3) % 4;
        break;
      }
    }
      setSquare();
    setOrientation();
    act.cmdExec = i;
    highlightCommand(i-1);
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

  restart();

  bindCommand('cforward',FD);
  bindCommand('cbackward',BK);
  bindCommand('cleft',LT);
  bindCommand('cright',RT);

  ge('cgo').addEventListener('click',function(event){
    //act.position = [0,4];
    //act.orientation = FD;
    //act.cmdExec = 0;
    if (!act.play){
    act.play = true;
    setTimeout(nextCommand,100);
    }
  });
  
  ge('cdelete').addEventListener('click',function(){
  	console.log(act.selected);
  	if (act.selected==-1){
  		restart();
  	}
  	else{
  		deleteCommand(act.selected);
  	}
  });

  ge('cstop').addEventListener('click',function(){
      stop();
  });
  for (let i=0; i<allCommands; i++){
    ge('cell'+i.toString()).onclick = function(){runFast(i); act.selected = i; console.log(act.selected);};
  }
}

window.onerror = onError;
window.onload = init;
// Call onResize even before the images are loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onResize);
} else {  // DOMContentLoaded` already fired
  onResize();
}


function changeGrid(){
  var grids = {"empty":"resource/grid.svg",
               "alpha":"resource/alphabet.svg",
               "dice":"resource/dice.svg",
               "school":"resource/school.svg"}
  var s = ge('sel');
  var i = s.selectedIndex;
  var sv = s.options[i].value;
  var im = grids[sv];
  var imurl = "url('" + im + "')";

  ge('stage').style.backgroundImage = imurl;
}

