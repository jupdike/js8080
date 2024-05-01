
if ('ontouchstart' in window) {
    // This means the browser supports touch events.
    // TODO show touch controls
} else {
    // This specifies the browser does not support touch events.
    // TODO hide touch controls
    // TODO show information about which keys are which controls
}

function createImageData(w, h) {
  if (!cpu.ctx || !cpu.ctx.createImageData) {
    cpu.ctx = null;
    $('#screen').replaceWith("<p style='width: 400px'><b>The graphical display of the emulators screen has been disabled. Your browser does not support the features of the HTML5 canvas element that are required. You need a browser that has the createImageData method on the canvas 2D rendering context object. Nightly builds of <a href='http://www.mozilla.org/developer/#builds'>Firefox 3.1</a> and <a href='http://nightly.webkit.org/'>WebKit</a> are known to work.</b></p>");
    return null;
  }
  else {
    return cpu.ctx.createImageData(w, h);
  }
}

function si() { 
  if (cpu.interval)
    clearInterval(cpu.interval);

  cpu = new Cpu(memoryUpdated, sound, interrupt);   
  cpu.count = 0;
  if($('#screen').length > 0) {
    cpu.ctx = $('#screen')[0].getContext('2d');
    cpu.video = createImageData(224*2, 256*2);
  }
  cpu.load(0x0000, invadersh);
  cpu.load(0x0800, invadersg);
  cpu.load(0x1000, invadersf);
  cpu.load(0x1800, invaderse);
  update(cpu);
}

function bb() { 
  if (cpu.interval)
    clearInterval(cpu.interval);

  cpu = new Cpu(memoryUpdated, sound, interrupt);   
  cpu.count = 0;
  if($('#screen').length > 0) {
    cpu.ctx = $('#screen')[0].getContext('2d');
    cpu.video = createImageData(224*2, 256*2);
  }
  cpu.load(0x0000, tn01);
  cpu.load(0x0800, tn02);
  cpu.load(0x1000, tn03);
  cpu.load(0x1800, tn04);
  cpu.load(0x4000, tn05);
  update(cpu);
}

function lr() { 
  if (cpu.interval)
    clearInterval(cpu.interval);

  cpu = new Cpu(memoryUpdated, sound, interrupt);   
  cpu.count = 0;
  if($('#screen').length > 0) {
    cpu.ctx = $('#screen')[0].getContext('2d');
    cpu.video = createImageData(224*2, 256*2);
  }
  cpu.load(0x0000, lrescue1);
  cpu.load(0x0800, lrescue2);
  cpu.load(0x1000, lrescue3);
  cpu.load(0x1800, lrescue4);
  cpu.load(0x4000, lrescue5);
  cpu.load(0x4800, lrescue6);
  update(cpu);
}

function flags(cpu) {
  return (cpu.f & ZERO ? "z" : ".") +
        (cpu.f & SIGN ? "s" : ".") +
        (cpu.f & PARITY ? "p" : ".") +
        (cpu.f & INTERRUPT ? "i" : ".") +
        (cpu.f & CARRY ? "c" : ".");
}   
function hex(n) {
  return pad(n.toString(16), 4);
}
function update(cpu) {
  $('#af').html(hex(cpu.af()));
  $('#bc').html(hex(cpu.bc()));
  $('#de').html(hex(cpu.de()));
  $('#hl').html(hex(cpu.hl()));
  $('#pc').html(hex(cpu.pc));
  $('#sp').html(hex(cpu.sp));
  $('#flags').html(flags(cpu));
  $('#cycles').html(cpu.cycles);
  $('#disassemble').html(cpu.disassemble(cpu.pc));
  if (cpu.ctx)
    cpu.ctx.putImageData(cpu.video, 0, 0);
}
function run1()
{
  cpu.step();
  update(cpu);
}
function runn()
{
  var n = parseInt($('#n')[0].value);
  var start = new Date();
  for(var i=0; i<n; ++i) {
    cpu.step();
  }
  var end = new Date();
  update(cpu);
  $('#time').html((end-start) + "ms");
}

function stopAnimate() {
  if (cpu.interval)
    clearInterval(cpu.interval);
  delete cpu.interval;
  update(cpu);
}
// cannot call this animate because it conflicts with the animate method on windows.animate
function anim() {
  if (cpu.interval)
    clearInterval(cpu.interval);
  cpu.interval = setInterval(function() {
    for(var i=0; i < (cpu.animate || 3000) ; ++i) {
      cpu.step();
    }
  }, 10);
}
function fullscreen() {
  var e = document.getElementById('screen');
  if (e.requestFullScreen) {  
    e.requestFullScreen();  
  } else if (e.mozRequestFullScreen) {  
    e.mozRequestFullScreen();  
  } else if (e.webkitRequestFullScreen) {  
    e.webkitRequestFullScreen();  
  }  
}
function mobile() {
  var e = document.getElementById('screen');
  e.className = "fullscreen";
}
function noper(event) {
  event.preventDefault();
}

