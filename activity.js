/*
Copyright (C) 2019 Alkis Georgopoulos <alkisg@gmail.com>
Dimitris Nikolos <dnikolos@gmail.com>.
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

function setAnimation(eleName,aniName,aniDur){
  /* Code for Chrome, Safari, and Opera */
  ge(eleName).classList.add(aniName);
  ge(eleName).style.animationName = aniName;
  ge(eleName).style.animationDuration = aniDur;
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

const UP = 0
const DN = 2//DOWN

const GRASS = 0;
const FLOWER = 1;
const WATER = 2;

var act = {
      program: [],
      position: [0,4],
      orientation: FD,
      cmdExec: 0,
      play: false,//play means that the program is executed but may be it is paused
      pause: false,
      selected: -1,
      stage: [], 
    }
var inter,inter1,inter2;

const allCommands = 30;
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
  if (i!=-1 && i<act.program.length){
    cell = i;
    ge('cell'+cell.toString()).classList.add('cellHighlight');
  }
}

function bindCommand(cmdName,cmdCode){
  ge(cmdName).onclick = function(event){
    if (!act.play || (act.play && act.pause)){//only add command if not in play
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
  stop();
}

function getFlower(anim){
  var ladySquare = act.position[1]*7 + act.position[0];
  if (act.stage[ladySquare] == FLOWER){
    ge('stage'+ladySquare.toString()).style.backgroundImage = "url('resource/squareGrass.svg')";
    if (anim){
  		setAnimation('eprobot','eat','0.2s');
  		setTimeout(function(){setAnimation('eprobot','reset','0s');},200);
  	}
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


function marginsToCanvas(marginTop,marginLeft){
  //margins are in ems
  point = {};
  marginTop = parseInt(marginTop);
  marginLeft = parseInt(marginLeft);
  point.y = marginTop/6*30 + 15;
  point.x = marginLeft/6*42 + 25.1;//must be the scaling
  return(point);
}

function positionToCanvas(position){
  point = {};
  point.y = position[1]*30 + 15;
  point.x = position[0]*42 + 25.1;
  return(point);
}


function resetScene(){
  var imgUrls = ['resource/squareGrass.svg','resource/squareFlower.svg','resource/squareWater.svg'];
  for (let i=0; i<35; i++){
  	ge('stage' + i.toString()).style.backgroundImage = "url('"+imgUrls[act.stage[i]] +"')";
  }

}

function clearTrace(){
  c = ge('mycanvas');
  ctx = c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
}

function trace(startpoint,endpoint){

  if (act.pencil){
    c = ge('mycanvas');
    ctx = c.getContext('2d');
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.strokeRect(startpoint.x,startpoint.y,endpoint.x-startpoint.x,endpoint.y-startpoint.y);
    ctx.stroke();
    ctx.closePath();
  }
}

function isWater(position,dir){
  var newPos = [];
  newPos[0] = position[0];
  newPos[1] = position[1];
  if (dir == FD){
    //means up
    newPos[1] -= 1;
  }
  if (dir == BK){
    //means down
    newPos[1] += 1;
  }
  if (dir == RT){
    newPos[0] += 1;
  }
  if (dir == LT){
    newPos[0] -= 1;
  }
  console.log(newPos,newPos[1]*7+newPos[0]);
  try{
    if (act.stage[newPos[1]*7+newPos[0]] == WATER){
      return(true);
    }
  }
  catch(err){
    return(true);//if is out of bounds just return
                 //that it is WATER so that the ladybug
                 //cannot go
    }
  return(false);
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
          if (!act.pause){
            setTimeout(nextCommand,100);}
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
      startpoint = marginsToCanvas(ge('eprobot').style.marginTop,ge('eprobot').style.marginLeft);
      if (Math.abs((startPos + i*diff - endPos)) < 0.01){
        if (hor){
          ge('eprobot').style.marginLeft = sformat("{}em",endPos);
        }
        else{
          ge('eprobot').style.marginTop = sformat("{}em",endPos);
        }
        getFlower(true);
        clearInterval(inter);
        if (act.cmdExec < act.program.length){
          act.cmdExec += 1
          if (!act.pause){
            setTimeout(nextCommand,100);
          }
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
    endpoint = marginsToCanvas(ge('eprobot').style.marginTop,ge('eprobot').style.marginLeft);
    trace(startpoint,endpoint);
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
          if (!act.pause){
            setTimeout(nextCommand,100);
          }
        }
        else{
          highlightCommand(-1);
          act.play = false;
          act.selected = -1;
          act.outofplace = true;
        }
      }
      else{
        ge('eprobot').style.transform = sformat('rotate({}deg)',startAngleDeg + i*diff);
        i++;
    }
  },100);
}

function moveUp(){
  if (act.position[1] > 0 && !isWater(act.position,FD)){
    animationSi(act.position[1]*6,(--act.position[1])*6,false);
  }
  else{
    animationNo(act.position[1]*6,false,false);
  }
}
function moveDown(){
  if (act.position[1] < 4 && !isWater(act.position,BK)){
    animationSi(act.position[1]*6,(++act.position[1])*6,false);
  }
  else{
    animationNo(act.position[1]*6,true,false);
  }
}
function moveRight(){
  if (act.position[0] < 6 && !isWater(act.position,RT)){//grid is 6 cells wide
    animationSi(act.position[0]*6,(++act.position[0])*6,true);
  }
  else{
    animationNo(act.position[0]*6,true,true);
  }
}
function moveLeft(){
 if (act.position[0] > 0 && !isWater(act.position,LT)){
    animationSi(act.position[0]*6,(--act.position[0])*6,true);
  } 
  else{
    animationNo(act.position[0]*6,false,true);
  }
}

function nextCommand(){
  if (act.play){
    if (act.cmdExec == 0){
      clearTrace();
      resetScene();
    }
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
      act.outofplace = true;
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
    act.program = [];
    act.position = [0,4];
    act.orientation = FD;
    act.cmdExec = 0;
    act.play = false;//play means that the program is executed but may be it is paused
    act.pause = false;
    act.selected = -1;
    
    setOrientation();
    setSquare();
    deleteProgram();
    highlightCommand(-1);//-1 means none
    clearTrace();
    resetScene();
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
  clearTrace();
  resetScene();
  clearInterval(inter);
  clearInterval(inter1);
  clearInterval(inter2);
}

function runFast(currentCommand){
  if (!act.play || (act.play && act.pause)){
  	clearTrace();
  	resetScene();
  	if (currentCommand == act.program.length - 1){
  		act.outofplace = false;//if user clicks on last command
  		                       //ladybug and commands are in
  		                       //harmony
  	}
    act.position = [0,4];
    act.orientation = FD;
    for (i=0; i<=currentCommand; i++){
      startpoint = positionToCanvas(act.position);
      switch (act.program[i]){
        case FD:
          switch (act.orientation){
            case FD: if (act.position[1]>0 && !isWater(act.position,FD)) act.position[1]--; break;
            case RT: if (act.position[0]<6 && !isWater(act.position,RT)) act.position[0]++; break;//grid is 6 cells wide
            case LT: if (act.position[0]>0 && !isWater(act.position,LT)) act.position[0]--; break;
            case BK: if (act.position[1]<4 && !isWater(act.position,BK)) act.position[1]++; break;
          }
        break;
        case BK:
          switch (act.orientation){
            case FD: if (act.position[1]<4 && !isWater(act.position,BK)) act.position[1]++; break;
            case RT: if (act.position[0]>0 && !isWater(act.position,LT)) act.position[0]--; break;
            case LT: if (act.position[0]<6 && !isWater(act.position,RT)) act.position[0]++; break;//grid is 6 cells wide
            case BK: if (act.position[1]>0 && !isWater(act.position,FD)) act.position[1]--; break;
          }    
        break;
        case RT:
          act.orientation = (act.orientation + 1) % 4;
        break;
        case LT:
          act.orientation = (act.orientation + 3) % 4;
        break;
      }
      endpoint = positionToCanvas(act.position);
      trace(startpoint,endpoint);
      getFlower(false);
    }
    setSquare();
    setOrientation();
    act.cmdExec = currentCommand+1;
    highlightCommand(currentCommand);
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
  sqs = 35; while (sqs--) act.stage[sqs] = 0;

  bindCommand('cforward',FD);
  bindCommand('cbackward',BK);
  bindCommand('cleft',LT);
  bindCommand('cright',RT);

  ge('cgo').addEventListener('click',function(event){
    //act.position = [0,4];
    //act.orientation = FD;
    //act.cmdExec = 0;
    if (!act.play || (act.play && act.pause)){
    act.play = true;
    act.pause = false;
    setTimeout(nextCommand,100);
    }
  });
  

  ge('cdelete1').addEventListener('click',function(){
    if (act.selected>=0 && act.selected<act.program.length){
      deleteCommand(act.selected);
    }
  });

  ge('cdelete').addEventListener('click',restart);

  ge('cstop').addEventListener('click',function(){
      stop();
  });
  ge('cpause').addEventListener('click',function(){
    act.selected = act.cmdExec;
    act.pause = true;
  });
  ge('cpencil').addEventListener('click',function(){
      if (!act.play || (act.play && act.pause)){
        clearTrace();
        act.pencil = !act.pencil;
        if (act.pencil){
          ge('cpencil').src = "resource/pencil-on.svg";
          if (act.outofplace){
          	runFast(act.program.length-1);
          }
          else{
          	runFast(act.cmdExec-1);
          }
        }
        else{
          ge('cpencil').src = "resource/pencil-off.svg";
          clearTrace();
        }
      }
    });
  for (let i=0; i<allCommands; i++){
    ge('cell'+i.toString()).onclick = function(){runFast(i); act.selected = i;};
  }
  for (let i=0; i<35; i++){
    ge('stage'+i.toString()).style.backgroundImage = "url('resource/squareGrass.svg')";
  }
  for (let i=0; i<35; i++){
    ge('stage'+i.toString()).onclick = function(event){
      if (act.cmdExec == 0 && !act.oufofplace){
      	act.stage[i] = (act.stage[i]+1)%3;
      }
      resetScene();
    };
  }
  ge('loading').style.display = "none";
  ge('main').style.display = "";
}



window.onerror = onError;
window.onload = init;
// Call onResize even before the images are loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onResize);
} else {  // DOMContentLoaded` already fired
  onResize();
}



function changeChar(){
  var chars = {"ladybug" :"resource/ladybug.svg",
               "ant" :"resource/ant.svg",
               "bee"  :"resource/bee.svg",
               "butterfly" : "resource/butterfly.svg",
}
  var s = ge('selchar');
  var i = s.selectedIndex;
  var sv = s.options[i].value;
  var im = chars[sv];

  ge('eprobot').src = im;
}



