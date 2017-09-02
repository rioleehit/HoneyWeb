

//init point
var drawObj=drawObj||{};
 function initMouse(){
	
	var canvas = document.getElementById("ca")
	var cxt=canvas.getContext("2d");
	
	var ws=new WebSocket("ws://192.168.0.9:8080");
	
	core.initWebSocket(ws);
	core.initTouchBoard(0,0,500,500);
	var drawPoints = function(arr,color){
		cxt.fillStyle=color||"#0F0FF0";
		var i = arr[0]
		for(var i=0;i<arr.length;i++){
			x=arr[i].pageX - 0;
			y=arr[i].pageY - 0;
			cxt.fillRect(x,y,5,5); 
		}
	}
	core.touchboard.scal = 1.3
//	var oInp = document.getElementById("touchBoard");
	var oInp = canvas;
	oInp.addEventListener('touchstart',function(event){
    	var event = event || window.event;
		drawPoints(event.changedTouches);
		core.touchboard.touchStart(event.changedTouches);
	},false);
	oInp.addEventListener('touchmove',function(event){
    	var event = event || window.event; 
        event.preventDefault();
		drawPoints(event.changedTouches);
		core.touchboard.touchMove(event.touches);
	},false);
	oInp.addEventListener('touchend',function(event){
    	var event = event || window.event;
    	drawPoints(event.changedTouches);
		core.touchboard.touchEnd(event.changedTouches);
	},false);     
	
}