function pixelSet(video, y, x, r, g, b) {
const w = 224;
const chan = 4;
const stride_per_row = w * chan * 2;
const stride_per_y = stride_per_row * 2;
// draw 2x2 pixel blocks
var index;
index = y * stride_per_y + x*2*4;
video[index+0] = r;
video[index+1] = g;
video[index+2] = b;
video[index+3] = 255;
index += stride_per_row;
video[index+0] = r;
video[index+1] = g;
video[index+2] = b;
video[index+3] = 255;
index = y * stride_per_y + x*2*4;
video[index+0+4] = r;
video[index+1+4] = g;
video[index+2+4] = b;
video[index+3+4] = 180;
index += stride_per_row;
video[index+0+4] = r;
video[index+1+4] = g;
video[index+2+4] = b;
video[index+3+4] = 180;
}
function plotData(video, x, y, value, bit) {
if (y < 0 || y >= 256 || x < 0 || x >= 224)
{
  return;
}
var bt = (value >> bit) & 1;
y = y-bit;
var r = 0;
var g = 0;
var b = 0;
if (bt) {
  // fake cellophane colors for different games since graphics are just white on black
  if (y >= 184+8 && y <= 238 && x >= 0 && x <= 223)
    g = 255;
  else if (y >= 240 && y <= 247 && x >= 16 && x <= 133)
    g = 255;
  else if (y >= 33 && y <= 33+16) {
    r = 255;
    g = 0;
    b = 0;
  }
  else {
    g = 250;
    b = 250;
    r = 250;
  } 
}
pixelSet(video, y, x, r, g, b);
}
function memoryUpdated(addr, value)
{
if (!this.video)
  return;

if (addr >= 0x2400) {
  // Update video memory
  var base = addr - 0x2400;
  var y = ~(((base & 0x1f) * 8) & 0xFF) & 0xFF;
  var x = base >> 5;
  for(var i=0; i<8; ++i) {
    plotData(this.video.data, x, y, value, i);
  }
}
}
function sound(id) {   
    console.log("sound()", id);
    console.log(sounds);
switch(id) {
case 2:       
  sounds.shot.play();
  $('#status').html("bang!");
  break;
case 3:
  sounds.basehit.play();
  $('#status').html("boom!");
  break;
case 4:
  sounds.invhit.play();
  $('#status').html("kaboom!");
  break;
case 11:
  sounds.walk1.play();
//       $('#status').html("walk1");
  break;
case 12:
  sounds.walk2.play();
//       $('#status').html("walk2");
  break;
case 13:
  sounds.walk3.play();
//       $('#status').html("walk3");
  break;
case 14:
  sounds.walk4.play();
//       $('#status').html("walk4");
  break;
case 15:
  sounds.ufohit.play();
  $('#status').html("ufo blows up!");
  break;
}
}
function interrupt(n) {
if (n == 0x10 && this.ctx)
  this.ctx.putImageData(this.video, 0, 0);
}

var cpu = {};

function downControl_Coin() {
cpu.port1 |= 1;
}
function downControl_Left() {
cpu.port1 |= 0x20;
}
function downControl_Right() {
cpu.port1 |= 0x40;
}
function downControl_1P() {
cpu.port1 |= 4;
}
function downControl_2P() {
cpu.port1 |= 8; // ?
}
function downControl_Fire() {
cpu.port1 |= 0x10;
}

function upControl_Coin() {
cpu.port1 &= 255-1;
}
function upControl_Left() {
cpu.port1 &= 255-0x20;
}
function upControl_Right() {
cpu.port1 &= 255-0x40;
}
function upControl_1P() {
cpu.port1 &= 255-4;
}
function upControl_2P() {
cpu.port1 &= 255-8; // ?
}
function upControl_Fire() {
cpu.port1 &= 255-0x10;
}


/*
// from: http://stackoverflow.com/questions/442404/dynamically-retrieve-html-element-x-y-position-with-javascript
function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.parentNode;
    }
    return { top: _y, left: _x };
}

document.getElementById('screen').addEventListener("mousedown", function(e) {
  var evt = e || window.event;
  var offset = getOffset (document.getElementById('screen'));
  var y = evt.clientY - offset.top;
  var x = evt.clientX - offset.left;
  if(y <= 100 && x <= 112)
    cpu.port1 |= 1; // coin
  if(y <= 100 && x > 112)
    cpu.port1 |= 4;

  if(y > 100 && x >= 74 && x <= 150)
    cpu.port1 |= 0x10;

  if(y > 100 && x < 74)
    cpu.port1 |= 0x20;

  if(y > 100 && x > 150)
    cpu.port1 |= 0x40;
  
  return false;
}, false);
document.getElementById('screen').addEventListener("mouseup", function(e) {
  var evt = e || window.event;
  var offset = getOffset (document.getElementById('screen'));
  var y = evt.clientY - offset.top;
  var x = evt.clientX - offset.left;
  if(y <= 100 && x <= 112)
    cpu.port1 &= 255-1; // coin
  if(y <= 100 && x > 112)
    cpu.port1 &= 255-4; // 1 player

  if(y > 100 && x >= 74 && x <= 150)
    cpu.port1 &= 255-0x10;
  if(y > 100 && x < 74)
    cpu.port1 &= 255-0x20;
  if(y > 100 && x > 150)
    cpu.port1 &= 255-0x40;
  return false;
}, false);
 */