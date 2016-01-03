(function(window,document,undefined){
	function type(o){
		return Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
	}

	var Ajax = {
		// get xhr object
		_getXhr: function(){
			var xhr = null;
			if( window.XMLHttpRequest ){
				xhr =  new XMLHttpRequest();
			} else {
				xhr = new ActiveXObject('Microsoft.XMLHTTP');
			}
			return xhr;
		},
		// basic ajax method, only support GET/POST
		ajax: function(method, url, data, onsuccess, onerror){
			if( type(o) === 'object' ){
				var o = method;
				return this.ajax(o.method, o.url, o.data, o.success, o.error)
			}
			if( type(data) === 'function' ){
				onsuccess = data;
				onerror = onsuccess;
				data = {};
			}

			var key,arr=[],xhr;
			method = method.toLowerCase();
			if( type(data) === 'object' ) {
				for (key in data) {
					if( data.hasOwnProperty(key) ){
						arr.push(encodeURIComponent(key) + '&' + encodeURIComponent(data[key]))
					}
				}
				data = arr.join('&');
			}

			xhr = this._getXhr();
			if( method === 'get' ) {
				if(data){
					xhr.open('GET', url + (url.indexOf('?')>=0 ? '&' : '?') + data, true );
				} else {
					xhr.open('GET', url, true);
				}
				xhr.send();
			} else if( method === 'post' ) {
				xhr.open('POST', url, true);
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhr.send(data);
			}

			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4){
					if(xhr.status == 200){
						type(onsuccess) === 'function' && onsuccess.call(null,xhr.responseText);
					} else {
						type(onerror) === 'function' && onerror.call(null,xhr);
					}
				}
			}

			return xhr;
		},
		get: function(url,onsuccess,onerror){
			return this.ajax('GET', url, onsuccess,onerror);
		},
		post: function(url,data,onsuccess,onerror){
			return this.ajax('POST', url, data, onsuccess,onerror);
		}
	};

	// requestAnimationFrame polyfill
	// FROM https://gist.github.com/paulirish/1579671
	var rAF = (function(window) {
		var lastTime = 0,
			vendors = ['ms', 'moz', 'webkit', 'o'],
			requestAnimationFrame,
			cancelAnimationFrame;
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
										|| window[vendors[x]+'CancelRequestAnimationFrame'];
		}
	 
		if (!requestAnimationFrame)
			requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
				  timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
	 
		if (!cancelAnimationFrame)
			cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};

		return {
			requestAnimationFrame: requestAnimationFrame,
			cancelAnimationFrame: cancelAnimationFrame
		};
	})(window);

	var nyanpasu = (function(window){
		var inited = false,
			timer,
			errTimes = 0,
			sound = new Audio('media/nyanpasu.mp3'),
			UPDATE_TIME = 2000,
			ERR_TIME_ALLOWED = 5;

		var req = {
			onmessage: null,
			onerror: null,
			onclose: null,
			init: function(){
				if( inited ) return;
				inited = true;
				var self = this;

				timer = setInterval(function(){
					if( errTimes < ERR_TIME_ALLOWED ){
						ajaxRequest('/get');						
					} else {
						self.close();
					}
				},UPDATE_TIME);

				return this;
			},
			add: function(){
				ajaxRequest('/add');
				sound.currentTime = 0;
				sound.play();
				return this;
			},
			close: function(){
				clearInterval(timer);
				this.onclose && this.onclose();
				return this;
			}
		}

		function ajaxRequest(url){
			Ajax.get(url, function(result){
				req.onmessage && req.onmessage.call(req,result);
			}, function(){
				req.onerror && req.onerror.call(req,result);
				errTimes++;
			});			
		}

		return req;

	})(window);

	var counter = (function(window,document){
		var counter = document.getElementById('count'),
			number = parseInt(counter.innerText || counter.textContent,10) || 0,
			display = number,
			next = true,
			// firefox doesn't support innerText, use textContent.
			textContentFlag = typeof counter.innerText == 'undefined';

		function numAnimate(){
			var added = 0;
			if (display < number) {
				// assumed 60fps, increase at least by 1 per cycle
				added = (number - display)/60 ^ 0;
				display += (added || 1);
				counter[textContentFlag ? 'textContent' :'innerText'] = display;
			}
			next && rAF.requestAnimationFrame(numAnimate);
		}

		return {
			num: function(n){
				if( n === undefined ){
					return n;
				} else if( n <= number ){
					return n;
				} else if( n > number ){
					return number = n;
				}
			},
			stop: function(){
				next = false;
				return this;
			},
			start: function(){
				next = true;
				rAF.requestAnimationFrame(numAnimate);
				return this;
			}
		}
	})(window,document);

	
	counter.start();
	nyanpasu.onmessage = function(data){
		data = JSON.parse(data);
		if(data && data.nyanpasu){
			counter.num(+data.nyanpasu);
		}
	};
	nyanpasu.onerror = function(){};
	nyanpasu.onclose = function(){};
	nyanpasu.init();

	function bindClick(elem,callback){
		if( 'addEventListener' in document ){
			elem.addEventListener('click',callback,false);
		} else {
			elem.attachEvent('onclick',callback)
		}
	}
	bindClick(document.getElementById('nyanpasu'),function(){
		nyanpasu.add();
	})
})(window,document);