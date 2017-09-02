var core = core||{};
core.webSocket={};
core.initWebSocket = function(ws){
	ws.onmessage = function(event) { 
	
	};
	ws.onclose = function(event) {
		
	}; 
	ws.onopen = function(event) {
		
	}; 
	ws.onerror =function(event){
			
	};
	core.webSocket = ws;
}
core.initTouchBoard = function(x,y,width,height){
	core.touchboard = {
		scal:1.0,
		posX:x,
		posY:y,
		width:width,
		height:height,
		///
		_touch_event:function(type,points){
			var selfObj = core.touchboard;
			var touchPoints = {
				type:type,
				points:[]
			}
			for(var i=0;i<points.length;i++){
				var ref = points[i];
				touchPoints.points[i]={
					px:(ref.pageX-selfObj.posX)*selfObj.scal,
					py:(ref.pageY-selfObj.posY)*selfObj.scal,
					id:ref.identifier,
					ex:JSON.stringify(ref),
				};
			}
			core.webSocket.send(JSON.stringify(touchPoints));
		},
		touchStart:function(points){
			var selfObj = core.touchboard;
			selfObj._touch_event("touch_start",points);
		},
		touchMove:function(points){
			var selfObj = core.touchboard;
			selfObj._touch_event("touch_move",points);
		},
		touchEnd:function(points){
			var selfObj = core.touchboard;
			selfObj._touch_event("touch_end",points);
		},
	};
	
	return core.touchboard;
}

