var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

const WebSocket = require('ws');
var robot = require('robotjs');
//robot.setMouseDelay(0);
const wss = new WebSocket.Server({ port: 8080 });
 
 var curPos = {
	 px:0,
	 py:0,
	 id:0
 };
 var prePos={};
 
 

var ActionList={
	curActions:null,
	_isUp:false,
	_cleanAction:function(){
		this.curActions = this._isUp && this.curenPoints.length<=1 ? [] : this.curActions;
	},	 
	
	totalPointsCount:0,
	totalMaxCount:0,
	isRightUp:false,
	isQuickUp:false,
	isTimeOut:true,
	curTimeOutTick:null,
	pushAction:function(action){
		if(action == "t_touch_down"){
			this.totalPointsCount+=1;
			this.totalMaxCount = this.totalMaxCount < this.totalPointsCount ? this.totalPointsCount : this.totalMaxCount
			switch(this.totalPointsCount){
				case 1:
					{
						this.resetPrePos();
						this.isRightUp=true;
						if(this.isQuickUp){
							console.log("press down")
							robot.mouseToggle("down");
						}
						this.isTimeOut = false;
						if(this.curTimeOutTick){
							clearTimeout(this.curTimeOutTick);
							this.curTimeOutTick = null;
						}
						this.curTimeOutTick = setTimeout(function(){
							console.log("isTimeOut")
							ActionList.isTimeOut = true;
							ActionList.isQuickUp = false;
							ActionList.curTimeOutTick = null;
						},200)
					}
					break;
				case 2:
					//ActionList.isQuickUp = false;
					break;
				default:
					break;
			}
			
		}else if(action == "t_touch_move"){
			switch(this.totalPointsCount){
				case 1:
					{
						var mouse = robot.getMousePos();
						var total = ActionList.totalOffset();
						var toPointX = mouse.x + total.offsetX;
						var toPointY = mouse.y + total.offsetY;
						robot.moveMouse(toPointX, toPointY);
						this.resetPrePos();
					}
					break;
				case 2:
					{
					//	var result = this.offsets();
					//	if
					}
					break;
				default:
					break;
			}
			this.isRightUp=false;
		}else if(action == "t_touch_up"){
			switch(this.totalPointsCount){
				case 1:
					{
						this.isQuickUp=!this.isTimeOut;
						console.log("isQuickUp"+this.isQuickUp)
						if(this.isQuickUp){
							console.log("mouseClick left")
							robot.mouseClick('left');
						}
						if(this.totalMaxCount==2 && this.isRightUp){
							console.log("mouseClick right")
							robot.mouseClick('right');
							this.isRightUp = false;
							this.totalMaxCount = 0;
						}
					}
					break;
				case 2:
					//ActionList.isQuickUp = false;
					break;
				default:
					break;
			}
			
			this.totalPointsCount-=1;
		}
		return;
		
		
		 //this._isUp = action == "t_touch_up";
		 
		 if(action == "t_touch_move"){
			 //this.curActions = [];
			 //this.registCB['m'].call();
			 
			 //this._callCB("t_touch_move");
			 
			 var cb = this.regCBTree.getCb(this.curActions) || 
						this.regCBTree.getCb(['t_touch_move']);
			 if(cb){cb()}
			 this.curActions = [];
		 }else if(action == "t_touch_up"){
			 this.curActions.push(action);
			 //this.curActions.push();
			 //console.log("t_touch_up ")
			 //this._callCB("t_touch_up")
			 var cb = this.regCBTree.getCb(this.curActions) || 
						this.regCBTree.getCb(['t_touch_up']);
			 if(cb){cb()}
			
		 }else if(action == "t_touch_down"){
			  setTimeout(function(){
				ActionList._cleanAction();
				if(ActionList._isUp && cb){
					cb();
				}
			 },100)
			 this.curActions.push(action);
			 //this.curActions.push();
			 //console.log("t_touch_down ")
			 //this._callCB("t_touch_down")
		 }else {
			 this.curActions = [];
		 }
	},
	 regCB:function(id,acArray,fun){
		 //console.log("reg id=%s actions=%s",id,JSON.stringify(acArray))
		 //this.registCB[id]={actions:acArray,call:fun};
		 this.regCBTree.reg(acArray,fun);
	 },
	 regCBTree:{
		 reg:function(arr,cb){
			 var key = arr[0];
			 this[key] = this[key] || 
						{
							reg:ActionList.regCBTree.reg,
							getCb:ActionList.regCBTree.getCb
						};
			 if(arr.length==1){this[key].cb = cb; return;}
			 arr = arr.slice(1);
			 this[key].reg(arr,cb);
		 },
		 getCb:function(arr){
			 if(arr.length==0){return;}
			 var key = arr[0];
			 console.log(key);
			 if(arr.length==1){return this[key].cb;}
			 arr = arr.slice(1);
			 return this[key] ? this[key].getCb(arr) : null;
		 },
	 },
	 registCB:[],
	 curenPoints:[],
	 prePos:[],
	 resetPrePos:function(){
		 var arr = this.curenPoints;
		 this.prePos = [];
		 //console.log("arr %s",JSON.stringify(arr))
		 for(key in arr){
			 var item = arr[key];
			 this.prePos[item.id] = item;
		 }
	 },
	 offsets:function(){
		 var arr = this.curenPoints
		 var result = []
		 for(key in arr){
			 var item = arr[key]
			 var p = this.prePos[item.id]
			 if(!p){continue;}
			 result.append({
				 offsetX:(item.px - p.px),
				 offsetY:(item.py - p.py)
			})
		 }
		 return result;
	 },
	 totalOffset:function(){
		 var arr = this.curenPoints
		 var result = {
			 offsetX:0,
			 offsetY:0
		 }
		 for(key in arr){
			 var item = arr[key]
			 var p = this.prePos[item.id]
			 if(!p){continue;}
			 result.offsetX += (item.px - p.px)
			 result.offsetY += (item.py - p.py)
		 }
		 return result
	 },
 };
 /*
ActionList.baseD=function(){
	ActionList.resetPrePos();
};
ActionList.baseM=function(){
	//console.log("base move")
	
	var mouse = robot.getMousePos();
	var total = ActionList.totalOffset();
	var toPointX = mouse.x + total.offsetX;
	var toPointY = mouse.y + total.offsetY;
	
	robot.moveMouse(toPointX, toPointY);
	ActionList.resetPrePos();
},
ActionList.baseU=function(){}
function reset(){
	ActionList.regCB('d',["t_touch_down"],ActionList.baseD);
	ActionList.regCB('m',["t_touch_move"],ActionList.baseM);
	ActionList.regCB('u',["t_touch_up"],ActionList.baseU);
};
 reset();
 
 ActionList.regCB('du',
					["t_touch_down",
					"t_touch_up"],
					function(){	 
	robot.mouseClick('left');
 });
 ActionList.regCB('dudu',
					["t_touch_down",
					"t_touch_up",
					"t_touch_down",
					"t_touch_up"],
					function(){	 
	robot.mouseClick('left');
 });
 /*
 
 ActionList.regCB('du',
					["t_touch_down",
					"t_touch_up"],
					function(){	 
	console.log("click du d")
    robot.mouseToggle();
	ActionList.regCB('u',["t_touch_up"],function(){
		console.log("click du u")
		robot.mouseToggle("up");
		ActionList.regCB('u',["t_touch_up"],ActionList.baseU);
	});
 });
 
 function scrowMouse(){
	ActionList.resetPrePos();	 
	console.log("click ddm")
	ActionList.regCB('m',["t_touch_move"],function(){
		var total = ActionList.totalOffset();
		robot.scrollMouse(-total.offsetY/200,-total.offsetX/200);
		console.log("scrollMouse posX=%s posy=%s",total.offsetX,total.offsetY)
	});
	ActionList.regCB('u',["t_touch_up"],reset);
 }
  ActionList.regCB('ddm',
					["t_touch_down",
					"t_touch_down",
					"t_touch_move"],
					scrowMouse);
					
  ActionList.regCB('dudm',
					["t_touch_down",
					"t_touch_move",
					"t_touch_down",
					"t_touch_move"],
					function(){
						
		robot.mouseToggle("down");
					});
					
   ActionList.regCB('ddu',
					["t_touch_down",
					"t_touch_down",
					"t_touch_up"],
					function(){
	ActionList.resetPrePos();
	console.log("click ddu")
	robot.mouseClick('right');
	ActionList.regCB('u',["t_touch_up"],reset);
 });
 ActionList.regCB('dud',
					["t_touch_down",
					"t_touch_up",
					"t_touch_down"],
					function(){ 
	ActionList.resetPrePos();
	console.log("dud down")
	robot.mouseToggle("down");
	reset();
 });
 console.log(JSON.stringify(ActionList.registCB))
 
 /*
 ActionList.regCB('ddddd',
 ["t_touch_down",
 "t_touch_down",
 "t_touch_down",
 "t_touch_down",
 "t_touch_down"],
 function(){
	 
 });
 */
 
 
var spawn = require('child_process').spawn;
var grep = spawn('../../vs/multiTouchpad/Debug/test.exe', ['']);

wss.on('connection', function connection(ws) {
	console.log('wss connection');
	ws.on('message', function incoming(message) {
	
		console.log('received: %s', message);
		grep.stdin.write(message);
		//grep.stdin.write("\n");
		grep.stdin.end();
		return 
		  
		var evt = JSON.parse(message);
		
		if(evt.type == 'touch_start'){
			for(key in evt.points){
				ActionList.curenPoints = [evt.points[key]];
				ActionList.pushAction("t_touch_down");
			}
		}else if(evt.type == 'touch_move'){
			ActionList.curenPoints = evt.points;
			ActionList.pushAction("t_touch_move");
		}else if(evt.type == 'touch_end'){
			for(key in evt.points){
				ActionList.curenPoints = [evt.points[key]];
				ActionList.pushAction("t_touch_up");		
			}
		}else {
			console.log("not know")
		}
	});
 
  //ws.send('something');
});



grep.stdout.on('data', function(data){
    console.log('data from grep: ' + data);
});

grep.on('close', function(code){
    console.log('grep exists with code: ' + code);
});
  