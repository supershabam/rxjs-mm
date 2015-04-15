/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

	var _Tone = __webpack_require__(3);

	var _Tone2 = _interopRequireWildcard(_Tone);

	var _rxdom = __webpack_require__(1);

	var _rxdom2 = _interopRequireWildcard(_rxdom);

	var _rx = __webpack_require__(2);

	var _rx2 = _interopRequireWildcard(_rx);

	function wsURL() {
	  var scheme = 'ws';
	  if (window.location.protocol === 'https:') {
	    scheme = 'wss';
	  }
	  return '' + scheme + '://' + window.location.host + '/synth';
	}

	// messages from websocket
	var ws = _rxdom2['default'].DOM.fromWebSocket(wsURL()).map(function (x) {
	  try {
	    return JSON.parse(x.data);
	  } catch (err) {
	    return {};
	  }
	}).filter(function (msg) {
	  return msg && msg.config;
	}).publish(); // single hot observable

	var score = {};
	// synth: [["0:0:2", ["E4"]], ["0:0:2", ["G4"]], ["0:0:2", ["F4"]]]
	// global mutable we will abuse
	var synthNotes = {
	  C4: ['0:0:2', '0:2:4'],
	  E4: ['0:0:2']
	};
	function synthScoreline() {
	  var scoreline = [];
	  Object.keys(synthNotes).forEach(function (note) {
	    synthNotes[note].forEach(function (timing) {
	      scoreline.push([timing, [note]]);
	    });
	  });
	  return scoreline;
	}
	var rescore = function rescore() {
	  score.synth = synthScoreline();
	  console.log(score);
	  _Tone2['default'].Transport.clearTimelines();
	  _Tone2['default'].Note.parseScore(score);
	};
	rescore();

	var synth = new _Tone2['default'].PolySynth(5, _Tone2['default'].MonoSynth).setPreset('Pianoetta');
	synth.volume.value = -30;

	var feedbackDelay = new _Tone2['default'].PingPongDelay({
	  delayTime: '8n',
	  feedback: 0.6,
	  wet: 0.5
	});

	var kick = new _Tone2['default'].Player('http://tonenotone.github.io/Tone.js/examples/audio/505/kick.mp3');
	var snare = new _Tone2['default'].Player('http://tonenotone.github.io/Tone.js/examples/audio/505/snare.mp3');
	var hh = new _Tone2['default'].Player('http://tonenotone.github.io/Tone.js/examples/audio/505/hh.mp3');

	// wiring
	kick.connect(feedbackDelay);
	snare.connect(feedbackDelay);
	hh.connect(feedbackDelay);
	synth.connect(feedbackDelay);
	feedbackDelay.toMaster();

	// wire scored components
	_Tone2['default'].Note.route('snare', function (time) {
	  snare.start(time);
	});
	_Tone2['default'].Note.route('hh', function (time) {
	  hh.start(time);
	});
	_Tone2['default'].Note.route('kick', function (time) {
	  kick.start(time);
	});
	_Tone2['default'].Note.route('synth', function (time, value) {
	  var velocity = Math.random() * 0.5 + 0.4;
	  for (var i = 0; i < value.length; i++) {
	    synth.triggerAttackRelease(value[i], '16n', time, velocity);
	  }
	});

	//setup the transport values
	_Tone2['default'].Transport.loopStart = 0;
	_Tone2['default'].Transport.loopEnd = '1:0';
	_Tone2['default'].Transport.loop = true;
	_Tone2['default'].Transport.bpm.value = 120;
	_Tone2['default'].Transport.swing = 0.2;

	//the transport won't start firing events until it's started
	_Tone2['default'].Transport.start();

	////////////////
	// HANDLE EVENTS

	// kicker
	ws.filter(function (msg) {
	  return msg.config.name === 'kick';
	}).subscribe(function (msg) {
	  score.kick = msg.value;
	  rescore();
	});

	// snare
	ws.filter(function (msg) {
	  return msg.config.name === 'snare';
	}).subscribe(function (msg) {
	  score.snare = msg.value;
	  rescore();
	});

	// hh
	ws.filter(function (msg) {
	  return msg.config.name === 'hh';
	}).subscribe(function (msg) {
	  score.hh = msg.value;
	  rescore();
	});

	// synth
	ws.filter(function (msg) {
	  return msg.config.name === 'synth';
	}).subscribe(function (msg) {});

	// only once tone is ready will we start up the websocket
	_Tone2['default'].Buffer.onload = function () {
	  ws.connect();
	};
	// start the observable now that Tone is ready

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

	;(function (factory) {
	  var objectTypes = {
	    'boolean': false,
	    'function': true,
	    'object': true,
	    'number': false,
	    'string': false,
	    'undefined': false
	  };

	  var root = (objectTypes[typeof window] && window) || this,
	    freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
	    freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
	    moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
	    freeGlobal = objectTypes[typeof global] && global;

	  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
	    root = freeGlobal;
	  }

	  // Because of build optimizers
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), exports], __WEBPACK_AMD_DEFINE_RESULT__ = function (Rx, exports) {
	      root.Rx = factory(root, exports, Rx);
	      return root.Rx;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module === 'object' && module && module.exports === freeExports) {
	    module.exports = factory(root, module.exports, require('rx'));
	  } else {
	    root.Rx = factory(root, {}, root.Rx);
	  }
	}.call(this, function (root, exp, Rx, undefined) {

	  var Observable = Rx.Observable,
	    observableProto = Observable.prototype,
	    AnonymousObservable = Rx.AnonymousObservable,
	    observerCreate = Rx.Observer.create,
	    disposableCreate = Rx.Disposable.create,
	    CompositeDisposable = Rx.CompositeDisposable,
	    SingleAssignmentDisposable = Rx.SingleAssignmentDisposable,
	    AsyncSubject = Rx.AsyncSubject,
	    Subject = Rx.Subject,
	    Scheduler = Rx.Scheduler,
	    defaultNow = (function () { return !!Date.now ? Date.now : function () { return +new Date; }; }()),
	    dom = Rx.DOM = {},
	    hasOwnProperty = {}.hasOwnProperty,
	    noop = Rx.helpers.noop;

	  function createListener (element, name, handler) {
	    if (element.addEventListener) {
	      element.addEventListener(name, handler, false);
	      return disposableCreate(function () {
	        element.removeEventListener(name, handler, false);
	      });
	    }
	    throw new Error('No listener found');
	  }

	  function createEventListener (el, eventName, handler) {
	    var disposables = new CompositeDisposable();

	    // Asume NodeList
	    if (Object.prototype.toString.call(el) === '[object NodeList]') {
	      for (var i = 0, len = el.length; i < len; i++) {
	        disposables.add(createEventListener(el.item(i), eventName, handler));
	      }
	    } else if (el) {
	      disposables.add(createListener(el, eventName, handler));
	    }

	    return disposables;
	  }

	  /**
	   * Creates an observable sequence by adding an event listener to the matching DOMElement or each item in the NodeList.
	   *
	   * @example
	   *   var source = Rx.DOM.fromEvent(element, 'mouseup');
	   * 
	   * @param {Object} element The DOMElement or NodeList to attach a listener.
	   * @param {String} eventName The event name to attach the observable sequence.
	   * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.     
	   * @returns {Observable} An observable sequence of events from the specified element and the specified event.
	   */
	  var fromEvent = dom.fromEvent = function (element, eventName, selector) {

	    return new AnonymousObservable(function (observer) {
	      return createEventListener(
	        element, 
	        eventName, 
	        function handler (e) { 
	          var results = e;

	          if (selector) {
	            try {
	              results = selector(arguments);
	            } catch (err) {
	              observer.onError(err);
	              return
	            }
	          }

	          observer.onNext(results); 
	        });
	    }).publish().refCount();
	  };

	  (function () {
	    var events = "blur focus focusin focusout load resize scroll unload click dblclick " +
	      "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	      "change select submit keydown keypress keyup error contextmenu";

	    if (root.PointerEvent) {
	      events += " pointerdown pointerup pointermove pointerover pointerout pointerenter pointerleave";
	    }

	    if (root.TouchEvent) {
	      events += " touchstart touchend touchmove touchcancel";
	    }

	    events = events.split(' ');

	    for(var i = 0, len = events.length; i < len; i++) {
	      (function (e) {
	        dom[e] = function (element, selector) {
	          return fromEvent(element, e, selector);
	        };
	      }(events[i]))
	    }
	  }());

	  /**
	   * Creates an observable sequence when the DOM is loaded
	   * @returns {Observable} An observable sequence fired when the DOM is loaded
	   */
	  dom.ready = function () {
	    return new AnonymousObservable(function (observer) {
	      var addedHandlers = false;

	      function handler () {
	        observer.onNext();
	        observer.onCompleted();
	      }

	      if (document.readyState === 'complete') {
	        setTimeout(handler, 0);
	      } else {
	        addedHandlers = true;
	        document.addEventListener( 'DOMContentLoaded', handler, false );
	        root.addEventListener( 'load', handler, false );
	      }

	      return function () {
	        if (!addedHandlers) { return; }
	        document.removeEventListener( 'DOMContentLoaded', handler, false );
	        root.removeEventListener( 'load', handler, false );
	      };
	    });
	  };


	  // Gets the proper XMLHttpRequest for support for older IE
	  function getXMLHttpRequest() {
	    if (root.XMLHttpRequest) {
	      return new root.XMLHttpRequest();
	    } else {
	      var progId;
	      try {
	        var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
	        for(var i = 0; i < 3; i++) {
	          try {
	            progId = progIds[i];
	            if (new root.ActiveXObject(progId)) {
	              break;
	            }
	          } catch(e) { }
	        }
	        return new root.ActiveXObject(progId);
	      } catch (e) {
	        throw new Error('XMLHttpRequest is not supported by your browser');
	      }
	    }
	  }

	  // Get CORS support even for older IE
	  function getCORSRequest() {
	    if ('withCredentials' in root.XMLHttpRequest.prototype) {
	      return new root.XMLHttpRequest();
	    } else if (!!root.XDomainRequest) {
	      return new XDomainRequest();
	    } else {
	      throw new Error('CORS is not supported by your browser');
	    }
	  }

	  function normalizeAjaxLoadEvent(e, xhr, settings) {
	    var response = ('response' in xhr) ? xhr.response :
	      (settings.responseType === 'json' ? JSON.parse(xhr.responseText) : xhr.responseText);
	    return {
	      response: response,
	      status: xhr.status,
	      responseType: xhr.responseType,
	      xhr: xhr,
	      originalEvent: e
	    };
	  }

	  function normalizeAjaxErrorEvent(e, xhr, type) {
	    return {
	      type: type,
	      status: xhr.status,
	      xhr: xhr,
	      originalEvent: e
	    };
	  }

	  /**
	   * Creates an observable for an Ajax request with either a settings object with url, headers, etc or a string for a URL.
	   *
	   * @example
	   *   source = Rx.DOM.ajax('/products');
	   *   source = Rx.DOM.ajax( url: 'products', method: 'GET' });
	   *
	   * @param {Object} settings Can be one of the following:
	   *
	   *  A string of the URL to make the Ajax call.
	   *  An object with the following properties
	   *   - url: URL of the request
	   *   - body: The body of the request
	   *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
	   *   - async: Whether the request is async
	   *   - headers: Optional headers
	   *   - crossDomain: true if a cross domain request, else false
	   *
	   * @returns {Observable} An observable sequence containing the XMLHttpRequest.
	  */
	  var ajaxRequest = dom.ajax = function (options) {
	    var settings = {
	      method: 'GET',
	      crossDomain: false,
	      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
	      async: true,
	      headers: {},
	      responseType: 'text'
	    };

	    if(typeof options === 'string') {
	      settings.url = options;
	    } else {
	      for(var prop in options) {
	        if(hasOwnProperty.call(options, prop)) {
	          settings[prop] = options[prop];
	        }
	      }
	    }

	    if (!settings.crossDomain && !settings.headers['X-Requested-With']) {
	      settings.headers['X-Requested-With'] = 'XMLHttpRequest';
	    }
	    settings.hasContent = settings.body !== undefined;

	    return new AnonymousObservable(function (observer) {
	      var isDone = false;

	      try {
	        var xhr = settings.crossDomain ? getCORSRequest() : getXMLHttpRequest();
	      } catch (err) {
	        observer.onError(err);
	      }

	      try {
	        if (settings.user) {
	          xhr.open(settings.method, settings.url, settings.async, settings.user, settings.password);
	        } else {
	          xhr.open(settings.method, settings.url, settings.async);
	        }

	        var headers = settings.headers;
	        for (var header in headers) {
	          if (hasOwnProperty.call(headers, header)) {
	            xhr.setRequestHeader(header, headers[header]);
	          }
	        }

	        if(!!xhr.upload || (!('withCredentials' in xhr) && !!root.XDomainRequest)) {
	          xhr.onload = function(e) {
	            if(settings.progressObserver) {
	              settings.progressObserver.onNext(e);
	              settings.progressObserver.onCompleted();
	            }
	            observer.onNext(normalizeAjaxLoadEvent(e, xhr, settings));
	            observer.onCompleted();
	            isDone = true;
	          };

	          if(settings.progressObserver) {
	            xhr.onprogress = function(e) {
	              settings.progressObserver.onNext(e);
	            };
	          }

	          xhr.onerror = function(e) {
	            settings.progressObserver && settings.progressObserver.onError(e);
	            observer.onError(normalizeAjaxErrorEvent(e, xhr, 'error'));
	            isDone = true;
	          };

	          xhr.onabort = function(e) {
	            settings.progressObserver && settings.progressObserver.onError(e);
	            observer.onError(normalizeAjaxErrorEvent(e, xhr, 'abort'));
	            isDone = true;
	          };
	        } else {

	          xhr.onreadystatechange = function (e) {
	            if (xhr.readyState === 4) {
	              var status = xhr.status == 1223 ? 204 : xhr.status;
	              if ((status >= 200 && status <= 300) || status === 0 || status === '') {
	                observer.onNext(normalizeAjaxLoadEvent(e, xhr, settings));
	                observer.onCompleted();
	              } else {
	                observer.onError(normalizeAjaxErrorEvent(e, xhr, 'error'));
	              }
	              isDone = true;
	            }
	          };
	        }

	        xhr.send(settings.hasContent && settings.body || null);
	      } catch (e) {
	        observer.onError(e);
	      }

	      return function () {
	        if (!isDone && xhr.readyState !== 4) { xhr.abort(); }
	      };
	    });
	  };

	  /**
	   * Creates an observable sequence from an Ajax POST Request with the body.
	   *
	   * @param {String} url The URL to POST
	   * @param {Object} body The body to POST
	   * @returns {Observable} The observable sequence which contains the response from the Ajax POST.
	   */
	  dom.post = function (url, body) {
	    return ajaxRequest({ url: url, body: body, method: 'POST' });
	  };

	  /**
	   * Creates an observable sequence from an Ajax GET Request with the body.
	   *
	   * @param {String} url The URL to GET
	   * @returns {Observable} The observable sequence which contains the response from the Ajax GET.
	   */
	  var observableGet = dom.get = function (url) {
	    return ajaxRequest({ url: url });
	  };

	  /**
	   * Creates an observable sequence from JSON from an Ajax request
	   *
	   * @param {String} url The URL to GET
	   * @returns {Observable} The observable sequence which contains the parsed JSON.
	   */
	  dom.getJSON = function (url) {
	    if (!root.JSON && typeof root.JSON.parse !== 'function') { throw new TypeError('JSON is not supported in your runtime.'); }
	    return ajaxRequest({url: url, responseType: 'json'}).map(function (x) {
	      return x.response;
	    });
	  };

	  /** @private
	   * Destroys the current element
	   */
	  var destroy = (function () {
	    var trash = document.createElement('div');
	    return function (element) {
	      trash.appendChild(element);
	      trash.innerHTML = '';
	    };
	  })();

	  /**
	   * Creates an observable JSONP Request with the specified settings.
	   *
	   * @example
	   *   source = Rx.DOM.jsonpRequest('http://www.bing.com/?q=foo&JSONPCallback=?');
	   *   source = Rx.DOM.jsonpRequest( url: 'http://bing.com/?q=foo', jsonp: 'JSONPCallback' });
	   *
	   * @param {Object} settings Can be one of the following:
	   *
	   *  A string of the URL to make the JSONP call with the JSONPCallback=? in the url.
	   *  An object with the following properties
	   *   - url: URL of the request
	   *   - jsonp: The named callback parameter for the JSONP call
	   *   - jsonpCallback: Callback to execute. For when the JSONP callback can't be changed
	   *
	   * @returns {Observable} A cold observable containing the results from the JSONP call.
	   */
	   dom.jsonpRequest = (function() {
	     var id = 0;

	     return function(options) {
	       return new AnonymousObservable(function(observer) {

	         var callbackId = 'callback_' + (id++).toString(36);

	         var settings = {
	           jsonp: 'JSONPCallback',
	           async: true,
	           jsonpCallback: 'rxjsjsonpCallbacks' + callbackId
	         };

	         if(typeof options === 'string') {
	           settings.url = options;
	         } else {
	           for(var prop in options) {
	             if(hasOwnProperty.call(options, prop)) {
	               settings[prop] = options[prop];
	             }
	           }
	         }

	         var script = document.createElement('script');
	         script.type = 'text/javascript';
	         script.async = settings.async;
	         script.src = settings.url.replace(settings.jsonp, settings.jsonpCallback);

	         root[settings.jsonpCallback] = function(data) {
	           root[settings.jsonpCallback].called = true;
	           root[settings.jsonpCallback].data = data;
	         };

	         var handler = function(e) {
	           if(e.type === 'load' && !root[settings.jsonpCallback].called) {
	             e = { type: 'error' };
	           }
	           var status = e.type === 'error' ? 400 : 200;
	           var data = root[settings.jsonpCallback].data;

	           if(status === 200) {
	             observer.onNext({
	               status: status,
	               responseType: 'jsonp',
	               response: data,
	               originalEvent: e
	             });

	             observer.onCompleted();
	           }
	           else {
	             observer.onError({
	               type: 'error',
	               status: status,
	               originalEvent: e
	             });
	           }
	         };

	         script.onload = script.onreadystatechanged = script.onerror = handler;

	         var head = document.getElementsByTagName('head')[0] || document.documentElement;
	         head.insertBefore(script, head.firstChild);

	         return function() {
	           script.onload = script.onreadystatechanged = script.onerror = null;
	           destroy(script);
	           script = null;
	         };
	       });
	     }
	   }());

	   /**
	   * Creates a WebSocket Subject with a given URL, protocol and an optional observer for the open event.
	   *
	   * @example
	   *  var socket = Rx.DOM.fromWebSocket('http://localhost:8080', 'stock-protocol', openObserver, closingObserver);
	   *
	   * @param {String} url The URL of the WebSocket.
	   * @param {String} protocol The protocol of the WebSocket.
	   * @param {Observer} [openObserver] An optional Observer to capture the open event.
	   * @param {Observer} [closingObserver] An optional Observer to capture the moment before the underlying socket is closed.
	   * @returns {Subject} An observable sequence wrapping a WebSocket.
	   */
	  dom.fromWebSocket = function (url, protocol, openObserver, closingObserver) {
	    if (!WebSocket) { throw new TypeError('WebSocket not implemented in your runtime.'); }

	    var socket;

	    var socketClose = function(code, reason) {
	      if(socket) {
	        if(closingObserver) {
	          closingObserver.onNext();
	          closingObserver.onCompleted();
	        }
	        if(!code) {
	          socket.close();
	        } else {
	          socket.close(code, reason);
	        }
	      }
	    };

	    var observable = new AnonymousObservable(function (obs) {
	      socket = protocol ? new WebSocket(url, protocol) : new WebSocket(url);

	      var openHandler = function(e) {
	        openObserver.onNext(e);
	        openObserver.onCompleted();
	        socket.removeEventListener('open', openHandler, false);
	      };
	      var messageHandler = function(e) { obs.onNext(e); };
	      var errHandler = function(e) { obs.onError(e); };
	      var closeHandler = function(e) {
	        if(e.code !== 1000 || !e.wasClean) {
	          return obs.onError(e);
	        }
	        obs.onCompleted();
	      };

	      openObserver && socket.addEventListener('open', openHandler, false);
	      socket.addEventListener('message', messageHandler, false);
	      socket.addEventListener('error', errHandler, false);
	      socket.addEventListener('close', closeHandler, false);

	      return function () {
	        socketClose();

	        socket.removeEventListener('message', messageHandler, false);
	        socket.removeEventListener('error', errHandler, false);
	        socket.removeEventListener('close', closeHandler, false);
	      };
	    });

	    var observer = observerCreate(function (data) {
	      socket.readyState === WebSocket.OPEN && socket.send(data);
	    },
	    function(e) {
	      if (!e.code) {
	        throw new Error('no code specified. be sure to pass { code: ###, reason: "" } to onError()');
	      }

	      socketClose(e.code, e.reason || '');
	    },
	    function() {
	      socketClose(1000, '');
	    });

	    return Subject.create(observer, observable);
	  };

	  /**
	   * Creates a Web Worker with a given URL as a Subject.
	   *
	   * @example
	   * var worker = Rx.DOM.fromWebWorker('worker.js');
	   *
	   * @param {String} url The URL of the Web Worker.
	   * @returns {Subject} A Subject wrapping the Web Worker.
	   */
	  dom.fromWebWorker = function (url) {
	    if (!root.Worker) { throw new TypeError('Worker not implemented in your runtime.'); }
	    var worker = new root.Worker(url);

	    var observable = new AnonymousObservable(function (obs) {

	      function messageHandler(data) { obs.onNext(data); }
	      function errHandler(err) { obs.onError(err); }

	      worker.addEventListener('message', messageHandler, false);
	      worker.addEventListener('error', errHandler, false);

	      return function () {
	        worker.close();
	        worker.removeEventListener('message', messageHandler, false);
	        worker.removeEventListener('error', errHandler, false);
	      };
	    });

	    var observer = observerCreate(function (data) {
	      worker.postMessage(data);
	    });

	    return Subject.create(observer, observable);
	  };

	  /**
	   * This method wraps an EventSource as an observable sequence.
	   * @param {String} url The url of the server-side script.
	   * @param {Observer} [openObserver] An optional observer for the 'open' event for the server side event.
	   * @returns {Observable} An observable sequence which represents the data from a server-side event.
	   */
	  dom.fromEventSource = function (url, openObserver) {
	    if (!root.EventSource) { throw new TypeError('EventSource not implemented in your runtime.'); }
	    return new AnonymousObservable(function (observer) {
	      var source = new root.EventSource(url);

	      function onOpen(e) {
	        openObserver.onNext(e);
	        openObserver.onCompleted();
	        source.removeEventListener('open', onOpen, false);
	      }

	      function onError(e) {
	        if (e.readyState === EventSource.CLOSED) {
	          observer.onCompleted();
	        } else {
	          observer.onError(e);
	        }
	      }

	      function onMessage(e) {
	        observer.onNext(e);
	      }

	      openObserver && source.addEventListener('open', onOpen, false);
	      source.addEventListener('error', onError, false);
	      source.addEventListener('message', onMessage, false);

	      return function () {
	        source.removeEventListener('error', onError, false);
	        source.removeEventListener('message', onMessage, false);
	        source.close();
	      };
	    });
	  };

	  /**
	   * Creates an observable sequence from a Mutation Observer.
	   * MutationObserver provides developers a way to react to changes in a DOM.
	   * @example
	   *  Rx.DOM.fromMutationObserver(document.getElementById('foo'), { attributes: true, childList: true, characterData: true });
	   *
	   * @param {Object} target The Node on which to obserave DOM mutations.
	   * @param {Object} options A MutationObserverInit object, specifies which DOM mutations should be reported.
	   * @returns {Observable} An observable sequence which contains mutations on the given DOM target.
	   */
	  dom.fromMutationObserver = function (target, options) {
	    var BrowserMutationObserver = root.MutationObserver || root.WebKitMutationObserver;
	    if (!BrowserMutationObserver) { throw new TypeError('MutationObserver not implemented in your runtime.'); }
	    return observableCreate(function (observer) {
	      var mutationObserver = new BrowserMutationObserver(observer.onNext.bind(observer));
	      mutationObserver.observe(target, options);

	      return mutationObserver.disconnect.bind(mutationObserver);
	    });
	  };

	  // Get the right animation frame method
	  var requestAnimFrame, cancelAnimFrame;
	  if (root.requestAnimationFrame) {
	    requestAnimFrame = root.requestAnimationFrame;
	    cancelAnimFrame = root.cancelAnimationFrame;
	  } else if (root.mozRequestAnimationFrame) {
	    requestAnimFrame = root.mozRequestAnimationFrame;
	    cancelAnimFrame = root.mozCancelAnimationFrame;
	  } else if (root.webkitRequestAnimationFrame) {
	    requestAnimFrame = root.webkitRequestAnimationFrame;
	    cancelAnimFrame = root.webkitCancelAnimationFrame;
	  } else if (root.msRequestAnimationFrame) {
	    requestAnimFrame = root.msRequestAnimationFrame;
	    cancelAnimFrame = root.msCancelAnimationFrame;
	  } else if (root.oRequestAnimationFrame) {
	    requestAnimFrame = root.oRequestAnimationFrame;
	    cancelAnimFrame = root.oCancelAnimationFrame;
	  } else {
	    requestAnimFrame = function(cb) { root.setTimeout(cb, 1000 / 60); };
	    cancelAnimFrame = root.clearTimeout;
	  }

	  /**
	   * Gets a scheduler that schedules schedules work on the requestAnimationFrame for immediate actions.
	   */
	  Scheduler.requestAnimationFrame = (function () {

	    function scheduleNow(state, action) {
	      var scheduler = this,
	        disposable = new SingleAssignmentDisposable();
	      var id = requestAnimFrame(function () {
	        !disposable.isDisposed && (disposable.setDisposable(action(scheduler, state)));
	      });
	      return new CompositeDisposable(disposable, disposableCreate(function () {
	        cancelAnimFrame(id);
	      }));
	    }

	    function scheduleRelative(state, dueTime, action) {
	      var scheduler = this, dt = Scheduler.normalize(dueTime);
	      if (dt === 0) { return scheduler.scheduleWithState(state, action); }
	      var disposable = new SingleAssignmentDisposable();
	      var id = root.setTimeout(function () {
	        if (!disposable.isDisposed) {
	          disposable.setDisposable(action(scheduler, state));
	        }
	      }, dt);
	      return new CompositeDisposable(disposable, disposableCreate(function () {
	        root.clearTimeout(id);
	      }));
	    }

	    function scheduleAbsolute(state, dueTime, action) {
	      return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
	    }

	    return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);

	  }());

	  /**
	   * Scheduler that uses a MutationObserver changes as the scheduling mechanism
	   */
	  Scheduler.microtask = (function () {

	    var nextHandle = 1, tasksByHandle = {}, currentlyRunning = false, scheduleMethod;

	    function clearMethod(handle) {
	      delete tasksByHandle[handle];
	    }

	    function runTask(handle) {
	      if (currentlyRunning) {
	        root.setTimeout(function () { runTask(handle) }, 0);
	      } else {
	        var task = tasksByHandle[handle];
	        if (task) {
	          currentlyRunning = true;
	          try {
	            task();
	          } catch (e) {
	            throw e;
	          } finally {
	            clearMethod(handle);
	            currentlyRunning = false;
	          }
	        }
	      }
	    }

	    function postMessageSupported () {
	      // Ensure not in a worker
	      if (!root.postMessage || root.importScripts) { return false; }
	      var isAsync = false, oldHandler = root.onmessage;
	      // Test for async
	      root.onmessage = function () { isAsync = true; };
	      root.postMessage('', '*');
	      root.onmessage = oldHandler;

	      return isAsync;
	    }

	    // Use in order, setImmediate, nextTick, postMessage, MessageChannel, script readystatechanged, setTimeout
	    var BrowserMutationObserver = root.MutationObserver || root.WebKitMutationObserver;
	    if (!!BrowserMutationObserver) {

	      var PREFIX = 'drainqueue_';

	      var observer = new BrowserMutationObserver(function(mutations) {
	        mutations.forEach(function (mutation) {
	          runTask(mutation.attributeName.substring(PREFIX.length));
	        })
	      });

	      var element = document.createElement('div');
	      observer.observe(element, { attributes: true });

	      // Prevent leaks
	      root.addEventListener('unload', function () {
	        observer.disconnect();
	        observer = null;
	      }, false);

	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[id] = action;
	        element.setAttribute(PREFIX + id, 'drainQueue');
	        return id;
	      };
	    } else if (typeof root.setImmediate === 'function') {
	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[id] = action;
	        root.setImmediate(function () {
	          runTask(id);
	        });

	        return id;
	      };
	    } else if (postMessageSupported()) {
	      var MSG_PREFIX = 'ms.rx.schedule' + Math.random();

	      function onGlobalPostMessage(event) {
	        // Only if we're a match to avoid any other global events
	        if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
	          runTask(event.data.substring(MSG_PREFIX.length));
	        }
	      }

	      if (root.addEventListener) {
	        root.addEventListener('message', onGlobalPostMessage, false);
	      } else if (root.attachEvent){
	        root.attachEvent('onmessage', onGlobalPostMessage);
	      }

	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[currentId] = action;
	        root.postMessage(MSG_PREFIX + currentId, '*');
	        return id;
	      };
	    } else if (!!root.MessageChannel) {
	      var channel = new root.MessageChannel();

	      channel.port1.onmessage = function (event) {
	        runTask(event.data);
	      };

	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[id] = action;
	        channel.port2.postMessage(id);
	        return id;
	      };
	    } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {

	      scheduleMethod = function (action) {
	        var scriptElement = root.document.createElement('script');
	        var id = nextHandle++;
	        tasksByHandle[id] = action;

	        scriptElement.onreadystatechange = function () {
	          runTask(id);
	          scriptElement.onreadystatechange = null;
	          scriptElement.parentNode.removeChild(scriptElement);
	          scriptElement = null;
	        };
	        root.document.documentElement.appendChild(scriptElement);

	        return id;
	      };

	    } else {
	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[id] = action;
	        root.setTimeout(function () {
	          runTask(id);
	        }, 0);

	        return id;
	      };
	    }

	    function scheduleNow(state, action) {

	      var scheduler = this,
	        disposable = new SingleAssignmentDisposable();

	      var id = scheduleMethod(function () {
	        !disposable.isDisposed && (disposable.setDisposable(action(scheduler, state)));
	      });

	      return new CompositeDisposable(disposable, disposableCreate(function () {
	        clearMethod(id);
	      }));
	    }

	    function scheduleRelative(state, dueTime, action) {
	      var scheduler = this, dt = Scheduler.normalize(dueTime);
	      if (dt === 0) { return scheduler.scheduleWithState(state, action); }
	      var disposable = new SingleAssignmentDisposable();
	      var id = root.setTimeout(function () {
	        if (!disposable.isDisposed) {
	          disposable.setDisposable(action(scheduler, state));
	        }
	      }, dt);
	      return new CompositeDisposable(disposable, disposableCreate(function () {
	        root.clearTimeout(id);
	      }));
	    }

	    function scheduleAbsolute(state, dueTime, action) {
	      return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
	    }

	    return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);
	  }());

	  Rx.DOM.geolocation = {
	    /**
	    * Obtains the geographic position, in terms of latitude and longitude coordinates, of the device.
	    * @param {Object} [geolocationOptions] An object literal to specify one or more of the following attributes and desired values:
	    *   - enableHighAccuracy: Specify true to obtain the most accurate position possible, or false to optimize in favor of performance and power consumption.
	    *   - timeout: An Integer value that indicates the time, in milliseconds, allowed for obtaining the position.
	    *              If timeout is Infinity, (the default value) the location request will not time out.
	    *              If timeout is zero (0) or negative, the results depend on the behavior of the location provider.
	    *   - maximumAge: An Integer value indicating the maximum age, in milliseconds, of cached position information.
	    *                 If maximumAge is non-zero, and a cached position that is no older than maximumAge is available, the cached position is used instead of obtaining an updated location.
	    *                 If maximumAge is zero (0), watchPosition always tries to obtain an updated position, even if a cached position is already available.
	    *                 If maximumAge is Infinity, any cached position is used, regardless of its age, and watchPosition only tries to obtain an updated position if no cached position data exists.
	    * @returns {Observable} An observable sequence with the geographical location of the device running the client.
	    */
	    getCurrentPosition: function (geolocationOptions) {
	      if (!root.navigator && !root.navigation.geolocation) { throw new TypeError('geolocation not available'); }

	      return new AnonymousObservable(function (observer) {
	        root.navigator.geolocation.getCurrentPosition(
	          function (data) {
	            observer.onNext(data);
	            observer.onCompleted();
	          },
	          observer.onError.bind(observer),
	          geolocationOptions);
	      });
	    },

	    /**
	    * Begins listening for updates to the current geographical location of the device running the client.
	    * @param {Object} [geolocationOptions] An object literal to specify one or more of the following attributes and desired values:
	    *   - enableHighAccuracy: Specify true to obtain the most accurate position possible, or false to optimize in favor of performance and power consumption.
	    *   - timeout: An Integer value that indicates the time, in milliseconds, allowed for obtaining the position.
	    *              If timeout is Infinity, (the default value) the location request will not time out.
	    *              If timeout is zero (0) or negative, the results depend on the behavior of the location provider.
	    *   - maximumAge: An Integer value indicating the maximum age, in milliseconds, of cached position information.
	    *                 If maximumAge is non-zero, and a cached position that is no older than maximumAge is available, the cached position is used instead of obtaining an updated location.
	    *                 If maximumAge is zero (0), watchPosition always tries to obtain an updated position, even if a cached position is already available.
	    *                 If maximumAge is Infinity, any cached position is used, regardless of its age, and watchPosition only tries to obtain an updated position if no cached position data exists.
	    * @returns {Observable} An observable sequence with the current geographical location of the device running the client.
	    */
	    watchPosition: function (geolocationOptions) {
	      if (!root.navigator && !root.navigation.geolocation) { throw new TypeError('geolocation not available'); }

	      return new AnonymousObservable(function (observer) {
	        var watchId = root.navigator.geolocation.watchPosition(
	          observer.onNext.bind(observer),
	          observer.onError.bind(observer),
	          geolocationOptions);

	        return function () {
	          root.navigator.geolocation.clearWatch(watchId);
	        };
	      }).publish().refCount();
	    }
	  };

	  /**
	   * The FileReader object lets web applications asynchronously read the contents of
	   * files (or raw data buffers) stored on the user's computer, using File or Blob objects
	   * to specify the file or data to read as an observable sequence.
	   * @param {String} file The file to read.
	   * @param {Observer} An observer to watch for progress.
	   * @returns {Object} An object which contains methods for reading the data.
	   */
	  dom.fromReader = function(file, progressObserver) {
	    if (!root.FileReader) { throw new TypeError('FileReader not implemented in your runtime.'); }

	    function _fromReader(readerFn, file, encoding) {
	      return new AnonymousObservable(function(observer) {
	        var reader = new root.FileReader();
	        var subject = new AsyncSubject();

	        function loadHandler(e) {
	          progressObserver && progressObserver.onCompleted();
	          subject.onNext(e.target.result);
	          subject.onCompleted();
	        }

	        function errorHandler(e) {
	          subject.onError(e.target.error);
	        }

	        function progressHandler(e) {
	          progressObserver.onNext(e);
	        }

	        reader.addEventListener('load', loadHandler, false);
	        reader.addEventListener('error', errorHandler, false);
	        progressObserver && reader.addEventListener('progress', progressHandler, false);

	        reader[readerFn](file, encoding);

	        return new CompositeDisposable(subject.subscribe(observer), disposableCreate(function () {
	          reader.readyState == root.FileReader.LOADING && reader.abort();
	          reader.removeEventListener('load', loadHandler, false);
	          reader.removeEventListener('error', errorHandler, false);
	          progressObserver && reader.removeEventListener('progress', progressHandler, false);
	        }));
	      });
	    }

	    return {
	      /**
	       * This method is used to read the file as an ArrayBuffer as an Observable stream.
	       * @returns {Observable} An observable stream of an ArrayBuffer
	       */
	      asArrayBuffer : function() {
	        return _fromReader('readAsArrayBuffer', file);
	      },
	      /**
	       * This method is used to read the file as a binary data string as an Observable stream.
	       * @returns {Observable} An observable stream of a binary data string.
	       */
	      asBinaryString : function() {
	        return _fromReader('readAsBinaryString', file);
	      },
	      /**
	       * This method is used to read the file as a URL of the file's data as an Observable stream.
	       * @returns {Observable} An observable stream of a URL representing the file's data.
	       */
	      asDataURL : function() {
	        return _fromReader('readAsDataURL', file);
	      },
	      /**
	       * This method is used to read the file as a string as an Observable stream.
	       * @returns {Observable} An observable stream of the string contents of the file.
	       */
	      asText : function(encoding) {
	        return _fromReader('readAsText', file, encoding);
	      }
	    };
	  };

	  return Rx;
	}));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)(module), (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global, process) {// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

	;(function (undefined) {

	  var objectTypes = {
	    'boolean': false,
	    'function': true,
	    'object': true,
	    'number': false,
	    'string': false,
	    'undefined': false
	  };

	  var root = (objectTypes[typeof window] && window) || this,
	    freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
	    freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
	    moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
	    freeGlobal = objectTypes[typeof global] && global;

	  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
	    root = freeGlobal;
	  }

	  var Rx = {
	      internals: {},
	      config: {
	        Promise: root.Promise
	      },
	      helpers: { }
	  };

	  // Defaults
	  var noop = Rx.helpers.noop = function () { },
	    notDefined = Rx.helpers.notDefined = function (x) { return typeof x === 'undefined'; },
	    isScheduler = Rx.helpers.isScheduler = function (x) { return x instanceof Rx.Scheduler; },
	    identity = Rx.helpers.identity = function (x) { return x; },
	    pluck = Rx.helpers.pluck = function (property) { return function (x) { return x[property]; }; },
	    just = Rx.helpers.just = function (value) { return function () { return value; }; },
	    defaultNow = Rx.helpers.defaultNow = Date.now,
	    defaultComparer = Rx.helpers.defaultComparer = function (x, y) { return isEqual(x, y); },
	    defaultSubComparer = Rx.helpers.defaultSubComparer = function (x, y) { return x > y ? 1 : (x < y ? -1 : 0); },
	    defaultKeySerializer = Rx.helpers.defaultKeySerializer = function (x) { return x.toString(); },
	    defaultError = Rx.helpers.defaultError = function (err) { throw err; },
	    isPromise = Rx.helpers.isPromise = function (p) { return !!p && typeof p.then === 'function'; },
	    asArray = Rx.helpers.asArray = function () { return Array.prototype.slice.call(arguments); },
	    not = Rx.helpers.not = function (a) { return !a; },
	    isFunction = Rx.helpers.isFunction = (function () {

	      var isFn = function (value) {
	        return typeof value == 'function' || false;
	      }

	      // fallback for older versions of Chrome and Safari
	      if (isFn(/x/)) {
	        isFn = function(value) {
	          return typeof value == 'function' && toString.call(value) == '[object Function]';
	        };
	      }

	      return isFn;
	    }());

	  function cloneArray(arr) { for(var a = [], i = 0, len = arr.length; i < len; i++) { a.push(arr[i]); } return a;}

	  Rx.config.longStackSupport = false;
	  var hasStacks = false;
	  try {
	    throw new Error();
	  } catch (e) {
	    hasStacks = !!e.stack;
	  }

	  // All code after this point will be filtered from stack traces reported by RxJS
	  var rStartingLine = captureLine(), rFileName;

	  var STACK_JUMP_SEPARATOR = "From previous event:";

	  function makeStackTraceLong(error, observable) {
	      // If possible, transform the error stack trace by removing Node and RxJS
	      // cruft, then concatenating with the stack trace of `observable`.
	      if (hasStacks &&
	          observable.stack &&
	          typeof error === "object" &&
	          error !== null &&
	          error.stack &&
	          error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
	      ) {
	        var stacks = [];
	        for (var o = observable; !!o; o = o.source) {
	          if (o.stack) {
	            stacks.unshift(o.stack);
	          }
	        }
	        stacks.unshift(error.stack);

	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        error.stack = filterStackString(concatedStacks);
	    }
	  }

	  function filterStackString(stackString) {
	    var lines = stackString.split("\n"),
	        desiredLines = [];
	    for (var i = 0, len = lines.length; i < len; i++) {
	      var line = lines[i];

	      if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	        desiredLines.push(line);
	      }
	    }
	    return desiredLines.join("\n");
	  }

	  function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
	    if (!fileNameAndLineNumber) {
	      return false;
	    }
	    var fileName = fileNameAndLineNumber[0], lineNumber = fileNameAndLineNumber[1];

	    return fileName === rFileName &&
	      lineNumber >= rStartingLine &&
	      lineNumber <= rEndingLine;
	  }

	  function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	      stackLine.indexOf("(node.js:") !== -1;
	  }

	  function captureLine() {
	    if (!hasStacks) { return; }

	    try {
	      throw new Error();
	    } catch (e) {
	      var lines = e.stack.split("\n");
	      var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	      var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	      if (!fileNameAndLineNumber) { return; }

	      rFileName = fileNameAndLineNumber[0];
	      return fileNameAndLineNumber[1];
	    }
	  }

	  function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) { return [attempt1[1], Number(attempt1[2])]; }

	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) { return [attempt2[1], Number(attempt2[2])]; }

	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) { return [attempt3[1], Number(attempt3[2])]; }
	  }

	  var EmptyError = Rx.EmptyError = function() {
	    this.message = 'Sequence contains no elements.';
	    Error.call(this);
	  };
	  EmptyError.prototype = Error.prototype;

	  var ObjectDisposedError = Rx.ObjectDisposedError = function() {
	    this.message = 'Object has been disposed';
	    Error.call(this);
	  };
	  ObjectDisposedError.prototype = Error.prototype;

	  var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function () {
	    this.message = 'Argument out of range';
	    Error.call(this);
	  };
	  ArgumentOutOfRangeError.prototype = Error.prototype;

	  var NotSupportedError = Rx.NotSupportedError = function (message) {
	    this.message = message || 'This operation is not supported';
	    Error.call(this);
	  };
	  NotSupportedError.prototype = Error.prototype;

	  var NotImplementedError = Rx.NotImplementedError = function (message) {
	    this.message = message || 'This operation is not implemented';
	    Error.call(this);
	  };
	  NotImplementedError.prototype = Error.prototype;

	  var notImplemented = Rx.helpers.notImplemented = function () {
	    throw new NotImplementedError();
	  };

	  var notSupported = Rx.helpers.notSupported = function () {
	    throw new NotSupportedError();
	  };

	  // Shim in iterator support
	  var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) ||
	    '_es6shim_iterator_';
	  // Bug for mozilla version
	  if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
	    $iterator$ = '@@iterator';
	  }

	  var doneEnumerator = Rx.doneEnumerator = { done: true, value: undefined };

	  var isIterable = Rx.helpers.isIterable = function (o) {
	    return o[$iterator$] !== undefined;
	  }

	  var isArrayLike = Rx.helpers.isArrayLike = function (o) {
	    return o && o.length !== undefined;
	  }

	  Rx.helpers.iterator = $iterator$;

	  var bindCallback = Rx.internals.bindCallback = function (func, thisArg, argCount) {
	    if (typeof thisArg === 'undefined') { return func; }
	    switch(argCount) {
	      case 0:
	        return function() {
	          return func.call(thisArg)
	        };
	      case 1:
	        return function(arg) {
	          return func.call(thisArg, arg);
	        }
	      case 2:
	        return function(value, index) {
	          return func.call(thisArg, value, index);
	        };
	      case 3:
	        return function(value, index, collection) {
	          return func.call(thisArg, value, index, collection);
	        };
	    }

	    return function() {
	      return func.apply(thisArg, arguments);
	    };
	  };

	  /** Used to determine if values are of the language type Object */
	  var dontEnums = ['toString',
	    'toLocaleString',
	    'valueOf',
	    'hasOwnProperty',
	    'isPrototypeOf',
	    'propertyIsEnumerable',
	    'constructor'],
	  dontEnumsLength = dontEnums.length;

	  /** `Object#toString` result shortcuts */
	  var argsClass = '[object Arguments]',
	    arrayClass = '[object Array]',
	    boolClass = '[object Boolean]',
	    dateClass = '[object Date]',
	    errorClass = '[object Error]',
	    funcClass = '[object Function]',
	    numberClass = '[object Number]',
	    objectClass = '[object Object]',
	    regexpClass = '[object RegExp]',
	    stringClass = '[object String]';

	  var toString = Object.prototype.toString,
	    hasOwnProperty = Object.prototype.hasOwnProperty,
	    supportsArgsClass = toString.call(arguments) == argsClass, // For less <IE9 && FF<4
	    supportNodeClass,
	    errorProto = Error.prototype,
	    objectProto = Object.prototype,
	    stringProto = String.prototype,
	    propertyIsEnumerable = objectProto.propertyIsEnumerable;

	  try {
	    supportNodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
	  } catch (e) {
	    supportNodeClass = true;
	  }

	  var nonEnumProps = {};
	  nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
	  nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
	  nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
	  nonEnumProps[objectClass] = { 'constructor': true };

	  var support = {};
	  (function () {
	    var ctor = function() { this.x = 1; },
	      props = [];

	    ctor.prototype = { 'valueOf': 1, 'y': 1 };
	    for (var key in new ctor) { props.push(key); }
	    for (key in arguments) { }

	    // Detect if `name` or `message` properties of `Error.prototype` are enumerable by default.
	    support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

	    // Detect if `prototype` properties are enumerable by default.
	    support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

	    // Detect if `arguments` object indexes are non-enumerable
	    support.nonEnumArgs = key != 0;

	    // Detect if properties shadowing those on `Object.prototype` are non-enumerable.
	    support.nonEnumShadows = !/valueOf/.test(props);
	  }(1));

	  var isObject = Rx.internals.isObject = function(value) {
	    var type = typeof value;
	    return value && (type == 'function' || type == 'object') || false;
	  };

	  function keysIn(object) {
	    var result = [];
	    if (!isObject(object)) {
	      return result;
	    }
	    if (support.nonEnumArgs && object.length && isArguments(object)) {
	      object = slice.call(object);
	    }
	    var skipProto = support.enumPrototypes && typeof object == 'function',
	        skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error);

	    for (var key in object) {
	      if (!(skipProto && key == 'prototype') &&
	          !(skipErrorProps && (key == 'message' || key == 'name'))) {
	        result.push(key);
	      }
	    }

	    if (support.nonEnumShadows && object !== objectProto) {
	      var ctor = object.constructor,
	          index = -1,
	          length = dontEnumsLength;

	      if (object === (ctor && ctor.prototype)) {
	        var className = object === stringProto ? stringClass : object === errorProto ? errorClass : toString.call(object),
	            nonEnum = nonEnumProps[className];
	      }
	      while (++index < length) {
	        key = dontEnums[index];
	        if (!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)) {
	          result.push(key);
	        }
	      }
	    }
	    return result;
	  }

	  function internalFor(object, callback, keysFunc) {
	    var index = -1,
	      props = keysFunc(object),
	      length = props.length;

	    while (++index < length) {
	      var key = props[index];
	      if (callback(object[key], key, object) === false) {
	        break;
	      }
	    }
	    return object;
	  }

	  function internalForIn(object, callback) {
	    return internalFor(object, callback, keysIn);
	  }

	  function isNode(value) {
	    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
	    // methods that are `typeof` "string" and still can coerce nodes to strings
	    return typeof value.toString != 'function' && typeof (value + '') == 'string';
	  }

	  var isArguments = function(value) {
	    return (value && typeof value == 'object') ? toString.call(value) == argsClass : false;
	  }

	  // fallback for browsers that can't detect `arguments` objects by [[Class]]
	  if (!supportsArgsClass) {
	    isArguments = function(value) {
	      return (value && typeof value == 'object') ? hasOwnProperty.call(value, 'callee') : false;
	    };
	  }

	  var isEqual = Rx.internals.isEqual = function (x, y) {
	    return deepEquals(x, y, [], []);
	  };

	  /** @private
	   * Used for deep comparison
	   **/
	  function deepEquals(a, b, stackA, stackB) {
	    // exit early for identical values
	    if (a === b) {
	      // treat `+0` vs. `-0` as not equal
	      return a !== 0 || (1 / a == 1 / b);
	    }

	    var type = typeof a,
	        otherType = typeof b;

	    // exit early for unlike primitive values
	    if (a === a && (a == null || b == null ||
	        (type != 'function' && type != 'object' && otherType != 'function' && otherType != 'object'))) {
	      return false;
	    }

	    // compare [[Class]] names
	    var className = toString.call(a),
	        otherClass = toString.call(b);

	    if (className == argsClass) {
	      className = objectClass;
	    }
	    if (otherClass == argsClass) {
	      otherClass = objectClass;
	    }
	    if (className != otherClass) {
	      return false;
	    }
	    switch (className) {
	      case boolClass:
	      case dateClass:
	        // coerce dates and booleans to numbers, dates to milliseconds and booleans
	        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
	        return +a == +b;

	      case numberClass:
	        // treat `NaN` vs. `NaN` as equal
	        return (a != +a) ?
	          b != +b :
	          // but treat `-0` vs. `+0` as not equal
	          (a == 0 ? (1 / a == 1 / b) : a == +b);

	      case regexpClass:
	      case stringClass:
	        // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
	        // treat string primitives and their corresponding object instances as equal
	        return a == String(b);
	    }
	    var isArr = className == arrayClass;
	    if (!isArr) {

	      // exit for functions and DOM nodes
	      if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
	        return false;
	      }
	      // in older versions of Opera, `arguments` objects have `Array` constructors
	      var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
	          ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

	      // non `Object` object instances with different constructors are not equal
	      if (ctorA != ctorB &&
	            !(hasOwnProperty.call(a, 'constructor') && hasOwnProperty.call(b, 'constructor')) &&
	            !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
	            ('constructor' in a && 'constructor' in b)
	          ) {
	        return false;
	      }
	    }
	    // assume cyclic structures are equal
	    // the algorithm for detecting cyclic structures is adapted from ES 5.1
	    // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
	    var initedStack = !stackA;
	    stackA || (stackA = []);
	    stackB || (stackB = []);

	    var length = stackA.length;
	    while (length--) {
	      if (stackA[length] == a) {
	        return stackB[length] == b;
	      }
	    }
	    var size = 0;
	    var result = true;

	    // add `a` and `b` to the stack of traversed objects
	    stackA.push(a);
	    stackB.push(b);

	    // recursively compare objects and arrays (susceptible to call stack limits)
	    if (isArr) {
	      // compare lengths to determine if a deep comparison is necessary
	      length = a.length;
	      size = b.length;
	      result = size == length;

	      if (result) {
	        // deep compare the contents, ignoring non-numeric properties
	        while (size--) {
	          var index = length,
	              value = b[size];

	          if (!(result = deepEquals(a[size], value, stackA, stackB))) {
	            break;
	          }
	        }
	      }
	    }
	    else {
	      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
	      // which, in this case, is more costly
	      internalForIn(b, function(value, key, b) {
	        if (hasOwnProperty.call(b, key)) {
	          // count the number of properties.
	          size++;
	          // deep compare each property value.
	          return (result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB));
	        }
	      });

	      if (result) {
	        // ensure both objects have the same number of properties
	        internalForIn(a, function(value, key, a) {
	          if (hasOwnProperty.call(a, key)) {
	            // `size` will be `-1` if `a` has more properties than `b`
	            return (result = --size > -1);
	          }
	        });
	      }
	    }
	    stackA.pop();
	    stackB.pop();

	    return result;
	  }

	  var hasProp = {}.hasOwnProperty,
	      slice = Array.prototype.slice;

	  var inherits = this.inherits = Rx.internals.inherits = function (child, parent) {
	    function __() { this.constructor = child; }
	    __.prototype = parent.prototype;
	    child.prototype = new __();
	  };

	  var addProperties = Rx.internals.addProperties = function (obj) {
	    for(var sources = [], i = 1, len = arguments.length; i < len; i++) { sources.push(arguments[i]); }
	    for (var idx = 0, ln = sources.length; idx < ln; idx++) {
	      var source = sources[idx];
	      for (var prop in source) {
	        obj[prop] = source[prop];
	      }
	    }
	  };

	  // Rx Utils
	  var addRef = Rx.internals.addRef = function (xs, r) {
	    return new AnonymousObservable(function (observer) {
	      return new CompositeDisposable(r.getDisposable(), xs.subscribe(observer));
	    });
	  };

	  function arrayInitialize(count, factory) {
	    var a = new Array(count);
	    for (var i = 0; i < count; i++) {
	      a[i] = factory();
	    }
	    return a;
	  }

	  var errorObj = {e: {}};
	  var tryCatchTarget;
	  function tryCatcher() {
	    try {
	      return tryCatchTarget.apply(this, arguments);
	    } catch (e) {
	      errorObj.e = e;
	      return errorObj;
	    }
	  }
	  function tryCatch(fn) {
	    if (!isFunction(fn)) { throw new TypeError('fn must be a function'); }
	    tryCatchTarget = fn;
	    return tryCatcher;
	  }
	  function thrower(e) {
	    throw e;
	  }

	  // Collections
	  function IndexedItem(id, value) {
	    this.id = id;
	    this.value = value;
	  }

	  IndexedItem.prototype.compareTo = function (other) {
	    var c = this.value.compareTo(other.value);
	    c === 0 && (c = this.id - other.id);
	    return c;
	  };

	  // Priority Queue for Scheduling
	  var PriorityQueue = Rx.internals.PriorityQueue = function (capacity) {
	    this.items = new Array(capacity);
	    this.length = 0;
	  };

	  var priorityProto = PriorityQueue.prototype;
	  priorityProto.isHigherPriority = function (left, right) {
	    return this.items[left].compareTo(this.items[right]) < 0;
	  };

	  priorityProto.percolate = function (index) {
	    if (index >= this.length || index < 0) { return; }
	    var parent = index - 1 >> 1;
	    if (parent < 0 || parent === index) { return; }
	    if (this.isHigherPriority(index, parent)) {
	      var temp = this.items[index];
	      this.items[index] = this.items[parent];
	      this.items[parent] = temp;
	      this.percolate(parent);
	    }
	  };

	  priorityProto.heapify = function (index) {
	    +index || (index = 0);
	    if (index >= this.length || index < 0) { return; }
	    var left = 2 * index + 1,
	        right = 2 * index + 2,
	        first = index;
	    if (left < this.length && this.isHigherPriority(left, first)) {
	      first = left;
	    }
	    if (right < this.length && this.isHigherPriority(right, first)) {
	      first = right;
	    }
	    if (first !== index) {
	      var temp = this.items[index];
	      this.items[index] = this.items[first];
	      this.items[first] = temp;
	      this.heapify(first);
	    }
	  };

	  priorityProto.peek = function () { return this.items[0].value; };

	  priorityProto.removeAt = function (index) {
	    this.items[index] = this.items[--this.length];
	    this.items[this.length] = undefined;
	    this.heapify();
	  };

	  priorityProto.dequeue = function () {
	    var result = this.peek();
	    this.removeAt(0);
	    return result;
	  };

	  priorityProto.enqueue = function (item) {
	    var index = this.length++;
	    this.items[index] = new IndexedItem(PriorityQueue.count++, item);
	    this.percolate(index);
	  };

	  priorityProto.remove = function (item) {
	    for (var i = 0; i < this.length; i++) {
	      if (this.items[i].value === item) {
	        this.removeAt(i);
	        return true;
	      }
	    }
	    return false;
	  };
	  PriorityQueue.count = 0;

	  /**
	   * Represents a group of disposable resources that are disposed together.
	   * @constructor
	   */
	  var CompositeDisposable = Rx.CompositeDisposable = function () {
	    var args = [], i, len;
	    if (Array.isArray(arguments[0])) {
	      args = arguments[0];
	      len = args.length;
	    } else {
	      len = arguments.length;
	      args = new Array(len);
	      for(i = 0; i < len; i++) { args[i] = arguments[i]; }
	    }
	    for(i = 0; i < len; i++) {
	      if (!isDisposable(args[i])) { throw new TypeError('Not a disposable'); }
	    }
	    this.disposables = args;
	    this.isDisposed = false;
	    this.length = args.length;
	  };

	  var CompositeDisposablePrototype = CompositeDisposable.prototype;

	  /**
	   * Adds a disposable to the CompositeDisposable or disposes the disposable if the CompositeDisposable is disposed.
	   * @param {Mixed} item Disposable to add.
	   */
	  CompositeDisposablePrototype.add = function (item) {
	    if (this.isDisposed) {
	      item.dispose();
	    } else {
	      this.disposables.push(item);
	      this.length++;
	    }
	  };

	  /**
	   * Removes and disposes the first occurrence of a disposable from the CompositeDisposable.
	   * @param {Mixed} item Disposable to remove.
	   * @returns {Boolean} true if found; false otherwise.
	   */
	  CompositeDisposablePrototype.remove = function (item) {
	    var shouldDispose = false;
	    if (!this.isDisposed) {
	      var idx = this.disposables.indexOf(item);
	      if (idx !== -1) {
	        shouldDispose = true;
	        this.disposables.splice(idx, 1);
	        this.length--;
	        item.dispose();
	      }
	    }
	    return shouldDispose;
	  };

	  /**
	   *  Disposes all disposables in the group and removes them from the group.
	   */
	  CompositeDisposablePrototype.dispose = function () {
	    if (!this.isDisposed) {
	      this.isDisposed = true;
	      var len = this.disposables.length, currentDisposables = new Array(len);
	      for(var i = 0; i < len; i++) { currentDisposables[i] = this.disposables[i]; }
	      this.disposables = [];
	      this.length = 0;

	      for (i = 0; i < len; i++) {
	        currentDisposables[i].dispose();
	      }
	    }
	  };

	  /**
	   * Provides a set of static methods for creating Disposables.
	   * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
	   */
	  var Disposable = Rx.Disposable = function (action) {
	    this.isDisposed = false;
	    this.action = action || noop;
	  };

	  /** Performs the task of cleaning up resources. */
	  Disposable.prototype.dispose = function () {
	    if (!this.isDisposed) {
	      this.action();
	      this.isDisposed = true;
	    }
	  };

	  /**
	   * Creates a disposable object that invokes the specified action when disposed.
	   * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
	   * @return {Disposable} The disposable object that runs the given action upon disposal.
	   */
	  var disposableCreate = Disposable.create = function (action) { return new Disposable(action); };

	  /**
	   * Gets the disposable that does nothing when disposed.
	   */
	  var disposableEmpty = Disposable.empty = { dispose: noop };

	  /**
	   * Validates whether the given object is a disposable
	   * @param {Object} Object to test whether it has a dispose method
	   * @returns {Boolean} true if a disposable object, else false.
	   */
	  var isDisposable = Disposable.isDisposable = function (d) {
	    return d && isFunction(d.dispose);
	  };

	  var checkDisposed = Disposable.checkDisposed = function (disposable) {
	    if (disposable.isDisposed) { throw new ObjectDisposedError(); }
	  };

	  var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = (function () {
	    function BooleanDisposable () {
	      this.isDisposed = false;
	      this.current = null;
	    }

	    var booleanDisposablePrototype = BooleanDisposable.prototype;

	    /**
	     * Gets the underlying disposable.
	     * @return The underlying disposable.
	     */
	    booleanDisposablePrototype.getDisposable = function () {
	      return this.current;
	    };

	    /**
	     * Sets the underlying disposable.
	     * @param {Disposable} value The new underlying disposable.
	     */
	    booleanDisposablePrototype.setDisposable = function (value) {
	      var shouldDispose = this.isDisposed;
	      if (!shouldDispose) {
	        var old = this.current;
	        this.current = value;
	      }
	      old && old.dispose();
	      shouldDispose && value && value.dispose();
	    };

	    /**
	     * Disposes the underlying disposable as well as all future replacements.
	     */
	    booleanDisposablePrototype.dispose = function () {
	      if (!this.isDisposed) {
	        this.isDisposed = true;
	        var old = this.current;
	        this.current = null;
	      }
	      old && old.dispose();
	    };

	    return BooleanDisposable;
	  }());
	  var SerialDisposable = Rx.SerialDisposable = SingleAssignmentDisposable;

	  /**
	   * Represents a disposable resource that only disposes its underlying disposable resource when all dependent disposable objects have been disposed.
	   */
	  var RefCountDisposable = Rx.RefCountDisposable = (function () {

	    function InnerDisposable(disposable) {
	      this.disposable = disposable;
	      this.disposable.count++;
	      this.isInnerDisposed = false;
	    }

	    InnerDisposable.prototype.dispose = function () {
	      if (!this.disposable.isDisposed && !this.isInnerDisposed) {
	        this.isInnerDisposed = true;
	        this.disposable.count--;
	        if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
	          this.disposable.isDisposed = true;
	          this.disposable.underlyingDisposable.dispose();
	        }
	      }
	    };

	    /**
	     * Initializes a new instance of the RefCountDisposable with the specified disposable.
	     * @constructor
	     * @param {Disposable} disposable Underlying disposable.
	      */
	    function RefCountDisposable(disposable) {
	      this.underlyingDisposable = disposable;
	      this.isDisposed = false;
	      this.isPrimaryDisposed = false;
	      this.count = 0;
	    }

	    /**
	     * Disposes the underlying disposable only when all dependent disposables have been disposed
	     */
	    RefCountDisposable.prototype.dispose = function () {
	      if (!this.isDisposed && !this.isPrimaryDisposed) {
	        this.isPrimaryDisposed = true;
	        if (this.count === 0) {
	          this.isDisposed = true;
	          this.underlyingDisposable.dispose();
	        }
	      }
	    };

	    /**
	     * Returns a dependent disposable that when disposed decreases the refcount on the underlying disposable.
	     * @returns {Disposable} A dependent disposable contributing to the reference count that manages the underlying disposable's lifetime.
	     */
	    RefCountDisposable.prototype.getDisposable = function () {
	      return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
	    };

	    return RefCountDisposable;
	  })();

	  function ScheduledDisposable(scheduler, disposable) {
	    this.scheduler = scheduler;
	    this.disposable = disposable;
	    this.isDisposed = false;
	  }

	  function scheduleItem(s, self) {
	    if (!self.isDisposed) {
	      self.isDisposed = true;
	      self.disposable.dispose();
	    }
	  }

	  ScheduledDisposable.prototype.dispose = function () {
	    this.scheduler.scheduleWithState(this, scheduleItem);
	  };

	  var ScheduledItem = Rx.internals.ScheduledItem = function (scheduler, state, action, dueTime, comparer) {
	    this.scheduler = scheduler;
	    this.state = state;
	    this.action = action;
	    this.dueTime = dueTime;
	    this.comparer = comparer || defaultSubComparer;
	    this.disposable = new SingleAssignmentDisposable();
	  }

	  ScheduledItem.prototype.invoke = function () {
	    this.disposable.setDisposable(this.invokeCore());
	  };

	  ScheduledItem.prototype.compareTo = function (other) {
	    return this.comparer(this.dueTime, other.dueTime);
	  };

	  ScheduledItem.prototype.isCancelled = function () {
	    return this.disposable.isDisposed;
	  };

	  ScheduledItem.prototype.invokeCore = function () {
	    return this.action(this.scheduler, this.state);
	  };

	  /** Provides a set of static properties to access commonly used schedulers. */
	  var Scheduler = Rx.Scheduler = (function () {

	    function Scheduler(now, schedule, scheduleRelative, scheduleAbsolute) {
	      this.now = now;
	      this._schedule = schedule;
	      this._scheduleRelative = scheduleRelative;
	      this._scheduleAbsolute = scheduleAbsolute;
	    }

	    function invokeAction(scheduler, action) {
	      action();
	      return disposableEmpty;
	    }

	    var schedulerProto = Scheduler.prototype;

	    /**
	     * Schedules an action to be executed.
	     * @param {Function} action Action to execute.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.schedule = function (action) {
	      return this._schedule(action, invokeAction);
	    };

	    /**
	     * Schedules an action to be executed.
	     * @param state State passed to the action to be executed.
	     * @param {Function} action Action to be executed.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleWithState = function (state, action) {
	      return this._schedule(state, action);
	    };

	    /**
	     * Schedules an action to be executed after the specified relative due time.
	     * @param {Function} action Action to execute.
	     * @param {Number} dueTime Relative time after which to execute the action.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleWithRelative = function (dueTime, action) {
	      return this._scheduleRelative(action, dueTime, invokeAction);
	    };

	    /**
	     * Schedules an action to be executed after dueTime.
	     * @param state State passed to the action to be executed.
	     * @param {Function} action Action to be executed.
	     * @param {Number} dueTime Relative time after which to execute the action.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleWithRelativeAndState = function (state, dueTime, action) {
	      return this._scheduleRelative(state, dueTime, action);
	    };

	    /**
	     * Schedules an action to be executed at the specified absolute due time.
	     * @param {Function} action Action to execute.
	     * @param {Number} dueTime Absolute time at which to execute the action.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	      */
	    schedulerProto.scheduleWithAbsolute = function (dueTime, action) {
	      return this._scheduleAbsolute(action, dueTime, invokeAction);
	    };

	    /**
	     * Schedules an action to be executed at dueTime.
	     * @param {Mixed} state State passed to the action to be executed.
	     * @param {Function} action Action to be executed.
	     * @param {Number}dueTime Absolute time at which to execute the action.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleWithAbsoluteAndState = function (state, dueTime, action) {
	      return this._scheduleAbsolute(state, dueTime, action);
	    };

	    /** Gets the current time according to the local machine's system clock. */
	    Scheduler.now = defaultNow;

	    /**
	     * Normalizes the specified TimeSpan value to a positive value.
	     * @param {Number} timeSpan The time span value to normalize.
	     * @returns {Number} The specified TimeSpan value if it is zero or positive; otherwise, 0
	     */
	    Scheduler.normalize = function (timeSpan) {
	      timeSpan < 0 && (timeSpan = 0);
	      return timeSpan;
	    };

	    return Scheduler;
	  }());

	  var normalizeTime = Scheduler.normalize;

	  (function (schedulerProto) {

	    function invokeRecImmediate(scheduler, pair) {
	      var state = pair[0], action = pair[1], group = new CompositeDisposable();

	      function recursiveAction(state1) {
	        action(state1, function (state2) {
	          var isAdded = false, isDone = false,
	          d = scheduler.scheduleWithState(state2, function (scheduler1, state3) {
	            if (isAdded) {
	              group.remove(d);
	            } else {
	              isDone = true;
	            }
	            recursiveAction(state3);
	            return disposableEmpty;
	          });
	          if (!isDone) {
	            group.add(d);
	            isAdded = true;
	          }
	        });
	      }

	      recursiveAction(state);
	      return group;
	    }

	    function invokeRecDate(scheduler, pair, method) {
	      var state = pair[0], action = pair[1], group = new CompositeDisposable();
	      function recursiveAction(state1) {
	        action(state1, function (state2, dueTime1) {
	          var isAdded = false, isDone = false,
	          d = scheduler[method](state2, dueTime1, function (scheduler1, state3) {
	            if (isAdded) {
	              group.remove(d);
	            } else {
	              isDone = true;
	            }
	            recursiveAction(state3);
	            return disposableEmpty;
	          });
	          if (!isDone) {
	            group.add(d);
	            isAdded = true;
	          }
	        });
	      };
	      recursiveAction(state);
	      return group;
	    }

	    function scheduleInnerRecursive(action, self) {
	      action(function(dt) { self(action, dt); });
	    }

	    /**
	     * Schedules an action to be executed recursively.
	     * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleRecursive = function (action) {
	      return this.scheduleRecursiveWithState(action, function (_action, self) {
	        _action(function () { self(_action); }); });
	    };

	    /**
	     * Schedules an action to be executed recursively.
	     * @param {Mixed} state State passed to the action to be executed.
	     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in recursive invocation state.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleRecursiveWithState = function (state, action) {
	      return this.scheduleWithState([state, action], invokeRecImmediate);
	    };

	    /**
	     * Schedules an action to be executed recursively after a specified relative due time.
	     * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action at the specified relative time.
	     * @param {Number}dueTime Relative time after which to execute the action for the first time.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleRecursiveWithRelative = function (dueTime, action) {
	      return this.scheduleRecursiveWithRelativeAndState(action, dueTime, scheduleInnerRecursive);
	    };

	    /**
	     * Schedules an action to be executed recursively after a specified relative due time.
	     * @param {Mixed} state State passed to the action to be executed.
	     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
	     * @param {Number}dueTime Relative time after which to execute the action for the first time.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleRecursiveWithRelativeAndState = function (state, dueTime, action) {
	      return this._scheduleRelative([state, action], dueTime, function (s, p) {
	        return invokeRecDate(s, p, 'scheduleWithRelativeAndState');
	      });
	    };

	    /**
	     * Schedules an action to be executed recursively at a specified absolute due time.
	     * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action at the specified absolute time.
	     * @param {Number}dueTime Absolute time at which to execute the action for the first time.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleRecursiveWithAbsolute = function (dueTime, action) {
	      return this.scheduleRecursiveWithAbsoluteAndState(action, dueTime, scheduleInnerRecursive);
	    };

	    /**
	     * Schedules an action to be executed recursively at a specified absolute due time.
	     * @param {Mixed} state State passed to the action to be executed.
	     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
	     * @param {Number}dueTime Absolute time at which to execute the action for the first time.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    schedulerProto.scheduleRecursiveWithAbsoluteAndState = function (state, dueTime, action) {
	      return this._scheduleAbsolute([state, action], dueTime, function (s, p) {
	        return invokeRecDate(s, p, 'scheduleWithAbsoluteAndState');
	      });
	    };
	  }(Scheduler.prototype));

	  (function (schedulerProto) {

	    /**
	     * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
	     * @param {Number} period Period for running the work periodically.
	     * @param {Function} action Action to be executed.
	     * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
	     */
	    Scheduler.prototype.schedulePeriodic = function (period, action) {
	      return this.schedulePeriodicWithState(null, period, action);
	    };

	    /**
	     * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
	     * @param {Mixed} state Initial state passed to the action upon the first iteration.
	     * @param {Number} period Period for running the work periodically.
	     * @param {Function} action Action to be executed, potentially updating the state.
	     * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
	     */
	    Scheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
	      if (typeof root.setInterval === 'undefined') { throw new NotSupportedError(); }
	      period = normalizeTime(period);
	      var s = state, id = root.setInterval(function () { s = action(s); }, period);
	      return disposableCreate(function () { root.clearInterval(id); });
	    };

	  }(Scheduler.prototype));

	  (function (schedulerProto) {
	    /**
	     * Returns a scheduler that wraps the original scheduler, adding exception handling for scheduled actions.
	     * @param {Function} handler Handler that's run if an exception is caught. The exception will be rethrown if the handler returns false.
	     * @returns {Scheduler} Wrapper around the original scheduler, enforcing exception handling.
	     */
	    schedulerProto.catchError = schedulerProto['catch'] = function (handler) {
	      return new CatchScheduler(this, handler);
	    };
	  }(Scheduler.prototype));

	  var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function () {
	    function tick(command, recurse) {
	      recurse(0, this._period);
	      try {
	        this._state = this._action(this._state);
	      } catch (e) {
	        this._cancel.dispose();
	        throw e;
	      }
	    }

	    function SchedulePeriodicRecursive(scheduler, state, period, action) {
	      this._scheduler = scheduler;
	      this._state = state;
	      this._period = period;
	      this._action = action;
	    }

	    SchedulePeriodicRecursive.prototype.start = function () {
	      var d = new SingleAssignmentDisposable();
	      this._cancel = d;
	      d.setDisposable(this._scheduler.scheduleRecursiveWithRelativeAndState(0, this._period, tick.bind(this)));

	      return d;
	    };

	    return SchedulePeriodicRecursive;
	  }());

	  /** Gets a scheduler that schedules work immediately on the current thread. */
	  var immediateScheduler = Scheduler.immediate = (function () {
	    function scheduleNow(state, action) { return action(this, state); }
	    return new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
	  }());

	  /**
	   * Gets a scheduler that schedules work as soon as possible on the current thread.
	   */
	  var currentThreadScheduler = Scheduler.currentThread = (function () {
	    var queue;

	    function runTrampoline () {
	      while (queue.length > 0) {
	        var item = queue.dequeue();
	        !item.isCancelled() && item.invoke();
	      }
	    }

	    function scheduleNow(state, action) {
	      var si = new ScheduledItem(this, state, action, this.now());

	      if (!queue) {
	        queue = new PriorityQueue(4);
	        queue.enqueue(si);

	        var result = tryCatch(runTrampoline)();
	        queue = null;
	        if (result === errorObj) { return thrower(result.e); }
	      } else {
	        queue.enqueue(si);
	      }
	      return si.disposable;
	    }

	    var currentScheduler = new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
	    currentScheduler.scheduleRequired = function () { return !queue; };

	    return currentScheduler;
	  }());

	  var scheduleMethod, clearMethod;

	  var localTimer = (function () {
	    var localSetTimeout, localClearTimeout = noop;
	    if (!!root.WScript) {
	      localSetTimeout = function (fn, time) {
	        root.WScript.Sleep(time);
	        fn();
	      };
	    } else if (!!root.setTimeout) {
	      localSetTimeout = root.setTimeout;
	      localClearTimeout = root.clearTimeout;
	    } else {
	      throw new NotSupportedError();
	    }

	    return {
	      setTimeout: localSetTimeout,
	      clearTimeout: localClearTimeout
	    };
	  }());
	  var localSetTimeout = localTimer.setTimeout,
	    localClearTimeout = localTimer.clearTimeout;

	  (function () {

	    var nextHandle = 1, tasksByHandle = {}, currentlyRunning = false;

	    clearMethod = function (handle) {
	      delete tasksByHandle[handle];
	    };

	    function runTask(handle) {
	      if (currentlyRunning) {
	        localSetTimeout(function () { runTask(handle) }, 0);
	      } else {
	        var task = tasksByHandle[handle];
	        if (task) {
	          currentlyRunning = true;
	          var result = tryCatch(task)();
	          clearMethod(handle);
	          currentlyRunning = false;
	          if (result === errorObj) { return thrower(result.e); }
	        }
	      }
	    }

	    var reNative = RegExp('^' +
	      String(toString)
	        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	        .replace(/toString| for [^\]]+/g, '.*?') + '$'
	    );

	    var setImmediate = typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' &&
	      !reNative.test(setImmediate) && setImmediate;

	    function postMessageSupported () {
	      // Ensure not in a worker
	      if (!root.postMessage || root.importScripts) { return false; }
	      var isAsync = false, oldHandler = root.onmessage;
	      // Test for async
	      root.onmessage = function () { isAsync = true; };
	      root.postMessage('', '*');
	      root.onmessage = oldHandler;

	      return isAsync;
	    }

	    // Use in order, setImmediate, nextTick, postMessage, MessageChannel, script readystatechanged, setTimeout
	    if (isFunction(setImmediate)) {
	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[id] = action;
	        setImmediate(function () { runTask(id); });

	        return id;
	      };
	    } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[id] = action;
	        process.nextTick(function () { runTask(id); });

	        return id;
	      };
	    } else if (postMessageSupported()) {
	      var MSG_PREFIX = 'ms.rx.schedule' + Math.random();

	      function onGlobalPostMessage(event) {
	        // Only if we're a match to avoid any other global events
	        if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
	          runTask(event.data.substring(MSG_PREFIX.length));
	        }
	      }

	      if (root.addEventListener) {
	        root.addEventListener('message', onGlobalPostMessage, false);
	      } else {
	        root.attachEvent('onmessage', onGlobalPostMessage, false);
	      }

	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[id] = action;
	        root.postMessage(MSG_PREFIX + currentId, '*');
	        return id;
	      };
	    } else if (!!root.MessageChannel) {
	      var channel = new root.MessageChannel();

	      channel.port1.onmessage = function (e) { runTask(e.data); };

	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[id] = action;
	        channel.port2.postMessage(id);
	        return id;
	      };
	    } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {

	      scheduleMethod = function (action) {
	        var scriptElement = root.document.createElement('script');
	        var id = nextHandle++;
	        tasksByHandle[id] = action;

	        scriptElement.onreadystatechange = function () {
	          runTask(id);
	          scriptElement.onreadystatechange = null;
	          scriptElement.parentNode.removeChild(scriptElement);
	          scriptElement = null;
	        };
	        root.document.documentElement.appendChild(scriptElement);
	        return id;
	      };

	    } else {
	      scheduleMethod = function (action) {
	        var id = nextHandle++;
	        tasksByHandle[id] = action;
	        localSetTimeout(function () {
	          runTask(id);
	        }, 0);

	        return id;
	      };
	    }
	  }());

	  /**
	   * Gets a scheduler that schedules work via a timed callback based upon platform.
	   */
	  var timeoutScheduler = Scheduler.timeout = Scheduler.default = (function () {

	    function scheduleNow(state, action) {
	      var scheduler = this,
	        disposable = new SingleAssignmentDisposable();
	      var id = scheduleMethod(function () {
	        if (!disposable.isDisposed) {
	          disposable.setDisposable(action(scheduler, state));
	        }
	      });
	      return new CompositeDisposable(disposable, disposableCreate(function () {
	        clearMethod(id);
	      }));
	    }

	    function scheduleRelative(state, dueTime, action) {
	      var scheduler = this, dt = Scheduler.normalize(dueTime);
	      if (dt === 0) { return scheduler.scheduleWithState(state, action); }
	      var disposable = new SingleAssignmentDisposable();
	      var id = localSetTimeout(function () {
	        if (!disposable.isDisposed) {
	          disposable.setDisposable(action(scheduler, state));
	        }
	      }, dt);
	      return new CompositeDisposable(disposable, disposableCreate(function () {
	        localClearTimeout(id);
	      }));
	    }

	    function scheduleAbsolute(state, dueTime, action) {
	      return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
	    }

	    return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);
	  })();

	  var CatchScheduler = (function (__super__) {

	    function scheduleNow(state, action) {
	      return this._scheduler.scheduleWithState(state, this._wrap(action));
	    }

	    function scheduleRelative(state, dueTime, action) {
	      return this._scheduler.scheduleWithRelativeAndState(state, dueTime, this._wrap(action));
	    }

	    function scheduleAbsolute(state, dueTime, action) {
	      return this._scheduler.scheduleWithAbsoluteAndState(state, dueTime, this._wrap(action));
	    }

	    inherits(CatchScheduler, __super__);

	    function CatchScheduler(scheduler, handler) {
	      this._scheduler = scheduler;
	      this._handler = handler;
	      this._recursiveOriginal = null;
	      this._recursiveWrapper = null;
	      __super__.call(this, this._scheduler.now.bind(this._scheduler), scheduleNow, scheduleRelative, scheduleAbsolute);
	    }

	    CatchScheduler.prototype._clone = function (scheduler) {
	        return new CatchScheduler(scheduler, this._handler);
	    };

	    CatchScheduler.prototype._wrap = function (action) {
	      var parent = this;
	      return function (self, state) {
	        try {
	          return action(parent._getRecursiveWrapper(self), state);
	        } catch (e) {
	          if (!parent._handler(e)) { throw e; }
	          return disposableEmpty;
	        }
	      };
	    };

	    CatchScheduler.prototype._getRecursiveWrapper = function (scheduler) {
	      if (this._recursiveOriginal !== scheduler) {
	        this._recursiveOriginal = scheduler;
	        var wrapper = this._clone(scheduler);
	        wrapper._recursiveOriginal = scheduler;
	        wrapper._recursiveWrapper = wrapper;
	        this._recursiveWrapper = wrapper;
	      }
	      return this._recursiveWrapper;
	    };

	    CatchScheduler.prototype.schedulePeriodicWithState = function (state, period, action) {
	      var self = this, failed = false, d = new SingleAssignmentDisposable();

	      d.setDisposable(this._scheduler.schedulePeriodicWithState(state, period, function (state1) {
	        if (failed) { return null; }
	        try {
	          return action(state1);
	        } catch (e) {
	          failed = true;
	          if (!self._handler(e)) { throw e; }
	          d.dispose();
	          return null;
	        }
	      }));

	      return d;
	    };

	    return CatchScheduler;
	  }(Scheduler));

	  /**
	   *  Represents a notification to an observer.
	   */
	  var Notification = Rx.Notification = (function () {
	    function Notification(kind, value, exception, accept, acceptObservable, toString) {
	      this.kind = kind;
	      this.value = value;
	      this.exception = exception;
	      this._accept = accept;
	      this._acceptObservable = acceptObservable;
	      this.toString = toString;
	    }

	    /**
	     * Invokes the delegate corresponding to the notification or the observer's method corresponding to the notification and returns the produced result.
	     *
	     * @memberOf Notification
	     * @param {Any} observerOrOnNext Delegate to invoke for an OnNext notification or Observer to invoke the notification on..
	     * @param {Function} onError Delegate to invoke for an OnError notification.
	     * @param {Function} onCompleted Delegate to invoke for an OnCompleted notification.
	     * @returns {Any} Result produced by the observation.
	     */
	    Notification.prototype.accept = function (observerOrOnNext, onError, onCompleted) {
	      return observerOrOnNext && typeof observerOrOnNext === 'object' ?
	        this._acceptObservable(observerOrOnNext) :
	        this._accept(observerOrOnNext, onError, onCompleted);
	    };

	    /**
	     * Returns an observable sequence with a single notification.
	     *
	     * @memberOf Notifications
	     * @param {Scheduler} [scheduler] Scheduler to send out the notification calls on.
	     * @returns {Observable} The observable sequence that surfaces the behavior of the notification upon subscription.
	     */
	    Notification.prototype.toObservable = function (scheduler) {
	      var self = this;
	      isScheduler(scheduler) || (scheduler = immediateScheduler);
	      return new AnonymousObservable(function (observer) {
	        return scheduler.scheduleWithState(self, function (_, notification) {
	          notification._acceptObservable(observer);
	          notification.kind === 'N' && observer.onCompleted();
	        });
	      });
	    };

	    return Notification;
	  })();

	  /**
	   * Creates an object that represents an OnNext notification to an observer.
	   * @param {Any} value The value contained in the notification.
	   * @returns {Notification} The OnNext notification containing the value.
	   */
	  var notificationCreateOnNext = Notification.createOnNext = (function () {
	      function _accept(onNext) { return onNext(this.value); }
	      function _acceptObservable(observer) { return observer.onNext(this.value); }
	      function toString() { return 'OnNext(' + this.value + ')'; }

	      return function (value) {
	        return new Notification('N', value, null, _accept, _acceptObservable, toString);
	      };
	  }());

	  /**
	   * Creates an object that represents an OnError notification to an observer.
	   * @param {Any} error The exception contained in the notification.
	   * @returns {Notification} The OnError notification containing the exception.
	   */
	  var notificationCreateOnError = Notification.createOnError = (function () {
	    function _accept (onNext, onError) { return onError(this.exception); }
	    function _acceptObservable(observer) { return observer.onError(this.exception); }
	    function toString () { return 'OnError(' + this.exception + ')'; }

	    return function (e) {
	      return new Notification('E', null, e, _accept, _acceptObservable, toString);
	    };
	  }());

	  /**
	   * Creates an object that represents an OnCompleted notification to an observer.
	   * @returns {Notification} The OnCompleted notification.
	   */
	  var notificationCreateOnCompleted = Notification.createOnCompleted = (function () {
	    function _accept (onNext, onError, onCompleted) { return onCompleted(); }
	    function _acceptObservable(observer) { return observer.onCompleted(); }
	    function toString () { return 'OnCompleted()'; }

	    return function () {
	      return new Notification('C', null, null, _accept, _acceptObservable, toString);
	    };
	  }());

	  var Enumerator = Rx.internals.Enumerator = function (next) {
	    this._next = next;
	  };

	  Enumerator.prototype.next = function () {
	    return this._next();
	  };

	  Enumerator.prototype[$iterator$] = function () { return this; }

	  var Enumerable = Rx.internals.Enumerable = function (iterator) {
	    this._iterator = iterator;
	  };

	  Enumerable.prototype[$iterator$] = function () {
	    return this._iterator();
	  };

	  Enumerable.prototype.concat = function () {
	    var sources = this;
	    return new AnonymousObservable(function (o) {
	      var e = sources[$iterator$]();

	      var isDisposed, subscription = new SerialDisposable();
	      var cancelable = immediateScheduler.scheduleRecursive(function (self) {
	        if (isDisposed) { return; }
	        try {
	          var currentItem = e.next();
	        } catch (ex) {
	          return o.onError(ex);
	        }

	        if (currentItem.done) {
	          return o.onCompleted();
	        }

	        // Check if promise
	        var currentValue = currentItem.value;
	        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

	        var d = new SingleAssignmentDisposable();
	        subscription.setDisposable(d);
	        d.setDisposable(currentValue.subscribe(
	          function(x) { o.onNext(x); },
	          function(err) { o.onError(err); },
	          self)
	        );
	      });

	      return new CompositeDisposable(subscription, cancelable, disposableCreate(function () {
	        isDisposed = true;
	      }));
	    });
	  };

	  Enumerable.prototype.catchError = function () {
	    var sources = this;
	    return new AnonymousObservable(function (o) {
	      var e = sources[$iterator$]();

	      var isDisposed, subscription = new SerialDisposable();
	      var cancelable = immediateScheduler.scheduleRecursiveWithState(null, function (lastException, self) {
	        if (isDisposed) { return; }

	        try {
	          var currentItem = e.next();
	        } catch (ex) {
	          return observer.onError(ex);
	        }

	        if (currentItem.done) {
	          if (lastException !== null) {
	            o.onError(lastException);
	          } else {
	            o.onCompleted();
	          }
	          return;
	        }

	        // Check if promise
	        var currentValue = currentItem.value;
	        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

	        var d = new SingleAssignmentDisposable();
	        subscription.setDisposable(d);
	        d.setDisposable(currentValue.subscribe(
	          function(x) { o.onNext(x); },
	          self,
	          function() { o.onCompleted(); }));
	      });
	      return new CompositeDisposable(subscription, cancelable, disposableCreate(function () {
	        isDisposed = true;
	      }));
	    });
	  };


	  Enumerable.prototype.catchErrorWhen = function (notificationHandler) {
	    var sources = this;
	    return new AnonymousObservable(function (o) {
	      var exceptions = new Subject(),
	        notifier = new Subject(),
	        handled = notificationHandler(exceptions),
	        notificationDisposable = handled.subscribe(notifier);

	      var e = sources[$iterator$]();

	      var isDisposed,
	        lastException,
	        subscription = new SerialDisposable();
	      var cancelable = immediateScheduler.scheduleRecursive(function (self) {
	        if (isDisposed) { return; }

	        try {
	          var currentItem = e.next();
	        } catch (ex) {
	          return o.onError(ex);
	        }

	        if (currentItem.done) {
	          if (lastException) {
	            o.onError(lastException);
	          } else {
	            o.onCompleted();
	          }
	          return;
	        }

	        // Check if promise
	        var currentValue = currentItem.value;
	        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

	        var outer = new SingleAssignmentDisposable();
	        var inner = new SingleAssignmentDisposable();
	        subscription.setDisposable(new CompositeDisposable(inner, outer));
	        outer.setDisposable(currentValue.subscribe(
	          function(x) { o.onNext(x); },
	          function (exn) {
	            inner.setDisposable(notifier.subscribe(self, function(ex) {
	              o.onError(ex);
	            }, function() {
	              o.onCompleted();
	            }));

	            exceptions.onNext(exn);
	          },
	          function() { o.onCompleted(); }));
	      });

	      return new CompositeDisposable(notificationDisposable, subscription, cancelable, disposableCreate(function () {
	        isDisposed = true;
	      }));
	    });
	  };

	  var enumerableRepeat = Enumerable.repeat = function (value, repeatCount) {
	    if (repeatCount == null) { repeatCount = -1; }
	    return new Enumerable(function () {
	      var left = repeatCount;
	      return new Enumerator(function () {
	        if (left === 0) { return doneEnumerator; }
	        if (left > 0) { left--; }
	        return { done: false, value: value };
	      });
	    });
	  };

	  var enumerableOf = Enumerable.of = function (source, selector, thisArg) {
	    if (selector) {
	      var selectorFn = bindCallback(selector, thisArg, 3);
	    }
	    return new Enumerable(function () {
	      var index = -1;
	      return new Enumerator(
	        function () {
	          return ++index < source.length ?
	            { done: false, value: !selector ? source[index] : selectorFn(source[index], index, source) } :
	            doneEnumerator;
	        });
	    });
	  };

	  /**
	   * Supports push-style iteration over an observable sequence.
	   */
	  var Observer = Rx.Observer = function () { };

	  /**
	   *  Creates a notification callback from an observer.
	   * @returns The action that forwards its input notification to the underlying observer.
	   */
	  Observer.prototype.toNotifier = function () {
	    var observer = this;
	    return function (n) { return n.accept(observer); };
	  };

	  /**
	   *  Hides the identity of an observer.
	   * @returns An observer that hides the identity of the specified observer.
	   */
	  Observer.prototype.asObserver = function () {
	    return new AnonymousObserver(this.onNext.bind(this), this.onError.bind(this), this.onCompleted.bind(this));
	  };

	  /**
	   *  Checks access to the observer for grammar violations. This includes checking for multiple OnError or OnCompleted calls, as well as reentrancy in any of the observer methods.
	   *  If a violation is detected, an Error is thrown from the offending observer method call.
	   * @returns An observer that checks callbacks invocations against the observer grammar and, if the checks pass, forwards those to the specified observer.
	   */
	  Observer.prototype.checked = function () { return new CheckedObserver(this); };

	  /**
	   *  Creates an observer from the specified OnNext, along with optional OnError, and OnCompleted actions.
	   * @param {Function} [onNext] Observer's OnNext action implementation.
	   * @param {Function} [onError] Observer's OnError action implementation.
	   * @param {Function} [onCompleted] Observer's OnCompleted action implementation.
	   * @returns {Observer} The observer object implemented using the given actions.
	   */
	  var observerCreate = Observer.create = function (onNext, onError, onCompleted) {
	    onNext || (onNext = noop);
	    onError || (onError = defaultError);
	    onCompleted || (onCompleted = noop);
	    return new AnonymousObserver(onNext, onError, onCompleted);
	  };

	  /**
	   *  Creates an observer from a notification callback.
	   *
	   * @static
	   * @memberOf Observer
	   * @param {Function} handler Action that handles a notification.
	   * @returns The observer object that invokes the specified handler using a notification corresponding to each message it receives.
	   */
	  Observer.fromNotifier = function (handler, thisArg) {
	    return new AnonymousObserver(function (x) {
	      return handler.call(thisArg, notificationCreateOnNext(x));
	    }, function (e) {
	      return handler.call(thisArg, notificationCreateOnError(e));
	    }, function () {
	      return handler.call(thisArg, notificationCreateOnCompleted());
	    });
	  };

	  /**
	   * Schedules the invocation of observer methods on the given scheduler.
	   * @param {Scheduler} scheduler Scheduler to schedule observer messages on.
	   * @returns {Observer} Observer whose messages are scheduled on the given scheduler.
	   */
	  Observer.prototype.notifyOn = function (scheduler) {
	    return new ObserveOnObserver(scheduler, this);
	  };

	  Observer.prototype.makeSafe = function(disposable) {
	    return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);
	  };

	  /**
	   * Abstract base class for implementations of the Observer class.
	   * This base class enforces the grammar of observers where OnError and OnCompleted are terminal messages.
	   */
	  var AbstractObserver = Rx.internals.AbstractObserver = (function (__super__) {
	    inherits(AbstractObserver, __super__);

	    /**
	     * Creates a new observer in a non-stopped state.
	     */
	    function AbstractObserver() {
	      this.isStopped = false;
	      __super__.call(this);
	    }

	    // Must be implemented by other observers
	    AbstractObserver.prototype.next = notImplemented;
	    AbstractObserver.prototype.error = notImplemented;
	    AbstractObserver.prototype.completed = notImplemented;

	    /**
	     * Notifies the observer of a new element in the sequence.
	     * @param {Any} value Next element in the sequence.
	     */
	    AbstractObserver.prototype.onNext = function (value) {
	      if (!this.isStopped) { this.next(value); }
	    };

	    /**
	     * Notifies the observer that an exception has occurred.
	     * @param {Any} error The error that has occurred.
	     */
	    AbstractObserver.prototype.onError = function (error) {
	      if (!this.isStopped) {
	        this.isStopped = true;
	        this.error(error);
	      }
	    };

	    /**
	     * Notifies the observer of the end of the sequence.
	     */
	    AbstractObserver.prototype.onCompleted = function () {
	      if (!this.isStopped) {
	        this.isStopped = true;
	        this.completed();
	      }
	    };

	    /**
	     * Disposes the observer, causing it to transition to the stopped state.
	     */
	    AbstractObserver.prototype.dispose = function () {
	      this.isStopped = true;
	    };

	    AbstractObserver.prototype.fail = function (e) {
	      if (!this.isStopped) {
	        this.isStopped = true;
	        this.error(e);
	        return true;
	      }

	      return false;
	    };

	    return AbstractObserver;
	  }(Observer));

	  /**
	   * Class to create an Observer instance from delegate-based implementations of the on* methods.
	   */
	  var AnonymousObserver = Rx.AnonymousObserver = (function (__super__) {
	    inherits(AnonymousObserver, __super__);

	    /**
	     * Creates an observer from the specified OnNext, OnError, and OnCompleted actions.
	     * @param {Any} onNext Observer's OnNext action implementation.
	     * @param {Any} onError Observer's OnError action implementation.
	     * @param {Any} onCompleted Observer's OnCompleted action implementation.
	     */
	    function AnonymousObserver(onNext, onError, onCompleted) {
	      __super__.call(this);
	      this._onNext = onNext;
	      this._onError = onError;
	      this._onCompleted = onCompleted;
	    }

	    /**
	     * Calls the onNext action.
	     * @param {Any} value Next element in the sequence.
	     */
	    AnonymousObserver.prototype.next = function (value) {
	      this._onNext(value);
	    };

	    /**
	     * Calls the onError action.
	     * @param {Any} error The error that has occurred.
	     */
	    AnonymousObserver.prototype.error = function (error) {
	      this._onError(error);
	    };

	    /**
	     *  Calls the onCompleted action.
	     */
	    AnonymousObserver.prototype.completed = function () {
	      this._onCompleted();
	    };

	    return AnonymousObserver;
	  }(AbstractObserver));

	  var CheckedObserver = (function (__super__) {
	    inherits(CheckedObserver, __super__);

	    function CheckedObserver(observer) {
	      __super__.call(this);
	      this._observer = observer;
	      this._state = 0; // 0 - idle, 1 - busy, 2 - done
	    }

	    var CheckedObserverPrototype = CheckedObserver.prototype;

	    CheckedObserverPrototype.onNext = function (value) {
	      this.checkAccess();
	      var res = tryCatch(this._observer.onNext).call(this._observer, value);
	      this._state = 0;
	      res === errorObj && thrower(res.e);
	    };

	    CheckedObserverPrototype.onError = function (err) {
	      this.checkAccess();
	      var res = tryCatch(this._observer.onError).call(this._observer, err);
	      this._state = 2;
	      res === errorObj && thrower(res.e);
	    };

	    CheckedObserverPrototype.onCompleted = function () {
	      this.checkAccess();
	      var res = tryCatch(this._observer.onCompleted).call(this._observer);
	      this._state = 2;
	      res === errorObj && thrower(res.e);
	    };

	    CheckedObserverPrototype.checkAccess = function () {
	      if (this._state === 1) { throw new Error('Re-entrancy detected'); }
	      if (this._state === 2) { throw new Error('Observer completed'); }
	      if (this._state === 0) { this._state = 1; }
	    };

	    return CheckedObserver;
	  }(Observer));

	  var ScheduledObserver = Rx.internals.ScheduledObserver = (function (__super__) {
	    inherits(ScheduledObserver, __super__);

	    function ScheduledObserver(scheduler, observer) {
	      __super__.call(this);
	      this.scheduler = scheduler;
	      this.observer = observer;
	      this.isAcquired = false;
	      this.hasFaulted = false;
	      this.queue = [];
	      this.disposable = new SerialDisposable();
	    }

	    ScheduledObserver.prototype.next = function (value) {
	      var self = this;
	      this.queue.push(function () { self.observer.onNext(value); });
	    };

	    ScheduledObserver.prototype.error = function (e) {
	      var self = this;
	      this.queue.push(function () { self.observer.onError(e); });
	    };

	    ScheduledObserver.prototype.completed = function () {
	      var self = this;
	      this.queue.push(function () { self.observer.onCompleted(); });
	    };

	    ScheduledObserver.prototype.ensureActive = function () {
	      var isOwner = false, parent = this;
	      if (!this.hasFaulted && this.queue.length > 0) {
	        isOwner = !this.isAcquired;
	        this.isAcquired = true;
	      }
	      if (isOwner) {
	        this.disposable.setDisposable(this.scheduler.scheduleRecursive(function (self) {
	          var work;
	          if (parent.queue.length > 0) {
	            work = parent.queue.shift();
	          } else {
	            parent.isAcquired = false;
	            return;
	          }
	          try {
	            work();
	          } catch (ex) {
	            parent.queue = [];
	            parent.hasFaulted = true;
	            throw ex;
	          }
	          self();
	        }));
	      }
	    };

	    ScheduledObserver.prototype.dispose = function () {
	      __super__.prototype.dispose.call(this);
	      this.disposable.dispose();
	    };

	    return ScheduledObserver;
	  }(AbstractObserver));

	  var ObserveOnObserver = (function (__super__) {
	    inherits(ObserveOnObserver, __super__);

	    function ObserveOnObserver(scheduler, observer, cancel) {
	      __super__.call(this, scheduler, observer);
	      this._cancel = cancel;
	    }

	    ObserveOnObserver.prototype.next = function (value) {
	      __super__.prototype.next.call(this, value);
	      this.ensureActive();
	    };

	    ObserveOnObserver.prototype.error = function (e) {
	      __super__.prototype.error.call(this, e);
	      this.ensureActive();
	    };

	    ObserveOnObserver.prototype.completed = function () {
	      __super__.prototype.completed.call(this);
	      this.ensureActive();
	    };

	    ObserveOnObserver.prototype.dispose = function () {
	      __super__.prototype.dispose.call(this);
	      this._cancel && this._cancel.dispose();
	      this._cancel = null;
	    };

	    return ObserveOnObserver;
	  })(ScheduledObserver);

	  var observableProto;

	  /**
	   * Represents a push-style collection.
	   */
	  var Observable = Rx.Observable = (function () {

	    function Observable(subscribe) {
	      if (Rx.config.longStackSupport && hasStacks) {
	        try {
	          throw new Error();
	        } catch (e) {
	          this.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	        }

	        var self = this;
	        this._subscribe = function (observer) {
	          var oldOnError = observer.onError.bind(observer);

	          observer.onError = function (err) {
	            makeStackTraceLong(err, self);
	            oldOnError(err);
	          };

	          return subscribe.call(self, observer);
	        };
	      } else {
	        this._subscribe = subscribe;
	      }
	    }

	    observableProto = Observable.prototype;

	    /**
	     *  Subscribes an observer to the observable sequence.
	     *  @param {Mixed} [observerOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
	     *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
	     *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
	     *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
	     */
	    observableProto.subscribe = observableProto.forEach = function (observerOrOnNext, onError, onCompleted) {
	      return this._subscribe(typeof observerOrOnNext === 'object' ?
	        observerOrOnNext :
	        observerCreate(observerOrOnNext, onError, onCompleted));
	    };

	    /**
	     * Subscribes to the next value in the sequence with an optional "this" argument.
	     * @param {Function} onNext The function to invoke on each element in the observable sequence.
	     * @param {Any} [thisArg] Object to use as this when executing callback.
	     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
	     */
	    observableProto.subscribeOnNext = function (onNext, thisArg) {
	      return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) { onNext.call(thisArg, x); } : onNext));
	    };

	    /**
	     * Subscribes to an exceptional condition in the sequence with an optional "this" argument.
	     * @param {Function} onError The function to invoke upon exceptional termination of the observable sequence.
	     * @param {Any} [thisArg] Object to use as this when executing callback.
	     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
	     */
	    observableProto.subscribeOnError = function (onError, thisArg) {
	      return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) { onError.call(thisArg, e); } : onError));
	    };

	    /**
	     * Subscribes to the next value in the sequence with an optional "this" argument.
	     * @param {Function} onCompleted The function to invoke upon graceful termination of the observable sequence.
	     * @param {Any} [thisArg] Object to use as this when executing callback.
	     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
	     */
	    observableProto.subscribeOnCompleted = function (onCompleted, thisArg) {
	      return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() { onCompleted.call(thisArg); } : onCompleted));
	    };

	    return Observable;
	  })();

	  var ObservableBase = Rx.ObservableBase = (function (__super__) {
	    inherits(ObservableBase, __super__);

	    function fixSubscriber(subscriber) {
	      return subscriber && isFunction(subscriber.dispose) ? subscriber :
	        isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
	    }

	    function setDisposable(s, state) {
	      var ado = state[0], self = state[1];
	      var sub = tryCatch(self.subscribeCore).call(self, ado);

	      if (sub === errorObj) {
	        if(!ado.fail(errorObj.e)) { return thrower(errorObj.e); }
	      }
	      ado.setDisposable(fixSubscriber(sub));
	    }

	    function subscribe(observer) {
	      var ado = new AutoDetachObserver(observer), state = [ado, this];

	      if (currentThreadScheduler.scheduleRequired()) {
	        currentThreadScheduler.scheduleWithState(state, setDisposable);
	      } else {
	        setDisposable(null, state);
	      }
	      return ado;
	    }

	    function ObservableBase() {
	      __super__.call(this, subscribe);
	    }

	    ObservableBase.prototype.subscribeCore = notImplemented;

	    return ObservableBase;
	  }(Observable));

	   /**
	   *  Wraps the source sequence in order to run its observer callbacks on the specified scheduler.
	   *
	   *  This only invokes observer callbacks on a scheduler. In case the subscription and/or unsubscription actions have side-effects
	   *  that require to be run on a scheduler, use subscribeOn.
	   *
	   *  @param {Scheduler} scheduler Scheduler to notify observers on.
	   *  @returns {Observable} The source sequence whose observations happen on the specified scheduler.
	   */
	  observableProto.observeOn = function (scheduler) {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      return source.subscribe(new ObserveOnObserver(scheduler, observer));
	    }, source);
	  };

	   /**
	   *  Wraps the source sequence in order to run its subscription and unsubscription logic on the specified scheduler. This operation is not commonly used;
	   *  see the remarks section for more information on the distinction between subscribeOn and observeOn.

	   *  This only performs the side-effects of subscription and unsubscription on the specified scheduler. In order to invoke observer
	   *  callbacks on a scheduler, use observeOn.

	   *  @param {Scheduler} scheduler Scheduler to perform subscription and unsubscription actions on.
	   *  @returns {Observable} The source sequence whose subscriptions and unsubscriptions happen on the specified scheduler.
	   */
	  observableProto.subscribeOn = function (scheduler) {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var m = new SingleAssignmentDisposable(), d = new SerialDisposable();
	      d.setDisposable(m);
	      m.setDisposable(scheduler.schedule(function () {
	        d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(observer)));
	      }));
	      return d;
	    }, source);
	  };

	  /**
	   * Converts a Promise to an Observable sequence
	   * @param {Promise} An ES6 Compliant promise.
	   * @returns {Observable} An Observable sequence which wraps the existing promise success and failure.
	   */
	  var observableFromPromise = Observable.fromPromise = function (promise) {
	    return observableDefer(function () {
	      var subject = new Rx.AsyncSubject();

	      promise.then(
	        function (value) {
	          subject.onNext(value);
	          subject.onCompleted();
	        },
	        subject.onError.bind(subject));

	      return subject;
	    });
	  };

	  /*
	   * Converts an existing observable sequence to an ES6 Compatible Promise
	   * @example
	   * var promise = Rx.Observable.return(42).toPromise(RSVP.Promise);
	   *
	   * // With config
	   * Rx.config.Promise = RSVP.Promise;
	   * var promise = Rx.Observable.return(42).toPromise();
	   * @param {Function} [promiseCtor] The constructor of the promise. If not provided, it looks for it in Rx.config.Promise.
	   * @returns {Promise} An ES6 compatible promise with the last value from the observable sequence.
	   */
	  observableProto.toPromise = function (promiseCtor) {
	    promiseCtor || (promiseCtor = Rx.config.Promise);
	    if (!promiseCtor) { throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise'); }
	    var source = this;
	    return new promiseCtor(function (resolve, reject) {
	      // No cancellation can be done
	      var value, hasValue = false;
	      source.subscribe(function (v) {
	        value = v;
	        hasValue = true;
	      }, reject, function () {
	        hasValue && resolve(value);
	      });
	    });
	  };

	  var ToArrayObservable = (function(__super__) {
	    inherits(ToArrayObservable, __super__);
	    function ToArrayObservable(source) {
	      this.source = source;
	      __super__.call(this);
	    }

	    ToArrayObservable.prototype.subscribeCore = function(observer) {
	      return this.source.subscribe(new ToArrayObserver(observer));
	    };

	    return ToArrayObservable;
	  }(ObservableBase));

	  function ToArrayObserver(observer) {
	    this.observer = observer;
	    this.a = [];
	    this.isStopped = false;
	  }
	  ToArrayObserver.prototype.onNext = function (x) { if(!this.isStopped) { this.a.push(x); } };
	  ToArrayObserver.prototype.onError = function (e) {
	    if (!this.isStopped) {
	      this.isStopped = true;
	      this.observer.onError(e);
	    }
	  };
	  ToArrayObserver.prototype.onCompleted = function () {
	    if (!this.isStopped) {
	      this.isStopped = true;
	      this.observer.onNext(this.a);
	      this.observer.onCompleted();
	    }
	  };
	  ToArrayObserver.prototype.dispose = function () { this.isStopped = true; }
	  ToArrayObserver.prototype.fail = function (e) {
	    if (!this.isStopped) {
	      this.isStopped = true;
	      this.observer.onError(e);
	      return true;
	    }

	    return false;
	  };

	  /**
	  * Creates an array from an observable sequence.
	  * @returns {Observable} An observable sequence containing a single element with a list containing all the elements of the source sequence.
	  */
	  observableProto.toArray = function () {
	    return new ToArrayObservable(this);
	  };

	  /**
	   *  Creates an observable sequence from a specified subscribe method implementation.
	   * @example
	   *  var res = Rx.Observable.create(function (observer) { return function () { } );
	   *  var res = Rx.Observable.create(function (observer) { return Rx.Disposable.empty; } );
	   *  var res = Rx.Observable.create(function (observer) { } );
	   * @param {Function} subscribe Implementation of the resulting observable sequence's subscribe method, returning a function that will be wrapped in a Disposable.
	   * @returns {Observable} The observable sequence with the specified implementation for the Subscribe method.
	   */
	  Observable.create = Observable.createWithDisposable = function (subscribe, parent) {
	    return new AnonymousObservable(subscribe, parent);
	  };

	  /**
	   *  Returns an observable sequence that invokes the specified factory function whenever a new observer subscribes.
	   *
	   * @example
	   *  var res = Rx.Observable.defer(function () { return Rx.Observable.fromArray([1,2,3]); });
	   * @param {Function} observableFactory Observable factory function to invoke for each observer that subscribes to the resulting sequence or Promise.
	   * @returns {Observable} An observable sequence whose observers trigger an invocation of the given observable factory function.
	   */
	  var observableDefer = Observable.defer = function (observableFactory) {
	    return new AnonymousObservable(function (observer) {
	      var result;
	      try {
	        result = observableFactory();
	      } catch (e) {
	        return observableThrow(e).subscribe(observer);
	      }
	      isPromise(result) && (result = observableFromPromise(result));
	      return result.subscribe(observer);
	    });
	  };

	  /**
	   *  Returns an empty observable sequence, using the specified scheduler to send out the single OnCompleted message.
	   *
	   * @example
	   *  var res = Rx.Observable.empty();
	   *  var res = Rx.Observable.empty(Rx.Scheduler.timeout);
	   * @param {Scheduler} [scheduler] Scheduler to send the termination call on.
	   * @returns {Observable} An observable sequence with no elements.
	   */
	  var observableEmpty = Observable.empty = function (scheduler) {
	    isScheduler(scheduler) || (scheduler = immediateScheduler);
	    return new AnonymousObservable(function (observer) {
	      return scheduler.scheduleWithState(null, function () {
	        observer.onCompleted();
	      });
	    });
	  };

	  var FromObservable = (function(__super__) {
	    inherits(FromObservable, __super__);
	    function FromObservable(iterable, mapper, scheduler) {
	      this.iterable = iterable;
	      this.mapper = mapper;
	      this.scheduler = scheduler;
	      __super__.call(this);
	    }

	    FromObservable.prototype.subscribeCore = function (observer) {
	      var sink = new FromSink(observer, this);
	      return sink.run();
	    };

	    return FromObservable;
	  }(ObservableBase));

	  var FromSink = (function () {
	    function FromSink(observer, parent) {
	      this.observer = observer;
	      this.parent = parent;
	    }

	    FromSink.prototype.run = function () {
	      var list = Object(this.parent.iterable),
	          it = getIterable(list),
	          observer = this.observer,
	          mapper = this.parent.mapper;

	      function loopRecursive(i, recurse) {
	        try {
	          var next = it.next();
	        } catch (e) {
	          return observer.onError(e);
	        }
	        if (next.done) {
	          return observer.onCompleted();
	        }

	        var result = next.value;

	        if (mapper) {
	          try {
	            result = mapper(result, i);
	          } catch (e) {
	            return observer.onError(e);
	          }
	        }

	        observer.onNext(result);
	        recurse(i + 1);
	      }

	      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
	    };

	    return FromSink;
	  }());

	  var maxSafeInteger = Math.pow(2, 53) - 1;

	  function StringIterable(str) {
	    this._s = s;
	  }

	  StringIterable.prototype[$iterator$] = function () {
	    return new StringIterator(this._s);
	  };

	  function StringIterator(str) {
	    this._s = s;
	    this._l = s.length;
	    this._i = 0;
	  }

	  StringIterator.prototype[$iterator$] = function () {
	    return this;
	  };

	  StringIterator.prototype.next = function () {
	    return this._i < this._l ? { done: false, value: this._s.charAt(this._i++) } : doneEnumerator;
	  };

	  function ArrayIterable(a) {
	    this._a = a;
	  }

	  ArrayIterable.prototype[$iterator$] = function () {
	    return new ArrayIterator(this._a);
	  };

	  function ArrayIterator(a) {
	    this._a = a;
	    this._l = toLength(a);
	    this._i = 0;
	  }

	  ArrayIterator.prototype[$iterator$] = function () {
	    return this;
	  };

	  ArrayIterator.prototype.next = function () {
	    return this._i < this._l ? { done: false, value: this._a[this._i++] } : doneEnumerator;
	  };

	  function numberIsFinite(value) {
	    return typeof value === 'number' && root.isFinite(value);
	  }

	  function isNan(n) {
	    return n !== n;
	  }

	  function getIterable(o) {
	    var i = o[$iterator$], it;
	    if (!i && typeof o === 'string') {
	      it = new StringIterable(o);
	      return it[$iterator$]();
	    }
	    if (!i && o.length !== undefined) {
	      it = new ArrayIterable(o);
	      return it[$iterator$]();
	    }
	    if (!i) { throw new TypeError('Object is not iterable'); }
	    return o[$iterator$]();
	  }

	  function sign(value) {
	    var number = +value;
	    if (number === 0) { return number; }
	    if (isNaN(number)) { return number; }
	    return number < 0 ? -1 : 1;
	  }

	  function toLength(o) {
	    var len = +o.length;
	    if (isNaN(len)) { return 0; }
	    if (len === 0 || !numberIsFinite(len)) { return len; }
	    len = sign(len) * Math.floor(Math.abs(len));
	    if (len <= 0) { return 0; }
	    if (len > maxSafeInteger) { return maxSafeInteger; }
	    return len;
	  }

	  /**
	  * This method creates a new Observable sequence from an array-like or iterable object.
	  * @param {Any} arrayLike An array-like or iterable object to convert to an Observable sequence.
	  * @param {Function} [mapFn] Map function to call on every element of the array.
	  * @param {Any} [thisArg] The context to use calling the mapFn if provided.
	  * @param {Scheduler} [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
	  */
	  var observableFrom = Observable.from = function (iterable, mapFn, thisArg, scheduler) {
	    if (iterable == null) {
	      throw new Error('iterable cannot be null.')
	    }
	    if (mapFn && !isFunction(mapFn)) {
	      throw new Error('mapFn when provided must be a function');
	    }
	    if (mapFn) {
	      var mapper = bindCallback(mapFn, thisArg, 2);
	    }
	    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
	    return new FromObservable(iterable, mapper, scheduler);
	  }

	  var FromArrayObservable = (function(__super__) {
	    inherits(FromArrayObservable, __super__);
	    function FromArrayObservable(args, scheduler) {
	      this.args = args;
	      this.scheduler = scheduler;
	      __super__.call(this);
	    }

	    FromArrayObservable.prototype.subscribeCore = function (observer) {
	      var sink = new FromArraySink(observer, this);
	      return sink.run();
	    };

	    return FromArrayObservable;
	  }(ObservableBase));

	  function FromArraySink(observer, parent) {
	    this.observer = observer;
	    this.parent = parent;
	  }

	  FromArraySink.prototype.run = function () {
	    var observer = this.observer, args = this.parent.args, len = args.length;
	    function loopRecursive(i, recurse) {
	      if (i < len) {
	        observer.onNext(args[i]);
	        recurse(i + 1);
	      } else {
	        observer.onCompleted();
	      }
	    }

	    return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
	  };

	  /**
	  *  Converts an array to an observable sequence, using an optional scheduler to enumerate the array.
	  * @deprecated use Observable.from or Observable.of
	  * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
	  * @returns {Observable} The observable sequence whose elements are pulled from the given enumerable sequence.
	  */
	  var observableFromArray = Observable.fromArray = function (array, scheduler) {
	    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
	    return new FromArrayObservable(array, scheduler)
	  };

	  /**
	   *  Generates an observable sequence by running a state-driven loop producing the sequence's elements, using the specified scheduler to send out observer messages.
	   *
	   * @example
	   *  var res = Rx.Observable.generate(0, function (x) { return x < 10; }, function (x) { return x + 1; }, function (x) { return x; });
	   *  var res = Rx.Observable.generate(0, function (x) { return x < 10; }, function (x) { return x + 1; }, function (x) { return x; }, Rx.Scheduler.timeout);
	   * @param {Mixed} initialState Initial state.
	   * @param {Function} condition Condition to terminate generation (upon returning false).
	   * @param {Function} iterate Iteration step function.
	   * @param {Function} resultSelector Selector function for results produced in the sequence.
	   * @param {Scheduler} [scheduler] Scheduler on which to run the generator loop. If not provided, defaults to Scheduler.currentThread.
	   * @returns {Observable} The generated sequence.
	   */
	  Observable.generate = function (initialState, condition, iterate, resultSelector, scheduler) {
	    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
	    return new AnonymousObservable(function (o) {
	      var first = true;
	      return scheduler.scheduleRecursiveWithState(initialState, function (state, self) {
	        var hasResult, result;
	        try {
	          if (first) {
	            first = false;
	          } else {
	            state = iterate(state);
	          }
	          hasResult = condition(state);
	          hasResult && (result = resultSelector(state));
	        } catch (e) {
	          return o.onError(e);
	        }
	        if (hasResult) {
	          o.onNext(result);
	          self(state);
	        } else {
	          o.onCompleted();
	        }
	      });
	    });
	  };

	  function observableOf (scheduler, array) {
	    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
	    return new FromArrayObservable(array, scheduler);
	  }

	  /**
	  *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
	  * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
	  */
	  Observable.of = function () {
	    var len = arguments.length, args = new Array(len);
	    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
	    return new FromArrayObservable(args, currentThreadScheduler);
	  };

	  /**
	  *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
	  * @param {Scheduler} scheduler A scheduler to use for scheduling the arguments.
	  * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
	  */
	  Observable.ofWithScheduler = function (scheduler) {
	    var len = arguments.length, args = new Array(len - 1);
	    for(var i = 1; i < len; i++) { args[i - 1] = arguments[i]; }
	    return new FromArrayObservable(args, scheduler);
	  };

	  /**
	   * Creates an Observable sequence from changes to an array using Array.observe.
	   * @param {Array} array An array to observe changes.
	   * @returns {Observable} An observable sequence containing changes to an array from Array.observe.
	   */
	  Observable.ofArrayChanges = function(array) {
	    if (!Array.isArray(array)) { throw new TypeError('Array.observe only accepts arrays.'); }
	    if (typeof Array.observe !== 'function' && typeof Array.unobserve !== 'function') { throw new TypeError('Array.observe is not supported on your platform') }
	    return new AnonymousObservable(function(observer) {
	      function observerFn(changes) {
	        for(var i = 0, len = changes.length; i < len; i++) {
	          observer.onNext(changes[i]);
	        }
	      }
	      
	      Array.observe(array, observerFn);

	      return function () {
	        Array.unobserve(array, observerFn);
	      };
	    });
	  };

	  /**
	   * Creates an Observable sequence from changes to an object using Object.observe.
	   * @param {Object} obj An object to observe changes.
	   * @returns {Observable} An observable sequence containing changes to an object from Object.observe.
	   */
	  Observable.ofObjectChanges = function(obj) {
	    if (obj == null) { throw new TypeError('object must not be null or undefined.'); }
	    if (typeof Object.observe !== 'function' && typeof Object.unobserve !== 'function') { throw new TypeError('Array.observe is not supported on your platform') }
	    return new AnonymousObservable(function(observer) {
	      function observerFn(changes) {
	        for(var i = 0, len = changes.length; i < len; i++) {
	          observer.onNext(changes[i]);
	        }
	      }

	      Object.observe(obj, observerFn);

	      return function () {
	        Object.unobserve(obj, observerFn);
	      };
	    });
	  };

	  /**
	   *  Returns a non-terminating observable sequence, which can be used to denote an infinite duration (e.g. when using reactive joins).
	   * @returns {Observable} An observable sequence whose observers will never get called.
	   */
	  var observableNever = Observable.never = function () {
	    return new AnonymousObservable(function () {
	      return disposableEmpty;
	    });
	  };

	  /**
	   * Convert an object into an observable sequence of [key, value] pairs.
	   * @param {Object} obj The object to inspect.
	   * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
	   * @returns {Observable} An observable sequence of [key, value] pairs from the object.
	   */
	  Observable.pairs = function (obj, scheduler) {
	    scheduler || (scheduler = Rx.Scheduler.currentThread);
	    return new AnonymousObservable(function (observer) {
	      var keys = Object.keys(obj), len = keys.length;
	      return scheduler.scheduleRecursiveWithState(0, function (idx, self) {
	        if (idx < len) {
	          var key = keys[idx];
	          observer.onNext([key, obj[key]]);
	          self(idx + 1);
	        } else {
	          observer.onCompleted();
	        }
	      });
	    });
	  };

	    var RangeObservable = (function(__super__) {
	    inherits(RangeObservable, __super__);
	    function RangeObservable(start, count, scheduler) {
	      this.start = start;
	      this.count = count;
	      this.scheduler = scheduler;
	      __super__.call(this);
	    }

	    RangeObservable.prototype.subscribeCore = function (observer) {
	      var sink = new RangeSink(observer, this);
	      return sink.run();
	    };

	    return RangeObservable;
	  }(ObservableBase));

	  var RangeSink = (function () {
	    function RangeSink(observer, parent) {
	      this.observer = observer;
	      this.parent = parent;
	    }

	    RangeSink.prototype.run = function () {
	      var start = this.parent.start, count = this.parent.count, observer = this.observer;
	      function loopRecursive(i, recurse) {
	        if (i < count) {
	          observer.onNext(start + i);
	          recurse(i + 1);
	        } else {
	          observer.onCompleted();
	        }
	      }

	      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
	    };

	    return RangeSink;
	  }());

	  /**
	  *  Generates an observable sequence of integral numbers within a specified range, using the specified scheduler to send out observer messages.
	  * @param {Number} start The value of the first integer in the sequence.
	  * @param {Number} count The number of sequential integers to generate.
	  * @param {Scheduler} [scheduler] Scheduler to run the generator loop on. If not specified, defaults to Scheduler.currentThread.
	  * @returns {Observable} An observable sequence that contains a range of sequential integral numbers.
	  */
	  Observable.range = function (start, count, scheduler) {
	    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
	    return new RangeObservable(start, count, scheduler);
	  };

	  /**
	   *  Generates an observable sequence that repeats the given element the specified number of times, using the specified scheduler to send out observer messages.
	   *
	   * @example
	   *  var res = Rx.Observable.repeat(42);
	   *  var res = Rx.Observable.repeat(42, 4);
	   *  3 - res = Rx.Observable.repeat(42, 4, Rx.Scheduler.timeout);
	   *  4 - res = Rx.Observable.repeat(42, null, Rx.Scheduler.timeout);
	   * @param {Mixed} value Element to repeat.
	   * @param {Number} repeatCount [Optiona] Number of times to repeat the element. If not specified, repeats indefinitely.
	   * @param {Scheduler} scheduler Scheduler to run the producer loop on. If not specified, defaults to Scheduler.immediate.
	   * @returns {Observable} An observable sequence that repeats the given element the specified number of times.
	   */
	  Observable.repeat = function (value, repeatCount, scheduler) {
	    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
	    return observableReturn(value, scheduler).repeat(repeatCount == null ? -1 : repeatCount);
	  };

	  /**
	   *  Returns an observable sequence that contains a single element, using the specified scheduler to send out observer messages.
	   *  There is an alias called 'just' or browsers <IE9.
	   * @param {Mixed} value Single element in the resulting observable sequence.
	   * @param {Scheduler} scheduler Scheduler to send the single element on. If not specified, defaults to Scheduler.immediate.
	   * @returns {Observable} An observable sequence containing the single specified element.
	   */
	  var observableReturn = Observable['return'] = Observable.just = Observable.returnValue = function (value, scheduler) {
	    isScheduler(scheduler) || (scheduler = immediateScheduler);
	    return new AnonymousObservable(function (o) {
	      return scheduler.scheduleWithState(value, function(_,v) {
	        o.onNext(v);
	        o.onCompleted();
	      });
	    });
	  };

	  /**
	   *  Returns an observable sequence that terminates with an exception, using the specified scheduler to send out the single onError message.
	   *  There is an alias to this method called 'throwError' for browsers <IE9.
	   * @param {Mixed} error An object used for the sequence's termination.
	   * @param {Scheduler} scheduler Scheduler to send the exceptional termination call on. If not specified, defaults to Scheduler.immediate.
	   * @returns {Observable} The observable sequence that terminates exceptionally with the specified exception object.
	   */
	  var observableThrow = Observable['throw'] = Observable.throwError = function (error, scheduler) {
	    isScheduler(scheduler) || (scheduler = immediateScheduler);
	    return new AnonymousObservable(function (observer) {
	      return scheduler.schedule(function () {
	        observer.onError(error);
	      });
	    });
	  };

	  /** @deprecated use #some instead */
	  Observable.throwException = function () {
	    //deprecate('throwException', 'throwError');
	    return Observable.throwError.apply(null, arguments);
	  };

	  /**
	   * Constructs an observable sequence that depends on a resource object, whose lifetime is tied to the resulting observable sequence's lifetime.
	   * @param {Function} resourceFactory Factory function to obtain a resource object.
	   * @param {Function} observableFactory Factory function to obtain an observable sequence that depends on the obtained resource.
	   * @returns {Observable} An observable sequence whose lifetime controls the lifetime of the dependent resource object.
	   */
	  Observable.using = function (resourceFactory, observableFactory) {
	    return new AnonymousObservable(function (observer) {
	      var disposable = disposableEmpty, resource, source;
	      try {
	        resource = resourceFactory();
	        resource && (disposable = resource);
	        source = observableFactory(resource);
	      } catch (exception) {
	        return new CompositeDisposable(observableThrow(exception).subscribe(observer), disposable);
	      }
	      return new CompositeDisposable(source.subscribe(observer), disposable);
	    });
	  };

	  /**
	   * Propagates the observable sequence or Promise that reacts first.
	   * @param {Observable} rightSource Second observable sequence or Promise.
	   * @returns {Observable} {Observable} An observable sequence that surfaces either of the given sequences, whichever reacted first.
	   */
	  observableProto.amb = function (rightSource) {
	    var leftSource = this;
	    return new AnonymousObservable(function (observer) {
	      var choice,
	        leftChoice = 'L', rightChoice = 'R',
	        leftSubscription = new SingleAssignmentDisposable(),
	        rightSubscription = new SingleAssignmentDisposable();

	      isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));

	      function choiceL() {
	        if (!choice) {
	          choice = leftChoice;
	          rightSubscription.dispose();
	        }
	      }

	      function choiceR() {
	        if (!choice) {
	          choice = rightChoice;
	          leftSubscription.dispose();
	        }
	      }

	      leftSubscription.setDisposable(leftSource.subscribe(function (left) {
	        choiceL();
	        if (choice === leftChoice) {
	          observer.onNext(left);
	        }
	      }, function (err) {
	        choiceL();
	        if (choice === leftChoice) {
	          observer.onError(err);
	        }
	      }, function () {
	        choiceL();
	        if (choice === leftChoice) {
	          observer.onCompleted();
	        }
	      }));

	      rightSubscription.setDisposable(rightSource.subscribe(function (right) {
	        choiceR();
	        if (choice === rightChoice) {
	          observer.onNext(right);
	        }
	      }, function (err) {
	        choiceR();
	        if (choice === rightChoice) {
	          observer.onError(err);
	        }
	      }, function () {
	        choiceR();
	        if (choice === rightChoice) {
	          observer.onCompleted();
	        }
	      }));

	      return new CompositeDisposable(leftSubscription, rightSubscription);
	    });
	  };

	  /**
	   * Propagates the observable sequence or Promise that reacts first.
	   *
	   * @example
	   * var = Rx.Observable.amb(xs, ys, zs);
	   * @returns {Observable} An observable sequence that surfaces any of the given sequences, whichever reacted first.
	   */
	  Observable.amb = function () {
	    var acc = observableNever(), items = [];
	    if (Array.isArray(arguments[0])) {
	      items = arguments[0];
	    } else {
	      for(var i = 0, len = arguments.length; i < len; i++) { items.push(arguments[i]); }
	    }

	    function func(previous, current) {
	      return previous.amb(current);
	    }
	    for (var i = 0, len = items.length; i < len; i++) {
	      acc = func(acc, items[i]);
	    }
	    return acc;
	  };

	  function observableCatchHandler(source, handler) {
	    return new AnonymousObservable(function (o) {
	      var d1 = new SingleAssignmentDisposable(), subscription = new SerialDisposable();
	      subscription.setDisposable(d1);
	      d1.setDisposable(source.subscribe(function (x) { o.onNext(x); }, function (e) {
	        try {
	          var result = handler(e);
	        } catch (ex) {
	          return o.onError(ex);
	        }
	        isPromise(result) && (result = observableFromPromise(result));

	        var d = new SingleAssignmentDisposable();
	        subscription.setDisposable(d);
	        d.setDisposable(result.subscribe(o));
	      }, function (x) { o.onCompleted(x); }));

	      return subscription;
	    }, source);
	  }

	  /**
	   * Continues an observable sequence that is terminated by an exception with the next observable sequence.
	   * @example
	   * 1 - xs.catchException(ys)
	   * 2 - xs.catchException(function (ex) { return ys(ex); })
	   * @param {Mixed} handlerOrSecond Exception handler function that returns an observable sequence given the error that occurred in the first sequence, or a second observable sequence used to produce results when an error occurred in the first sequence.
	   * @returns {Observable} An observable sequence containing the first sequence's elements, followed by the elements of the handler sequence in case an exception occurred.
	   */
	  observableProto['catch'] = observableProto.catchError = observableProto.catchException = function (handlerOrSecond) {
	    return typeof handlerOrSecond === 'function' ?
	      observableCatchHandler(this, handlerOrSecond) :
	      observableCatch([this, handlerOrSecond]);
	  };

	  /**
	   * Continues an observable sequence that is terminated by an exception with the next observable sequence.
	   * @param {Array | Arguments} args Arguments or an array to use as the next sequence if an error occurs.
	   * @returns {Observable} An observable sequence containing elements from consecutive source sequences until a source sequence terminates successfully.
	   */
	  var observableCatch = Observable.catchError = Observable['catch'] = Observable.catchException = function () {
	    var items = [];
	    if (Array.isArray(arguments[0])) {
	      items = arguments[0];
	    } else {
	      for(var i = 0, len = arguments.length; i < len; i++) { items.push(arguments[i]); }
	    }
	    return enumerableOf(items).catchError();
	  };

	  /**
	   * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
	   * This can be in the form of an argument list of observables or an array.
	   *
	   * @example
	   * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
	   * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
	   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
	   */
	  observableProto.combineLatest = function () {
	    var len = arguments.length, args = new Array(len);
	    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
	    if (Array.isArray(args[0])) {
	      args[0].unshift(this);
	    } else {
	      args.unshift(this);
	    }
	    return combineLatest.apply(this, args);
	  };

	  /**
	   * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
	   *
	   * @example
	   * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
	   * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
	   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
	   */
	  var combineLatest = Observable.combineLatest = function () {
	    var len = arguments.length, args = new Array(len);
	    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
	    var resultSelector = args.pop();
	    Array.isArray(args[0]) && (args = args[0]);

	    return new AnonymousObservable(function (o) {
	      var n = args.length,
	        falseFactory = function () { return false; },
	        hasValue = arrayInitialize(n, falseFactory),
	        hasValueAll = false,
	        isDone = arrayInitialize(n, falseFactory),
	        values = new Array(n);

	      function next(i) {
	        hasValue[i] = true;
	        if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
	          try {
	            var res = resultSelector.apply(null, values);
	          } catch (e) {
	            return o.onError(e);
	          }
	          o.onNext(res);
	        } else if (isDone.filter(function (x, j) { return j !== i; }).every(identity)) {
	          o.onCompleted();
	        }
	      }

	      function done (i) {
	        isDone[i] = true;
	        isDone.every(identity) && o.onCompleted();
	      }

	      var subscriptions = new Array(n);
	      for (var idx = 0; idx < n; idx++) {
	        (function (i) {
	          var source = args[i], sad = new SingleAssignmentDisposable();
	          isPromise(source) && (source = observableFromPromise(source));
	          sad.setDisposable(source.subscribe(function (x) {
	              values[i] = x;
	              next(i);
	            },
	            function(e) { o.onError(e); },
	            function () { done(i); }
	          ));
	          subscriptions[i] = sad;
	        }(idx));
	      }

	      return new CompositeDisposable(subscriptions);
	    }, this);
	  };

	  /**
	   * Concatenates all the observable sequences.  This takes in either an array or variable arguments to concatenate.
	   * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
	   */
	  observableProto.concat = function () {
	    for(var args = [], i = 0, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
	    args.unshift(this);
	    return observableConcat.apply(null, args);
	  };

	  /**
	   * Concatenates all the observable sequences.
	   * @param {Array | Arguments} args Arguments or an array to concat to the observable sequence.
	   * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
	   */
	  var observableConcat = Observable.concat = function () {
	    var args;
	    if (Array.isArray(arguments[0])) {
	      args = arguments[0];
	    } else {
	      args = new Array(arguments.length);
	      for(var i = 0, len = arguments.length; i < len; i++) { args[i] = arguments[i]; }
	    }
	    return enumerableOf(args).concat();
	  };

	  /**
	   * Concatenates an observable sequence of observable sequences.
	   * @returns {Observable} An observable sequence that contains the elements of each observed inner sequence, in sequential order.
	   */
	  observableProto.concatAll = observableProto.concatObservable = function () {
	    return this.merge(1);
	  };

	  var MergeObservable = (function (__super__) {
	    inherits(MergeObservable, __super__);

	    function MergeObservable(source, maxConcurrent) {
	      this.source = source;
	      this.maxConcurrent = maxConcurrent;
	      __super__.call(this);
	    }

	    MergeObservable.prototype.subscribeCore = function(observer) {
	      var g = new CompositeDisposable();
	      g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
	      return g;
	    };

	    return MergeObservable;

	  }(ObservableBase));

	  var MergeObserver = (function () {
	    function MergeObserver(o, max, g) {
	      this.o = o;
	      this.max = max;
	      this.g = g;
	      this.done = false;
	      this.q = [];
	      this.activeCount = 0;
	      this.isStopped = false;
	    }
	    MergeObserver.prototype.handleSubscribe = function (xs) {
	      var sad = new SingleAssignmentDisposable();
	      this.g.add(sad);
	      isPromise(xs) && (xs = observableFromPromise(xs));
	      sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
	    };
	    MergeObserver.prototype.onNext = function (innerSource) {
	      if (this.isStopped) { return; }
	        if(this.activeCount < this.max) {
	          this.activeCount++;
	          this.handleSubscribe(innerSource);
	        } else {
	          this.q.push(innerSource);
	        }
	      };
	      MergeObserver.prototype.onError = function (e) {
	        if (!this.isStopped) {
	          this.isStopped = true;
	          this.o.onError(e);
	        }
	      };
	      MergeObserver.prototype.onCompleted = function () {
	        if (!this.isStopped) {
	          this.isStopped = true;
	          this.done = true;
	          this.activeCount === 0 && this.o.onCompleted();
	        }
	      };
	      MergeObserver.prototype.dispose = function() { this.isStopped = true; };
	      MergeObserver.prototype.fail = function (e) {
	        if (!this.isStopped) {
	          this.isStopped = true;
	          this.o.onError(e);
	          return true;
	        }

	        return false;
	      };

	      function InnerObserver(parent, sad) {
	        this.parent = parent;
	        this.sad = sad;
	        this.isStopped = false;
	      }
	      InnerObserver.prototype.onNext = function (x) { if(!this.isStopped) { this.parent.o.onNext(x); } };
	      InnerObserver.prototype.onError = function (e) {
	        if (!this.isStopped) {
	          this.isStopped = true;
	          this.parent.o.onError(e);
	        }
	      };
	      InnerObserver.prototype.onCompleted = function () {
	        if(!this.isStopped) {
	          this.isStopped = true;
	          var parent = this.parent;
	          parent.g.remove(this.sad);
	          if (parent.q.length > 0) {
	            parent.handleSubscribe(parent.q.shift());
	          } else {
	            parent.activeCount--;
	            parent.done && parent.activeCount === 0 && parent.o.onCompleted();
	          }
	        }
	      };
	      InnerObserver.prototype.dispose = function() { this.isStopped = true; };
	      InnerObserver.prototype.fail = function (e) {
	        if (!this.isStopped) {
	          this.isStopped = true;
	          this.parent.o.onError(e);
	          return true;
	        }

	        return false;
	      };

	      return MergeObserver;
	  }());





	  /**
	  * Merges an observable sequence of observable sequences into an observable sequence, limiting the number of concurrent subscriptions to inner sequences.
	  * Or merges two observable sequences into a single observable sequence.
	  *
	  * @example
	  * 1 - merged = sources.merge(1);
	  * 2 - merged = source.merge(otherSource);
	  * @param {Mixed} [maxConcurrentOrOther] Maximum number of inner observable sequences being subscribed to concurrently or the second observable sequence.
	  * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
	  */
	  observableProto.merge = function (maxConcurrentOrOther) {
	    return typeof maxConcurrentOrOther !== 'number' ?
	      observableMerge(this, maxConcurrentOrOther) :
	      new MergeObservable(this, maxConcurrentOrOther);
	  };

	  /**
	   * Merges all the observable sequences into a single observable sequence.
	   * The scheduler is optional and if not specified, the immediate scheduler is used.
	   * @returns {Observable} The observable sequence that merges the elements of the observable sequences.
	   */
	  var observableMerge = Observable.merge = function () {
	    var scheduler, sources = [], i, len = arguments.length;
	    if (!arguments[0]) {
	      scheduler = immediateScheduler;
	      for(i = 1; i < len; i++) { sources.push(arguments[i]); }
	    } else if (isScheduler(arguments[0])) {
	      scheduler = arguments[0];
	      for(i = 1; i < len; i++) { sources.push(arguments[i]); }
	    } else {
	      scheduler = immediateScheduler;
	      for(i = 0; i < len; i++) { sources.push(arguments[i]); }
	    }
	    if (Array.isArray(sources[0])) {
	      sources = sources[0];
	    }
	    return observableOf(scheduler, sources).mergeAll();
	  };

	  var MergeAllObservable = (function (__super__) {
	    inherits(MergeAllObservable, __super__);

	    function MergeAllObservable(source) {
	      this.source = source;
	      __super__.call(this);
	    }

	    MergeAllObservable.prototype.subscribeCore = function (observer) {
	      var g = new CompositeDisposable(), m = new SingleAssignmentDisposable();
	      g.add(m);
	      m.setDisposable(this.source.subscribe(new MergeAllObserver(observer, g)));
	      return g;
	    };

	    return MergeAllObservable;
	  }(ObservableBase));

	  var MergeAllObserver = (function() {

	    function MergeAllObserver(o, g) {
	      this.o = o;
	      this.g = g;
	      this.isStopped = false;
	      this.done = false;
	    }
	    MergeAllObserver.prototype.onNext = function(innerSource) {
	      if(this.isStopped) { return; }
	      var sad = new SingleAssignmentDisposable();
	      this.g.add(sad);

	      isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));

	      sad.setDisposable(innerSource.subscribe(new InnerObserver(this, this.g, sad)));
	    };
	    MergeAllObserver.prototype.onError = function (e) {
	      if(!this.isStopped) {
	        this.isStopped = true;
	        this.o.onError(e);
	      }
	    };
	    MergeAllObserver.prototype.onCompleted = function () {
	      if(!this.isStopped) {
	        this.isStopped = true;
	        this.done = true;
	        this.g.length === 1 && this.o.onCompleted();
	      }
	    };
	    MergeAllObserver.prototype.dispose = function() { this.isStopped = true; };
	    MergeAllObserver.prototype.fail = function (e) {
	      if (!this.isStopped) {
	        this.isStopped = true;
	        this.o.onError(e);
	        return true;
	      }

	      return false;
	    };

	    function InnerObserver(parent, g, sad) {
	      this.parent = parent;
	      this.g = g;
	      this.sad = sad;
	      this.isStopped = false;
	    }
	    InnerObserver.prototype.onNext = function (x) { if (!this.isStopped) { this.parent.o.onNext(x); } };
	    InnerObserver.prototype.onError = function (e) {
	      if(!this.isStopped) {
	        this.isStopped = true;
	        this.parent.o.onError(e);
	      }
	    };
	    InnerObserver.prototype.onCompleted = function () {
	      if(!this.isStopped) {
	        var parent = this.parent;
	        this.isStopped = true;
	        parent.g.remove(this.sad);
	        parent.done && parent.g.length === 1 && parent.o.onCompleted();
	      }
	    };
	    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
	    InnerObserver.prototype.fail = function (e) {
	      if (!this.isStopped) {
	        this.isStopped = true;
	        this.parent.o.onError(e);
	        return true;
	      }

	      return false;
	    };

	    return MergeAllObserver;

	  }());

	  /**
	  * Merges an observable sequence of observable sequences into an observable sequence.
	  * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
	  */
	  observableProto.mergeAll = observableProto.mergeObservable = function () {
	    return new MergeAllObservable(this);
	  };

	  var CompositeError = Rx.CompositeError = function(errors) {
	    this.name = "NotImplementedError";
	    this.innerErrors = errors;
	    this.message = 'This contains multiple errors. Check the innerErrors';
	    Error.call(this);
	  }
	  CompositeError.prototype = Error.prototype;

	  /**
	  * Flattens an Observable that emits Observables into one Observable, in a way that allows an Observer to
	  * receive all successfully emitted items from all of the source Observables without being interrupted by
	  * an error notification from one of them.
	  *
	  * This behaves like Observable.prototype.mergeAll except that if any of the merged Observables notify of an
	  * error via the Observer's onError, mergeDelayError will refrain from propagating that
	  * error notification until all of the merged Observables have finished emitting items.
	  * @param {Array | Arguments} args Arguments or an array to merge.
	  * @returns {Observable} an Observable that emits all of the items emitted by the Observables emitted by the Observable
	  */
	  Observable.mergeDelayError = function() {
	    var args;
	    if (Array.isArray(arguments[0])) {
	      args = arguments[0];
	    } else {
	      var len = arguments.length;
	      args = new Array(len);
	      for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
	    }
	    var source = observableOf(null, args);

	    return new AnonymousObservable(function (o) {
	      var group = new CompositeDisposable(),
	        m = new SingleAssignmentDisposable(),
	        isStopped = false,
	        errors = [];

	      function setCompletion() {
	        if (errors.length === 0) {
	          o.onCompleted();
	        } else if (errors.length === 1) {
	          o.onError(errors[0]);
	        } else {
	          o.onError(new CompositeError(errors));
	        }
	      }

	      group.add(m);

	      m.setDisposable(source.subscribe(
	        function (innerSource) {
	          var innerSubscription = new SingleAssignmentDisposable();
	          group.add(innerSubscription);

	          // Check for promises support
	          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));

	          innerSubscription.setDisposable(innerSource.subscribe(
	            function (x) { o.onNext(x); },
	            function (e) {
	              errors.push(e);
	              group.remove(innerSubscription);
	              isStopped && group.length === 1 && setCompletion();
	            },
	            function () {
	              group.remove(innerSubscription);
	              isStopped && group.length === 1 && setCompletion();
	          }));
	        },
	        function (e) {
	          errors.push(e);
	          isStopped = true;
	          group.length === 1 && setCompletion();
	        },
	        function () {
	          isStopped = true;
	          group.length === 1 && setCompletion();
	        }));
	      return group;
	    });
	  };

	  /**
	   * Continues an observable sequence that is terminated normally or by an exception with the next observable sequence.
	   * @param {Observable} second Second observable sequence used to produce results after the first sequence terminates.
	   * @returns {Observable} An observable sequence that concatenates the first and second sequence, even if the first sequence terminates exceptionally.
	   */
	  observableProto.onErrorResumeNext = function (second) {
	    if (!second) { throw new Error('Second observable is required'); }
	    return onErrorResumeNext([this, second]);
	  };

	  /**
	   * Continues an observable sequence that is terminated normally or by an exception with the next observable sequence.
	   *
	   * @example
	   * 1 - res = Rx.Observable.onErrorResumeNext(xs, ys, zs);
	   * 1 - res = Rx.Observable.onErrorResumeNext([xs, ys, zs]);
	   * @returns {Observable} An observable sequence that concatenates the source sequences, even if a sequence terminates exceptionally.
	   */
	  var onErrorResumeNext = Observable.onErrorResumeNext = function () {
	    var sources = [];
	    if (Array.isArray(arguments[0])) {
	      sources = arguments[0];
	    } else {
	      for(var i = 0, len = arguments.length; i < len; i++) { sources.push(arguments[i]); }
	    }
	    return new AnonymousObservable(function (observer) {
	      var pos = 0, subscription = new SerialDisposable(),
	      cancelable = immediateScheduler.scheduleRecursive(function (self) {
	        var current, d;
	        if (pos < sources.length) {
	          current = sources[pos++];
	          isPromise(current) && (current = observableFromPromise(current));
	          d = new SingleAssignmentDisposable();
	          subscription.setDisposable(d);
	          d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));
	        } else {
	          observer.onCompleted();
	        }
	      });
	      return new CompositeDisposable(subscription, cancelable);
	    });
	  };

	  /**
	   * Returns the values from the source observable sequence only after the other observable sequence produces a value.
	   * @param {Observable | Promise} other The observable sequence or Promise that triggers propagation of elements of the source sequence.
	   * @returns {Observable} An observable sequence containing the elements of the source sequence starting from the point the other sequence triggered propagation.
	   */
	  observableProto.skipUntil = function (other) {
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var isOpen = false;
	      var disposables = new CompositeDisposable(source.subscribe(function (left) {
	        isOpen && o.onNext(left);
	      }, function (e) { o.onError(e); }, function () {
	        isOpen && o.onCompleted();
	      }));

	      isPromise(other) && (other = observableFromPromise(other));

	      var rightSubscription = new SingleAssignmentDisposable();
	      disposables.add(rightSubscription);
	      rightSubscription.setDisposable(other.subscribe(function () {
	        isOpen = true;
	        rightSubscription.dispose();
	      }, function (e) { o.onError(e); }, function () {
	        rightSubscription.dispose();
	      }));

	      return disposables;
	    }, source);
	  };

	  /**
	   * Transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
	   * @returns {Observable} The observable sequence that at any point in time produces the elements of the most recent inner observable sequence that has been received.
	   */
	  observableProto['switch'] = observableProto.switchLatest = function () {
	    var sources = this;
	    return new AnonymousObservable(function (observer) {
	      var hasLatest = false,
	        innerSubscription = new SerialDisposable(),
	        isStopped = false,
	        latest = 0,
	        subscription = sources.subscribe(
	          function (innerSource) {
	            var d = new SingleAssignmentDisposable(), id = ++latest;
	            hasLatest = true;
	            innerSubscription.setDisposable(d);

	            // Check if Promise or Observable
	            isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));

	            d.setDisposable(innerSource.subscribe(
	              function (x) { latest === id && observer.onNext(x); },
	              function (e) { latest === id && observer.onError(e); },
	              function () {
	                if (latest === id) {
	                  hasLatest = false;
	                  isStopped && observer.onCompleted();
	                }
	              }));
	          },
	          function (e) { observer.onError(e); },
	          function () {
	            isStopped = true;
	            !hasLatest && observer.onCompleted();
	          });
	      return new CompositeDisposable(subscription, innerSubscription);
	    }, sources);
	  };

	  /**
	   * Returns the values from the source observable sequence until the other observable sequence produces a value.
	   * @param {Observable | Promise} other Observable sequence or Promise that terminates propagation of elements of the source sequence.
	   * @returns {Observable} An observable sequence containing the elements of the source sequence up to the point the other sequence interrupted further propagation.
	   */
	  observableProto.takeUntil = function (other) {
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      isPromise(other) && (other = observableFromPromise(other));
	      return new CompositeDisposable(
	        source.subscribe(o),
	        other.subscribe(function () { o.onCompleted(); }, function (e) { o.onError(e); }, noop)
	      );
	    }, source);
	  };

	  /**
	   * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
	   *
	   * @example
	   * 1 - obs = obs1.withLatestFrom(obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
	   * 2 - obs = obs1.withLatestFrom([obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
	   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
	   */
	  observableProto.withLatestFrom = function () {
	    var len = arguments.length, args = new Array(len)
	    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
	    var resultSelector = args.pop(), source = this;

	    if (typeof source === 'undefined') {
	      throw new Error('Source observable not found for withLatestFrom().');
	    }
	    if (typeof resultSelector !== 'function') {
	      throw new Error('withLatestFrom() expects a resultSelector function.');
	    }
	    if (Array.isArray(args[0])) {
	      args = args[0];
	    }

	    return new AnonymousObservable(function (observer) {
	      var falseFactory = function () { return false; },
	        n = args.length,
	        hasValue = arrayInitialize(n, falseFactory),
	        hasValueAll = false,
	        values = new Array(n);

	      var subscriptions = new Array(n + 1);
	      for (var idx = 0; idx < n; idx++) {
	        (function (i) {
	          var other = args[i], sad = new SingleAssignmentDisposable();
	          isPromise(other) && (other = observableFromPromise(other));
	          sad.setDisposable(other.subscribe(function (x) {
	            values[i] = x;
	            hasValue[i] = true;
	            hasValueAll = hasValue.every(identity);
	          }, observer.onError.bind(observer), function () {}));
	          subscriptions[i] = sad;
	        }(idx));
	      }

	      var sad = new SingleAssignmentDisposable();
	      sad.setDisposable(source.subscribe(function (x) {
	        var res;
	        var allValues = [x].concat(values);
	        if (!hasValueAll) return;
	        try {
	          res = resultSelector.apply(null, allValues);
	        } catch (ex) {
	          observer.onError(ex);
	          return;
	        }
	        observer.onNext(res);
	      }, observer.onError.bind(observer), function () {
	        observer.onCompleted();
	      }));
	      subscriptions[n] = sad;

	      return new CompositeDisposable(subscriptions);
	    }, this);
	  };

	  function zipArray(second, resultSelector) {
	    var first = this;
	    return new AnonymousObservable(function (observer) {
	      var index = 0, len = second.length;
	      return first.subscribe(function (left) {
	        if (index < len) {
	          var right = second[index++], result;
	          try {
	            result = resultSelector(left, right);
	          } catch (e) {
	            return observer.onError(e);
	          }
	          observer.onNext(result);
	        } else {
	          observer.onCompleted();
	        }
	      }, function (e) { observer.onError(e); }, function () { observer.onCompleted(); });
	    }, first);
	  }

	  function falseFactory() { return false; }
	  function emptyArrayFactory() { return []; }

	  /**
	   * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
	   * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
	   *
	   * @example
	   * 1 - res = obs1.zip(obs2, fn);
	   * 1 - res = x1.zip([1,2,3], fn);
	   * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
	   */
	  observableProto.zip = function () {
	    if (Array.isArray(arguments[0])) { return zipArray.apply(this, arguments); }
	    var len = arguments.length, args = new Array(len);
	    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }

	    var parent = this, resultSelector = args.pop();
	    args.unshift(parent);
	    return new AnonymousObservable(function (observer) {
	      var n = args.length,
	        queues = arrayInitialize(n, emptyArrayFactory),
	        isDone = arrayInitialize(n, falseFactory);

	      function next(i) {
	        var res, queuedValues;
	        if (queues.every(function (x) { return x.length > 0; })) {
	          try {
	            queuedValues = queues.map(function (x) { return x.shift(); });
	            res = resultSelector.apply(parent, queuedValues);
	          } catch (ex) {
	            observer.onError(ex);
	            return;
	          }
	          observer.onNext(res);
	        } else if (isDone.filter(function (x, j) { return j !== i; }).every(identity)) {
	          observer.onCompleted();
	        }
	      };

	      function done(i) {
	        isDone[i] = true;
	        if (isDone.every(function (x) { return x; })) {
	          observer.onCompleted();
	        }
	      }

	      var subscriptions = new Array(n);
	      for (var idx = 0; idx < n; idx++) {
	        (function (i) {
	          var source = args[i], sad = new SingleAssignmentDisposable();
	          isPromise(source) && (source = observableFromPromise(source));
	          sad.setDisposable(source.subscribe(function (x) {
	            queues[i].push(x);
	            next(i);
	          }, function (e) { observer.onError(e); }, function () {
	            done(i);
	          }));
	          subscriptions[i] = sad;
	        })(idx);
	      }

	      return new CompositeDisposable(subscriptions);
	    }, parent);
	  };

	  /**
	   * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
	   * @param arguments Observable sources.
	   * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
	   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
	   */
	  Observable.zip = function () {
	    var len = arguments.length, args = new Array(len);
	    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
	    var first = args.shift();
	    return first.zip.apply(first, args);
	  };

	  /**
	   * Merges the specified observable sequences into one observable sequence by emitting a list with the elements of the observable sequences at corresponding indexes.
	   * @param arguments Observable sources.
	   * @returns {Observable} An observable sequence containing lists of elements at corresponding indexes.
	   */
	  Observable.zipArray = function () {
	    var sources;
	    if (Array.isArray(arguments[0])) {
	      sources = arguments[0];
	    } else {
	      var len = arguments.length;
	      sources = new Array(len);
	      for(var i = 0; i < len; i++) { sources[i] = arguments[i]; }
	    }
	    return new AnonymousObservable(function (observer) {
	      var n = sources.length,
	        queues = arrayInitialize(n, function () { return []; }),
	        isDone = arrayInitialize(n, function () { return false; });

	      function next(i) {
	        if (queues.every(function (x) { return x.length > 0; })) {
	          var res = queues.map(function (x) { return x.shift(); });
	          observer.onNext(res);
	        } else if (isDone.filter(function (x, j) { return j !== i; }).every(identity)) {
	          observer.onCompleted();
	          return;
	        }
	      };

	      function done(i) {
	        isDone[i] = true;
	        if (isDone.every(identity)) {
	          observer.onCompleted();
	          return;
	        }
	      }

	      var subscriptions = new Array(n);
	      for (var idx = 0; idx < n; idx++) {
	        (function (i) {
	          subscriptions[i] = new SingleAssignmentDisposable();
	          subscriptions[i].setDisposable(sources[i].subscribe(function (x) {
	            queues[i].push(x);
	            next(i);
	          }, function (e) { observer.onError(e); }, function () {
	            done(i);
	          }));
	        })(idx);
	      }

	      return new CompositeDisposable(subscriptions);
	    });
	  };

	  /**
	   *  Hides the identity of an observable sequence.
	   * @returns {Observable} An observable sequence that hides the identity of the source sequence.
	   */
	  observableProto.asObservable = function () {
	    var source = this;
	    return new AnonymousObservable(function (o) { return source.subscribe(o); }, this);
	  };

	  /**
	   *  Projects each element of an observable sequence into zero or more buffers which are produced based on element count information.
	   *
	   * @example
	   *  var res = xs.bufferWithCount(10);
	   *  var res = xs.bufferWithCount(10, 1);
	   * @param {Number} count Length of each buffer.
	   * @param {Number} [skip] Number of elements to skip between creation of consecutive buffers. If not provided, defaults to the count.
	   * @returns {Observable} An observable sequence of buffers.
	   */
	  observableProto.bufferWithCount = function (count, skip) {
	    if (typeof skip !== 'number') {
	      skip = count;
	    }
	    return this.windowWithCount(count, skip).selectMany(function (x) {
	      return x.toArray();
	    }).where(function (x) {
	      return x.length > 0;
	    });
	  };

	  /**
	   * Dematerializes the explicit notification values of an observable sequence as implicit notifications.
	   * @returns {Observable} An observable sequence exhibiting the behavior corresponding to the source sequence's notification values.
	   */
	  observableProto.dematerialize = function () {
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      return source.subscribe(function (x) { return x.accept(o); }, function(e) { o.onError(e); }, function () { o.onCompleted(); });
	    }, this);
	  };

	  /**
	   *  Returns an observable sequence that contains only distinct contiguous elements according to the keySelector and the comparer.
	   *
	   *  var obs = observable.distinctUntilChanged();
	   *  var obs = observable.distinctUntilChanged(function (x) { return x.id; });
	   *  var obs = observable.distinctUntilChanged(function (x) { return x.id; }, function (x, y) { return x === y; });
	   *
	   * @param {Function} [keySelector] A function to compute the comparison key for each element. If not provided, it projects the value.
	   * @param {Function} [comparer] Equality comparer for computed key values. If not provided, defaults to an equality comparer function.
	   * @returns {Observable} An observable sequence only containing the distinct contiguous elements, based on a computed key value, from the source sequence.
	   */
	  observableProto.distinctUntilChanged = function (keySelector, comparer) {
	    var source = this;
	    comparer || (comparer = defaultComparer);
	    return new AnonymousObservable(function (o) {
	      var hasCurrentKey = false, currentKey;
	      return source.subscribe(function (value) {
	        var key = value;
	        if (keySelector) {
	          try {
	            key = keySelector(value);
	          } catch (e) {
	            o.onError(e);
	            return;
	          }
	        }
	        if (hasCurrentKey) {
	          try {
	            var comparerEquals = comparer(currentKey, key);
	          } catch (e) {
	            o.onError(e);
	            return;
	          }
	        }
	        if (!hasCurrentKey || !comparerEquals) {
	          hasCurrentKey = true;
	          currentKey = key;
	          o.onNext(value);
	        }
	      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
	    }, this);
	  };

	  /**
	   *  Invokes an action for each element in the observable sequence and invokes an action upon graceful or exceptional termination of the observable sequence.
	   *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
	   * @param {Function | Observer} observerOrOnNext Action to invoke for each element in the observable sequence or an observer.
	   * @param {Function} [onError]  Action to invoke upon exceptional termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
	   * @param {Function} [onCompleted]  Action to invoke upon graceful termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
	   * @returns {Observable} The source sequence with the side-effecting behavior applied.
	   */
	  observableProto['do'] = observableProto.tap = observableProto.doAction = function (observerOrOnNext, onError, onCompleted) {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var tapObserver = !observerOrOnNext || isFunction(observerOrOnNext) ?
	        observerCreate(observerOrOnNext || noop, onError || noop, onCompleted || noop) :
	        observerOrOnNext;

	      return source.subscribe(function (x) {
	        try {
	          tapObserver.onNext(x);
	        } catch (e) {
	          observer.onError(e);
	        }
	        observer.onNext(x);
	      }, function (err) {
	          try {
	            tapObserver.onError(err);
	          } catch (e) {
	            observer.onError(e);
	          }
	        observer.onError(err);
	      }, function () {
	        try {
	          tapObserver.onCompleted();
	        } catch (e) {
	          observer.onError(e);
	        }
	        observer.onCompleted();
	      });
	    }, this);
	  };

	  /**
	   *  Invokes an action for each element in the observable sequence.
	   *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
	   * @param {Function} onNext Action to invoke for each element in the observable sequence.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} The source sequence with the side-effecting behavior applied.
	   */
	  observableProto.doOnNext = observableProto.tapOnNext = function (onNext, thisArg) {
	    return this.tap(typeof thisArg !== 'undefined' ? function (x) { onNext.call(thisArg, x); } : onNext);
	  };

	  /**
	   *  Invokes an action upon exceptional termination of the observable sequence.
	   *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
	   * @param {Function} onError Action to invoke upon exceptional termination of the observable sequence.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} The source sequence with the side-effecting behavior applied.
	   */
	  observableProto.doOnError = observableProto.tapOnError = function (onError, thisArg) {
	    return this.tap(noop, typeof thisArg !== 'undefined' ? function (e) { onError.call(thisArg, e); } : onError);
	  };

	  /**
	   *  Invokes an action upon graceful termination of the observable sequence.
	   *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
	   * @param {Function} onCompleted Action to invoke upon graceful termination of the observable sequence.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} The source sequence with the side-effecting behavior applied.
	   */
	  observableProto.doOnCompleted = observableProto.tapOnCompleted = function (onCompleted, thisArg) {
	    return this.tap(noop, null, typeof thisArg !== 'undefined' ? function () { onCompleted.call(thisArg); } : onCompleted);
	  };

	  /**
	   *  Invokes a specified action after the source observable sequence terminates gracefully or exceptionally.
	   * @param {Function} finallyAction Action to invoke after the source observable sequence terminates.
	   * @returns {Observable} Source sequence with the action-invoking termination behavior applied.
	   */
	  observableProto['finally'] = observableProto.ensure = function (action) {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var subscription;
	      try {
	        subscription = source.subscribe(observer);
	      } catch (e) {
	        action();
	        throw e;
	      }
	      return disposableCreate(function () {
	        try {
	          subscription.dispose();
	        } catch (e) {
	          throw e;
	        } finally {
	          action();
	        }
	      });
	    }, this);
	  };

	  /**
	   * @deprecated use #finally or #ensure instead.
	   */
	  observableProto.finallyAction = function (action) {
	    //deprecate('finallyAction', 'finally or ensure');
	    return this.ensure(action);
	  };

	  /**
	   *  Ignores all elements in an observable sequence leaving only the termination messages.
	   * @returns {Observable} An empty observable sequence that signals termination, successful or exceptional, of the source sequence.
	   */
	  observableProto.ignoreElements = function () {
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      return source.subscribe(noop, function (e) { o.onError(e); }, function () { o.onCompleted(); });
	    }, source);
	  };

	  /**
	   *  Materializes the implicit notifications of an observable sequence as explicit notification values.
	   * @returns {Observable} An observable sequence containing the materialized notification values from the source sequence.
	   */
	  observableProto.materialize = function () {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      return source.subscribe(function (value) {
	        observer.onNext(notificationCreateOnNext(value));
	      }, function (e) {
	        observer.onNext(notificationCreateOnError(e));
	        observer.onCompleted();
	      }, function () {
	        observer.onNext(notificationCreateOnCompleted());
	        observer.onCompleted();
	      });
	    }, source);
	  };

	  /**
	   *  Repeats the observable sequence a specified number of times. If the repeat count is not specified, the sequence repeats indefinitely.
	   * @param {Number} [repeatCount]  Number of times to repeat the sequence. If not provided, repeats the sequence indefinitely.
	   * @returns {Observable} The observable sequence producing the elements of the given sequence repeatedly.
	   */
	  observableProto.repeat = function (repeatCount) {
	    return enumerableRepeat(this, repeatCount).concat();
	  };

	  /**
	   *  Repeats the source observable sequence the specified number of times or until it successfully terminates. If the retry count is not specified, it retries indefinitely.
	   *  Note if you encounter an error and want it to retry once, then you must use .retry(2);
	   *
	   * @example
	   *  var res = retried = retry.repeat();
	   *  var res = retried = retry.repeat(2);
	   * @param {Number} [retryCount]  Number of times to retry the sequence. If not provided, retry the sequence indefinitely.
	   * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
	   */
	  observableProto.retry = function (retryCount) {
	    return enumerableRepeat(this, retryCount).catchError();
	  };

	  /**
	   *  Repeats the source observable sequence upon error each time the notifier emits or until it successfully terminates. 
	   *  if the notifier completes, the observable sequence completes.
	   *
	   * @example
	   *  var timer = Observable.timer(500);
	   *  var source = observable.retryWhen(timer);
	   * @param {Observable} [notifier] An observable that triggers the retries or completes the observable with onNext or onCompleted respectively.
	   * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
	   */
	  observableProto.retryWhen = function (notifier) {
	    return enumerableRepeat(this).catchErrorWhen(notifier);
	  };
	  /**
	   *  Applies an accumulator function over an observable sequence and returns each intermediate result. The optional seed value is used as the initial accumulator value.
	   *  For aggregation behavior with no intermediate results, see Observable.aggregate.
	   * @example
	   *  var res = source.scan(function (acc, x) { return acc + x; });
	   *  var res = source.scan(0, function (acc, x) { return acc + x; });
	   * @param {Mixed} [seed] The initial accumulator value.
	   * @param {Function} accumulator An accumulator function to be invoked on each element.
	   * @returns {Observable} An observable sequence containing the accumulated values.
	   */
	  observableProto.scan = function () {
	    var hasSeed = false, seed, accumulator, source = this;
	    if (arguments.length === 2) {
	      hasSeed = true;
	      seed = arguments[0];
	      accumulator = arguments[1];
	    } else {
	      accumulator = arguments[0];
	    }
	    return new AnonymousObservable(function (o) {
	      var hasAccumulation, accumulation, hasValue;
	      return source.subscribe (
	        function (x) {
	          !hasValue && (hasValue = true);
	          try {
	            if (hasAccumulation) {
	              accumulation = accumulator(accumulation, x);
	            } else {
	              accumulation = hasSeed ? accumulator(seed, x) : x;
	              hasAccumulation = true;
	            }
	          } catch (e) {
	            o.onError(e);
	            return;
	          }

	          o.onNext(accumulation);
	        },
	        function (e) { o.onError(e); },
	        function () {
	          !hasValue && hasSeed && o.onNext(seed);
	          o.onCompleted();
	        }
	      );
	    }, source);
	  };

	  /**
	   *  Bypasses a specified number of elements at the end of an observable sequence.
	   * @description
	   *  This operator accumulates a queue with a length enough to store the first `count` elements. As more elements are
	   *  received, elements are taken from the front of the queue and produced on the result sequence. This causes elements to be delayed.
	   * @param count Number of elements to bypass at the end of the source sequence.
	   * @returns {Observable} An observable sequence containing the source sequence elements except for the bypassed ones at the end.
	   */
	  observableProto.skipLast = function (count) {
	    if (count < 0) { throw new ArgumentOutOfRangeError(); }
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var q = [];
	      return source.subscribe(function (x) {
	        q.push(x);
	        q.length > count && o.onNext(q.shift());
	      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
	    }, source);
	  };

	  /**
	   *  Prepends a sequence of values to an observable sequence with an optional scheduler and an argument list of values to prepend.
	   *  @example
	   *  var res = source.startWith(1, 2, 3);
	   *  var res = source.startWith(Rx.Scheduler.timeout, 1, 2, 3);
	   * @param {Arguments} args The specified values to prepend to the observable sequence
	   * @returns {Observable} The source sequence prepended with the specified values.
	   */
	  observableProto.startWith = function () {
	    var values, scheduler, start = 0;
	    if (!!arguments.length && isScheduler(arguments[0])) {
	      scheduler = arguments[0];
	      start = 1;
	    } else {
	      scheduler = immediateScheduler;
	    }
	    for(var args = [], i = start, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
	    return enumerableOf([observableFromArray(args, scheduler), this]).concat();
	  };

	  /**
	   *  Returns a specified number of contiguous elements from the end of an observable sequence.
	   * @description
	   *  This operator accumulates a buffer with a length enough to store elements count elements. Upon completion of
	   *  the source sequence, this buffer is drained on the result sequence. This causes the elements to be delayed.
	   * @param {Number} count Number of elements to take from the end of the source sequence.
	   * @returns {Observable} An observable sequence containing the specified number of elements from the end of the source sequence.
	   */
	  observableProto.takeLast = function (count) {
	    if (count < 0) { throw new ArgumentOutOfRangeError(); }
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var q = [];
	      return source.subscribe(function (x) {
	        q.push(x);
	        q.length > count && q.shift();
	      }, function (e) { o.onError(e); }, function () {
	        while (q.length > 0) { o.onNext(q.shift()); }
	        o.onCompleted();
	      });
	    }, source);
	  };

	  /**
	   *  Returns an array with the specified number of contiguous elements from the end of an observable sequence.
	   *
	   * @description
	   *  This operator accumulates a buffer with a length enough to store count elements. Upon completion of the
	   *  source sequence, this buffer is produced on the result sequence.
	   * @param {Number} count Number of elements to take from the end of the source sequence.
	   * @returns {Observable} An observable sequence containing a single array with the specified number of elements from the end of the source sequence.
	   */
	  observableProto.takeLastBuffer = function (count) {
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var q = [];
	      return source.subscribe(function (x) {
	        q.push(x);
	        q.length > count && q.shift();
	      }, function (e) { o.onError(e); }, function () {
	        o.onNext(q);
	        o.onCompleted();
	      });
	    }, source);
	  };

	  /**
	   *  Projects each element of an observable sequence into zero or more windows which are produced based on element count information.
	   *
	   *  var res = xs.windowWithCount(10);
	   *  var res = xs.windowWithCount(10, 1);
	   * @param {Number} count Length of each window.
	   * @param {Number} [skip] Number of elements to skip between creation of consecutive windows. If not specified, defaults to the count.
	   * @returns {Observable} An observable sequence of windows.
	   */
	  observableProto.windowWithCount = function (count, skip) {
	    var source = this;
	    +count || (count = 0);
	    Math.abs(count) === Infinity && (count = 0);
	    if (count <= 0) { throw new ArgumentOutOfRangeError(); }
	    skip == null && (skip = count);
	    +skip || (skip = 0);
	    Math.abs(skip) === Infinity && (skip = 0);

	    if (skip <= 0) { throw new ArgumentOutOfRangeError(); }
	    return new AnonymousObservable(function (observer) {
	      var m = new SingleAssignmentDisposable(),
	        refCountDisposable = new RefCountDisposable(m),
	        n = 0,
	        q = [];

	      function createWindow () {
	        var s = new Subject();
	        q.push(s);
	        observer.onNext(addRef(s, refCountDisposable));
	      }

	      createWindow();

	      m.setDisposable(source.subscribe(
	        function (x) {
	          for (var i = 0, len = q.length; i < len; i++) { q[i].onNext(x); }
	          var c = n - count + 1;
	          c >= 0 && c % skip === 0 && q.shift().onCompleted();
	          ++n % skip === 0 && createWindow();
	        },
	        function (e) {
	          while (q.length > 0) { q.shift().onError(e); }
	          observer.onError(e);
	        },
	        function () {
	          while (q.length > 0) { q.shift().onCompleted(); }
	          observer.onCompleted();
	        }
	      ));
	      return refCountDisposable;
	    }, source);
	  };

	  function concatMap(source, selector, thisArg) {
	    var selectorFunc = bindCallback(selector, thisArg, 3);
	    return source.map(function (x, i) {
	      var result = selectorFunc(x, i, source);
	      isPromise(result) && (result = observableFromPromise(result));
	      (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
	      return result;
	    }).concatAll();
	  }

	  /**
	   *  One of the Following:
	   *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
	   *
	   * @example
	   *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
	   *  Or:
	   *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
	   *
	   *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
	   *  Or:
	   *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
	   *
	   *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
	   * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
	   * source sequence onto which could be either an observable or Promise.
	   * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
	   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
	   */
	  observableProto.selectConcat = observableProto.concatMap = function (selector, resultSelector, thisArg) {
	    if (isFunction(selector) && isFunction(resultSelector)) {
	      return this.concatMap(function (x, i) {
	        var selectorResult = selector(x, i);
	        isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
	        (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));

	        return selectorResult.map(function (y, i2) {
	          return resultSelector(x, y, i, i2);
	        });
	      });
	    }
	    return isFunction(selector) ?
	      concatMap(this, selector, thisArg) :
	      concatMap(this, function () { return selector; });
	  };

	  /**
	   * Projects each notification of an observable sequence to an observable sequence and concats the resulting observable sequences into one observable sequence.
	   * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
	   * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
	   * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
	   * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
	   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
	   */
	  observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg) {
	    var source = this,
	        onNextFunc = bindCallback(onNext, thisArg, 2),
	        onErrorFunc = bindCallback(onError, thisArg, 1),
	        onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
	    return new AnonymousObservable(function (observer) {
	      var index = 0;
	      return source.subscribe(
	        function (x) {
	          var result;
	          try {
	            result = onNextFunc(x, index++);
	          } catch (e) {
	            observer.onError(e);
	            return;
	          }
	          isPromise(result) && (result = observableFromPromise(result));
	          observer.onNext(result);
	        },
	        function (err) {
	          var result;
	          try {
	            result = onErrorFunc(err);
	          } catch (e) {
	            observer.onError(e);
	            return;
	          }
	          isPromise(result) && (result = observableFromPromise(result));
	          observer.onNext(result);
	          observer.onCompleted();
	        },
	        function () {
	          var result;
	          try {
	            result = onCompletedFunc();
	          } catch (e) {
	            observer.onError(e);
	            return;
	          }
	          isPromise(result) && (result = observableFromPromise(result));
	          observer.onNext(result);
	          observer.onCompleted();
	        });
	    }, this).concatAll();
	  };

	    /**
	     *  Returns the elements of the specified sequence or the specified value in a singleton sequence if the sequence is empty.
	     *
	     *  var res = obs = xs.defaultIfEmpty();
	     *  2 - obs = xs.defaultIfEmpty(false);
	     *
	     * @memberOf Observable#
	     * @param defaultValue The value to return if the sequence is empty. If not provided, this defaults to null.
	     * @returns {Observable} An observable sequence that contains the specified default value if the source is empty; otherwise, the elements of the source itself.
	     */
	    observableProto.defaultIfEmpty = function (defaultValue) {
	      var source = this;
	      defaultValue === undefined && (defaultValue = null);
	      return new AnonymousObservable(function (observer) {
	        var found = false;
	        return source.subscribe(function (x) {
	          found = true;
	          observer.onNext(x);
	        },
	        function (e) { observer.onError(e); }, 
	        function () {
	          !found && observer.onNext(defaultValue);
	          observer.onCompleted();
	        });
	      }, source);
	    };

	  // Swap out for Array.findIndex
	  function arrayIndexOfComparer(array, item, comparer) {
	    for (var i = 0, len = array.length; i < len; i++) {
	      if (comparer(array[i], item)) { return i; }
	    }
	    return -1;
	  }

	  function HashSet(comparer) {
	    this.comparer = comparer;
	    this.set = [];
	  }
	  HashSet.prototype.push = function(value) {
	    var retValue = arrayIndexOfComparer(this.set, value, this.comparer) === -1;
	    retValue && this.set.push(value);
	    return retValue;
	  };

	  /**
	   *  Returns an observable sequence that contains only distinct elements according to the keySelector and the comparer.
	   *  Usage of this operator should be considered carefully due to the maintenance of an internal lookup structure which can grow large.
	   *
	   * @example
	   *  var res = obs = xs.distinct();
	   *  2 - obs = xs.distinct(function (x) { return x.id; });
	   *  2 - obs = xs.distinct(function (x) { return x.id; }, function (a,b) { return a === b; });
	   * @param {Function} [keySelector]  A function to compute the comparison key for each element.
	   * @param {Function} [comparer]  Used to compare items in the collection.
	   * @returns {Observable} An observable sequence only containing the distinct elements, based on a computed key value, from the source sequence.
	   */
	  observableProto.distinct = function (keySelector, comparer) {
	    var source = this;
	    comparer || (comparer = defaultComparer);
	    return new AnonymousObservable(function (o) {
	      var hashSet = new HashSet(comparer);
	      return source.subscribe(function (x) {
	        var key = x;

	        if (keySelector) {
	          try {
	            key = keySelector(x);
	          } catch (e) {
	            o.onError(e);
	            return;
	          }
	        }
	        hashSet.push(key) && o.onNext(x);
	      },
	      function (e) { o.onError(e); }, function () { o.onCompleted(); });
	    }, this);
	  };

	  /**
	   *  Groups the elements of an observable sequence according to a specified key selector function and comparer and selects the resulting elements by using a specified function.
	   *
	   * @example
	   *  var res = observable.groupBy(function (x) { return x.id; });
	   *  2 - observable.groupBy(function (x) { return x.id; }), function (x) { return x.name; });
	   *  3 - observable.groupBy(function (x) { return x.id; }), function (x) { return x.name; }, function (x) { return x.toString(); });
	   * @param {Function} keySelector A function to extract the key for each element.
	   * @param {Function} [elementSelector]  A function to map each source element to an element in an observable group.
	   * @param {Function} [comparer] Used to determine whether the objects are equal.
	   * @returns {Observable} A sequence of observable groups, each of which corresponds to a unique key value, containing all elements that share that same key value.
	   */
	  observableProto.groupBy = function (keySelector, elementSelector, comparer) {
	    return this.groupByUntil(keySelector, elementSelector, observableNever, comparer);
	  };

	    /**
	     *  Groups the elements of an observable sequence according to a specified key selector function.
	     *  A duration selector function is used to control the lifetime of groups. When a group expires, it receives an OnCompleted notification. When a new element with the same
	     *  key value as a reclaimed group occurs, the group will be reborn with a new lifetime request.
	     *
	     * @example
	     *  var res = observable.groupByUntil(function (x) { return x.id; }, null,  function () { return Rx.Observable.never(); });
	     *  2 - observable.groupBy(function (x) { return x.id; }), function (x) { return x.name; },  function () { return Rx.Observable.never(); });
	     *  3 - observable.groupBy(function (x) { return x.id; }), function (x) { return x.name; },  function () { return Rx.Observable.never(); }, function (x) { return x.toString(); });
	     * @param {Function} keySelector A function to extract the key for each element.
	     * @param {Function} durationSelector A function to signal the expiration of a group.
	     * @param {Function} [comparer] Used to compare objects. When not specified, the default comparer is used.
	     * @returns {Observable}
	     *  A sequence of observable groups, each of which corresponds to a unique key value, containing all elements that share that same key value.
	     *  If a group's lifetime expires, a new group with the same key value can be created once an element with such a key value is encoutered.
	     *
	     */
	    observableProto.groupByUntil = function (keySelector, elementSelector, durationSelector, comparer) {
	      var source = this;
	      elementSelector || (elementSelector = identity);
	      comparer || (comparer = defaultComparer);
	      return new AnonymousObservable(function (observer) {
	        function handleError(e) { return function (item) { item.onError(e); }; }
	        var map = new Dictionary(0, comparer),
	          groupDisposable = new CompositeDisposable(),
	          refCountDisposable = new RefCountDisposable(groupDisposable);

	        groupDisposable.add(source.subscribe(function (x) {
	          var key;
	          try {
	            key = keySelector(x);
	          } catch (e) {
	            map.getValues().forEach(handleError(e));
	            observer.onError(e);
	            return;
	          }

	          var fireNewMapEntry = false,
	            writer = map.tryGetValue(key);
	          if (!writer) {
	            writer = new Subject();
	            map.set(key, writer);
	            fireNewMapEntry = true;
	          }

	          if (fireNewMapEntry) {
	            var group = new GroupedObservable(key, writer, refCountDisposable),
	              durationGroup = new GroupedObservable(key, writer);
	            try {
	              duration = durationSelector(durationGroup);
	            } catch (e) {
	              map.getValues().forEach(handleError(e));
	              observer.onError(e);
	              return;
	            }

	            observer.onNext(group);

	            var md = new SingleAssignmentDisposable();
	            groupDisposable.add(md);

	            var expire = function () {
	              map.remove(key) && writer.onCompleted();
	              groupDisposable.remove(md);
	            };

	            md.setDisposable(duration.take(1).subscribe(
	              noop,
	              function (exn) {
	                map.getValues().forEach(handleError(exn));
	                observer.onError(exn);
	              },
	              expire)
	            );
	          }

	          var element;
	          try {
	            element = elementSelector(x);
	          } catch (e) {
	            map.getValues().forEach(handleError(e));
	            observer.onError(e);
	            return;
	          }

	          writer.onNext(element);
	      }, function (ex) {
	        map.getValues().forEach(handleError(ex));
	        observer.onError(ex);
	      }, function () {
	        map.getValues().forEach(function (item) { item.onCompleted(); });
	        observer.onCompleted();
	      }));

	      return refCountDisposable;
	    }, source);
	  };

	  var MapObservable = (function (__super__) {
	    inherits(MapObservable, __super__);

	    function MapObservable(source, selector, thisArg) {
	      this.source = source;
	      this.selector = bindCallback(selector, thisArg, 3);
	      __super__.call(this);
	    }

	    MapObservable.prototype.internalMap = function (selector, thisArg) {
	      var self = this;
	      return new MapObservable(this.source, function (x, i, o) { return selector.call(this, self.selector(x, i, o), i, o); }, thisArg)
	    };

	    MapObservable.prototype.subscribeCore = function (observer) {
	      return this.source.subscribe(new MapObserver(observer, this.selector, this));
	    };

	    return MapObservable;

	  }(ObservableBase));

	  function MapObserver(observer, selector, source) {
	    this.observer = observer;
	    this.selector = selector;
	    this.source = source;
	    this.i = 0;
	    this.isStopped = false;
	  }

	  MapObserver.prototype.onNext = function(x) {
	    if (this.isStopped) { return; }
	    var result = tryCatch(this.selector).call(this, x, this.i++, this.source);
	    if (result === errorObj) {
	      return this.observer.onError(result.e);
	    }
	    this.observer.onNext(result);
	  };
	  MapObserver.prototype.onError = function (e) {
	    if(!this.isStopped) { this.isStopped = true; this.observer.onError(e); }
	  };
	  MapObserver.prototype.onCompleted = function () {
	    if(!this.isStopped) { this.isStopped = true; this.observer.onCompleted(); }
	  };
	  MapObserver.prototype.dispose = function() { this.isStopped = true; };
	  MapObserver.prototype.fail = function (e) {
	    if (!this.isStopped) {
	      this.isStopped = true;
	      this.observer.onError(e);
	      return true;
	    }

	    return false;
	  };

	  /**
	  * Projects each element of an observable sequence into a new form by incorporating the element's index.
	  * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
	  * @param {Any} [thisArg] Object to use as this when executing callback.
	  * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source.
	  */
	  observableProto.map = observableProto.select = function (selector, thisArg) {
	    var selectorFn = typeof selector === 'function' ? selector : function () { return selector; };
	    return this instanceof MapObservable ?
	      this.internalMap(selectorFn, thisArg) :
	      new MapObservable(this, selectorFn, thisArg);
	  };

	  /**
	   * Retrieves the value of a specified nested property from all elements in
	   * the Observable sequence.
	   * @param {Arguments} arguments The nested properties to pluck.
	   * @returns {Observable} Returns a new Observable sequence of property values.
	   */
	  observableProto.pluck = function () {
	    var args = arguments, len = arguments.length;
	    if (len === 0) { throw new Error('List of properties cannot be empty.'); }
	    return this.map(function (x) {
	      var currentProp = x;
	      for (var i = 0; i < len; i++) {
	        var p = currentProp[args[i]];
	        if (typeof p !== 'undefined') {
	          currentProp = p;
	        } else {
	          return undefined;
	        }
	      }
	      return currentProp;
	    });
	  };

	  function flatMap(source, selector, thisArg) {
	    var selectorFunc = bindCallback(selector, thisArg, 3);
	    return source.map(function (x, i) {
	      var result = selectorFunc(x, i, source);
	      isPromise(result) && (result = observableFromPromise(result));
	      (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
	      return result;
	    }).mergeAll();
	  }

	  /**
	   *  One of the Following:
	   *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
	   *
	   * @example
	   *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
	   *  Or:
	   *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
	   *
	   *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
	   *  Or:
	   *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
	   *
	   *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
	   * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
	   * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
	   */
	  observableProto.selectMany = observableProto.flatMap = function (selector, resultSelector, thisArg) {
	    if (isFunction(selector) && isFunction(resultSelector)) {
	      return this.flatMap(function (x, i) {
	        var selectorResult = selector(x, i);
	        isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
	        (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));

	        return selectorResult.map(function (y, i2) {
	          return resultSelector(x, y, i, i2);
	        });
	      }, thisArg);
	    }
	    return isFunction(selector) ?
	      flatMap(this, selector, thisArg) :
	      flatMap(this, function () { return selector; });
	  };

	  /**
	   * Projects each notification of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
	   * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
	   * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
	   * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
	   * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
	   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
	   */
	  observableProto.flatMapObserver = observableProto.selectManyObserver = function (onNext, onError, onCompleted, thisArg) {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var index = 0;

	      return source.subscribe(
	        function (x) {
	          var result;
	          try {
	            result = onNext.call(thisArg, x, index++);
	          } catch (e) {
	            observer.onError(e);
	            return;
	          }
	          isPromise(result) && (result = observableFromPromise(result));
	          observer.onNext(result);
	        },
	        function (err) {
	          var result;
	          try {
	            result = onError.call(thisArg, err);
	          } catch (e) {
	            observer.onError(e);
	            return;
	          }
	          isPromise(result) && (result = observableFromPromise(result));
	          observer.onNext(result);
	          observer.onCompleted();
	        },
	        function () {
	          var result;
	          try {
	            result = onCompleted.call(thisArg);
	          } catch (e) {
	            observer.onError(e);
	            return;
	          }
	          isPromise(result) && (result = observableFromPromise(result));
	          observer.onNext(result);
	          observer.onCompleted();
	        });
	    }, source).mergeAll();
	  };

	  /**
	   *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
	   *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
	   * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
	   *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
	   */
	  observableProto.selectSwitch = observableProto.flatMapLatest = observableProto.switchMap = function (selector, thisArg) {
	    return this.select(selector, thisArg).switchLatest();
	  };

	  /**
	   * Bypasses a specified number of elements in an observable sequence and then returns the remaining elements.
	   * @param {Number} count The number of elements to skip before returning the remaining elements.
	   * @returns {Observable} An observable sequence that contains the elements that occur after the specified index in the input sequence.
	   */
	  observableProto.skip = function (count) {
	    if (count < 0) { throw new ArgumentOutOfRangeError(); }
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var remaining = count;
	      return source.subscribe(function (x) {
	        if (remaining <= 0) {
	          o.onNext(x);
	        } else {
	          remaining--;
	        }
	      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
	    }, source);
	  };

	  /**
	   *  Bypasses elements in an observable sequence as long as a specified condition is true and then returns the remaining elements.
	   *  The element's index is used in the logic of the predicate function.
	   *
	   *  var res = source.skipWhile(function (value) { return value < 10; });
	   *  var res = source.skipWhile(function (value, index) { return value < 10 || index < 10; });
	   * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} An observable sequence that contains the elements from the input sequence starting at the first element in the linear series that does not pass the test specified by predicate.
	   */
	  observableProto.skipWhile = function (predicate, thisArg) {
	    var source = this,
	        callback = bindCallback(predicate, thisArg, 3);
	    return new AnonymousObservable(function (o) {
	      var i = 0, running = false;
	      return source.subscribe(function (x) {
	        if (!running) {
	          try {
	            running = !callback(x, i++, source);
	          } catch (e) {
	            o.onError(e);
	            return;
	          }
	        }
	        running && o.onNext(x);
	      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
	    }, source);
	  };

	  /**
	   *  Returns a specified number of contiguous elements from the start of an observable sequence, using the specified scheduler for the edge case of take(0).
	   *
	   *  var res = source.take(5);
	   *  var res = source.take(0, Rx.Scheduler.timeout);
	   * @param {Number} count The number of elements to return.
	   * @param {Scheduler} [scheduler] Scheduler used to produce an OnCompleted message in case <paramref name="count count</paramref> is set to 0.
	   * @returns {Observable} An observable sequence that contains the specified number of elements from the start of the input sequence.
	   */
	  observableProto.take = function (count, scheduler) {
	    if (count < 0) { throw new ArgumentOutOfRangeError(); }
	    if (count === 0) { return observableEmpty(scheduler); }
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var remaining = count;
	      return source.subscribe(function (x) {
	        if (remaining-- > 0) {
	          o.onNext(x);
	          remaining === 0 && o.onCompleted();
	        }
	      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
	    }, source);
	  };

	  /**
	   *  Returns elements from an observable sequence as long as a specified condition is true.
	   *  The element's index is used in the logic of the predicate function.
	   * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} An observable sequence that contains the elements from the input sequence that occur before the element at which the test no longer passes.
	   */
	  observableProto.takeWhile = function (predicate, thisArg) {
	    var source = this,
	        callback = bindCallback(predicate, thisArg, 3);
	    return new AnonymousObservable(function (o) {
	      var i = 0, running = true;
	      return source.subscribe(function (x) {
	        if (running) {
	          try {
	            running = callback(x, i++, source);
	          } catch (e) {
	            o.onError(e);
	            return;
	          }
	          if (running) {
	            o.onNext(x);
	          } else {
	            o.onCompleted();
	          }
	        }
	      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
	    }, source);
	  };

	  var FilterObservable = (function (__super__) {
	    inherits(FilterObservable, __super__);

	    function FilterObservable(source, predicate, thisArg) {
	      this.source = source;
	      this.predicate = bindCallback(predicate, thisArg, 3);
	      __super__.call(this);
	    }

	    FilterObservable.prototype.subscribeCore = function (observer) {
	      return this.source.subscribe(new FilterObserver(observer, this.predicate, this));
	    };

	    FilterObservable.prototype.internalFilter = function(predicate, thisArg) {
	      var self = this;
	      return new FilterObservable(this.source, function(x, i, o) { return self.predicate(x, i, o) && predicate.call(this, x, i, o); }, thisArg);
	    };

	    return FilterObservable;

	  }(ObservableBase));

	  function FilterObserver(observer, predicate, source) {
	    this.observer = observer;
	    this.predicate = predicate;
	    this.source = source;
	    this.i = 0;
	    this.isStopped = false;
	  }

	  FilterObserver.prototype.onNext = function(x) {
	    if (this.isStopped) { return; }
	    var shouldYield = tryCatch(this.predicate).call(this, x, this.i++, this.source);
	    if (shouldYield === errorObj) {
	      return this.observer.onError(shouldYield.e);
	    }
	    shouldYield && this.observer.onNext(x);
	  };
	  FilterObserver.prototype.onError = function (e) {
	    if(!this.isStopped) { this.isStopped = true; this.observer.onError(e); }
	  };
	  FilterObserver.prototype.onCompleted = function () {
	    if(!this.isStopped) { this.isStopped = true; this.observer.onCompleted(); }
	  };
	  FilterObserver.prototype.dispose = function() { this.isStopped = true; };
	  FilterObserver.prototype.fail = function (e) {
	    if (!this.isStopped) {
	      this.isStopped = true;
	      this.observer.onError(e);
	      return true;
	    }
	    return false;
	  };

	  /**
	  *  Filters the elements of an observable sequence based on a predicate by incorporating the element's index.
	  * @param {Function} predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
	  * @param {Any} [thisArg] Object to use as this when executing callback.
	  * @returns {Observable} An observable sequence that contains elements from the input sequence that satisfy the condition.
	  */
	  observableProto.filter = observableProto.where = function (predicate, thisArg) {
	    return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) :
	      new FilterObservable(this, predicate, thisArg);
	  };

	  function extremaBy(source, keySelector, comparer) {
	    return new AnonymousObservable(function (o) {
	      var hasValue = false, lastKey = null, list = [];
	      return source.subscribe(function (x) {
	        var comparison, key;
	        try {
	          key = keySelector(x);
	        } catch (ex) {
	          o.onError(ex);
	          return;
	        }
	        comparison = 0;
	        if (!hasValue) {
	          hasValue = true;
	          lastKey = key;
	        } else {
	          try {
	            comparison = comparer(key, lastKey);
	          } catch (ex1) {
	            o.onError(ex1);
	            return;
	          }
	        }
	        if (comparison > 0) {
	          lastKey = key;
	          list = [];
	        }
	        if (comparison >= 0) { list.push(x); }
	      }, function (e) { o.onError(e); }, function () {
	        o.onNext(list);
	        o.onCompleted();
	      });
	    }, source);
	  }

	  function firstOnly(x) {
	    if (x.length === 0) { throw new EmptyError(); }
	    return x[0];
	  }

	  /**
	   * Applies an accumulator function over an observable sequence, returning the result of the aggregation as a single element in the result sequence. The specified seed value is used as the initial accumulator value.
	   * For aggregation behavior with incremental intermediate results, see Observable.scan.
	   * @deprecated Use #reduce instead
	   * @param {Mixed} [seed] The initial accumulator value.
	   * @param {Function} accumulator An accumulator function to be invoked on each element.
	   * @returns {Observable} An observable sequence containing a single element with the final accumulator value.
	   */
	  observableProto.aggregate = function () {
	    var hasSeed = false, accumulator, seed, source = this;
	    if (arguments.length === 2) {
	      hasSeed = true;
	      seed = arguments[0];
	      accumulator = arguments[1];
	    } else {
	      accumulator = arguments[0];
	    }
	    return new AnonymousObservable(function (o) {
	      var hasAccumulation, accumulation, hasValue;
	      return source.subscribe (
	        function (x) {
	          !hasValue && (hasValue = true);
	          try {
	            if (hasAccumulation) {
	              accumulation = accumulator(accumulation, x);
	            } else {
	              accumulation = hasSeed ? accumulator(seed, x) : x;
	              hasAccumulation = true;
	            }
	          } catch (e) {
	            return o.onError(e);
	          }
	        },
	        function (e) { o.onError(e); },
	        function () {
	          hasValue && o.onNext(accumulation);
	          !hasValue && hasSeed && o.onNext(seed);
	          !hasValue && !hasSeed && o.onError(new EmptyError());
	          o.onCompleted();
	        }
	      );
	    }, source);
	  };

	  /**
	   * Applies an accumulator function over an observable sequence, returning the result of the aggregation as a single element in the result sequence. The specified seed value is used as the initial accumulator value.
	   * For aggregation behavior with incremental intermediate results, see Observable.scan.
	   * @param {Function} accumulator An accumulator function to be invoked on each element.
	   * @param {Any} [seed] The initial accumulator value.
	   * @returns {Observable} An observable sequence containing a single element with the final accumulator value.
	   */
	  observableProto.reduce = function (accumulator) {
	    var hasSeed = false, seed, source = this;
	    if (arguments.length === 2) {
	      hasSeed = true;
	      seed = arguments[1];
	    }
	    return new AnonymousObservable(function (o) {
	      var hasAccumulation, accumulation, hasValue;
	      return source.subscribe (
	        function (x) {
	          !hasValue && (hasValue = true);
	          try {
	            if (hasAccumulation) {
	              accumulation = accumulator(accumulation, x);
	            } else {
	              accumulation = hasSeed ? accumulator(seed, x) : x;
	              hasAccumulation = true;
	            }
	          } catch (e) {
	            return o.onError(e);
	          }
	        },
	        function (e) { o.onError(e); },
	        function () {
	          hasValue && o.onNext(accumulation);
	          !hasValue && hasSeed && o.onNext(seed);
	          !hasValue && !hasSeed && o.onError(new EmptyError());
	          o.onCompleted();
	        }
	      );
	    }, source);
	  };

	  /**
	   * Determines whether any element of an observable sequence satisfies a condition if present, else if any items are in the sequence.
	   * @param {Function} [predicate] A function to test each element for a condition.
	   * @returns {Observable} An observable sequence containing a single element determining whether any elements in the source sequence pass the test in the specified predicate if given, else if any items are in the sequence.
	   */
	  observableProto.some = function (predicate, thisArg) {
	    var source = this;
	    return predicate ?
	      source.filter(predicate, thisArg).some() :
	      new AnonymousObservable(function (observer) {
	        return source.subscribe(function () {
	          observer.onNext(true);
	          observer.onCompleted();
	        }, function (e) { observer.onError(e); }, function () {
	          observer.onNext(false);
	          observer.onCompleted();
	        });
	      }, source);
	  };

	  /** @deprecated use #some instead */
	  observableProto.any = function () {
	    //deprecate('any', 'some');
	    return this.some.apply(this, arguments);
	  };

	  /**
	   * Determines whether an observable sequence is empty.
	   * @returns {Observable} An observable sequence containing a single element determining whether the source sequence is empty.
	   */
	  observableProto.isEmpty = function () {
	    return this.any().map(not);
	  };

	  /**
	   * Determines whether all elements of an observable sequence satisfy a condition.
	   * @param {Function} [predicate] A function to test each element for a condition.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} An observable sequence containing a single element determining whether all elements in the source sequence pass the test in the specified predicate.
	   */
	  observableProto.every = function (predicate, thisArg) {
	    return this.filter(function (v) { return !predicate(v); }, thisArg).some().map(not);
	  };

	  /** @deprecated use #every instead */
	  observableProto.all = function () {
	    //deprecate('all', 'every');
	    return this.every.apply(this, arguments);
	  };

	  /**
	   * Determines whether an observable sequence includes a specified element with an optional equality comparer.
	   * @param searchElement The value to locate in the source sequence.
	   * @param {Number} [fromIndex] An equality comparer to compare elements.
	   * @returns {Observable} An observable sequence containing a single element determining whether the source sequence includes an element that has the specified value from the given index.
	   */
	  observableProto.includes = function (searchElement, fromIndex) {
	    var source = this;
	    function comparer(a, b) {
	      return (a === 0 && b === 0) || (a === b || (isNaN(a) && isNaN(b)));
	    }
	    return new AnonymousObservable(function (o) {
	      var i = 0, n = +fromIndex || 0;
	      Math.abs(n) === Infinity && (n = 0);
	      if (n < 0) {
	        o.onNext(false);
	        o.onCompleted();
	        return disposableEmpty;
	      }
	      return source.subscribe(
	        function (x) {
	          if (i++ >= n && comparer(x, searchElement)) {
	            o.onNext(true);
	            o.onCompleted();
	          }
	        },
	        function (e) { o.onError(e); },
	        function () {
	          o.onNext(false);
	          o.onCompleted();
	        });
	    }, this);
	  };

	  /**
	   * @deprecated use #includes instead.
	   */
	  observableProto.contains = function (searchElement, fromIndex) {
	    //deprecate('contains', 'includes');
	    observableProto.includes(searchElement, fromIndex);
	  };
	  /**
	   * Returns an observable sequence containing a value that represents how many elements in the specified observable sequence satisfy a condition if provided, else the count of items.
	   * @example
	   * res = source.count();
	   * res = source.count(function (x) { return x > 3; });
	   * @param {Function} [predicate]A function to test each element for a condition.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} An observable sequence containing a single element with a number that represents how many elements in the input sequence satisfy the condition in the predicate function if provided, else the count of items in the sequence.
	   */
	  observableProto.count = function (predicate, thisArg) {
	    return predicate ?
	      this.filter(predicate, thisArg).count() :
	      this.reduce(function (count) { return count + 1; }, 0);
	  };

	  /**
	   * Returns the first index at which a given element can be found in the observable sequence, or -1 if it is not present.
	   * @param {Any} searchElement Element to locate in the array.
	   * @param {Number} [fromIndex] The index to start the search.  If not specified, defaults to 0.
	   * @returns {Observable} And observable sequence containing the first index at which a given element can be found in the observable sequence, or -1 if it is not present.
	   */
	  observableProto.indexOf = function(searchElement, fromIndex) {
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var i = 0, n = +fromIndex || 0;
	      Math.abs(n) === Infinity && (n = 0);
	      if (n < 0) {
	        o.onNext(-1);
	        o.onCompleted();
	        return disposableEmpty;
	      }
	      return source.subscribe(
	        function (x) {
	          if (i >= n && x === searchElement) {
	            o.onNext(i);
	            o.onCompleted();
	          }
	          i++;
	        },
	        function (e) { o.onError(e); },
	        function () {
	          o.onNext(-1);
	          o.onCompleted();
	        });
	    }, source);
	  };

	  /**
	   * Computes the sum of a sequence of values that are obtained by invoking an optional transform function on each element of the input sequence, else if not specified computes the sum on each item in the sequence.
	   * @param {Function} [selector] A transform function to apply to each element.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} An observable sequence containing a single element with the sum of the values in the source sequence.
	   */
	  observableProto.sum = function (keySelector, thisArg) {
	    return keySelector && isFunction(keySelector) ?
	      this.map(keySelector, thisArg).sum() :
	      this.reduce(function (prev, curr) { return prev + curr; }, 0);
	  };

	  /**
	   * Returns the elements in an observable sequence with the minimum key value according to the specified comparer.
	   * @example
	   * var res = source.minBy(function (x) { return x.value; });
	   * var res = source.minBy(function (x) { return x.value; }, function (x, y) { return x - y; });
	   * @param {Function} keySelector Key selector function.
	   * @param {Function} [comparer] Comparer used to compare key values.
	   * @returns {Observable} An observable sequence containing a list of zero or more elements that have a minimum key value.
	   */
	  observableProto.minBy = function (keySelector, comparer) {
	    comparer || (comparer = defaultSubComparer);
	    return extremaBy(this, keySelector, function (x, y) { return comparer(x, y) * -1; });
	  };

	  /**
	   * Returns the minimum element in an observable sequence according to the optional comparer else a default greater than less than check.
	   * @example
	   * var res = source.min();
	   * var res = source.min(function (x, y) { return x.value - y.value; });
	   * @param {Function} [comparer] Comparer used to compare elements.
	   * @returns {Observable} An observable sequence containing a single element with the minimum element in the source sequence.
	   */
	  observableProto.min = function (comparer) {
	    return this.minBy(identity, comparer).map(function (x) { return firstOnly(x); });
	  };

	  /**
	   * Returns the elements in an observable sequence with the maximum  key value according to the specified comparer.
	   * @example
	   * var res = source.maxBy(function (x) { return x.value; });
	   * var res = source.maxBy(function (x) { return x.value; }, function (x, y) { return x - y;; });
	   * @param {Function} keySelector Key selector function.
	   * @param {Function} [comparer]  Comparer used to compare key values.
	   * @returns {Observable} An observable sequence containing a list of zero or more elements that have a maximum key value.
	   */
	  observableProto.maxBy = function (keySelector, comparer) {
	    comparer || (comparer = defaultSubComparer);
	    return extremaBy(this, keySelector, comparer);
	  };

	  /**
	   * Returns the maximum value in an observable sequence according to the specified comparer.
	   * @example
	   * var res = source.max();
	   * var res = source.max(function (x, y) { return x.value - y.value; });
	   * @param {Function} [comparer] Comparer used to compare elements.
	   * @returns {Observable} An observable sequence containing a single element with the maximum element in the source sequence.
	   */
	  observableProto.max = function (comparer) {
	    return this.maxBy(identity, comparer).map(function (x) { return firstOnly(x); });
	  };

	  /**
	   * Computes the average of an observable sequence of values that are in the sequence or obtained by invoking a transform function on each element of the input sequence if present.
	   * @param {Function} [selector] A transform function to apply to each element.
	   * @param {Any} [thisArg] Object to use as this when executing callback.
	   * @returns {Observable} An observable sequence containing a single element with the average of the sequence of values.
	   */
	  observableProto.average = function (keySelector, thisArg) {
	    return keySelector && isFunction(keySelector) ?
	      this.map(keySelector, thisArg).average() :
	      this.reduce(function (prev, cur) {
	        return {
	          sum: prev.sum + cur,
	          count: prev.count + 1
	        };
	      }, {sum: 0, count: 0 }).map(function (s) {
	        if (s.count === 0) { throw new EmptyError(); }
	        return s.sum / s.count;
	      });
	  };

	  /**
	   *  Determines whether two sequences are equal by comparing the elements pairwise using a specified equality comparer.
	   *
	   * @example
	   * var res = res = source.sequenceEqual([1,2,3]);
	   * var res = res = source.sequenceEqual([{ value: 42 }], function (x, y) { return x.value === y.value; });
	   * 3 - res = source.sequenceEqual(Rx.Observable.returnValue(42));
	   * 4 - res = source.sequenceEqual(Rx.Observable.returnValue({ value: 42 }), function (x, y) { return x.value === y.value; });
	   * @param {Observable} second Second observable sequence or array to compare.
	   * @param {Function} [comparer] Comparer used to compare elements of both sequences.
	   * @returns {Observable} An observable sequence that contains a single element which indicates whether both sequences are of equal length and their corresponding elements are equal according to the specified equality comparer.
	   */
	  observableProto.sequenceEqual = function (second, comparer) {
	    var first = this;
	    comparer || (comparer = defaultComparer);
	    return new AnonymousObservable(function (o) {
	      var donel = false, doner = false, ql = [], qr = [];
	      var subscription1 = first.subscribe(function (x) {
	        var equal, v;
	        if (qr.length > 0) {
	          v = qr.shift();
	          try {
	            equal = comparer(v, x);
	          } catch (e) {
	            o.onError(e);
	            return;
	          }
	          if (!equal) {
	            o.onNext(false);
	            o.onCompleted();
	          }
	        } else if (doner) {
	          o.onNext(false);
	          o.onCompleted();
	        } else {
	          ql.push(x);
	        }
	      }, function(e) { o.onError(e); }, function () {
	        donel = true;
	        if (ql.length === 0) {
	          if (qr.length > 0) {
	            o.onNext(false);
	            o.onCompleted();
	          } else if (doner) {
	            o.onNext(true);
	            o.onCompleted();
	          }
	        }
	      });

	      (isArrayLike(second) || isIterable(second)) && (second = observableFrom(second));
	      isPromise(second) && (second = observableFromPromise(second));
	      var subscription2 = second.subscribe(function (x) {
	        var equal;
	        if (ql.length > 0) {
	          var v = ql.shift();
	          try {
	            equal = comparer(v, x);
	          } catch (exception) {
	            o.onError(exception);
	            return;
	          }
	          if (!equal) {
	            o.onNext(false);
	            o.onCompleted();
	          }
	        } else if (donel) {
	          o.onNext(false);
	          o.onCompleted();
	        } else {
	          qr.push(x);
	        }
	      }, function(e) { o.onError(e); }, function () {
	        doner = true;
	        if (qr.length === 0) {
	          if (ql.length > 0) {
	            o.onNext(false);
	            o.onCompleted();
	          } else if (donel) {
	            o.onNext(true);
	            o.onCompleted();
	          }
	        }
	      });
	      return new CompositeDisposable(subscription1, subscription2);
	    }, first);
	  };

	  function elementAtOrDefault(source, index, hasDefault, defaultValue) {
	    if (index < 0) { throw new ArgumentOutOfRangeError(); }
	    return new AnonymousObservable(function (o) {
	      var i = index;
	      return source.subscribe(function (x) {
	        if (i-- === 0) {
	          o.onNext(x);
	          o.onCompleted();
	        }
	      }, function (e) { o.onError(e); }, function () {
	        if (!hasDefault) {
	          o.onError(new ArgumentOutOfRangeError());
	        } else {
	          o.onNext(defaultValue);
	          o.onCompleted();
	        }
	      });
	    }, source);
	  }

	  /**
	   * Returns the element at a specified index in a sequence.
	   * @example
	   * var res = source.elementAt(5);
	   * @param {Number} index The zero-based index of the element to retrieve.
	   * @returns {Observable} An observable sequence that produces the element at the specified position in the source sequence.
	   */
	  observableProto.elementAt =  function (index) {
	    return elementAtOrDefault(this, index, false);
	  };

	  /**
	   * Returns the element at a specified index in a sequence or a default value if the index is out of range.
	   * @example
	   * var res = source.elementAtOrDefault(5);
	   * var res = source.elementAtOrDefault(5, 0);
	   * @param {Number} index The zero-based index of the element to retrieve.
	   * @param [defaultValue] The default value if the index is outside the bounds of the source sequence.
	   * @returns {Observable} An observable sequence that produces the element at the specified position in the source sequence, or a default value if the index is outside the bounds of the source sequence.
	   */
	  observableProto.elementAtOrDefault = function (index, defaultValue) {
	    return elementAtOrDefault(this, index, true, defaultValue);
	  };

	  function singleOrDefaultAsync(source, hasDefault, defaultValue) {
	    return new AnonymousObservable(function (o) {
	      var value = defaultValue, seenValue = false;
	      return source.subscribe(function (x) {
	        if (seenValue) {
	          o.onError(new Error('Sequence contains more than one element'));
	        } else {
	          value = x;
	          seenValue = true;
	        }
	      }, function (e) { o.onError(e); }, function () {
	        if (!seenValue && !hasDefault) {
	          o.onError(new EmptyError());
	        } else {
	          o.onNext(value);
	          o.onCompleted();
	        }
	      });
	    }, source);
	  }

	  /**
	   * Returns the only element of an observable sequence that satisfies the condition in the optional predicate, and reports an exception if there is not exactly one element in the observable sequence.
	   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
	   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
	   * @returns {Observable} Sequence containing the single element in the observable sequence that satisfies the condition in the predicate.
	   */
	  observableProto.single = function (predicate, thisArg) {
	    return predicate && isFunction(predicate) ?
	      this.where(predicate, thisArg).single() :
	      singleOrDefaultAsync(this, false);
	  };

	  /**
	   * Returns the only element of an observable sequence that matches the predicate, or a default value if no such element exists; this method reports an exception if there is more than one element in the observable sequence.
	   * @example
	   * var res = res = source.singleOrDefault();
	   * var res = res = source.singleOrDefault(function (x) { return x === 42; });
	   * res = source.singleOrDefault(function (x) { return x === 42; }, 0);
	   * res = source.singleOrDefault(null, 0);
	   * @memberOf Observable#
	   * @param {Function} predicate A predicate function to evaluate for elements in the source sequence.
	   * @param [defaultValue] The default value if the index is outside the bounds of the source sequence.
	   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
	   * @returns {Observable} Sequence containing the single element in the observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
	   */
	  observableProto.singleOrDefault = function (predicate, defaultValue, thisArg) {
	    return predicate && isFunction(predicate) ?
	      this.filter(predicate, thisArg).singleOrDefault(null, defaultValue) :
	      singleOrDefaultAsync(this, true, defaultValue);
	  };

	  function firstOrDefaultAsync(source, hasDefault, defaultValue) {
	    return new AnonymousObservable(function (o) {
	      return source.subscribe(function (x) {
	        o.onNext(x);
	        o.onCompleted();
	      }, function (e) { o.onError(e); }, function () {
	        if (!hasDefault) {
	          o.onError(new EmptyError());
	        } else {
	          o.onNext(defaultValue);
	          o.onCompleted();
	        }
	      });
	    }, source);
	  }

	  /**
	   * Returns the first element of an observable sequence that satisfies the condition in the predicate if present else the first item in the sequence.
	   * @example
	   * var res = res = source.first();
	   * var res = res = source.first(function (x) { return x > 3; });
	   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
	   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
	   * @returns {Observable} Sequence containing the first element in the observable sequence that satisfies the condition in the predicate if provided, else the first item in the sequence.
	   */
	  observableProto.first = function (predicate, thisArg) {
	    return predicate ?
	      this.where(predicate, thisArg).first() :
	      firstOrDefaultAsync(this, false);
	  };

	  /**
	   * Returns the first element of an observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
	   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
	   * @param {Any} [defaultValue] The default value if no such element exists.  If not specified, defaults to null.
	   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
	   * @returns {Observable} Sequence containing the first element in the observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
	   */
	  observableProto.firstOrDefault = function (predicate, defaultValue, thisArg) {
	    return predicate ?
	      this.where(predicate).firstOrDefault(null, defaultValue) :
	      firstOrDefaultAsync(this, true, defaultValue);
	  };

	  function lastOrDefaultAsync(source, hasDefault, defaultValue) {
	    return new AnonymousObservable(function (o) {
	      var value = defaultValue, seenValue = false;
	      return source.subscribe(function (x) {
	        value = x;
	        seenValue = true;
	      }, function (e) { o.onError(e); }, function () {
	        if (!seenValue && !hasDefault) {
	          o.onError(new EmptyError());
	        } else {
	          o.onNext(value);
	          o.onCompleted();
	        }
	      });
	    }, source);
	  }

	  /**
	   * Returns the last element of an observable sequence that satisfies the condition in the predicate if specified, else the last element.
	   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
	   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
	   * @returns {Observable} Sequence containing the last element in the observable sequence that satisfies the condition in the predicate.
	   */
	  observableProto.last = function (predicate, thisArg) {
	    return predicate ?
	      this.where(predicate, thisArg).last() :
	      lastOrDefaultAsync(this, false);
	  };

	  /**
	   * Returns the last element of an observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
	   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
	   * @param [defaultValue] The default value if no such element exists.  If not specified, defaults to null.
	   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
	   * @returns {Observable} Sequence containing the last element in the observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
	   */
	  observableProto.lastOrDefault = function (predicate, defaultValue, thisArg) {
	    return predicate ?
	      this.where(predicate, thisArg).lastOrDefault(null, defaultValue) :
	      lastOrDefaultAsync(this, true, defaultValue);
	  };

	  function findValue (source, predicate, thisArg, yieldIndex) {
	    var callback = bindCallback(predicate, thisArg, 3);
	    return new AnonymousObservable(function (o) {
	      var i = 0;
	      return source.subscribe(function (x) {
	        var shouldRun;
	        try {
	          shouldRun = callback(x, i, source);
	        } catch (e) {
	          o.onError(e);
	          return;
	        }
	        if (shouldRun) {
	          o.onNext(yieldIndex ? i : x);
	          o.onCompleted();
	        } else {
	          i++;
	        }
	      }, function (e) { o.onError(e); }, function () {
	        o.onNext(yieldIndex ? -1 : undefined);
	        o.onCompleted();
	      });
	    }, source);
	  }

	  /**
	   * Searches for an element that matches the conditions defined by the specified predicate, and returns the first occurrence within the entire Observable sequence.
	   * @param {Function} predicate The predicate that defines the conditions of the element to search for.
	   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
	   * @returns {Observable} An Observable sequence with the first element that matches the conditions defined by the specified predicate, if found; otherwise, undefined.
	   */
	  observableProto.find = function (predicate, thisArg) {
	    return findValue(this, predicate, thisArg, false);
	  };

	  /**
	   * Searches for an element that matches the conditions defined by the specified predicate, and returns
	   * an Observable sequence with the zero-based index of the first occurrence within the entire Observable sequence.
	   * @param {Function} predicate The predicate that defines the conditions of the element to search for.
	   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
	   * @returns {Observable} An Observable sequence with the zero-based index of the first occurrence of an element that matches the conditions defined by match, if found; otherwise, –1.
	  */
	  observableProto.findIndex = function (predicate, thisArg) {
	    return findValue(this, predicate, thisArg, true);
	  };

	  /**
	   * Converts the observable sequence to a Set if it exists.
	   * @returns {Observable} An observable sequence with a single value of a Set containing the values from the observable sequence.
	   */
	  observableProto.toSet = function () {
	    if (typeof root.Set === 'undefined') { throw new TypeError(); }
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var s = new root.Set();
	      return source.subscribe(
	        function (x) { s.add(x); },
	        function (e) { o.onError(e); },
	        function () {
	          o.onNext(s);
	          o.onCompleted();
	        });
	    }, source);
	  };

	  /**
	  * Converts the observable sequence to a Map if it exists.
	  * @param {Function} keySelector A function which produces the key for the Map.
	  * @param {Function} [elementSelector] An optional function which produces the element for the Map. If not present, defaults to the value from the observable sequence.
	  * @returns {Observable} An observable sequence with a single value of a Map containing the values from the observable sequence.
	  */
	  observableProto.toMap = function (keySelector, elementSelector) {
	    if (typeof root.Map === 'undefined') { throw new TypeError(); }
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var m = new root.Map();
	      return source.subscribe(
	        function (x) {
	          var key;
	          try {
	            key = keySelector(x);
	          } catch (e) {
	            o.onError(e);
	            return;
	          }

	          var element = x;
	          if (elementSelector) {
	            try {
	              element = elementSelector(x);
	            } catch (e) {
	              o.onError(e);
	              return;
	            }
	          }

	          m.set(key, element);
	        },
	        function (e) { o.onError(e); },
	        function () {
	          o.onNext(m);
	          o.onCompleted();
	        });
	    }, source);
	  };

	  var fnString = 'function',
	      throwString = 'throw',
	      isObject = Rx.internals.isObject;

	  function toThunk(obj, ctx) {
	    if (Array.isArray(obj)) {  return objectToThunk.call(ctx, obj); }
	    if (isGeneratorFunction(obj)) { return observableSpawn(obj.call(ctx)); }
	    if (isGenerator(obj)) {  return observableSpawn(obj); }
	    if (isObservable(obj)) { return observableToThunk(obj); }
	    if (isPromise(obj)) { return promiseToThunk(obj); }
	    if (typeof obj === fnString) { return obj; }
	    if (isObject(obj) || Array.isArray(obj)) { return objectToThunk.call(ctx, obj); }

	    return obj;
	  }

	  function objectToThunk(obj) {
	    var ctx = this;

	    return function (done) {
	      var keys = Object.keys(obj),
	          pending = keys.length,
	          results = new obj.constructor(),
	          finished;

	      if (!pending) {
	        timeoutScheduler.schedule(function () { done(null, results); });
	        return;
	      }

	      for (var i = 0, len = keys.length; i < len; i++) {
	        run(obj[keys[i]], keys[i]);
	      }

	      function run(fn, key) {
	        if (finished) { return; }
	        try {
	          fn = toThunk(fn, ctx);

	          if (typeof fn !== fnString) {
	            results[key] = fn;
	            return --pending || done(null, results);
	          }

	          fn.call(ctx, function(err, res) {
	            if (finished) { return; }

	            if (err) {
	              finished = true;
	              return done(err);
	            }

	            results[key] = res;
	            --pending || done(null, results);
	          });
	        } catch (e) {
	          finished = true;
	          done(e);
	        }
	      }
	    }
	  }

	  function observableToThunk(observable) {
	    return function (fn) {
	      var value, hasValue = false;
	      observable.subscribe(
	        function (v) {
	          value = v;
	          hasValue = true;
	        },
	        fn,
	        function () {
	          hasValue && fn(null, value);
	        });
	    }
	  }

	  function promiseToThunk(promise) {
	    return function(fn) {
	      promise.then(function(res) {
	        fn(null, res);
	      }, fn);
	    }
	  }

	  function isObservable(obj) {
	    return obj && typeof obj.subscribe === fnString;
	  }

	  function isGeneratorFunction(obj) {
	    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction';
	  }

	  function isGenerator(obj) {
	    return obj && typeof obj.next === fnString && typeof obj[throwString] === fnString;
	  }

	  /*
	   * Spawns a generator function which allows for Promises, Observable sequences, Arrays, Objects, Generators and functions.
	   * @param {Function} The spawning function.
	   * @returns {Function} a function which has a done continuation.
	   */
	  var observableSpawn = Rx.spawn = function (fn) {
	    var isGenFun = isGeneratorFunction(fn);

	    return function (done) {
	      var ctx = this,
	        gen = fn;

	      if (isGenFun) {
	        for(var args = [], i = 0, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
	        var len = args.length,
	          hasCallback = len && typeof args[len - 1] === fnString;

	        done = hasCallback ? args.pop() : handleError;
	        gen = fn.apply(this, args);
	      } else {
	        done = done || handleError;
	      }

	      next();

	      function exit(err, res) {
	        timeoutScheduler.schedule(done.bind(ctx, err, res));
	      }

	      function next(err, res) {
	        var ret;

	        // multiple args
	        if (arguments.length > 2) {
	          for(var res = [], i = 1, len = arguments.length; i < len; i++) { res.push(arguments[i]); }
	        }

	        if (err) {
	          try {
	            ret = gen[throwString](err);
	          } catch (e) {
	            return exit(e);
	          }
	        }

	        if (!err) {
	          try {
	            ret = gen.next(res);
	          } catch (e) {
	            return exit(e);
	          }
	        }

	        if (ret.done)  {
	          return exit(null, ret.value);
	        }

	        ret.value = toThunk(ret.value, ctx);

	        if (typeof ret.value === fnString) {
	          var called = false;
	          try {
	            ret.value.call(ctx, function() {
	              if (called) {
	                return;
	              }

	              called = true;
	              next.apply(ctx, arguments);
	            });
	          } catch (e) {
	            timeoutScheduler.schedule(function () {
	              if (called) {
	                return;
	              }

	              called = true;
	              next.call(ctx, e);
	            });
	          }
	          return;
	        }

	        // Not supported
	        next(new TypeError('Rx.spawn only supports a function, Promise, Observable, Object or Array.'));
	      }
	    }
	  };

	  function handleError(err) {
	    if (!err) { return; }
	    timeoutScheduler.schedule(function() {
	      throw err;
	    });
	  }

	  /**
	   * Invokes the specified function asynchronously on the specified scheduler, surfacing the result through an observable sequence.
	   *
	   * @example
	   * var res = Rx.Observable.start(function () { console.log('hello'); });
	   * var res = Rx.Observable.start(function () { console.log('hello'); }, Rx.Scheduler.timeout);
	   * var res = Rx.Observable.start(function () { this.log('hello'); }, Rx.Scheduler.timeout, console);
	   *
	   * @param {Function} func Function to run asynchronously.
	   * @param {Scheduler} [scheduler]  Scheduler to run the function on. If not specified, defaults to Scheduler.timeout.
	   * @param [context]  The context for the func parameter to be executed.  If not specified, defaults to undefined.
	   * @returns {Observable} An observable sequence exposing the function's result value, or an exception.
	   *
	   * Remarks
	   * * The function is called immediately, not during the subscription of the resulting sequence.
	   * * Multiple subscriptions to the resulting sequence can observe the function's result.
	   */
	  Observable.start = function (func, context, scheduler) {
	    return observableToAsync(func, context, scheduler)();
	  };

	  /**
	   * Converts the function into an asynchronous function. Each invocation of the resulting asynchronous function causes an invocation of the original synchronous function on the specified scheduler.
	   * @param {Function} function Function to convert to an asynchronous function.
	   * @param {Scheduler} [scheduler] Scheduler to run the function on. If not specified, defaults to Scheduler.timeout.
	   * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
	   * @returns {Function} Asynchronous function.
	   */
	  var observableToAsync = Observable.toAsync = function (func, context, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return function () {
	      var args = arguments,
	        subject = new AsyncSubject();

	      scheduler.schedule(function () {
	        var result;
	        try {
	          result = func.apply(context, args);
	        } catch (e) {
	          subject.onError(e);
	          return;
	        }
	        subject.onNext(result);
	        subject.onCompleted();
	      });
	      return subject.asObservable();
	    };
	  };

	  /**
	   * Converts a callback function to an observable sequence.
	   *
	   * @param {Function} function Function with a callback as the last parameter to convert to an Observable sequence.
	   * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
	   * @param {Function} [selector] A selector which takes the arguments from the callback to produce a single item to yield on next.
	   * @returns {Function} A function, when executed with the required parameters minus the callback, produces an Observable sequence with a single value of the arguments to the callback as an array.
	   */
	  Observable.fromCallback = function (func, context, selector) {
	    return function () {
	      var len = arguments.length, args = new Array(len)
	      for(var i = 0; i < len; i++) { args[i] = arguments[i]; }

	      return new AnonymousObservable(function (observer) {
	        function handler() {
	          var len = arguments.length, results = new Array(len);
	          for(var i = 0; i < len; i++) { results[i] = arguments[i]; }

	          if (selector) {
	            try {
	              results = selector.apply(context, results);
	            } catch (e) {
	              return observer.onError(e);
	            }

	            observer.onNext(results);
	          } else {
	            if (results.length <= 1) {
	              observer.onNext.apply(observer, results);
	            } else {
	              observer.onNext(results);
	            }
	          }

	          observer.onCompleted();
	        }

	        args.push(handler);
	        func.apply(context, args);
	      }).publishLast().refCount();
	    };
	  };

	  /**
	   * Converts a Node.js callback style function to an observable sequence.  This must be in function (err, ...) format.
	   * @param {Function} func The function to call
	   * @param {Mixed} [context] The context for the func parameter to be executed.  If not specified, defaults to undefined.
	   * @param {Function} [selector] A selector which takes the arguments from the callback minus the error to produce a single item to yield on next.
	   * @returns {Function} An async function which when applied, returns an observable sequence with the callback arguments as an array.
	   */
	  Observable.fromNodeCallback = function (func, context, selector) {
	    return function () {
	      var len = arguments.length, args = new Array(len);
	      for(var i = 0; i < len; i++) { args[i] = arguments[i]; }

	      return new AnonymousObservable(function (observer) {
	        function handler(err) {
	          if (err) {
	            observer.onError(err);
	            return;
	          }

	          var len = arguments.length, results = [];
	          for(var i = 1; i < len; i++) { results[i - 1] = arguments[i]; }

	          if (selector) {
	            try {
	              results = selector.apply(context, results);
	            } catch (e) {
	              return observer.onError(e);
	            }
	            observer.onNext(results);
	          } else {
	            if (results.length <= 1) {
	              observer.onNext.apply(observer, results);
	            } else {
	              observer.onNext(results);
	            }
	          }

	          observer.onCompleted();
	        }

	        args.push(handler);
	        func.apply(context, args);
	      }).publishLast().refCount();
	    };
	  };

	  function createListener (element, name, handler) {
	    if (element.addEventListener) {
	      element.addEventListener(name, handler, false);
	      return disposableCreate(function () {
	        element.removeEventListener(name, handler, false);
	      });
	    }
	    throw new Error('No listener found');
	  }

	  function createEventListener (el, eventName, handler) {
	    var disposables = new CompositeDisposable();

	    // Asume NodeList
	    if (Object.prototype.toString.call(el) === '[object NodeList]') {
	      for (var i = 0, len = el.length; i < len; i++) {
	        disposables.add(createEventListener(el.item(i), eventName, handler));
	      }
	    } else if (el) {
	      disposables.add(createListener(el, eventName, handler));
	    }

	    return disposables;
	  }

	  /**
	   * Configuration option to determine whether to use native events only
	   */
	  Rx.config.useNativeEvents = false;

	  /**
	   * Creates an observable sequence by adding an event listener to the matching DOMElement or each item in the NodeList.
	   *
	   * @example
	   *   var source = Rx.Observable.fromEvent(element, 'mouseup');
	   *
	   * @param {Object} element The DOMElement or NodeList to attach a listener.
	   * @param {String} eventName The event name to attach the observable sequence.
	   * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
	   * @returns {Observable} An observable sequence of events from the specified element and the specified event.
	   */
	  Observable.fromEvent = function (element, eventName, selector) {
	    // Node.js specific
	    if (element.addListener) {
	      return fromEventPattern(
	        function (h) { element.addListener(eventName, h); },
	        function (h) { element.removeListener(eventName, h); },
	        selector);
	    }

	    // Use only if non-native events are allowed
	    if (!Rx.config.useNativeEvents) {
	      // Handles jq, Angular.js, Zepto, Marionette, Ember.js
	      if (typeof element.on === 'function' && typeof element.off === 'function') {
	        return fromEventPattern(
	          function (h) { element.on(eventName, h); },
	          function (h) { element.off(eventName, h); },
	          selector);
	      }
	    }
	    return new AnonymousObservable(function (observer) {
	      return createEventListener(
	        element,
	        eventName,
	        function handler (e) {
	          var results = e;

	          if (selector) {
	            try {
	              results = selector(arguments);
	            } catch (err) {
	              return observer.onError(err);
	            }
	          }

	          observer.onNext(results);
	        });
	    }).publish().refCount();
	  };

	  /**
	   * Creates an observable sequence from an event emitter via an addHandler/removeHandler pair.
	   * @param {Function} addHandler The function to add a handler to the emitter.
	   * @param {Function} [removeHandler] The optional function to remove a handler from an emitter.
	   * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
	   * @returns {Observable} An observable sequence which wraps an event from an event emitter
	   */
	  var fromEventPattern = Observable.fromEventPattern = function (addHandler, removeHandler, selector) {
	    return new AnonymousObservable(function (observer) {
	      function innerHandler (e) {
	        var result = e;
	        if (selector) {
	          try {
	            result = selector(arguments);
	          } catch (err) {
	            return observer.onError(err);
	          }
	        }
	        observer.onNext(result);
	      }

	      var returnValue = addHandler(innerHandler);
	      return disposableCreate(function () {
	        if (removeHandler) {
	          removeHandler(innerHandler, returnValue);
	        }
	      });
	    }).publish().refCount();
	  };

	  /**
	   * Invokes the asynchronous function, surfacing the result through an observable sequence.
	   * @param {Function} functionAsync Asynchronous function which returns a Promise to run.
	   * @returns {Observable} An observable sequence exposing the function's result value, or an exception.
	   */
	  Observable.startAsync = function (functionAsync) {
	    var promise;
	    try {
	      promise = functionAsync();
	    } catch (e) {
	      return observableThrow(e);
	    }
	    return observableFromPromise(promise);
	  }

	  var PausableObservable = (function (__super__) {

	    inherits(PausableObservable, __super__);

	    function subscribe(observer) {
	      var conn = this.source.publish(),
	        subscription = conn.subscribe(observer),
	        connection = disposableEmpty;

	      var pausable = this.pauser.distinctUntilChanged().subscribe(function (b) {
	        if (b) {
	          connection = conn.connect();
	        } else {
	          connection.dispose();
	          connection = disposableEmpty;
	        }
	      });

	      return new CompositeDisposable(subscription, connection, pausable);
	    }

	    function PausableObservable(source, pauser) {
	      this.source = source;
	      this.controller = new Subject();

	      if (pauser && pauser.subscribe) {
	        this.pauser = this.controller.merge(pauser);
	      } else {
	        this.pauser = this.controller;
	      }

	      __super__.call(this, subscribe, source);
	    }

	    PausableObservable.prototype.pause = function () {
	      this.controller.onNext(false);
	    };

	    PausableObservable.prototype.resume = function () {
	      this.controller.onNext(true);
	    };

	    return PausableObservable;

	  }(Observable));

	  /**
	   * Pauses the underlying observable sequence based upon the observable sequence which yields true/false.
	   * @example
	   * var pauser = new Rx.Subject();
	   * var source = Rx.Observable.interval(100).pausable(pauser);
	   * @param {Observable} pauser The observable sequence used to pause the underlying sequence.
	   * @returns {Observable} The observable sequence which is paused based upon the pauser.
	   */
	  observableProto.pausable = function (pauser) {
	    return new PausableObservable(this, pauser);
	  };

	  function combineLatestSource(source, subject, resultSelector) {
	    return new AnonymousObservable(function (o) {
	      var hasValue = [false, false],
	        hasValueAll = false,
	        isDone = false,
	        values = new Array(2),
	        err;

	      function next(x, i) {
	        values[i] = x
	        var res;
	        hasValue[i] = true;
	        if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
	          if (err) {
	            o.onError(err);
	            return;
	          }

	          try {
	            res = resultSelector.apply(null, values);
	          } catch (ex) {
	            o.onError(ex);
	            return;
	          }
	          o.onNext(res);
	        }
	        if (isDone && values[1]) {
	          o.onCompleted();
	        }
	      }

	      return new CompositeDisposable(
	        source.subscribe(
	          function (x) {
	            next(x, 0);
	          },
	          function (e) {
	            if (values[1]) {
	              o.onError(e);
	            } else {
	              err = e;
	            }
	          },
	          function () {
	            isDone = true;
	            values[1] && o.onCompleted();
	          }),
	        subject.subscribe(
	          function (x) {
	            next(x, 1);
	          },
	          function (e) { o.onError(e); },
	          function () {
	            isDone = true;
	            next(true, 1);
	          })
	        );
	    }, source);
	  }

	  var PausableBufferedObservable = (function (__super__) {

	    inherits(PausableBufferedObservable, __super__);

	    function subscribe(o) {
	      var q = [], previousShouldFire;

	      var subscription =
	        combineLatestSource(
	          this.source,
	          this.pauser.distinctUntilChanged().startWith(false),
	          function (data, shouldFire) {
	            return { data: data, shouldFire: shouldFire };
	          })
	          .subscribe(
	            function (results) {
	              if (previousShouldFire !== undefined && results.shouldFire != previousShouldFire) {
	                previousShouldFire = results.shouldFire;
	                // change in shouldFire
	                if (results.shouldFire) {
	                  while (q.length > 0) {
	                    o.onNext(q.shift());
	                  }
	                }
	              } else {
	                previousShouldFire = results.shouldFire;
	                // new data
	                if (results.shouldFire) {
	                  o.onNext(results.data);
	                } else {
	                  q.push(results.data);
	                }
	              }
	            },
	            function (err) {
	              // Empty buffer before sending error
	              while (q.length > 0) {
	                o.onNext(q.shift());
	              }
	              o.onError(err);
	            },
	            function () {
	              // Empty buffer before sending completion
	              while (q.length > 0) {
	                o.onNext(q.shift());
	              }
	              o.onCompleted();
	            }
	          );
	      return subscription;
	    }

	    function PausableBufferedObservable(source, pauser) {
	      this.source = source;
	      this.controller = new Subject();

	      if (pauser && pauser.subscribe) {
	        this.pauser = this.controller.merge(pauser);
	      } else {
	        this.pauser = this.controller;
	      }

	      __super__.call(this, subscribe, source);
	    }

	    PausableBufferedObservable.prototype.pause = function () {
	      this.controller.onNext(false);
	    };

	    PausableBufferedObservable.prototype.resume = function () {
	      this.controller.onNext(true);
	    };

	    return PausableBufferedObservable;

	  }(Observable));

	  /**
	   * Pauses the underlying observable sequence based upon the observable sequence which yields true/false,
	   * and yields the values that were buffered while paused.
	   * @example
	   * var pauser = new Rx.Subject();
	   * var source = Rx.Observable.interval(100).pausableBuffered(pauser);
	   * @param {Observable} pauser The observable sequence used to pause the underlying sequence.
	   * @returns {Observable} The observable sequence which is paused based upon the pauser.
	   */
	  observableProto.pausableBuffered = function (subject) {
	    return new PausableBufferedObservable(this, subject);
	  };

	  var ControlledObservable = (function (__super__) {

	    inherits(ControlledObservable, __super__);

	    function subscribe (observer) {
	      return this.source.subscribe(observer);
	    }

	    function ControlledObservable (source, enableQueue) {
	      __super__.call(this, subscribe, source);
	      this.subject = new ControlledSubject(enableQueue);
	      this.source = source.multicast(this.subject).refCount();
	    }

	    ControlledObservable.prototype.request = function (numberOfItems) {
	      if (numberOfItems == null) { numberOfItems = -1; }
	      return this.subject.request(numberOfItems);
	    };

	    return ControlledObservable;

	  }(Observable));

	  var ControlledSubject = (function (__super__) {

	    function subscribe (observer) {
	      return this.subject.subscribe(observer);
	    }

	    inherits(ControlledSubject, __super__);

	    function ControlledSubject(enableQueue) {
	      enableQueue == null && (enableQueue = true);

	      __super__.call(this, subscribe);
	      this.subject = new Subject();
	      this.enableQueue = enableQueue;
	      this.queue = enableQueue ? [] : null;
	      this.requestedCount = 0;
	      this.requestedDisposable = disposableEmpty;
	      this.error = null;
	      this.hasFailed = false;
	      this.hasCompleted = false;
	    }

	    addProperties(ControlledSubject.prototype, Observer, {
	      onCompleted: function () {
	        this.hasCompleted = true;
	        if (!this.enableQueue || this.queue.length === 0)
	          this.subject.onCompleted();
	        else
	          this.queue.push(Rx.Notification.createOnCompleted());
	      },
	      onError: function (error) {
	        this.hasFailed = true;
	        this.error = error;
	        if (!this.enableQueue || this.queue.length === 0)
	          this.subject.onError(error);
	        else
	          this.queue.push(Rx.Notification.createOnError(error));
	      },
	      onNext: function (value) {
	        var hasRequested = false;

	        if (this.requestedCount === 0) {
	          this.enableQueue && this.queue.push(Rx.Notification.createOnNext(value));
	        } else {
	          (this.requestedCount !== -1 && this.requestedCount-- === 0) && this.disposeCurrentRequest();
	          hasRequested = true;
	        }
	        hasRequested && this.subject.onNext(value);
	      },
	      _processRequest: function (numberOfItems) {
	        if (this.enableQueue) {
	          while ((this.queue.length >= numberOfItems && numberOfItems > 0) ||
	          (this.queue.length > 0 && this.queue[0].kind !== 'N')) {
	            var first = this.queue.shift();
	            first.accept(this.subject);
	            if (first.kind === 'N') numberOfItems--;
	            else { this.disposeCurrentRequest(); this.queue = []; }
	          }

	          return { numberOfItems : numberOfItems, returnValue: this.queue.length !== 0};
	        }

	        //TODO I don't think this is ever necessary, since termination of a sequence without a queue occurs in the onCompletion or onError function
	        //if (this.hasFailed) {
	        //  this.subject.onError(this.error);
	        //} else if (this.hasCompleted) {
	        //  this.subject.onCompleted();
	        //}

	        return { numberOfItems: numberOfItems, returnValue: false };
	      },
	      request: function (number) {
	        this.disposeCurrentRequest();
	        var self = this, r = this._processRequest(number);

	        var number = r.numberOfItems;
	        if (!r.returnValue) {
	          this.requestedCount = number;
	          this.requestedDisposable = disposableCreate(function () {
	            self.requestedCount = 0;
	          });

	          return this.requestedDisposable;
	        } else {
	          return disposableEmpty;
	        }
	      },
	      disposeCurrentRequest: function () {
	        this.requestedDisposable.dispose();
	        this.requestedDisposable = disposableEmpty;
	      }
	    });

	    return ControlledSubject;
	  }(Observable));

	  /**
	   * Attaches a controller to the observable sequence with the ability to queue.
	   * @example
	   * var source = Rx.Observable.interval(100).controlled();
	   * source.request(3); // Reads 3 values
	   * @param {Observable} pauser The observable sequence used to pause the underlying sequence.
	   * @returns {Observable} The observable sequence which is paused based upon the pauser.
	   */
	  observableProto.controlled = function (enableQueue) {
	    if (enableQueue == null) {  enableQueue = true; }
	    return new ControlledObservable(this, enableQueue);
	  };

	  var StopAndWaitObservable = (function (__super__) {

	    function subscribe (observer) {
	      this.subscription = this.source.subscribe(new StopAndWaitObserver(observer, this, this.subscription));

	      var self = this;
	      timeoutScheduler.schedule(function () { self.source.request(1); });

	      return this.subscription;
	    }

	    inherits(StopAndWaitObservable, __super__);

	    function StopAndWaitObservable (source) {
	      __super__.call(this, subscribe, source);
	      this.source = source;
	    }

	    var StopAndWaitObserver = (function (__sub__) {

	      inherits(StopAndWaitObserver, __sub__);

	      function StopAndWaitObserver (observer, observable, cancel) {
	        __sub__.call(this);
	        this.observer = observer;
	        this.observable = observable;
	        this.cancel = cancel;
	      }

	      var stopAndWaitObserverProto = StopAndWaitObserver.prototype;

	      stopAndWaitObserverProto.completed = function () {
	        this.observer.onCompleted();
	        this.dispose();
	      };

	      stopAndWaitObserverProto.error = function (error) {
	        this.observer.onError(error);
	        this.dispose();
	      }

	      stopAndWaitObserverProto.next = function (value) {
	        this.observer.onNext(value);

	        var self = this;
	        timeoutScheduler.schedule(function () {
	          self.observable.source.request(1);
	        });
	      };

	      stopAndWaitObserverProto.dispose = function () {
	        this.observer = null;
	        if (this.cancel) {
	          this.cancel.dispose();
	          this.cancel = null;
	        }
	        __sub__.prototype.dispose.call(this);
	      };

	      return StopAndWaitObserver;
	    }(AbstractObserver));

	    return StopAndWaitObservable;
	  }(Observable));


	  /**
	   * Attaches a stop and wait observable to the current observable.
	   * @returns {Observable} A stop and wait observable.
	   */
	  ControlledObservable.prototype.stopAndWait = function () {
	    return new StopAndWaitObservable(this);
	  };

	  var WindowedObservable = (function (__super__) {

	    function subscribe (observer) {
	      this.subscription = this.source.subscribe(new WindowedObserver(observer, this, this.subscription));

	      var self = this;
	      timeoutScheduler.schedule(function () {
	        self.source.request(self.windowSize);
	      });

	      return this.subscription;
	    }

	    inherits(WindowedObservable, __super__);

	    function WindowedObservable(source, windowSize) {
	      __super__.call(this, subscribe, source);
	      this.source = source;
	      this.windowSize = windowSize;
	    }

	    var WindowedObserver = (function (__sub__) {

	      inherits(WindowedObserver, __sub__);

	      function WindowedObserver(observer, observable, cancel) {
	        this.observer = observer;
	        this.observable = observable;
	        this.cancel = cancel;
	        this.received = 0;
	      }

	      var windowedObserverPrototype = WindowedObserver.prototype;

	      windowedObserverPrototype.completed = function () {
	        this.observer.onCompleted();
	        this.dispose();
	      };

	      windowedObserverPrototype.error = function (error) {
	        this.observer.onError(error);
	        this.dispose();
	      };

	      windowedObserverPrototype.next = function (value) {
	        this.observer.onNext(value);

	        this.received = ++this.received % this.observable.windowSize;
	        if (this.received === 0) {
	          var self = this;
	          timeoutScheduler.schedule(function () {
	            self.observable.source.request(self.observable.windowSize);
	          });
	        }
	      };

	      windowedObserverPrototype.dispose = function () {
	        this.observer = null;
	        if (this.cancel) {
	          this.cancel.dispose();
	          this.cancel = null;
	        }
	        __sub__.prototype.dispose.call(this);
	      };

	      return WindowedObserver;
	    }(AbstractObserver));

	    return WindowedObservable;
	  }(Observable));

	  /**
	   * Creates a sliding windowed observable based upon the window size.
	   * @param {Number} windowSize The number of items in the window
	   * @returns {Observable} A windowed observable based upon the window size.
	   */
	  ControlledObservable.prototype.windowed = function (windowSize) {
	    return new WindowedObservable(this, windowSize);
	  };

	  /**
	   * Pipes the existing Observable sequence into a Node.js Stream.
	   * @param {Stream} dest The destination Node.js stream.
	   * @returns {Stream} The destination stream.
	   */
	  observableProto.pipe = function (dest) {
	    var source = this.pausableBuffered();

	    function onDrain() {
	      source.resume();
	    }

	    dest.addListener('drain', onDrain);

	    source.subscribe(
	      function (x) {
	        !dest.write(String(x)) && source.pause();
	      },
	      function (err) {
	        dest.emit('error', err);
	      },
	      function () {
	        // Hack check because STDIO is not closable
	        !dest._isStdio && dest.end();
	        dest.removeListener('drain', onDrain);
	      });

	    source.resume();

	    return dest;
	  };

	  /**
	   * Multicasts the source sequence notifications through an instantiated subject into all uses of the sequence within a selector function. Each
	   * subscription to the resulting sequence causes a separate multicast invocation, exposing the sequence resulting from the selector function's
	   * invocation. For specializations with fixed subject types, see Publish, PublishLast, and Replay.
	   *
	   * @example
	   * 1 - res = source.multicast(observable);
	   * 2 - res = source.multicast(function () { return new Subject(); }, function (x) { return x; });
	   *
	   * @param {Function|Subject} subjectOrSubjectSelector
	   * Factory function to create an intermediate subject through which the source sequence's elements will be multicast to the selector function.
	   * Or:
	   * Subject to push source elements into.
	   *
	   * @param {Function} [selector] Optional selector function which can use the multicasted source sequence subject to the policies enforced by the created subject. Specified only if <paramref name="subjectOrSubjectSelector" is a factory function.
	   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
	   */
	  observableProto.multicast = function (subjectOrSubjectSelector, selector) {
	    var source = this;
	    return typeof subjectOrSubjectSelector === 'function' ?
	      new AnonymousObservable(function (observer) {
	        var connectable = source.multicast(subjectOrSubjectSelector());
	        return new CompositeDisposable(selector(connectable).subscribe(observer), connectable.connect());
	      }, source) :
	      new ConnectableObservable(source, subjectOrSubjectSelector);
	  };

	  /**
	   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence.
	   * This operator is a specialization of Multicast using a regular Subject.
	   *
	   * @example
	   * var resres = source.publish();
	   * var res = source.publish(function (x) { return x; });
	   *
	   * @param {Function} [selector] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
	   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
	   */
	  observableProto.publish = function (selector) {
	    return selector && isFunction(selector) ?
	      this.multicast(function () { return new Subject(); }, selector) :
	      this.multicast(new Subject());
	  };

	  /**
	   * Returns an observable sequence that shares a single subscription to the underlying sequence.
	   * This operator is a specialization of publish which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
	   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
	   */
	  observableProto.share = function () {
	    return this.publish().refCount();
	  };

	  /**
	   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence containing only the last notification.
	   * This operator is a specialization of Multicast using a AsyncSubject.
	   *
	   * @example
	   * var res = source.publishLast();
	   * var res = source.publishLast(function (x) { return x; });
	   *
	   * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will only receive the last notification of the source.
	   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
	   */
	  observableProto.publishLast = function (selector) {
	    return selector && isFunction(selector) ?
	      this.multicast(function () { return new AsyncSubject(); }, selector) :
	      this.multicast(new AsyncSubject());
	  };

	  /**
	   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence and starts with initialValue.
	   * This operator is a specialization of Multicast using a BehaviorSubject.
	   *
	   * @example
	   * var res = source.publishValue(42);
	   * var res = source.publishValue(function (x) { return x.select(function (y) { return y * y; }) }, 42);
	   *
	   * @param {Function} [selector] Optional selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive immediately receive the initial value, followed by all notifications of the source from the time of the subscription on.
	   * @param {Mixed} initialValue Initial value received by observers upon subscription.
	   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
	   */
	  observableProto.publishValue = function (initialValueOrSelector, initialValue) {
	    return arguments.length === 2 ?
	      this.multicast(function () {
	        return new BehaviorSubject(initialValue);
	      }, initialValueOrSelector) :
	      this.multicast(new BehaviorSubject(initialValueOrSelector));
	  };

	  /**
	   * Returns an observable sequence that shares a single subscription to the underlying sequence and starts with an initialValue.
	   * This operator is a specialization of publishValue which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
	   * @param {Mixed} initialValue Initial value received by observers upon subscription.
	   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
	   */
	  observableProto.shareValue = function (initialValue) {
	    return this.publishValue(initialValue).refCount();
	  };

	  /**
	   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
	   * This operator is a specialization of Multicast using a ReplaySubject.
	   *
	   * @example
	   * var res = source.replay(null, 3);
	   * var res = source.replay(null, 3, 500);
	   * var res = source.replay(null, 3, 500, scheduler);
	   * var res = source.replay(function (x) { return x.take(6).repeat(); }, 3, 500, scheduler);
	   *
	   * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all the notifications of the source subject to the specified replay buffer trimming policy.
	   * @param bufferSize [Optional] Maximum element count of the replay buffer.
	   * @param windowSize [Optional] Maximum time length of the replay buffer.
	   * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
	   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
	   */
	  observableProto.replay = function (selector, bufferSize, windowSize, scheduler) {
	    return selector && isFunction(selector) ?
	      this.multicast(function () { return new ReplaySubject(bufferSize, windowSize, scheduler); }, selector) :
	      this.multicast(new ReplaySubject(bufferSize, windowSize, scheduler));
	  };

	  /**
	   * Returns an observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
	   * This operator is a specialization of replay which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
	   *
	   * @example
	   * var res = source.shareReplay(3);
	   * var res = source.shareReplay(3, 500);
	   * var res = source.shareReplay(3, 500, scheduler);
	   *

	   * @param bufferSize [Optional] Maximum element count of the replay buffer.
	   * @param window [Optional] Maximum time length of the replay buffer.
	   * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
	   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
	   */
	  observableProto.shareReplay = function (bufferSize, windowSize, scheduler) {
	    return this.replay(null, bufferSize, windowSize, scheduler).refCount();
	  };

	  var InnerSubscription = function (subject, observer) {
	    this.subject = subject;
	    this.observer = observer;
	  };

	  InnerSubscription.prototype.dispose = function () {
	    if (!this.subject.isDisposed && this.observer !== null) {
	      var idx = this.subject.observers.indexOf(this.observer);
	      this.subject.observers.splice(idx, 1);
	      this.observer = null;
	    }
	  };

	  /**
	   *  Represents a value that changes over time.
	   *  Observers can subscribe to the subject to receive the last (or initial) value and all subsequent notifications.
	   */
	  var BehaviorSubject = Rx.BehaviorSubject = (function (__super__) {
	    function subscribe(observer) {
	      checkDisposed(this);
	      if (!this.isStopped) {
	        this.observers.push(observer);
	        observer.onNext(this.value);
	        return new InnerSubscription(this, observer);
	      }
	      if (this.hasError) {
	        observer.onError(this.error);
	      } else {
	        observer.onCompleted();
	      }
	      return disposableEmpty;
	    }

	    inherits(BehaviorSubject, __super__);

	    /**
	     *  Initializes a new instance of the BehaviorSubject class which creates a subject that caches its last value and starts with the specified value.
	     *  @param {Mixed} value Initial value sent to observers when no other value has been received by the subject yet.
	     */
	    function BehaviorSubject(value) {
	      __super__.call(this, subscribe);
	      this.value = value,
	      this.observers = [],
	      this.isDisposed = false,
	      this.isStopped = false,
	      this.hasError = false;
	    }

	    addProperties(BehaviorSubject.prototype, Observer, {
	      /**
	       * Gets the current value or throws an exception.
	       * Value is frozen after onCompleted is called.
	       * After onError is called always throws the specified exception.
	       * An exception is always thrown after dispose is called.
	       * @returns {Mixed} The initial value passed to the constructor until onNext is called; after which, the last value passed to onNext.
	       */
	      getValue: function () {
	          checkDisposed(this);
	          if (this.hasError) {
	              throw this.error;
	          }
	          return this.value;
	      },
	      /**
	       * Indicates whether the subject has observers subscribed to it.
	       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
	       */
	      hasObservers: function () { return this.observers.length > 0; },
	      /**
	       * Notifies all subscribed observers about the end of the sequence.
	       */
	      onCompleted: function () {
	        checkDisposed(this);
	        if (this.isStopped) { return; }
	        this.isStopped = true;
	        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	          os[i].onCompleted();
	        }

	        this.observers.length = 0;
	      },
	      /**
	       * Notifies all subscribed observers about the exception.
	       * @param {Mixed} error The exception to send to all observers.
	       */
	      onError: function (error) {
	        checkDisposed(this);
	        if (this.isStopped) { return; }
	        this.isStopped = true;
	        this.hasError = true;
	        this.error = error;

	        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	          os[i].onError(error);
	        }

	        this.observers.length = 0;
	      },
	      /**
	       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
	       * @param {Mixed} value The value to send to all observers.
	       */
	      onNext: function (value) {
	        checkDisposed(this);
	        if (this.isStopped) { return; }
	        this.value = value;
	        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	          os[i].onNext(value);
	        }
	      },
	      /**
	       * Unsubscribe all observers and release resources.
	       */
	      dispose: function () {
	        this.isDisposed = true;
	        this.observers = null;
	        this.value = null;
	        this.exception = null;
	      }
	    });

	    return BehaviorSubject;
	  }(Observable));

	  /**
	   * Represents an object that is both an observable sequence as well as an observer.
	   * Each notification is broadcasted to all subscribed and future observers, subject to buffer trimming policies.
	   */
	  var ReplaySubject = Rx.ReplaySubject = (function (__super__) {

	    var maxSafeInteger = Math.pow(2, 53) - 1;

	    function createRemovableDisposable(subject, observer) {
	      return disposableCreate(function () {
	        observer.dispose();
	        !subject.isDisposed && subject.observers.splice(subject.observers.indexOf(observer), 1);
	      });
	    }

	    function subscribe(observer) {
	      var so = new ScheduledObserver(this.scheduler, observer),
	        subscription = createRemovableDisposable(this, so);
	      checkDisposed(this);
	      this._trim(this.scheduler.now());
	      this.observers.push(so);

	      for (var i = 0, len = this.q.length; i < len; i++) {
	        so.onNext(this.q[i].value);
	      }

	      if (this.hasError) {
	        so.onError(this.error);
	      } else if (this.isStopped) {
	        so.onCompleted();
	      }

	      so.ensureActive();
	      return subscription;
	    }

	    inherits(ReplaySubject, __super__);

	    /**
	     *  Initializes a new instance of the ReplaySubject class with the specified buffer size, window size and scheduler.
	     *  @param {Number} [bufferSize] Maximum element count of the replay buffer.
	     *  @param {Number} [windowSize] Maximum time length of the replay buffer.
	     *  @param {Scheduler} [scheduler] Scheduler the observers are invoked on.
	     */
	    function ReplaySubject(bufferSize, windowSize, scheduler) {
	      this.bufferSize = bufferSize == null ? maxSafeInteger : bufferSize;
	      this.windowSize = windowSize == null ? maxSafeInteger : windowSize;
	      this.scheduler = scheduler || currentThreadScheduler;
	      this.q = [];
	      this.observers = [];
	      this.isStopped = false;
	      this.isDisposed = false;
	      this.hasError = false;
	      this.error = null;
	      __super__.call(this, subscribe);
	    }

	    addProperties(ReplaySubject.prototype, Observer.prototype, {
	      /**
	       * Indicates whether the subject has observers subscribed to it.
	       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
	       */
	      hasObservers: function () {
	        return this.observers.length > 0;
	      },
	      _trim: function (now) {
	        while (this.q.length > this.bufferSize) {
	          this.q.shift();
	        }
	        while (this.q.length > 0 && (now - this.q[0].interval) > this.windowSize) {
	          this.q.shift();
	        }
	      },
	      /**
	       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
	       * @param {Mixed} value The value to send to all observers.
	       */
	      onNext: function (value) {
	        checkDisposed(this);
	        if (this.isStopped) { return; }
	        var now = this.scheduler.now();
	        this.q.push({ interval: now, value: value });
	        this._trim(now);

	        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	          var observer = os[i];
	          observer.onNext(value);
	          observer.ensureActive();
	        }
	      },
	      /**
	       * Notifies all subscribed observers about the exception.
	       * @param {Mixed} error The exception to send to all observers.
	       */
	      onError: function (error) {
	        checkDisposed(this);
	        if (this.isStopped) { return; }
	        this.isStopped = true;
	        this.error = error;
	        this.hasError = true;
	        var now = this.scheduler.now();
	        this._trim(now);
	        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	          var observer = os[i];
	          observer.onError(error);
	          observer.ensureActive();
	        }
	        this.observers.length = 0;
	      },
	      /**
	       * Notifies all subscribed observers about the end of the sequence.
	       */
	      onCompleted: function () {
	        checkDisposed(this);
	        if (this.isStopped) { return; }
	        this.isStopped = true;
	        var now = this.scheduler.now();
	        this._trim(now);
	        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	          var observer = os[i];
	          observer.onCompleted();
	          observer.ensureActive();
	        }
	        this.observers.length = 0;
	      },
	      /**
	       * Unsubscribe all observers and release resources.
	       */
	      dispose: function () {
	        this.isDisposed = true;
	        this.observers = null;
	      }
	    });

	    return ReplaySubject;
	  }(Observable));

	  var ConnectableObservable = Rx.ConnectableObservable = (function (__super__) {
	    inherits(ConnectableObservable, __super__);

	    function ConnectableObservable(source, subject) {
	      var hasSubscription = false,
	        subscription,
	        sourceObservable = source.asObservable();

	      this.connect = function () {
	        if (!hasSubscription) {
	          hasSubscription = true;
	          subscription = new CompositeDisposable(sourceObservable.subscribe(subject), disposableCreate(function () {
	            hasSubscription = false;
	          }));
	        }
	        return subscription;
	      };

	      __super__.call(this, function (o) { return subject.subscribe(o); });
	    }

	    ConnectableObservable.prototype.refCount = function () {
	      var connectableSubscription, count = 0, source = this;
	      return new AnonymousObservable(function (observer) {
	          var shouldConnect = ++count === 1,
	            subscription = source.subscribe(observer);
	          shouldConnect && (connectableSubscription = source.connect());
	          return function () {
	            subscription.dispose();
	            --count === 0 && connectableSubscription.dispose();
	          };
	      });
	    };

	    return ConnectableObservable;
	  }(Observable));

	  var Dictionary = (function () {

	    var primes = [1, 3, 7, 13, 31, 61, 127, 251, 509, 1021, 2039, 4093, 8191, 16381, 32749, 65521, 131071, 262139, 524287, 1048573, 2097143, 4194301, 8388593, 16777213, 33554393, 67108859, 134217689, 268435399, 536870909, 1073741789, 2147483647],
	      noSuchkey = "no such key",
	      duplicatekey = "duplicate key";

	    function isPrime(candidate) {
	      if ((candidate & 1) === 0) { return candidate === 2; }
	      var num1 = Math.sqrt(candidate),
	        num2 = 3;
	      while (num2 <= num1) {
	        if (candidate % num2 === 0) { return false; }
	        num2 += 2;
	      }
	      return true;
	    }

	    function getPrime(min) {
	      var index, num, candidate;
	      for (index = 0; index < primes.length; ++index) {
	        num = primes[index];
	        if (num >= min) { return num; }
	      }
	      candidate = min | 1;
	      while (candidate < primes[primes.length - 1]) {
	        if (isPrime(candidate)) { return candidate; }
	        candidate += 2;
	      }
	      return min;
	    }

	    function stringHashFn(str) {
	      var hash = 757602046;
	      if (!str.length) { return hash; }
	      for (var i = 0, len = str.length; i < len; i++) {
	        var character = str.charCodeAt(i);
	        hash = ((hash << 5) - hash) + character;
	        hash = hash & hash;
	      }
	      return hash;
	    }

	    function numberHashFn(key) {
	      var c2 = 0x27d4eb2d;
	      key = (key ^ 61) ^ (key >>> 16);
	      key = key + (key << 3);
	      key = key ^ (key >>> 4);
	      key = key * c2;
	      key = key ^ (key >>> 15);
	      return key;
	    }

	    var getHashCode = (function () {
	      var uniqueIdCounter = 0;

	      return function (obj) {
	        if (obj == null) { throw new Error(noSuchkey); }

	        // Check for built-ins before tacking on our own for any object
	        if (typeof obj === 'string') { return stringHashFn(obj); }
	        if (typeof obj === 'number') { return numberHashFn(obj); }
	        if (typeof obj === 'boolean') { return obj === true ? 1 : 0; }
	        if (obj instanceof Date) { return numberHashFn(obj.valueOf()); }
	        if (obj instanceof RegExp) { return stringHashFn(obj.toString()); }
	        if (typeof obj.valueOf === 'function') {
	          // Hack check for valueOf
	          var valueOf = obj.valueOf();
	          if (typeof valueOf === 'number') { return numberHashFn(valueOf); }
	          if (typeof valueOf === 'string') { return stringHashFn(valueOf); }
	        }
	        if (obj.hashCode) { return obj.hashCode(); }

	        var id = 17 * uniqueIdCounter++;
	        obj.hashCode = function () { return id; };
	        return id;
	      };
	    }());

	    function newEntry() {
	      return { key: null, value: null, next: 0, hashCode: 0 };
	    }

	    function Dictionary(capacity, comparer) {
	      if (capacity < 0) { throw new ArgumentOutOfRangeError(); }
	      if (capacity > 0) { this._initialize(capacity); }

	      this.comparer = comparer || defaultComparer;
	      this.freeCount = 0;
	      this.size = 0;
	      this.freeList = -1;
	    }

	    var dictionaryProto = Dictionary.prototype;

	    dictionaryProto._initialize = function (capacity) {
	      var prime = getPrime(capacity), i;
	      this.buckets = new Array(prime);
	      this.entries = new Array(prime);
	      for (i = 0; i < prime; i++) {
	        this.buckets[i] = -1;
	        this.entries[i] = newEntry();
	      }
	      this.freeList = -1;
	    };

	    dictionaryProto.add = function (key, value) {
	      this._insert(key, value, true);
	    };

	    dictionaryProto._insert = function (key, value, add) {
	      if (!this.buckets) { this._initialize(0); }
	      var index3,
	        num = getHashCode(key) & 2147483647,
	        index1 = num % this.buckets.length;
	      for (var index2 = this.buckets[index1]; index2 >= 0; index2 = this.entries[index2].next) {
	        if (this.entries[index2].hashCode === num && this.comparer(this.entries[index2].key, key)) {
	          if (add) { throw new Error(duplicatekey); }
	          this.entries[index2].value = value;
	          return;
	        }
	      }
	      if (this.freeCount > 0) {
	        index3 = this.freeList;
	        this.freeList = this.entries[index3].next;
	        --this.freeCount;
	      } else {
	        if (this.size === this.entries.length) {
	          this._resize();
	          index1 = num % this.buckets.length;
	        }
	        index3 = this.size;
	        ++this.size;
	      }
	      this.entries[index3].hashCode = num;
	      this.entries[index3].next = this.buckets[index1];
	      this.entries[index3].key = key;
	      this.entries[index3].value = value;
	      this.buckets[index1] = index3;
	    };

	    dictionaryProto._resize = function () {
	      var prime = getPrime(this.size * 2),
	        numArray = new Array(prime);
	      for (index = 0; index < numArray.length; ++index) {  numArray[index] = -1; }
	      var entryArray = new Array(prime);
	      for (index = 0; index < this.size; ++index) { entryArray[index] = this.entries[index]; }
	      for (var index = this.size; index < prime; ++index) { entryArray[index] = newEntry(); }
	      for (var index1 = 0; index1 < this.size; ++index1) {
	        var index2 = entryArray[index1].hashCode % prime;
	        entryArray[index1].next = numArray[index2];
	        numArray[index2] = index1;
	      }
	      this.buckets = numArray;
	      this.entries = entryArray;
	    };

	    dictionaryProto.remove = function (key) {
	      if (this.buckets) {
	        var num = getHashCode(key) & 2147483647,
	          index1 = num % this.buckets.length,
	          index2 = -1;
	        for (var index3 = this.buckets[index1]; index3 >= 0; index3 = this.entries[index3].next) {
	          if (this.entries[index3].hashCode === num && this.comparer(this.entries[index3].key, key)) {
	            if (index2 < 0) {
	              this.buckets[index1] = this.entries[index3].next;
	            } else {
	              this.entries[index2].next = this.entries[index3].next;
	            }
	            this.entries[index3].hashCode = -1;
	            this.entries[index3].next = this.freeList;
	            this.entries[index3].key = null;
	            this.entries[index3].value = null;
	            this.freeList = index3;
	            ++this.freeCount;
	            return true;
	          } else {
	            index2 = index3;
	          }
	        }
	      }
	      return false;
	    };

	    dictionaryProto.clear = function () {
	      var index, len;
	      if (this.size <= 0) { return; }
	      for (index = 0, len = this.buckets.length; index < len; ++index) {
	        this.buckets[index] = -1;
	      }
	      for (index = 0; index < this.size; ++index) {
	        this.entries[index] = newEntry();
	      }
	      this.freeList = -1;
	      this.size = 0;
	    };

	    dictionaryProto._findEntry = function (key) {
	      if (this.buckets) {
	        var num = getHashCode(key) & 2147483647;
	        for (var index = this.buckets[num % this.buckets.length]; index >= 0; index = this.entries[index].next) {
	          if (this.entries[index].hashCode === num && this.comparer(this.entries[index].key, key)) {
	            return index;
	          }
	        }
	      }
	      return -1;
	    };

	    dictionaryProto.count = function () {
	      return this.size - this.freeCount;
	    };

	    dictionaryProto.tryGetValue = function (key) {
	      var entry = this._findEntry(key);
	      return entry >= 0 ?
	        this.entries[entry].value :
	        undefined;
	    };

	    dictionaryProto.getValues = function () {
	      var index = 0, results = [];
	      if (this.entries) {
	        for (var index1 = 0; index1 < this.size; index1++) {
	          if (this.entries[index1].hashCode >= 0) {
	            results[index++] = this.entries[index1].value;
	          }
	        }
	      }
	      return results;
	    };

	    dictionaryProto.get = function (key) {
	      var entry = this._findEntry(key);
	      if (entry >= 0) { return this.entries[entry].value; }
	      throw new Error(noSuchkey);
	    };

	    dictionaryProto.set = function (key, value) {
	      this._insert(key, value, false);
	    };

	    dictionaryProto.containskey = function (key) {
	      return this._findEntry(key) >= 0;
	    };

	    return Dictionary;
	  }());

	  /**
	   *  Correlates the elements of two sequences based on overlapping durations.
	   *
	   *  @param {Observable} right The right observable sequence to join elements for.
	   *  @param {Function} leftDurationSelector A function to select the duration (expressed as an observable sequence) of each element of the left observable sequence, used to determine overlap.
	   *  @param {Function} rightDurationSelector A function to select the duration (expressed as an observable sequence) of each element of the right observable sequence, used to determine overlap.
	   *  @param {Function} resultSelector A function invoked to compute a result element for any two overlapping elements of the left and right observable sequences. The parameters passed to the function correspond with the elements from the left and right source sequences for which overlap occurs.
	   *  @returns {Observable} An observable sequence that contains result elements computed from source elements that have an overlapping duration.
	   */
	  observableProto.join = function (right, leftDurationSelector, rightDurationSelector, resultSelector) {
	    var left = this;
	    return new AnonymousObservable(function (observer) {
	      var group = new CompositeDisposable();
	      var leftDone = false, rightDone = false;
	      var leftId = 0, rightId = 0;
	      var leftMap = new Dictionary(), rightMap = new Dictionary();

	      group.add(left.subscribe(
	        function (value) {
	          var id = leftId++;
	          var md = new SingleAssignmentDisposable();

	          leftMap.add(id, value);
	          group.add(md);

	          var expire = function () {
	            leftMap.remove(id) && leftMap.count() === 0 && leftDone && observer.onCompleted();
	            group.remove(md);
	          };

	          var duration;
	          try {
	            duration = leftDurationSelector(value);
	          } catch (e) {
	            observer.onError(e);
	            return;
	          }

	          md.setDisposable(duration.take(1).subscribe(noop, observer.onError.bind(observer), expire));

	          rightMap.getValues().forEach(function (v) {
	            var result;
	            try {
	              result = resultSelector(value, v);
	            } catch (exn) {
	              observer.onError(exn);
	              return;
	            }

	            observer.onNext(result);
	          });
	        },
	        observer.onError.bind(observer),
	        function () {
	          leftDone = true;
	          (rightDone || leftMap.count() === 0) && observer.onCompleted();
	        })
	      );

	      group.add(right.subscribe(
	        function (value) {
	          var id = rightId++;
	          var md = new SingleAssignmentDisposable();

	          rightMap.add(id, value);
	          group.add(md);

	          var expire = function () {
	            rightMap.remove(id) && rightMap.count() === 0 && rightDone && observer.onCompleted();
	            group.remove(md);
	          };

	          var duration;
	          try {
	            duration = rightDurationSelector(value);
	          } catch (e) {
	            observer.onError(e);
	            return;
	          }

	          md.setDisposable(duration.take(1).subscribe(noop, observer.onError.bind(observer), expire));

	          leftMap.getValues().forEach(function (v) {
	            var result;
	            try {
	              result = resultSelector(v, value);
	            } catch (exn) {
	              observer.onError(exn);
	              return;
	            }

	            observer.onNext(result);
	          });
	        },
	        observer.onError.bind(observer),
	        function () {
	          rightDone = true;
	          (leftDone || rightMap.count() === 0) && observer.onCompleted();
	        })
	      );
	      return group;
	    }, left);
	  };

	  /**
	   *  Correlates the elements of two sequences based on overlapping durations, and groups the results.
	   *
	   *  @param {Observable} right The right observable sequence to join elements for.
	   *  @param {Function} leftDurationSelector A function to select the duration (expressed as an observable sequence) of each element of the left observable sequence, used to determine overlap.
	   *  @param {Function} rightDurationSelector A function to select the duration (expressed as an observable sequence) of each element of the right observable sequence, used to determine overlap.
	   *  @param {Function} resultSelector A function invoked to compute a result element for any element of the left sequence with overlapping elements from the right observable sequence. The first parameter passed to the function is an element of the left sequence. The second parameter passed to the function is an observable sequence with elements from the right sequence that overlap with the left sequence's element.
	   *  @returns {Observable} An observable sequence that contains result elements computed from source elements that have an overlapping duration.
	   */
	  observableProto.groupJoin = function (right, leftDurationSelector, rightDurationSelector, resultSelector) {
	    var left = this;
	    return new AnonymousObservable(function (observer) {
	      var group = new CompositeDisposable();
	      var r = new RefCountDisposable(group);
	      var leftMap = new Dictionary(), rightMap = new Dictionary();
	      var leftId = 0, rightId = 0;

	      function handleError(e) { return function (v) { v.onError(e); }; };

	      group.add(left.subscribe(
	        function (value) {
	          var s = new Subject();
	          var id = leftId++;
	          leftMap.add(id, s);

	          var result;
	          try {
	            result = resultSelector(value, addRef(s, r));
	          } catch (e) {
	            leftMap.getValues().forEach(handleError(e));
	            observer.onError(e);
	            return;
	          }
	          observer.onNext(result);

	          rightMap.getValues().forEach(function (v) { s.onNext(v); });

	          var md = new SingleAssignmentDisposable();
	          group.add(md);

	          var expire = function () {
	            leftMap.remove(id) && s.onCompleted();
	            group.remove(md);
	          };

	          var duration;
	          try {
	            duration = leftDurationSelector(value);
	          } catch (e) {
	            leftMap.getValues().forEach(handleError(e));
	            observer.onError(e);
	            return;
	          }

	          md.setDisposable(duration.take(1).subscribe(
	            noop,
	            function (e) {
	              leftMap.getValues().forEach(handleError(e));
	              observer.onError(e);
	            },
	            expire)
	          );
	        },
	        function (e) {
	          leftMap.getValues().forEach(handleError(e));
	          observer.onError(e);
	        },
	        observer.onCompleted.bind(observer))
	      );

	      group.add(right.subscribe(
	        function (value) {
	          var id = rightId++;
	          rightMap.add(id, value);

	          var md = new SingleAssignmentDisposable();
	          group.add(md);

	          var expire = function () {
	            rightMap.remove(id);
	            group.remove(md);
	          };

	          var duration;
	          try {
	            duration = rightDurationSelector(value);
	          } catch (e) {
	            leftMap.getValues().forEach(handleError(e));
	            observer.onError(e);
	            return;
	          }
	          md.setDisposable(duration.take(1).subscribe(
	            noop,
	            function (e) {
	              leftMap.getValues().forEach(handleError(e));
	              observer.onError(e);
	            },
	            expire)
	          );

	          leftMap.getValues().forEach(function (v) { v.onNext(value); });
	        },
	        function (e) {
	          leftMap.getValues().forEach(handleError(e));
	          observer.onError(e);
	        })
	      );

	      return r;
	    }, left);
	  };

	    /**
	     *  Projects each element of an observable sequence into zero or more buffers.
	     *
	     *  @param {Mixed} bufferOpeningsOrClosingSelector Observable sequence whose elements denote the creation of new windows, or, a function invoked to define the boundaries of the produced windows (a new window is started when the previous one is closed, resulting in non-overlapping windows).
	     *  @param {Function} [bufferClosingSelector] A function invoked to define the closing of each produced window. If a closing selector function is specified for the first parameter, this parameter is ignored.
	     *  @returns {Observable} An observable sequence of windows.
	     */
	    observableProto.buffer = function (bufferOpeningsOrClosingSelector, bufferClosingSelector) {
	        return this.window.apply(this, arguments).selectMany(function (x) { return x.toArray(); });
	    };

	  /**
	   *  Projects each element of an observable sequence into zero or more windows.
	   *
	   *  @param {Mixed} windowOpeningsOrClosingSelector Observable sequence whose elements denote the creation of new windows, or, a function invoked to define the boundaries of the produced windows (a new window is started when the previous one is closed, resulting in non-overlapping windows).
	   *  @param {Function} [windowClosingSelector] A function invoked to define the closing of each produced window. If a closing selector function is specified for the first parameter, this parameter is ignored.
	   *  @returns {Observable} An observable sequence of windows.
	   */
	  observableProto.window = function (windowOpeningsOrClosingSelector, windowClosingSelector) {
	    if (arguments.length === 1 && typeof arguments[0] !== 'function') {
	      return observableWindowWithBoundaries.call(this, windowOpeningsOrClosingSelector);
	    }
	    return typeof windowOpeningsOrClosingSelector === 'function' ?
	      observableWindowWithClosingSelector.call(this, windowOpeningsOrClosingSelector) :
	      observableWindowWithOpenings.call(this, windowOpeningsOrClosingSelector, windowClosingSelector);
	  };

	  function observableWindowWithOpenings(windowOpenings, windowClosingSelector) {
	    return windowOpenings.groupJoin(this, windowClosingSelector, observableEmpty, function (_, win) {
	      return win;
	    });
	  }

	  function observableWindowWithBoundaries(windowBoundaries) {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var win = new Subject(),
	        d = new CompositeDisposable(),
	        r = new RefCountDisposable(d);

	      observer.onNext(addRef(win, r));

	      d.add(source.subscribe(function (x) {
	        win.onNext(x);
	      }, function (err) {
	        win.onError(err);
	        observer.onError(err);
	      }, function () {
	        win.onCompleted();
	        observer.onCompleted();
	      }));

	      isPromise(windowBoundaries) && (windowBoundaries = observableFromPromise(windowBoundaries));

	      d.add(windowBoundaries.subscribe(function (w) {
	        win.onCompleted();
	        win = new Subject();
	        observer.onNext(addRef(win, r));
	      }, function (err) {
	        win.onError(err);
	        observer.onError(err);
	      }, function () {
	        win.onCompleted();
	        observer.onCompleted();
	      }));

	      return r;
	    }, source);
	  }

	  function observableWindowWithClosingSelector(windowClosingSelector) {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var m = new SerialDisposable(),
	        d = new CompositeDisposable(m),
	        r = new RefCountDisposable(d),
	        win = new Subject();
	      observer.onNext(addRef(win, r));
	      d.add(source.subscribe(function (x) {
	          win.onNext(x);
	      }, function (err) {
	          win.onError(err);
	          observer.onError(err);
	      }, function () {
	          win.onCompleted();
	          observer.onCompleted();
	      }));

	      function createWindowClose () {
	        var windowClose;
	        try {
	          windowClose = windowClosingSelector();
	        } catch (e) {
	          observer.onError(e);
	          return;
	        }

	        isPromise(windowClose) && (windowClose = observableFromPromise(windowClose));

	        var m1 = new SingleAssignmentDisposable();
	        m.setDisposable(m1);
	        m1.setDisposable(windowClose.take(1).subscribe(noop, function (err) {
	          win.onError(err);
	          observer.onError(err);
	        }, function () {
	          win.onCompleted();
	          win = new Subject();
	          observer.onNext(addRef(win, r));
	          createWindowClose();
	        }));
	      }

	      createWindowClose();
	      return r;
	    }, source);
	  }

	  /**
	   * Returns a new observable that triggers on the second and subsequent triggerings of the input observable.
	   * The Nth triggering of the input observable passes the arguments from the N-1th and Nth triggering as a pair.
	   * The argument passed to the N-1th triggering is held in hidden internal state until the Nth triggering occurs.
	   * @returns {Observable} An observable that triggers on successive pairs of observations from the input observable as an array.
	   */
	  observableProto.pairwise = function () {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var previous, hasPrevious = false;
	      return source.subscribe(
	        function (x) {
	          if (hasPrevious) {
	            observer.onNext([previous, x]);
	          } else {
	            hasPrevious = true;
	          }
	          previous = x;
	        },
	        observer.onError.bind(observer),
	        observer.onCompleted.bind(observer));
	    }, source);
	  };

	  /**
	   * Returns two observables which partition the observations of the source by the given function.
	   * The first will trigger observations for those values for which the predicate returns true.
	   * The second will trigger observations for those values where the predicate returns false.
	   * The predicate is executed once for each subscribed observer.
	   * Both also propagate all error observations arising from the source and each completes
	   * when the source completes.
	   * @param {Function} predicate
	   *    The function to determine which output Observable will trigger a particular observation.
	   * @returns {Array}
	   *    An array of observables. The first triggers when the predicate returns true,
	   *    and the second triggers when the predicate returns false.
	  */
	  observableProto.partition = function(predicate, thisArg) {
	    return [
	      this.filter(predicate, thisArg),
	      this.filter(function (x, i, o) { return !predicate.call(thisArg, x, i, o); })
	    ];
	  };

	  function enumerableWhile(condition, source) {
	    return new Enumerable(function () {
	      return new Enumerator(function () {
	        return condition() ?
	          { done: false, value: source } :
	          { done: true, value: undefined };
	      });
	    });
	  }

	   /**
	   *  Returns an observable sequence that is the result of invoking the selector on the source sequence, without sharing subscriptions.
	   *  This operator allows for a fluent style of writing queries that use the same sequence multiple times.
	   *
	   * @param {Function} selector Selector function which can use the source sequence as many times as needed, without sharing subscriptions to the source sequence.
	   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
	   */
	  observableProto.letBind = observableProto['let'] = function (func) {
	    return func(this);
	  };

	   /**
	   *  Determines whether an observable collection contains values. There is an alias for this method called 'ifThen' for browsers <IE9
	   *
	   * @example
	   *  1 - res = Rx.Observable.if(condition, obs1);
	   *  2 - res = Rx.Observable.if(condition, obs1, obs2);
	   *  3 - res = Rx.Observable.if(condition, obs1, scheduler);
	   * @param {Function} condition The condition which determines if the thenSource or elseSource will be run.
	   * @param {Observable} thenSource The observable sequence or Promise that will be run if the condition function returns true.
	   * @param {Observable} [elseSource] The observable sequence or Promise that will be run if the condition function returns false. If this is not provided, it defaults to Rx.Observabe.Empty with the specified scheduler.
	   * @returns {Observable} An observable sequence which is either the thenSource or elseSource.
	   */
	  Observable['if'] = Observable.ifThen = function (condition, thenSource, elseSourceOrScheduler) {
	    return observableDefer(function () {
	      elseSourceOrScheduler || (elseSourceOrScheduler = observableEmpty());

	      isPromise(thenSource) && (thenSource = observableFromPromise(thenSource));
	      isPromise(elseSourceOrScheduler) && (elseSourceOrScheduler = observableFromPromise(elseSourceOrScheduler));

	      // Assume a scheduler for empty only
	      typeof elseSourceOrScheduler.now === 'function' && (elseSourceOrScheduler = observableEmpty(elseSourceOrScheduler));
	      return condition() ? thenSource : elseSourceOrScheduler;
	    });
	  };

	   /**
	   *  Concatenates the observable sequences obtained by running the specified result selector for each element in source.
	   * There is an alias for this method called 'forIn' for browsers <IE9
	   * @param {Array} sources An array of values to turn into an observable sequence.
	   * @param {Function} resultSelector A function to apply to each item in the sources array to turn it into an observable sequence.
	   * @returns {Observable} An observable sequence from the concatenated observable sequences.
	   */
	  Observable['for'] = Observable.forIn = function (sources, resultSelector, thisArg) {
	    return enumerableOf(sources, resultSelector, thisArg).concat();
	  };

	   /**
	   *  Repeats source as long as condition holds emulating a while loop.
	   * There is an alias for this method called 'whileDo' for browsers <IE9
	   *
	   * @param {Function} condition The condition which determines if the source will be repeated.
	   * @param {Observable} source The observable sequence that will be run if the condition function returns true.
	   * @returns {Observable} An observable sequence which is repeated as long as the condition holds.
	   */
	  var observableWhileDo = Observable['while'] = Observable.whileDo = function (condition, source) {
	    isPromise(source) && (source = observableFromPromise(source));
	    return enumerableWhile(condition, source).concat();
	  };

	   /**
	   *  Repeats source as long as condition holds emulating a do while loop.
	   *
	   * @param {Function} condition The condition which determines if the source will be repeated.
	   * @param {Observable} source The observable sequence that will be run if the condition function returns true.
	   * @returns {Observable} An observable sequence which is repeated as long as the condition holds.
	   */
	  observableProto.doWhile = function (condition) {
	    return observableConcat([this, observableWhileDo(condition, this)]);
	  };

	   /**
	   *  Uses selector to determine which source in sources to use.
	   *  There is an alias 'switchCase' for browsers <IE9.
	   *
	   * @example
	   *  1 - res = Rx.Observable.case(selector, { '1': obs1, '2': obs2 });
	   *  1 - res = Rx.Observable.case(selector, { '1': obs1, '2': obs2 }, obs0);
	   *  1 - res = Rx.Observable.case(selector, { '1': obs1, '2': obs2 }, scheduler);
	   *
	   * @param {Function} selector The function which extracts the value for to test in a case statement.
	   * @param {Array} sources A object which has keys which correspond to the case statement labels.
	   * @param {Observable} [elseSource] The observable sequence or Promise that will be run if the sources are not matched. If this is not provided, it defaults to Rx.Observabe.empty with the specified scheduler.
	   *
	   * @returns {Observable} An observable sequence which is determined by a case statement.
	   */
	  Observable['case'] = Observable.switchCase = function (selector, sources, defaultSourceOrScheduler) {
	    return observableDefer(function () {
	      isPromise(defaultSourceOrScheduler) && (defaultSourceOrScheduler = observableFromPromise(defaultSourceOrScheduler));
	      defaultSourceOrScheduler || (defaultSourceOrScheduler = observableEmpty());

	      typeof defaultSourceOrScheduler.now === 'function' && (defaultSourceOrScheduler = observableEmpty(defaultSourceOrScheduler));

	      var result = sources[selector()];
	      isPromise(result) && (result = observableFromPromise(result));

	      return result || defaultSourceOrScheduler;
	    });
	  };

	   /**
	   *  Expands an observable sequence by recursively invoking selector.
	   *
	   * @param {Function} selector Selector function to invoke for each produced element, resulting in another sequence to which the selector will be invoked recursively again.
	   * @param {Scheduler} [scheduler] Scheduler on which to perform the expansion. If not provided, this defaults to the current thread scheduler.
	   * @returns {Observable} An observable sequence containing all the elements produced by the recursive expansion.
	   */
	  observableProto.expand = function (selector, scheduler) {
	    isScheduler(scheduler) || (scheduler = immediateScheduler);
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var q = [],
	        m = new SerialDisposable(),
	        d = new CompositeDisposable(m),
	        activeCount = 0,
	        isAcquired = false;

	      var ensureActive = function () {
	        var isOwner = false;
	        if (q.length > 0) {
	          isOwner = !isAcquired;
	          isAcquired = true;
	        }
	        if (isOwner) {
	          m.setDisposable(scheduler.scheduleRecursive(function (self) {
	            var work;
	            if (q.length > 0) {
	              work = q.shift();
	            } else {
	              isAcquired = false;
	              return;
	            }
	            var m1 = new SingleAssignmentDisposable();
	            d.add(m1);
	            m1.setDisposable(work.subscribe(function (x) {
	              observer.onNext(x);
	              var result = null;
	              try {
	                result = selector(x);
	              } catch (e) {
	                observer.onError(e);
	              }
	              q.push(result);
	              activeCount++;
	              ensureActive();
	            }, observer.onError.bind(observer), function () {
	              d.remove(m1);
	              activeCount--;
	              if (activeCount === 0) {
	                observer.onCompleted();
	              }
	            }));
	            self();
	          }));
	        }
	      };

	      q.push(source);
	      activeCount++;
	      ensureActive();
	      return d;
	    }, this);
	  };

	   /**
	   *  Runs all observable sequences in parallel and collect their last elements.
	   *
	   * @example
	   *  1 - res = Rx.Observable.forkJoin([obs1, obs2]);
	   *  1 - res = Rx.Observable.forkJoin(obs1, obs2, ...);
	   * @returns {Observable} An observable sequence with an array collecting the last elements of all the input sequences.
	   */
	  Observable.forkJoin = function () {
	    var allSources = [];
	    if (Array.isArray(arguments[0])) {
	      allSources = arguments[0];
	    } else {
	      for(var i = 0, len = arguments.length; i < len; i++) { allSources.push(arguments[i]); }
	    }
	    return new AnonymousObservable(function (subscriber) {
	      var count = allSources.length;
	      if (count === 0) {
	        subscriber.onCompleted();
	        return disposableEmpty;
	      }
	      var group = new CompositeDisposable(),
	        finished = false,
	        hasResults = new Array(count),
	        hasCompleted = new Array(count),
	        results = new Array(count);

	      for (var idx = 0; idx < count; idx++) {
	        (function (i) {
	          var source = allSources[i];
	          isPromise(source) && (source = observableFromPromise(source));
	          group.add(
	            source.subscribe(
	              function (value) {
	              if (!finished) {
	                hasResults[i] = true;
	                results[i] = value;
	              }
	            },
	            function (e) {
	              finished = true;
	              subscriber.onError(e);
	              group.dispose();
	            },
	            function () {
	              if (!finished) {
	                if (!hasResults[i]) {
	                    subscriber.onCompleted();
	                    return;
	                }
	                hasCompleted[i] = true;
	                for (var ix = 0; ix < count; ix++) {
	                  if (!hasCompleted[ix]) { return; }
	                }
	                finished = true;
	                subscriber.onNext(results);
	                subscriber.onCompleted();
	              }
	            }));
	        })(idx);
	      }

	      return group;
	    });
	  };

	   /**
	   *  Runs two observable sequences in parallel and combines their last elemenets.
	   *
	   * @param {Observable} second Second observable sequence.
	   * @param {Function} resultSelector Result selector function to invoke with the last elements of both sequences.
	   * @returns {Observable} An observable sequence with the result of calling the selector function with the last elements of both input sequences.
	   */
	  observableProto.forkJoin = function (second, resultSelector) {
	    var first = this;
	    return new AnonymousObservable(function (observer) {
	      var leftStopped = false, rightStopped = false,
	        hasLeft = false, hasRight = false,
	        lastLeft, lastRight,
	        leftSubscription = new SingleAssignmentDisposable(), rightSubscription = new SingleAssignmentDisposable();

	      isPromise(second) && (second = observableFromPromise(second));

	      leftSubscription.setDisposable(
	          first.subscribe(function (left) {
	            hasLeft = true;
	            lastLeft = left;
	          }, function (err) {
	            rightSubscription.dispose();
	            observer.onError(err);
	          }, function () {
	            leftStopped = true;
	            if (rightStopped) {
	              if (!hasLeft) {
	                  observer.onCompleted();
	              } else if (!hasRight) {
	                  observer.onCompleted();
	              } else {
	                var result;
	                try {
	                  result = resultSelector(lastLeft, lastRight);
	                } catch (e) {
	                  observer.onError(e);
	                  return;
	                }
	                observer.onNext(result);
	                observer.onCompleted();
	              }
	            }
	          })
	      );

	      rightSubscription.setDisposable(
	        second.subscribe(function (right) {
	          hasRight = true;
	          lastRight = right;
	        }, function (err) {
	          leftSubscription.dispose();
	          observer.onError(err);
	        }, function () {
	          rightStopped = true;
	          if (leftStopped) {
	            if (!hasLeft) {
	              observer.onCompleted();
	            } else if (!hasRight) {
	              observer.onCompleted();
	            } else {
	              var result;
	              try {
	                result = resultSelector(lastLeft, lastRight);
	              } catch (e) {
	                observer.onError(e);
	                return;
	              }
	              observer.onNext(result);
	              observer.onCompleted();
	            }
	          }
	        })
	      );

	      return new CompositeDisposable(leftSubscription, rightSubscription);
	    }, first);
	  };

	  /**
	   * Comonadic bind operator.
	   * @param {Function} selector A transform function to apply to each element.
	   * @param {Object} scheduler Scheduler used to execute the operation. If not specified, defaults to the ImmediateScheduler.
	   * @returns {Observable} An observable sequence which results from the comonadic bind operation.
	   */
	  observableProto.manySelect = function (selector, scheduler) {
	    isScheduler(scheduler) || (scheduler = immediateScheduler);
	    var source = this;
	    return observableDefer(function () {
	      var chain;

	      return source
	        .map(function (x) {
	          var curr = new ChainObservable(x);

	          chain && chain.onNext(x);
	          chain = curr;

	          return curr;
	        })
	        .tap(
	          noop,
	          function (e) { chain && chain.onError(e); },
	          function () { chain && chain.onCompleted(); }
	        )
	        .observeOn(scheduler)
	        .map(selector);
	    }, source);
	  };

	  var ChainObservable = (function (__super__) {

	    function subscribe (observer) {
	      var self = this, g = new CompositeDisposable();
	      g.add(currentThreadScheduler.schedule(function () {
	        observer.onNext(self.head);
	        g.add(self.tail.mergeAll().subscribe(observer));
	      }));

	      return g;
	    }

	    inherits(ChainObservable, __super__);

	    function ChainObservable(head) {
	      __super__.call(this, subscribe);
	      this.head = head;
	      this.tail = new AsyncSubject();
	    }

	    addProperties(ChainObservable.prototype, Observer, {
	      onCompleted: function () {
	        this.onNext(Observable.empty());
	      },
	      onError: function (e) {
	        this.onNext(Observable.throwError(e));
	      },
	      onNext: function (v) {
	        this.tail.onNext(v);
	        this.tail.onCompleted();
	      }
	    });

	    return ChainObservable;

	  }(Observable));

	  /** @private */
	  var Map = root.Map || (function () {

	    function Map() {
	      this._keys = [];
	      this._values = [];
	    }

	    Map.prototype.get = function (key) {
	      var i = this._keys.indexOf(key);
	      return i !== -1 ? this._values[i] : undefined;
	    };

	    Map.prototype.set = function (key, value) {
	      var i = this._keys.indexOf(key);
	      i !== -1 && (this._values[i] = value);
	      this._values[this._keys.push(key) - 1] = value;
	    };

	    Map.prototype.forEach = function (callback, thisArg) {
	      for (var i = 0, len = this._keys.length; i < len; i++) {
	        callback.call(thisArg, this._values[i], this._keys[i]);
	      }
	    };

	    return Map;
	  }());

	  /**
	   * @constructor
	   * Represents a join pattern over observable sequences.
	   */
	  function Pattern(patterns) {
	    this.patterns = patterns;
	  }

	  /**
	   *  Creates a pattern that matches the current plan matches and when the specified observable sequences has an available value.
	   *  @param other Observable sequence to match in addition to the current pattern.
	   *  @return {Pattern} Pattern object that matches when all observable sequences in the pattern have an available value.
	   */
	  Pattern.prototype.and = function (other) {
	    return new Pattern(this.patterns.concat(other));
	  };

	  /**
	   *  Matches when all observable sequences in the pattern (specified using a chain of and operators) have an available value and projects the values.
	   *  @param {Function} selector Selector that will be invoked with available values from the source sequences, in the same order of the sequences in the pattern.
	   *  @return {Plan} Plan that produces the projected values, to be fed (with other plans) to the when operator.
	   */
	  Pattern.prototype.thenDo = function (selector) {
	    return new Plan(this, selector);
	  };

	  function Plan(expression, selector) {
	      this.expression = expression;
	      this.selector = selector;
	  }

	  Plan.prototype.activate = function (externalSubscriptions, observer, deactivate) {
	    var self = this;
	    var joinObservers = [];
	    for (var i = 0, len = this.expression.patterns.length; i < len; i++) {
	      joinObservers.push(planCreateObserver(externalSubscriptions, this.expression.patterns[i], observer.onError.bind(observer)));
	    }
	    var activePlan = new ActivePlan(joinObservers, function () {
	      var result;
	      try {
	        result = self.selector.apply(self, arguments);
	      } catch (e) {
	        observer.onError(e);
	        return;
	      }
	      observer.onNext(result);
	    }, function () {
	      for (var j = 0, jlen = joinObservers.length; j < jlen; j++) {
	        joinObservers[j].removeActivePlan(activePlan);
	      }
	      deactivate(activePlan);
	    });
	    for (i = 0, len = joinObservers.length; i < len; i++) {
	      joinObservers[i].addActivePlan(activePlan);
	    }
	    return activePlan;
	  };

	  function planCreateObserver(externalSubscriptions, observable, onError) {
	    var entry = externalSubscriptions.get(observable);
	    if (!entry) {
	      var observer = new JoinObserver(observable, onError);
	      externalSubscriptions.set(observable, observer);
	      return observer;
	    }
	    return entry;
	  }

	  function ActivePlan(joinObserverArray, onNext, onCompleted) {
	    this.joinObserverArray = joinObserverArray;
	    this.onNext = onNext;
	    this.onCompleted = onCompleted;
	    this.joinObservers = new Map();
	    for (var i = 0, len = this.joinObserverArray.length; i < len; i++) {
	      var joinObserver = this.joinObserverArray[i];
	      this.joinObservers.set(joinObserver, joinObserver);
	    }
	  }

	  ActivePlan.prototype.dequeue = function () {
	    this.joinObservers.forEach(function (v) { v.queue.shift(); });
	  };

	  ActivePlan.prototype.match = function () {
	    var i, len, hasValues = true;
	    for (i = 0, len = this.joinObserverArray.length; i < len; i++) {
	      if (this.joinObserverArray[i].queue.length === 0) {
	        hasValues = false;
	        break;
	      }
	    }
	    if (hasValues) {
	      var firstValues = [],
	          isCompleted = false;
	      for (i = 0, len = this.joinObserverArray.length; i < len; i++) {
	        firstValues.push(this.joinObserverArray[i].queue[0]);
	        this.joinObserverArray[i].queue[0].kind === 'C' && (isCompleted = true);
	      }
	      if (isCompleted) {
	        this.onCompleted();
	      } else {
	        this.dequeue();
	        var values = [];
	        for (i = 0, len = firstValues.length; i < firstValues.length; i++) {
	          values.push(firstValues[i].value);
	        }
	        this.onNext.apply(this, values);
	      }
	    }
	  };

	  var JoinObserver = (function (__super__) {
	    inherits(JoinObserver, __super__);

	    function JoinObserver(source, onError) {
	      __super__.call(this);
	      this.source = source;
	      this.onError = onError;
	      this.queue = [];
	      this.activePlans = [];
	      this.subscription = new SingleAssignmentDisposable();
	      this.isDisposed = false;
	    }

	    var JoinObserverPrototype = JoinObserver.prototype;

	    JoinObserverPrototype.next = function (notification) {
	      if (!this.isDisposed) {
	        if (notification.kind === 'E') {
	          return this.onError(notification.exception);
	        }
	        this.queue.push(notification);
	        var activePlans = this.activePlans.slice(0);
	        for (var i = 0, len = activePlans.length; i < len; i++) {
	          activePlans[i].match();
	        }
	      }
	    };

	    JoinObserverPrototype.error = noop;
	    JoinObserverPrototype.completed = noop;

	    JoinObserverPrototype.addActivePlan = function (activePlan) {
	      this.activePlans.push(activePlan);
	    };

	    JoinObserverPrototype.subscribe = function () {
	      this.subscription.setDisposable(this.source.materialize().subscribe(this));
	    };

	    JoinObserverPrototype.removeActivePlan = function (activePlan) {
	      this.activePlans.splice(this.activePlans.indexOf(activePlan), 1);
	      this.activePlans.length === 0 && this.dispose();
	    };

	    JoinObserverPrototype.dispose = function () {
	      __super__.prototype.dispose.call(this);
	      if (!this.isDisposed) {
	        this.isDisposed = true;
	        this.subscription.dispose();
	      }
	    };

	    return JoinObserver;
	  } (AbstractObserver));

	  /**
	   *  Creates a pattern that matches when both observable sequences have an available value.
	   *
	   *  @param right Observable sequence to match with the current sequence.
	   *  @return {Pattern} Pattern object that matches when both observable sequences have an available value.
	   */
	  observableProto.and = function (right) {
	    return new Pattern([this, right]);
	  };

	  /**
	   *  Matches when the observable sequence has an available value and projects the value.
	   *
	   *  @param {Function} selector Selector that will be invoked for values in the source sequence.
	   *  @returns {Plan} Plan that produces the projected values, to be fed (with other plans) to the when operator.
	   */
	  observableProto.thenDo = function (selector) {
	    return new Pattern([this]).thenDo(selector);
	  };

	  /**
	   *  Joins together the results from several patterns.
	   *
	   *  @param plans A series of plans (specified as an Array of as a series of arguments) created by use of the Then operator on patterns.
	   *  @returns {Observable} Observable sequence with the results form matching several patterns.
	   */
	  Observable.when = function () {
	    var len = arguments.length, plans;
	    if (Array.isArray(arguments[0])) {
	      plans = arguments[0];
	    } else {
	      plans = new Array(len);
	      for(var i = 0; i < len; i++) { plans[i] = arguments[i]; }
	    }
	    return new AnonymousObservable(function (o) {
	      var activePlans = [],
	          externalSubscriptions = new Map();
	      var outObserver = observerCreate(
	        function (x) { o.onNext(x); },
	        function (err) {
	          externalSubscriptions.forEach(function (v) { v.onError(err); });
	          o.onError(err);
	        },
	        function (x) { o.onCompleted(); }
	      );
	      try {
	        for (var i = 0, len = plans.length; i < len; i++) {
	          activePlans.push(plans[i].activate(externalSubscriptions, outObserver, function (activePlan) {
	            var idx = activePlans.indexOf(activePlan);
	            activePlans.splice(idx, 1);
	            activePlans.length === 0 && o.onCompleted();
	          }));
	        }
	      } catch (e) {
	        observableThrow(e).subscribe(o);
	      }
	      var group = new CompositeDisposable();
	      externalSubscriptions.forEach(function (joinObserver) {
	        joinObserver.subscribe();
	        group.add(joinObserver);
	      });

	      return group;
	    });
	  };

	  function observableTimerDate(dueTime, scheduler) {
	    return new AnonymousObservable(function (observer) {
	      return scheduler.scheduleWithAbsolute(dueTime, function () {
	        observer.onNext(0);
	        observer.onCompleted();
	      });
	    });
	  }

	  function observableTimerDateAndPeriod(dueTime, period, scheduler) {
	    return new AnonymousObservable(function (observer) {
	      var d = dueTime, p = normalizeTime(period);
	      return scheduler.scheduleRecursiveWithAbsoluteAndState(0, d, function (count, self) {
	        if (p > 0) {
	          var now = scheduler.now();
	          d = d + p;
	          d <= now && (d = now + p);
	        }
	        observer.onNext(count);
	        self(count + 1, d);
	      });
	    });
	  }

	  function observableTimerTimeSpan(dueTime, scheduler) {
	    return new AnonymousObservable(function (observer) {
	      return scheduler.scheduleWithRelative(normalizeTime(dueTime), function () {
	        observer.onNext(0);
	        observer.onCompleted();
	      });
	    });
	  }

	  function observableTimerTimeSpanAndPeriod(dueTime, period, scheduler) {
	    return dueTime === period ?
	      new AnonymousObservable(function (observer) {
	        return scheduler.schedulePeriodicWithState(0, period, function (count) {
	          observer.onNext(count);
	          return count + 1;
	        });
	      }) :
	      observableDefer(function () {
	        return observableTimerDateAndPeriod(scheduler.now() + dueTime, period, scheduler);
	      });
	  }

	  /**
	   *  Returns an observable sequence that produces a value after each period.
	   *
	   * @example
	   *  1 - res = Rx.Observable.interval(1000);
	   *  2 - res = Rx.Observable.interval(1000, Rx.Scheduler.timeout);
	   *
	   * @param {Number} period Period for producing the values in the resulting sequence (specified as an integer denoting milliseconds).
	   * @param {Scheduler} [scheduler] Scheduler to run the timer on. If not specified, Rx.Scheduler.timeout is used.
	   * @returns {Observable} An observable sequence that produces a value after each period.
	   */
	  var observableinterval = Observable.interval = function (period, scheduler) {
	    return observableTimerTimeSpanAndPeriod(period, period, isScheduler(scheduler) ? scheduler : timeoutScheduler);
	  };

	  /**
	   *  Returns an observable sequence that produces a value after dueTime has elapsed and then after each period.
	   * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) at which to produce the first value.
	   * @param {Mixed} [periodOrScheduler]  Period to produce subsequent values (specified as an integer denoting milliseconds), or the scheduler to run the timer on. If not specified, the resulting timer is not recurring.
	   * @param {Scheduler} [scheduler]  Scheduler to run the timer on. If not specified, the timeout scheduler is used.
	   * @returns {Observable} An observable sequence that produces a value after due time has elapsed and then each period.
	   */
	  var observableTimer = Observable.timer = function (dueTime, periodOrScheduler, scheduler) {
	    var period;
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    if (periodOrScheduler !== undefined && typeof periodOrScheduler === 'number') {
	      period = periodOrScheduler;
	    } else if (isScheduler(periodOrScheduler)) {
	      scheduler = periodOrScheduler;
	    }
	    if (dueTime instanceof Date && period === undefined) {
	      return observableTimerDate(dueTime.getTime(), scheduler);
	    }
	    if (dueTime instanceof Date && period !== undefined) {
	      period = periodOrScheduler;
	      return observableTimerDateAndPeriod(dueTime.getTime(), period, scheduler);
	    }
	    return period === undefined ?
	      observableTimerTimeSpan(dueTime, scheduler) :
	      observableTimerTimeSpanAndPeriod(dueTime, period, scheduler);
	  };

	  function observableDelayTimeSpan(source, dueTime, scheduler) {
	    return new AnonymousObservable(function (observer) {
	      var active = false,
	        cancelable = new SerialDisposable(),
	        exception = null,
	        q = [],
	        running = false,
	        subscription;
	      subscription = source.materialize().timestamp(scheduler).subscribe(function (notification) {
	        var d, shouldRun;
	        if (notification.value.kind === 'E') {
	          q = [];
	          q.push(notification);
	          exception = notification.value.exception;
	          shouldRun = !running;
	        } else {
	          q.push({ value: notification.value, timestamp: notification.timestamp + dueTime });
	          shouldRun = !active;
	          active = true;
	        }
	        if (shouldRun) {
	          if (exception !== null) {
	            observer.onError(exception);
	          } else {
	            d = new SingleAssignmentDisposable();
	            cancelable.setDisposable(d);
	            d.setDisposable(scheduler.scheduleRecursiveWithRelative(dueTime, function (self) {
	              var e, recurseDueTime, result, shouldRecurse;
	              if (exception !== null) {
	                return;
	              }
	              running = true;
	              do {
	                result = null;
	                if (q.length > 0 && q[0].timestamp - scheduler.now() <= 0) {
	                  result = q.shift().value;
	                }
	                if (result !== null) {
	                  result.accept(observer);
	                }
	              } while (result !== null);
	              shouldRecurse = false;
	              recurseDueTime = 0;
	              if (q.length > 0) {
	                shouldRecurse = true;
	                recurseDueTime = Math.max(0, q[0].timestamp - scheduler.now());
	              } else {
	                active = false;
	              }
	              e = exception;
	              running = false;
	              if (e !== null) {
	                observer.onError(e);
	              } else if (shouldRecurse) {
	                self(recurseDueTime);
	              }
	            }));
	          }
	        }
	      });
	      return new CompositeDisposable(subscription, cancelable);
	    }, source);
	  }

	  function observableDelayDate(source, dueTime, scheduler) {
	    return observableDefer(function () {
	      return observableDelayTimeSpan(source, dueTime - scheduler.now(), scheduler);
	    });
	  }

	  /**
	   *  Time shifts the observable sequence by dueTime. The relative time intervals between the values are preserved.
	   *
	   * @example
	   *  1 - res = Rx.Observable.delay(new Date());
	   *  2 - res = Rx.Observable.delay(new Date(), Rx.Scheduler.timeout);
	   *
	   *  3 - res = Rx.Observable.delay(5000);
	   *  4 - res = Rx.Observable.delay(5000, 1000, Rx.Scheduler.timeout);
	   * @memberOf Observable#
	   * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) by which to shift the observable sequence.
	   * @param {Scheduler} [scheduler] Scheduler to run the delay timers on. If not specified, the timeout scheduler is used.
	   * @returns {Observable} Time-shifted sequence.
	   */
	  observableProto.delay = function (dueTime, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return dueTime instanceof Date ?
	      observableDelayDate(this, dueTime.getTime(), scheduler) :
	      observableDelayTimeSpan(this, dueTime, scheduler);
	  };

	  /**
	   *  Ignores values from an observable sequence which are followed by another value before dueTime.
	   * @param {Number} dueTime Duration of the debounce period for each value (specified as an integer denoting milliseconds).
	   * @param {Scheduler} [scheduler]  Scheduler to run the debounce timers on. If not specified, the timeout scheduler is used.
	   * @returns {Observable} The debounced sequence.
	   */
	  observableProto.debounce = observableProto.throttleWithTimeout = function (dueTime, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var cancelable = new SerialDisposable(), hasvalue = false, value, id = 0;
	      var subscription = source.subscribe(
	        function (x) {
	          hasvalue = true;
	          value = x;
	          id++;
	          var currentId = id,
	            d = new SingleAssignmentDisposable();
	          cancelable.setDisposable(d);
	          d.setDisposable(scheduler.scheduleWithRelative(dueTime, function () {
	            hasvalue && id === currentId && observer.onNext(value);
	            hasvalue = false;
	          }));
	        },
	        function (e) {
	          cancelable.dispose();
	          observer.onError(e);
	          hasvalue = false;
	          id++;
	        },
	        function () {
	          cancelable.dispose();
	          hasvalue && observer.onNext(value);
	          observer.onCompleted();
	          hasvalue = false;
	          id++;
	        });
	      return new CompositeDisposable(subscription, cancelable);
	    }, this);
	  };

	  /**
	   * @deprecated use #debounce or #throttleWithTimeout instead.
	   */
	  observableProto.throttle = function(dueTime, scheduler) {
	    //deprecate('throttle', 'debounce or throttleWithTimeout');
	    return this.debounce(dueTime, scheduler);
	  };

	  /**
	   *  Projects each element of an observable sequence into zero or more windows which are produced based on timing information.
	   * @param {Number} timeSpan Length of each window (specified as an integer denoting milliseconds).
	   * @param {Mixed} [timeShiftOrScheduler]  Interval between creation of consecutive windows (specified as an integer denoting milliseconds), or an optional scheduler parameter. If not specified, the time shift corresponds to the timeSpan parameter, resulting in non-overlapping adjacent windows.
	   * @param {Scheduler} [scheduler]  Scheduler to run windowing timers on. If not specified, the timeout scheduler is used.
	   * @returns {Observable} An observable sequence of windows.
	   */
	  observableProto.windowWithTime = function (timeSpan, timeShiftOrScheduler, scheduler) {
	    var source = this, timeShift;
	    timeShiftOrScheduler == null && (timeShift = timeSpan);
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    if (typeof timeShiftOrScheduler === 'number') {
	      timeShift = timeShiftOrScheduler;
	    } else if (isScheduler(timeShiftOrScheduler)) {
	      timeShift = timeSpan;
	      scheduler = timeShiftOrScheduler;
	    }
	    return new AnonymousObservable(function (observer) {
	      var groupDisposable,
	        nextShift = timeShift,
	        nextSpan = timeSpan,
	        q = [],
	        refCountDisposable,
	        timerD = new SerialDisposable(),
	        totalTime = 0;
	        groupDisposable = new CompositeDisposable(timerD),
	        refCountDisposable = new RefCountDisposable(groupDisposable);

	       function createTimer () {
	        var m = new SingleAssignmentDisposable(),
	          isSpan = false,
	          isShift = false;
	        timerD.setDisposable(m);
	        if (nextSpan === nextShift) {
	          isSpan = true;
	          isShift = true;
	        } else if (nextSpan < nextShift) {
	            isSpan = true;
	        } else {
	          isShift = true;
	        }
	        var newTotalTime = isSpan ? nextSpan : nextShift,
	          ts = newTotalTime - totalTime;
	        totalTime = newTotalTime;
	        if (isSpan) {
	          nextSpan += timeShift;
	        }
	        if (isShift) {
	          nextShift += timeShift;
	        }
	        m.setDisposable(scheduler.scheduleWithRelative(ts, function () {
	          if (isShift) {
	            var s = new Subject();
	            q.push(s);
	            observer.onNext(addRef(s, refCountDisposable));
	          }
	          isSpan && q.shift().onCompleted();
	          createTimer();
	        }));
	      };
	      q.push(new Subject());
	      observer.onNext(addRef(q[0], refCountDisposable));
	      createTimer();
	      groupDisposable.add(source.subscribe(
	        function (x) {
	          for (var i = 0, len = q.length; i < len; i++) { q[i].onNext(x); }
	        },
	        function (e) {
	          for (var i = 0, len = q.length; i < len; i++) { q[i].onError(e); }
	          observer.onError(e);
	        },
	        function () {
	          for (var i = 0, len = q.length; i < len; i++) { q[i].onCompleted(); }
	          observer.onCompleted();
	        }
	      ));
	      return refCountDisposable;
	    }, source);
	  };

	  /**
	   *  Projects each element of an observable sequence into a window that is completed when either it's full or a given amount of time has elapsed.
	   * @param {Number} timeSpan Maximum time length of a window.
	   * @param {Number} count Maximum element count of a window.
	   * @param {Scheduler} [scheduler]  Scheduler to run windowing timers on. If not specified, the timeout scheduler is used.
	   * @returns {Observable} An observable sequence of windows.
	   */
	  observableProto.windowWithTimeOrCount = function (timeSpan, count, scheduler) {
	    var source = this;
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return new AnonymousObservable(function (observer) {
	      var timerD = new SerialDisposable(),
	          groupDisposable = new CompositeDisposable(timerD),
	          refCountDisposable = new RefCountDisposable(groupDisposable),
	          n = 0,
	          windowId = 0,
	          s = new Subject();

	      function createTimer(id) {
	        var m = new SingleAssignmentDisposable();
	        timerD.setDisposable(m);
	        m.setDisposable(scheduler.scheduleWithRelative(timeSpan, function () {
	          if (id !== windowId) { return; }
	          n = 0;
	          var newId = ++windowId;
	          s.onCompleted();
	          s = new Subject();
	          observer.onNext(addRef(s, refCountDisposable));
	          createTimer(newId);
	        }));
	      }

	      observer.onNext(addRef(s, refCountDisposable));
	      createTimer(0);

	      groupDisposable.add(source.subscribe(
	        function (x) {
	          var newId = 0, newWindow = false;
	          s.onNext(x);
	          if (++n === count) {
	            newWindow = true;
	            n = 0;
	            newId = ++windowId;
	            s.onCompleted();
	            s = new Subject();
	            observer.onNext(addRef(s, refCountDisposable));
	          }
	          newWindow && createTimer(newId);
	        },
	        function (e) {
	          s.onError(e);
	          observer.onError(e);
	        }, function () {
	          s.onCompleted();
	          observer.onCompleted();
	        }
	      ));
	      return refCountDisposable;
	    }, source);
	  };

	    /**
	     *  Projects each element of an observable sequence into zero or more buffers which are produced based on timing information.
	     *
	     * @example
	     *  1 - res = xs.bufferWithTime(1000, scheduler); // non-overlapping segments of 1 second
	     *  2 - res = xs.bufferWithTime(1000, 500, scheduler; // segments of 1 second with time shift 0.5 seconds
	     *
	     * @param {Number} timeSpan Length of each buffer (specified as an integer denoting milliseconds).
	     * @param {Mixed} [timeShiftOrScheduler]  Interval between creation of consecutive buffers (specified as an integer denoting milliseconds), or an optional scheduler parameter. If not specified, the time shift corresponds to the timeSpan parameter, resulting in non-overlapping adjacent buffers.
	     * @param {Scheduler} [scheduler]  Scheduler to run buffer timers on. If not specified, the timeout scheduler is used.
	     * @returns {Observable} An observable sequence of buffers.
	     */
	    observableProto.bufferWithTime = function (timeSpan, timeShiftOrScheduler, scheduler) {
	        return this.windowWithTime.apply(this, arguments).selectMany(function (x) { return x.toArray(); });
	    };

	    /**
	     *  Projects each element of an observable sequence into a buffer that is completed when either it's full or a given amount of time has elapsed.
	     *
	     * @example
	     *  1 - res = source.bufferWithTimeOrCount(5000, 50); // 5s or 50 items in an array
	     *  2 - res = source.bufferWithTimeOrCount(5000, 50, scheduler); // 5s or 50 items in an array
	     *
	     * @param {Number} timeSpan Maximum time length of a buffer.
	     * @param {Number} count Maximum element count of a buffer.
	     * @param {Scheduler} [scheduler]  Scheduler to run bufferin timers on. If not specified, the timeout scheduler is used.
	     * @returns {Observable} An observable sequence of buffers.
	     */
	    observableProto.bufferWithTimeOrCount = function (timeSpan, count, scheduler) {
	        return this.windowWithTimeOrCount(timeSpan, count, scheduler).selectMany(function (x) {
	            return x.toArray();
	        });
	    };

	  /**
	   *  Records the time interval between consecutive values in an observable sequence.
	   *
	   * @example
	   *  1 - res = source.timeInterval();
	   *  2 - res = source.timeInterval(Rx.Scheduler.timeout);
	   *
	   * @param [scheduler]  Scheduler used to compute time intervals. If not specified, the timeout scheduler is used.
	   * @returns {Observable} An observable sequence with time interval information on values.
	   */
	  observableProto.timeInterval = function (scheduler) {
	    var source = this;
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return observableDefer(function () {
	      var last = scheduler.now();
	      return source.map(function (x) {
	        var now = scheduler.now(), span = now - last;
	        last = now;
	        return { value: x, interval: span };
	      });
	    });
	  };

	  /**
	   *  Records the timestamp for each value in an observable sequence.
	   *
	   * @example
	   *  1 - res = source.timestamp(); // produces { value: x, timestamp: ts }
	   *  2 - res = source.timestamp(Rx.Scheduler.timeout);
	   *
	   * @param {Scheduler} [scheduler]  Scheduler used to compute timestamps. If not specified, the timeout scheduler is used.
	   * @returns {Observable} An observable sequence with timestamp information on values.
	   */
	  observableProto.timestamp = function (scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return this.map(function (x) {
	      return { value: x, timestamp: scheduler.now() };
	    });
	  };

	  function sampleObservable(source, sampler) {
	    return new AnonymousObservable(function (observer) {
	      var atEnd, value, hasValue;

	      function sampleSubscribe() {
	        if (hasValue) {
	          hasValue = false;
	          observer.onNext(value);
	        }
	        atEnd && observer.onCompleted();
	      }

	      return new CompositeDisposable(
	        source.subscribe(function (newValue) {
	          hasValue = true;
	          value = newValue;
	        }, observer.onError.bind(observer), function () {
	          atEnd = true;
	        }),
	        sampler.subscribe(sampleSubscribe, observer.onError.bind(observer), sampleSubscribe)
	      );
	    }, source);
	  }

	  /**
	   *  Samples the observable sequence at each interval.
	   *
	   * @example
	   *  1 - res = source.sample(sampleObservable); // Sampler tick sequence
	   *  2 - res = source.sample(5000); // 5 seconds
	   *  2 - res = source.sample(5000, Rx.Scheduler.timeout); // 5 seconds
	   *
	   * @param {Mixed} intervalOrSampler Interval at which to sample (specified as an integer denoting milliseconds) or Sampler Observable.
	   * @param {Scheduler} [scheduler]  Scheduler to run the sampling timer on. If not specified, the timeout scheduler is used.
	   * @returns {Observable} Sampled observable sequence.
	   */
	  observableProto.sample = observableProto.throttleLatest = function (intervalOrSampler, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return typeof intervalOrSampler === 'number' ?
	      sampleObservable(this, observableinterval(intervalOrSampler, scheduler)) :
	      sampleObservable(this, intervalOrSampler);
	  };

	  /**
	   *  Returns the source observable sequence or the other observable sequence if dueTime elapses.
	   * @param {Number} dueTime Absolute (specified as a Date object) or relative time (specified as an integer denoting milliseconds) when a timeout occurs.
	   * @param {Observable} [other]  Sequence to return in case of a timeout. If not specified, a timeout error throwing sequence will be used.
	   * @param {Scheduler} [scheduler]  Scheduler to run the timeout timers on. If not specified, the timeout scheduler is used.
	   * @returns {Observable} The source sequence switching to the other sequence in case of a timeout.
	   */
	  observableProto.timeout = function (dueTime, other, scheduler) {
	    (other == null || typeof other === 'string') && (other = observableThrow(new Error(other || 'Timeout')));
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);

	    var source = this, schedulerMethod = dueTime instanceof Date ?
	      'scheduleWithAbsolute' :
	      'scheduleWithRelative';

	    return new AnonymousObservable(function (observer) {
	      var id = 0,
	        original = new SingleAssignmentDisposable(),
	        subscription = new SerialDisposable(),
	        switched = false,
	        timer = new SerialDisposable();

	      subscription.setDisposable(original);

	      function createTimer() {
	        var myId = id;
	        timer.setDisposable(scheduler[schedulerMethod](dueTime, function () {
	          if (id === myId) {
	            isPromise(other) && (other = observableFromPromise(other));
	            subscription.setDisposable(other.subscribe(observer));
	          }
	        }));
	      }

	      createTimer();

	      original.setDisposable(source.subscribe(function (x) {
	        if (!switched) {
	          id++;
	          observer.onNext(x);
	          createTimer();
	        }
	      }, function (e) {
	        if (!switched) {
	          id++;
	          observer.onError(e);
	        }
	      }, function () {
	        if (!switched) {
	          id++;
	          observer.onCompleted();
	        }
	      }));
	      return new CompositeDisposable(subscription, timer);
	    }, source);
	  };

	  /**
	   *  Generates an observable sequence by iterating a state from an initial state until the condition fails.
	   *
	   * @example
	   *  res = source.generateWithAbsoluteTime(0,
	   *      function (x) { return return true; },
	   *      function (x) { return x + 1; },
	   *      function (x) { return x; },
	   *      function (x) { return new Date(); }
	   *  });
	   *
	   * @param {Mixed} initialState Initial state.
	   * @param {Function} condition Condition to terminate generation (upon returning false).
	   * @param {Function} iterate Iteration step function.
	   * @param {Function} resultSelector Selector function for results produced in the sequence.
	   * @param {Function} timeSelector Time selector function to control the speed of values being produced each iteration, returning Date values.
	   * @param {Scheduler} [scheduler]  Scheduler on which to run the generator loop. If not specified, the timeout scheduler is used.
	   * @returns {Observable} The generated sequence.
	   */
	  Observable.generateWithAbsoluteTime = function (initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return new AnonymousObservable(function (observer) {
	      var first = true,
	        hasResult = false,
	        result,
	        state = initialState,
	        time;
	      return scheduler.scheduleRecursiveWithAbsolute(scheduler.now(), function (self) {
	        hasResult && observer.onNext(result);

	        try {
	          if (first) {
	            first = false;
	          } else {
	            state = iterate(state);
	          }
	          hasResult = condition(state);
	          if (hasResult) {
	            result = resultSelector(state);
	            time = timeSelector(state);
	          }
	        } catch (e) {
	          observer.onError(e);
	          return;
	        }
	        if (hasResult) {
	          self(time);
	        } else {
	          observer.onCompleted();
	        }
	      });
	    });
	  };

	  /**
	   *  Generates an observable sequence by iterating a state from an initial state until the condition fails.
	   *
	   * @example
	   *  res = source.generateWithRelativeTime(0,
	   *      function (x) { return return true; },
	   *      function (x) { return x + 1; },
	   *      function (x) { return x; },
	   *      function (x) { return 500; }
	   *  );
	   *
	   * @param {Mixed} initialState Initial state.
	   * @param {Function} condition Condition to terminate generation (upon returning false).
	   * @param {Function} iterate Iteration step function.
	   * @param {Function} resultSelector Selector function for results produced in the sequence.
	   * @param {Function} timeSelector Time selector function to control the speed of values being produced each iteration, returning integer values denoting milliseconds.
	   * @param {Scheduler} [scheduler]  Scheduler on which to run the generator loop. If not specified, the timeout scheduler is used.
	   * @returns {Observable} The generated sequence.
	   */
	  Observable.generateWithRelativeTime = function (initialState, condition, iterate, resultSelector, timeSelector, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return new AnonymousObservable(function (observer) {
	      var first = true,
	        hasResult = false,
	        result,
	        state = initialState,
	        time;
	      return scheduler.scheduleRecursiveWithRelative(0, function (self) {
	        hasResult && observer.onNext(result);

	        try {
	          if (first) {
	            first = false;
	          } else {
	            state = iterate(state);
	          }
	          hasResult = condition(state);
	          if (hasResult) {
	            result = resultSelector(state);
	            time = timeSelector(state);
	          }
	        } catch (e) {
	          observer.onError(e);
	          return;
	        }
	        if (hasResult) {
	          self(time);
	        } else {
	          observer.onCompleted();
	        }
	      });
	    });
	  };

	  /**
	   *  Time shifts the observable sequence by delaying the subscription.
	   *
	   * @example
	   *  1 - res = source.delaySubscription(5000); // 5s
	   *  2 - res = source.delaySubscription(5000, Rx.Scheduler.timeout); // 5 seconds
	   *
	   * @param {Number} dueTime Absolute or relative time to perform the subscription at.
	   * @param {Scheduler} [scheduler]  Scheduler to run the subscription delay timer on. If not specified, the timeout scheduler is used.
	   * @returns {Observable} Time-shifted sequence.
	   */
	  observableProto.delaySubscription = function (dueTime, scheduler) {
	    return this.delayWithSelector(observableTimer(dueTime, isScheduler(scheduler) ? scheduler : timeoutScheduler), observableEmpty);
	  };

	  /**
	   *  Time shifts the observable sequence based on a subscription delay and a delay selector function for each element.
	   *
	   * @example
	   *  1 - res = source.delayWithSelector(function (x) { return Rx.Scheduler.timer(5000); }); // with selector only
	   *  1 - res = source.delayWithSelector(Rx.Observable.timer(2000), function (x) { return Rx.Observable.timer(x); }); // with delay and selector
	   *
	   * @param {Observable} [subscriptionDelay]  Sequence indicating the delay for the subscription to the source.
	   * @param {Function} delayDurationSelector Selector function to retrieve a sequence indicating the delay for each given element.
	   * @returns {Observable} Time-shifted sequence.
	   */
	  observableProto.delayWithSelector = function (subscriptionDelay, delayDurationSelector) {
	      var source = this, subDelay, selector;
	      if (typeof subscriptionDelay === 'function') {
	        selector = subscriptionDelay;
	      } else {
	        subDelay = subscriptionDelay;
	        selector = delayDurationSelector;
	      }
	      return new AnonymousObservable(function (observer) {
	        var delays = new CompositeDisposable(), atEnd = false, done = function () {
	            if (atEnd && delays.length === 0) { observer.onCompleted(); }
	        }, subscription = new SerialDisposable(), start = function () {
	          subscription.setDisposable(source.subscribe(function (x) {
	              var delay;
	              try {
	                delay = selector(x);
	              } catch (error) {
	                observer.onError(error);
	                return;
	              }
	              var d = new SingleAssignmentDisposable();
	              delays.add(d);
	              d.setDisposable(delay.subscribe(function () {
	                observer.onNext(x);
	                delays.remove(d);
	                done();
	              }, observer.onError.bind(observer), function () {
	                observer.onNext(x);
	                delays.remove(d);
	                done();
	              }));
	          }, observer.onError.bind(observer), function () {
	            atEnd = true;
	            subscription.dispose();
	            done();
	          }));
	      };

	      if (!subDelay) {
	        start();
	      } else {
	        subscription.setDisposable(subDelay.subscribe(start, observer.onError.bind(observer), start));
	      }

	      return new CompositeDisposable(subscription, delays);
	    }, this);
	  };

	    /**
	     *  Returns the source observable sequence, switching to the other observable sequence if a timeout is signaled.
	     * @param {Observable} [firstTimeout]  Observable sequence that represents the timeout for the first element. If not provided, this defaults to Observable.never().
	     * @param {Function} timeoutDurationSelector Selector to retrieve an observable sequence that represents the timeout between the current element and the next element.
	     * @param {Observable} [other]  Sequence to return in case of a timeout. If not provided, this is set to Observable.throwException().
	     * @returns {Observable} The source sequence switching to the other sequence in case of a timeout.
	     */
	    observableProto.timeoutWithSelector = function (firstTimeout, timeoutdurationSelector, other) {
	      if (arguments.length === 1) {
	          timeoutdurationSelector = firstTimeout;
	          firstTimeout = observableNever();
	      }
	      other || (other = observableThrow(new Error('Timeout')));
	      var source = this;
	      return new AnonymousObservable(function (observer) {
	        var subscription = new SerialDisposable(), timer = new SerialDisposable(), original = new SingleAssignmentDisposable();

	        subscription.setDisposable(original);

	        var id = 0, switched = false;

	        function setTimer(timeout) {
	          var myId = id;

	          function timerWins () {
	            return id === myId;
	          }

	          var d = new SingleAssignmentDisposable();
	          timer.setDisposable(d);
	          d.setDisposable(timeout.subscribe(function () {
	            timerWins() && subscription.setDisposable(other.subscribe(observer));
	            d.dispose();
	          }, function (e) {
	            timerWins() && observer.onError(e);
	          }, function () {
	            timerWins() && subscription.setDisposable(other.subscribe(observer));
	          }));
	        };

	        setTimer(firstTimeout);

	        function observerWins() {
	          var res = !switched;
	          if (res) { id++; }
	          return res;
	        }

	        original.setDisposable(source.subscribe(function (x) {
	          if (observerWins()) {
	            observer.onNext(x);
	            var timeout;
	            try {
	              timeout = timeoutdurationSelector(x);
	            } catch (e) {
	              observer.onError(e);
	              return;
	            }
	            setTimer(isPromise(timeout) ? observableFromPromise(timeout) : timeout);
	          }
	        }, function (e) {
	          observerWins() && observer.onError(e);
	        }, function () {
	          observerWins() && observer.onCompleted();
	        }));
	        return new CompositeDisposable(subscription, timer);
	      }, source);
	    };

	  /**
	   * Ignores values from an observable sequence which are followed by another value within a computed throttle duration.
	   * @param {Function} durationSelector Selector function to retrieve a sequence indicating the throttle duration for each given element.
	   * @returns {Observable} The debounced sequence.
	   */
	  observableProto.debounceWithSelector = function (durationSelector) {
	    var source = this;
	    return new AnonymousObservable(function (observer) {
	      var value, hasValue = false, cancelable = new SerialDisposable(), id = 0;
	      var subscription = source.subscribe(function (x) {
	        var throttle;
	        try {
	          throttle = durationSelector(x);
	        } catch (e) {
	          observer.onError(e);
	          return;
	        }

	        isPromise(throttle) && (throttle = observableFromPromise(throttle));

	        hasValue = true;
	        value = x;
	        id++;
	        var currentid = id, d = new SingleAssignmentDisposable();
	        cancelable.setDisposable(d);
	        d.setDisposable(throttle.subscribe(function () {
	          hasValue && id === currentid && observer.onNext(value);
	          hasValue = false;
	          d.dispose();
	        }, observer.onError.bind(observer), function () {
	          hasValue && id === currentid && observer.onNext(value);
	          hasValue = false;
	          d.dispose();
	        }));
	      }, function (e) {
	        cancelable.dispose();
	        observer.onError(e);
	        hasValue = false;
	        id++;
	      }, function () {
	        cancelable.dispose();
	        hasValue && observer.onNext(value);
	        observer.onCompleted();
	        hasValue = false;
	        id++;
	      });
	      return new CompositeDisposable(subscription, cancelable);
	    }, source);
	  };

	  /**
	   * @deprecated use #debounceWithSelector instead.
	   */
	  observableProto.throttleWithSelector = function (durationSelector) {
	    //deprecate('throttleWithSelector', 'debounceWithSelector');
	    return this.debounceWithSelector(durationSelector);
	  };

	  /**
	   *  Skips elements for the specified duration from the end of the observable source sequence, using the specified scheduler to run timers.
	   *
	   *  1 - res = source.skipLastWithTime(5000);
	   *  2 - res = source.skipLastWithTime(5000, scheduler);
	   *
	   * @description
	   *  This operator accumulates a queue with a length enough to store elements received during the initial duration window.
	   *  As more elements are received, elements older than the specified duration are taken from the queue and produced on the
	   *  result sequence. This causes elements to be delayed with duration.
	   * @param {Number} duration Duration for skipping elements from the end of the sequence.
	   * @param {Scheduler} [scheduler]  Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout
	   * @returns {Observable} An observable sequence with the elements skipped during the specified duration from the end of the source sequence.
	   */
	  observableProto.skipLastWithTime = function (duration, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var q = [];
	      return source.subscribe(function (x) {
	        var now = scheduler.now();
	        q.push({ interval: now, value: x });
	        while (q.length > 0 && now - q[0].interval >= duration) {
	          o.onNext(q.shift().value);
	        }
	      }, function (e) { o.onError(e); }, function () {
	        var now = scheduler.now();
	        while (q.length > 0 && now - q[0].interval >= duration) {
	          o.onNext(q.shift().value);
	        }
	        o.onCompleted();
	      });
	    }, source);
	  };

	  /**
	   *  Returns elements within the specified duration from the end of the observable source sequence, using the specified schedulers to run timers and to drain the collected elements.
	   * @description
	   *  This operator accumulates a queue with a length enough to store elements received during the initial duration window.
	   *  As more elements are received, elements older than the specified duration are taken from the queue and produced on the
	   *  result sequence. This causes elements to be delayed with duration.
	   * @param {Number} duration Duration for taking elements from the end of the sequence.
	   * @param {Scheduler} [scheduler]  Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
	   * @returns {Observable} An observable sequence with the elements taken during the specified duration from the end of the source sequence.
	   */
	  observableProto.takeLastWithTime = function (duration, scheduler) {
	    var source = this;
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return new AnonymousObservable(function (o) {
	      var q = [];
	      return source.subscribe(function (x) {
	        var now = scheduler.now();
	        q.push({ interval: now, value: x });
	        while (q.length > 0 && now - q[0].interval >= duration) {
	          q.shift();
	        }
	      }, function (e) { o.onError(e); }, function () {
	        var now = scheduler.now();
	        while (q.length > 0) {
	          var next = q.shift();
	          if (now - next.interval <= duration) { o.onNext(next.value); }
	        }
	        o.onCompleted();
	      });
	    }, source);
	  };

	  /**
	   *  Returns an array with the elements within the specified duration from the end of the observable source sequence, using the specified scheduler to run timers.
	   * @description
	   *  This operator accumulates a queue with a length enough to store elements received during the initial duration window.
	   *  As more elements are received, elements older than the specified duration are taken from the queue and produced on the
	   *  result sequence. This causes elements to be delayed with duration.
	   * @param {Number} duration Duration for taking elements from the end of the sequence.
	   * @param {Scheduler} scheduler Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
	   * @returns {Observable} An observable sequence containing a single array with the elements taken during the specified duration from the end of the source sequence.
	   */
	  observableProto.takeLastBufferWithTime = function (duration, scheduler) {
	    var source = this;
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return new AnonymousObservable(function (o) {
	      var q = [];
	      return source.subscribe(function (x) {
	        var now = scheduler.now();
	        q.push({ interval: now, value: x });
	        while (q.length > 0 && now - q[0].interval >= duration) {
	          q.shift();
	        }
	      }, function (e) { o.onError(e); }, function () {
	        var now = scheduler.now(), res = [];
	        while (q.length > 0) {
	          var next = q.shift();
	          now - next.interval <= duration && res.push(next.value);
	        }
	        o.onNext(res);
	        o.onCompleted();
	      });
	    }, source);
	  };

	  /**
	   *  Takes elements for the specified duration from the start of the observable source sequence, using the specified scheduler to run timers.
	   *
	   * @example
	   *  1 - res = source.takeWithTime(5000,  [optional scheduler]);
	   * @description
	   *  This operator accumulates a queue with a length enough to store elements received during the initial duration window.
	   *  As more elements are received, elements older than the specified duration are taken from the queue and produced on the
	   *  result sequence. This causes elements to be delayed with duration.
	   * @param {Number} duration Duration for taking elements from the start of the sequence.
	   * @param {Scheduler} scheduler Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
	   * @returns {Observable} An observable sequence with the elements taken during the specified duration from the start of the source sequence.
	   */
	  observableProto.takeWithTime = function (duration, scheduler) {
	    var source = this;
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return new AnonymousObservable(function (o) {
	      return new CompositeDisposable(scheduler.scheduleWithRelative(duration, function () { o.onCompleted(); }), source.subscribe(o));
	    }, source);
	  };

	  /**
	   *  Skips elements for the specified duration from the start of the observable source sequence, using the specified scheduler to run timers.
	   *
	   * @example
	   *  1 - res = source.skipWithTime(5000, [optional scheduler]);
	   *
	   * @description
	   *  Specifying a zero value for duration doesn't guarantee no elements will be dropped from the start of the source sequence.
	   *  This is a side-effect of the asynchrony introduced by the scheduler, where the action that causes callbacks from the source sequence to be forwarded
	   *  may not execute immediately, despite the zero due time.
	   *
	   *  Errors produced by the source sequence are always forwarded to the result sequence, even if the error occurs before the duration.
	   * @param {Number} duration Duration for skipping elements from the start of the sequence.
	   * @param {Scheduler} scheduler Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
	   * @returns {Observable} An observable sequence with the elements skipped during the specified duration from the start of the source sequence.
	   */
	  observableProto.skipWithTime = function (duration, scheduler) {
	    var source = this;
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    return new AnonymousObservable(function (observer) {
	      var open = false;
	      return new CompositeDisposable(
	        scheduler.scheduleWithRelative(duration, function () { open = true; }),
	        source.subscribe(function (x) { open && observer.onNext(x); }, observer.onError.bind(observer), observer.onCompleted.bind(observer)));
	    }, source);
	  };

	  /**
	   *  Skips elements from the observable source sequence until the specified start time, using the specified scheduler to run timers.
	   *  Errors produced by the source sequence are always forwarded to the result sequence, even if the error occurs before the start time.
	   *
	   * @examples
	   *  1 - res = source.skipUntilWithTime(new Date(), [scheduler]);
	   *  2 - res = source.skipUntilWithTime(5000, [scheduler]);
	   * @param {Date|Number} startTime Time to start taking elements from the source sequence. If this value is less than or equal to Date(), no elements will be skipped.
	   * @param {Scheduler} [scheduler] Scheduler to run the timer on. If not specified, defaults to Rx.Scheduler.timeout.
	   * @returns {Observable} An observable sequence with the elements skipped until the specified start time.
	   */
	  observableProto.skipUntilWithTime = function (startTime, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    var source = this, schedulerMethod = startTime instanceof Date ?
	      'scheduleWithAbsolute' :
	      'scheduleWithRelative';
	    return new AnonymousObservable(function (o) {
	      var open = false;

	      return new CompositeDisposable(
	        scheduler[schedulerMethod](startTime, function () { open = true; }),
	        source.subscribe(
	          function (x) { open && o.onNext(x); },
	          function (e) { o.onError(e); }, function () { o.onCompleted(); }));
	    }, source);
	  };

	  /**
	   *  Takes elements for the specified duration until the specified end time, using the specified scheduler to run timers.
	   * @param {Number | Date} endTime Time to stop taking elements from the source sequence. If this value is less than or equal to new Date(), the result stream will complete immediately.
	   * @param {Scheduler} [scheduler] Scheduler to run the timer on.
	   * @returns {Observable} An observable sequence with the elements taken until the specified end time.
	   */
	  observableProto.takeUntilWithTime = function (endTime, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    var source = this, schedulerMethod = endTime instanceof Date ?
	      'scheduleWithAbsolute' :
	      'scheduleWithRelative';
	    return new AnonymousObservable(function (o) {
	      return new CompositeDisposable(
	        scheduler[schedulerMethod](endTime, function () { o.onCompleted(); }),
	        source.subscribe(o));
	    }, source);
	  };

	  /**
	   * Returns an Observable that emits only the first item emitted by the source Observable during sequential time windows of a specified duration.
	   * @param {Number} windowDuration time to wait before emitting another item after emitting the last item
	   * @param {Scheduler} [scheduler] the Scheduler to use internally to manage the timers that handle timeout for each item. If not provided, defaults to Scheduler.timeout.
	   * @returns {Observable} An Observable that performs the throttle operation.
	   */
	  observableProto.throttleFirst = function (windowDuration, scheduler) {
	    isScheduler(scheduler) || (scheduler = timeoutScheduler);
	    var duration = +windowDuration || 0;
	    if (duration <= 0) { throw new RangeError('windowDuration cannot be less or equal zero.'); }
	    var source = this;
	    return new AnonymousObservable(function (o) {
	      var lastOnNext = 0;
	      return source.subscribe(
	        function (x) {
	          var now = scheduler.now();
	          if (lastOnNext === 0 || now - lastOnNext >= duration) {
	            lastOnNext = now;
	            o.onNext(x);
	          }
	        },function (e) { o.onError(e); }, function () { o.onCompleted(); }
	      );
	    }, source);
	  };

	  /**
	   * Executes a transducer to transform the observable sequence
	   * @param {Transducer} transducer A transducer to execute
	   * @returns {Observable} An Observable sequence containing the results from the transducer.
	   */
	  observableProto.transduce = function(transducer) {
	    var source = this;

	    function transformForObserver(o) {
	      return {
	        '@@transducer/init': function() {
	          return o;
	        },
	        '@@transducer/step': function(obs, input) {
	          return obs.onNext(input);
	        },
	        '@@transducer/result': function(obs) {
	          return obs.onCompleted();
	        }
	      };
	    }

	    return new AnonymousObservable(function(o) {
	      var xform = transducer(transformForObserver(o));
	      return source.subscribe(
	        function(v) {
	          try {
	            xform['@@transducer/step'](o, v);
	          } catch (e) {
	            o.onError(e);
	          }
	        },
	        function (e) { o.onError(e); },
	        function() { xform['@@transducer/result'](o); }
	      );
	    }, source);
	  };

	  /*
	   * Performs a exclusive waiting for the first to finish before subscribing to another observable.
	   * Observables that come in between subscriptions will be dropped on the floor.
	   * @returns {Observable} A exclusive observable with only the results that happen when subscribed.
	   */
	  observableProto.exclusive = function () {
	    var sources = this;
	    return new AnonymousObservable(function (observer) {
	      var hasCurrent = false,
	        isStopped = false,
	        m = new SingleAssignmentDisposable(),
	        g = new CompositeDisposable();

	      g.add(m);

	      m.setDisposable(sources.subscribe(
	        function (innerSource) {
	          if (!hasCurrent) {
	            hasCurrent = true;

	            isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));

	            var innerSubscription = new SingleAssignmentDisposable();
	            g.add(innerSubscription);

	            innerSubscription.setDisposable(innerSource.subscribe(
	              observer.onNext.bind(observer),
	              observer.onError.bind(observer),
	              function () {
	                g.remove(innerSubscription);
	                hasCurrent = false;
	                if (isStopped && g.length === 1) {
	                  observer.onCompleted();
	                }
	            }));
	          }
	        },
	        observer.onError.bind(observer),
	        function () {
	          isStopped = true;
	          if (!hasCurrent && g.length === 1) {
	            observer.onCompleted();
	          }
	        }));

	      return g;
	    }, this);
	  };

	  /*
	   * Performs a exclusive map waiting for the first to finish before subscribing to another observable.
	   * Observables that come in between subscriptions will be dropped on the floor.
	   * @param {Function} selector Selector to invoke for every item in the current subscription.
	   * @param {Any} [thisArg] An optional context to invoke with the selector parameter.
	   * @returns {Observable} An exclusive observable with only the results that happen when subscribed.
	   */
	  observableProto.exclusiveMap = function (selector, thisArg) {
	    var sources = this,
	        selectorFunc = bindCallback(selector, thisArg, 3);
	    return new AnonymousObservable(function (observer) {
	      var index = 0,
	        hasCurrent = false,
	        isStopped = true,
	        m = new SingleAssignmentDisposable(),
	        g = new CompositeDisposable();

	      g.add(m);

	      m.setDisposable(sources.subscribe(
	        function (innerSource) {

	          if (!hasCurrent) {
	            hasCurrent = true;

	            innerSubscription = new SingleAssignmentDisposable();
	            g.add(innerSubscription);

	            isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));

	            innerSubscription.setDisposable(innerSource.subscribe(
	              function (x) {
	                var result;
	                try {
	                  result = selectorFunc(x, index++, innerSource);
	                } catch (e) {
	                  observer.onError(e);
	                  return;
	                }

	                observer.onNext(result);
	              },
	              function (e) { observer.onError(e); },
	              function () {
	                g.remove(innerSubscription);
	                hasCurrent = false;

	                if (isStopped && g.length === 1) {
	                  observer.onCompleted();
	                }
	              }));
	          }
	        },
	        function (e) { observer.onError(e); },
	        function () {
	          isStopped = true;
	          if (g.length === 1 && !hasCurrent) {
	            observer.onCompleted();
	          }
	        }));
	      return g;
	    }, this);
	  };

	  /** Provides a set of extension methods for virtual time scheduling. */
	  Rx.VirtualTimeScheduler = (function (__super__) {

	    function localNow() {
	      return this.toDateTimeOffset(this.clock);
	    }

	    function scheduleNow(state, action) {
	      return this.scheduleAbsoluteWithState(state, this.clock, action);
	    }

	    function scheduleRelative(state, dueTime, action) {
	      return this.scheduleRelativeWithState(state, this.toRelative(dueTime), action);
	    }

	    function scheduleAbsolute(state, dueTime, action) {
	      return this.scheduleRelativeWithState(state, this.toRelative(dueTime - this.now()), action);
	    }

	    function invokeAction(scheduler, action) {
	      action();
	      return disposableEmpty;
	    }

	    inherits(VirtualTimeScheduler, __super__);

	    /**
	     * Creates a new virtual time scheduler with the specified initial clock value and absolute time comparer.
	     *
	     * @constructor
	     * @param {Number} initialClock Initial value for the clock.
	     * @param {Function} comparer Comparer to determine causality of events based on absolute time.
	     */
	    function VirtualTimeScheduler(initialClock, comparer) {
	      this.clock = initialClock;
	      this.comparer = comparer;
	      this.isEnabled = false;
	      this.queue = new PriorityQueue(1024);
	      __super__.call(this, localNow, scheduleNow, scheduleRelative, scheduleAbsolute);
	    }

	    var VirtualTimeSchedulerPrototype = VirtualTimeScheduler.prototype;

	    /**
	     * Adds a relative time value to an absolute time value.
	     * @param {Number} absolute Absolute virtual time value.
	     * @param {Number} relative Relative virtual time value to add.
	     * @return {Number} Resulting absolute virtual time sum value.
	     */
	    VirtualTimeSchedulerPrototype.add = notImplemented;

	    /**
	     * Converts an absolute time to a number
	     * @param {Any} The absolute time.
	     * @returns {Number} The absolute time in ms
	     */
	    VirtualTimeSchedulerPrototype.toDateTimeOffset = notImplemented;

	    /**
	     * Converts the TimeSpan value to a relative virtual time value.
	     * @param {Number} timeSpan TimeSpan value to convert.
	     * @return {Number} Corresponding relative virtual time value.
	     */
	    VirtualTimeSchedulerPrototype.toRelative = notImplemented;

	    /**
	     * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be emulated using recursive scheduling.
	     * @param {Mixed} state Initial state passed to the action upon the first iteration.
	     * @param {Number} period Period for running the work periodically.
	     * @param {Function} action Action to be executed, potentially updating the state.
	     * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
	     */
	    VirtualTimeSchedulerPrototype.schedulePeriodicWithState = function (state, period, action) {
	      var s = new SchedulePeriodicRecursive(this, state, period, action);
	      return s.start();
	    };

	    /**
	     * Schedules an action to be executed after dueTime.
	     * @param {Mixed} state State passed to the action to be executed.
	     * @param {Number} dueTime Relative time after which to execute the action.
	     * @param {Function} action Action to be executed.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    VirtualTimeSchedulerPrototype.scheduleRelativeWithState = function (state, dueTime, action) {
	      var runAt = this.add(this.clock, dueTime);
	      return this.scheduleAbsoluteWithState(state, runAt, action);
	    };

	    /**
	     * Schedules an action to be executed at dueTime.
	     * @param {Number} dueTime Relative time after which to execute the action.
	     * @param {Function} action Action to be executed.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    VirtualTimeSchedulerPrototype.scheduleRelative = function (dueTime, action) {
	      return this.scheduleRelativeWithState(action, dueTime, invokeAction);
	    };

	    /**
	     * Starts the virtual time scheduler.
	     */
	    VirtualTimeSchedulerPrototype.start = function () {
	      if (!this.isEnabled) {
	        this.isEnabled = true;
	        do {
	          var next = this.getNext();
	          if (next !== null) {
	            this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
	            next.invoke();
	          } else {
	            this.isEnabled = false;
	          }
	        } while (this.isEnabled);
	      }
	    };

	    /**
	     * Stops the virtual time scheduler.
	     */
	    VirtualTimeSchedulerPrototype.stop = function () {
	      this.isEnabled = false;
	    };

	    /**
	     * Advances the scheduler's clock to the specified time, running all work till that point.
	     * @param {Number} time Absolute time to advance the scheduler's clock to.
	     */
	    VirtualTimeSchedulerPrototype.advanceTo = function (time) {
	      var dueToClock = this.comparer(this.clock, time);
	      if (this.comparer(this.clock, time) > 0) { throw new ArgumentOutOfRangeError(); }
	      if (dueToClock === 0) { return; }
	      if (!this.isEnabled) {
	        this.isEnabled = true;
	        do {
	          var next = this.getNext();
	          if (next !== null && this.comparer(next.dueTime, time) <= 0) {
	            this.comparer(next.dueTime, this.clock) > 0 && (this.clock = next.dueTime);
	            next.invoke();
	          } else {
	            this.isEnabled = false;
	          }
	        } while (this.isEnabled);
	        this.clock = time;
	      }
	    };

	    /**
	     * Advances the scheduler's clock by the specified relative time, running all work scheduled for that timespan.
	     * @param {Number} time Relative time to advance the scheduler's clock by.
	     */
	    VirtualTimeSchedulerPrototype.advanceBy = function (time) {
	      var dt = this.add(this.clock, time),
	          dueToClock = this.comparer(this.clock, dt);
	      if (dueToClock > 0) { throw new ArgumentOutOfRangeError(); }
	      if (dueToClock === 0) {  return; }

	      this.advanceTo(dt);
	    };

	    /**
	     * Advances the scheduler's clock by the specified relative time.
	     * @param {Number} time Relative time to advance the scheduler's clock by.
	     */
	    VirtualTimeSchedulerPrototype.sleep = function (time) {
	      var dt = this.add(this.clock, time);
	      if (this.comparer(this.clock, dt) >= 0) { throw new ArgumentOutOfRangeError(); }

	      this.clock = dt;
	    };

	    /**
	     * Gets the next scheduled item to be executed.
	     * @returns {ScheduledItem} The next scheduled item.
	     */
	    VirtualTimeSchedulerPrototype.getNext = function () {
	      while (this.queue.length > 0) {
	        var next = this.queue.peek();
	        if (next.isCancelled()) {
	          this.queue.dequeue();
	        } else {
	          return next;
	        }
	      }
	      return null;
	    };

	    /**
	     * Schedules an action to be executed at dueTime.
	     * @param {Scheduler} scheduler Scheduler to execute the action on.
	     * @param {Number} dueTime Absolute time at which to execute the action.
	     * @param {Function} action Action to be executed.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    VirtualTimeSchedulerPrototype.scheduleAbsolute = function (dueTime, action) {
	      return this.scheduleAbsoluteWithState(action, dueTime, invokeAction);
	    };

	    /**
	     * Schedules an action to be executed at dueTime.
	     * @param {Mixed} state State passed to the action to be executed.
	     * @param {Number} dueTime Absolute time at which to execute the action.
	     * @param {Function} action Action to be executed.
	     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
	     */
	    VirtualTimeSchedulerPrototype.scheduleAbsoluteWithState = function (state, dueTime, action) {
	      var self = this;

	      function run(scheduler, state1) {
	        self.queue.remove(si);
	        return action(scheduler, state1);
	      }

	      var si = new ScheduledItem(this, state, run, dueTime, this.comparer);
	      this.queue.enqueue(si);

	      return si.disposable;
	    };

	    return VirtualTimeScheduler;
	  }(Scheduler));

	  /** Provides a virtual time scheduler that uses Date for absolute time and number for relative time. */
	  Rx.HistoricalScheduler = (function (__super__) {
	    inherits(HistoricalScheduler, __super__);

	    /**
	     * Creates a new historical scheduler with the specified initial clock value.
	     * @constructor
	     * @param {Number} initialClock Initial value for the clock.
	     * @param {Function} comparer Comparer to determine causality of events based on absolute time.
	     */
	    function HistoricalScheduler(initialClock, comparer) {
	      var clock = initialClock == null ? 0 : initialClock;
	      var cmp = comparer || defaultSubComparer;
	      __super__.call(this, clock, cmp);
	    }

	    var HistoricalSchedulerProto = HistoricalScheduler.prototype;

	    /**
	     * Adds a relative time value to an absolute time value.
	     * @param {Number} absolute Absolute virtual time value.
	     * @param {Number} relative Relative virtual time value to add.
	     * @return {Number} Resulting absolute virtual time sum value.
	     */
	    HistoricalSchedulerProto.add = function (absolute, relative) {
	      return absolute + relative;
	    };

	    HistoricalSchedulerProto.toDateTimeOffset = function (absolute) {
	      return new Date(absolute).getTime();
	    };

	    /**
	     * Converts the TimeSpan value to a relative virtual time value.
	     * @memberOf HistoricalScheduler
	     * @param {Number} timeSpan TimeSpan value to convert.
	     * @return {Number} Corresponding relative virtual time value.
	     */
	    HistoricalSchedulerProto.toRelative = function (timeSpan) {
	      return timeSpan;
	    };

	    return HistoricalScheduler;
	  }(Rx.VirtualTimeScheduler));

	  var AnonymousObservable = Rx.AnonymousObservable = (function (__super__) {
	    inherits(AnonymousObservable, __super__);

	    // Fix subscriber to check for undefined or function returned to decorate as Disposable
	    function fixSubscriber(subscriber) {
	      return subscriber && isFunction(subscriber.dispose) ? subscriber :
	        isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
	    }

	    function setDisposable(s, state) {
	      var ado = state[0], subscribe = state[1];
	      var sub = tryCatch(subscribe)(ado);

	      if (sub === errorObj) {
	        if(!ado.fail(errorObj.e)) { return thrower(errorObj.e); }
	      }
	      ado.setDisposable(fixSubscriber(sub));
	    }

	    function AnonymousObservable(subscribe, parent) {
	      this.source = parent;

	      function s(observer) {
	        var ado = new AutoDetachObserver(observer), state = [ado, subscribe];

	        if (currentThreadScheduler.scheduleRequired()) {
	          currentThreadScheduler.scheduleWithState(state, setDisposable);
	        } else {
	          setDisposable(null, state);
	        }
	        return ado;
	      }

	      __super__.call(this, s);
	    }

	    return AnonymousObservable;

	  }(Observable));

	  var AutoDetachObserver = (function (__super__) {
	    inherits(AutoDetachObserver, __super__);

	    function AutoDetachObserver(observer) {
	      __super__.call(this);
	      this.observer = observer;
	      this.m = new SingleAssignmentDisposable();
	    }

	    var AutoDetachObserverPrototype = AutoDetachObserver.prototype;

	    AutoDetachObserverPrototype.next = function (value) {
	      var result = tryCatch(this.observer.onNext).call(this.observer, value);
	      if (result === errorObj) {
	        this.dispose();
	        thrower(result.e);
	      }
	    };

	    AutoDetachObserverPrototype.error = function (err) {
	      var result = tryCatch(this.observer.onError).call(this.observer, err);
	      this.dispose();
	      result === errorObj && thrower(result.e);
	    };

	    AutoDetachObserverPrototype.completed = function () {
	      var result = tryCatch(this.observer.onCompleted).call(this.observer);
	      this.dispose();
	      result === errorObj && thrower(result.e);
	    };

	    AutoDetachObserverPrototype.setDisposable = function (value) { this.m.setDisposable(value); };
	    AutoDetachObserverPrototype.getDisposable = function () { return this.m.getDisposable(); };

	    AutoDetachObserverPrototype.dispose = function () {
	      __super__.prototype.dispose.call(this);
	      this.m.dispose();
	    };

	    return AutoDetachObserver;
	  }(AbstractObserver));

	  var GroupedObservable = (function (__super__) {
	    inherits(GroupedObservable, __super__);

	    function subscribe(observer) {
	      return this.underlyingObservable.subscribe(observer);
	    }

	    function GroupedObservable(key, underlyingObservable, mergedDisposable) {
	      __super__.call(this, subscribe);
	      this.key = key;
	      this.underlyingObservable = !mergedDisposable ?
	        underlyingObservable :
	        new AnonymousObservable(function (observer) {
	          return new CompositeDisposable(mergedDisposable.getDisposable(), underlyingObservable.subscribe(observer));
	        });
	    }

	    return GroupedObservable;
	  }(Observable));

	  /**
	   *  Represents an object that is both an observable sequence as well as an observer.
	   *  Each notification is broadcasted to all subscribed observers.
	   */
	  var Subject = Rx.Subject = (function (__super__) {
	    function subscribe(observer) {
	      checkDisposed(this);
	      if (!this.isStopped) {
	        this.observers.push(observer);
	        return new InnerSubscription(this, observer);
	      }
	      if (this.hasError) {
	        observer.onError(this.error);
	        return disposableEmpty;
	      }
	      observer.onCompleted();
	      return disposableEmpty;
	    }

	    inherits(Subject, __super__);

	    /**
	     * Creates a subject.
	     */
	    function Subject() {
	      __super__.call(this, subscribe);
	      this.isDisposed = false,
	      this.isStopped = false,
	      this.observers = [];
	      this.hasError = false;
	    }

	    addProperties(Subject.prototype, Observer.prototype, {
	      /**
	       * Indicates whether the subject has observers subscribed to it.
	       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
	       */
	      hasObservers: function () { return this.observers.length > 0; },
	      /**
	       * Notifies all subscribed observers about the end of the sequence.
	       */
	      onCompleted: function () {
	        checkDisposed(this);
	        if (!this.isStopped) {
	          this.isStopped = true;
	          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	            os[i].onCompleted();
	          }

	          this.observers.length = 0;
	        }
	      },
	      /**
	       * Notifies all subscribed observers about the exception.
	       * @param {Mixed} error The exception to send to all observers.
	       */
	      onError: function (error) {
	        checkDisposed(this);
	        if (!this.isStopped) {
	          this.isStopped = true;
	          this.error = error;
	          this.hasError = true;
	          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	            os[i].onError(error);
	          }

	          this.observers.length = 0;
	        }
	      },
	      /**
	       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
	       * @param {Mixed} value The value to send to all observers.
	       */
	      onNext: function (value) {
	        checkDisposed(this);
	        if (!this.isStopped) {
	          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	            os[i].onNext(value);
	          }
	        }
	      },
	      /**
	       * Unsubscribe all observers and release resources.
	       */
	      dispose: function () {
	        this.isDisposed = true;
	        this.observers = null;
	      }
	    });

	    /**
	     * Creates a subject from the specified observer and observable.
	     * @param {Observer} observer The observer used to send messages to the subject.
	     * @param {Observable} observable The observable used to subscribe to messages sent from the subject.
	     * @returns {Subject} Subject implemented using the given observer and observable.
	     */
	    Subject.create = function (observer, observable) {
	      return new AnonymousSubject(observer, observable);
	    };

	    return Subject;
	  }(Observable));

	  /**
	   *  Represents the result of an asynchronous operation.
	   *  The last value before the OnCompleted notification, or the error received through OnError, is sent to all subscribed observers.
	   */
	  var AsyncSubject = Rx.AsyncSubject = (function (__super__) {

	    function subscribe(observer) {
	      checkDisposed(this);

	      if (!this.isStopped) {
	        this.observers.push(observer);
	        return new InnerSubscription(this, observer);
	      }

	      if (this.hasError) {
	        observer.onError(this.error);
	      } else if (this.hasValue) {
	        observer.onNext(this.value);
	        observer.onCompleted();
	      } else {
	        observer.onCompleted();
	      }

	      return disposableEmpty;
	    }

	    inherits(AsyncSubject, __super__);

	    /**
	     * Creates a subject that can only receive one value and that value is cached for all future observations.
	     * @constructor
	     */
	    function AsyncSubject() {
	      __super__.call(this, subscribe);

	      this.isDisposed = false;
	      this.isStopped = false;
	      this.hasValue = false;
	      this.observers = [];
	      this.hasError = false;
	    }

	    addProperties(AsyncSubject.prototype, Observer, {
	      /**
	       * Indicates whether the subject has observers subscribed to it.
	       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
	       */
	      hasObservers: function () {
	        checkDisposed(this);
	        return this.observers.length > 0;
	      },
	      /**
	       * Notifies all subscribed observers about the end of the sequence, also causing the last received value to be sent out (if any).
	       */
	      onCompleted: function () {
	        var i, len;
	        checkDisposed(this);
	        if (!this.isStopped) {
	          this.isStopped = true;
	          var os = cloneArray(this.observers), len = os.length;

	          if (this.hasValue) {
	            for (i = 0; i < len; i++) {
	              var o = os[i];
	              o.onNext(this.value);
	              o.onCompleted();
	            }
	          } else {
	            for (i = 0; i < len; i++) {
	              os[i].onCompleted();
	            }
	          }

	          this.observers.length = 0;
	        }
	      },
	      /**
	       * Notifies all subscribed observers about the error.
	       * @param {Mixed} error The Error to send to all observers.
	       */
	      onError: function (error) {
	        checkDisposed(this);
	        if (!this.isStopped) {
	          this.isStopped = true;
	          this.hasError = true;
	          this.error = error;

	          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
	            os[i].onError(error);
	          }

	          this.observers.length = 0;
	        }
	      },
	      /**
	       * Sends a value to the subject. The last value received before successful termination will be sent to all subscribed and future observers.
	       * @param {Mixed} value The value to store in the subject.
	       */
	      onNext: function (value) {
	        checkDisposed(this);
	        if (this.isStopped) { return; }
	        this.value = value;
	        this.hasValue = true;
	      },
	      /**
	       * Unsubscribe all observers and release resources.
	       */
	      dispose: function () {
	        this.isDisposed = true;
	        this.observers = null;
	        this.exception = null;
	        this.value = null;
	      }
	    });

	    return AsyncSubject;
	  }(Observable));

	  var AnonymousSubject = Rx.AnonymousSubject = (function (__super__) {
	    inherits(AnonymousSubject, __super__);

	    function subscribe(observer) {
	      return this.observable.subscribe(observer);
	    }

	    function AnonymousSubject(observer, observable) {
	      this.observer = observer;
	      this.observable = observable;
	      __super__.call(this, subscribe);
	    }

	    addProperties(AnonymousSubject.prototype, Observer.prototype, {
	      onCompleted: function () {
	        this.observer.onCompleted();
	      },
	      onError: function (error) {
	        this.observer.onError(error);
	      },
	      onNext: function (value) {
	        this.observer.onNext(value);
	      }
	    });

	    return AnonymousSubject;
	  }(Observable));

	  /**
	  * Used to pause and resume streams.
	  */
	  Rx.Pauser = (function (__super__) {
	    inherits(Pauser, __super__);

	    function Pauser() {
	      __super__.call(this);
	    }

	    /**
	     * Pauses the underlying sequence.
	     */
	    Pauser.prototype.pause = function () { this.onNext(false); };

	    /**
	    * Resumes the underlying sequence.
	    */
	    Pauser.prototype.resume = function () { this.onNext(true); };

	    return Pauser;
	  }(Subject));

	  if (true) {
	    root.Rx = Rx;

	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return Rx;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (freeExports && freeModule) {
	    // in Node.js or RingoJS
	    if (moduleExports) {
	      (freeModule.exports = Rx).Rx = Rx;
	    } else {
	      freeExports.Rx = Rx;
	    }
	  } else {
	    // in a browser or Rhino
	    root.Rx = Rx;
	  }

	  // All code before this point will be filtered from stack traces.
	  var rEndingLine = captureLine();

	}.call(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)(module), (function() { return this; }()), __webpack_require__(5)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root) {
		"use strict";
		var Tone;
		//constructs the main Tone object
		function MainModule(func){
			Tone = func();
		}
		//invokes each of the modules with the main Tone object as the argument
		function ToneModule(func){
			func(Tone);
		}

		/**
		 *  Tone.js
		 *  @author Yotam Mann
		 *  @license http://opensource.org/licenses/MIT MIT License
		 *  @copyright 2014-2015 Yotam Mann
		 */
		MainModule(function(){

			

			//////////////////////////////////////////////////////////////////////////
			//	WEB AUDIO CONTEXT
			///////////////////////////////////////////////////////////////////////////

			//borrowed from underscore.js
			function isUndef(val){
				return val === void 0;
			}

			//borrowed from underscore.js
			function isFunction(val){
				return typeof val === "function";
			}

			var audioContext;

			//polyfill for AudioContext and OfflineAudioContext
			if (isUndef(window.AudioContext)){
				window.AudioContext = window.webkitAudioContext;
			} 
			if (isUndef(window.OfflineAudioContext)){
				window.OfflineAudioContext = window.webkitOfflineAudioContext;
			} 

			if (!isUndef(AudioContext)){
				audioContext = new AudioContext();
			} else {
				throw new Error("Web Audio is not supported in this browser");
			}

			//SHIMS////////////////////////////////////////////////////////////////////

			if (!isFunction(AudioContext.prototype.createGain)){
				AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
			}
			if (!isFunction(AudioContext.prototype.createDelay)){
				AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
			}
			if (!isFunction(AudioContext.prototype.createPeriodicWave)){
				AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;
			}
			if (!isFunction(AudioBufferSourceNode.prototype.start)){
				AudioBufferSourceNode.prototype.start = AudioBufferSourceNode.prototype.noteGrainOn;
			}
			if (!isFunction(AudioBufferSourceNode.prototype.stop)){
				AudioBufferSourceNode.prototype.stop = AudioBufferSourceNode.prototype.noteOff;
			}
			if (!isFunction(OscillatorNode.prototype.start)){
				OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn;
			}
			if (!isFunction(OscillatorNode.prototype.stop)){
				OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff;	
			}
			if (!isFunction(OscillatorNode.prototype.setPeriodicWave)){
				OscillatorNode.prototype.setPeriodicWave = OscillatorNode.prototype.setWaveTable;	
			}
			//extend the connect function to include Tones
			AudioNode.prototype._nativeConnect = AudioNode.prototype.connect;
			AudioNode.prototype.connect = function(B, outNum, inNum){
				if (B.input){
					if (Array.isArray(B.input)){
						if (isUndef(inNum)){
							inNum = 0;
						}
						this.connect(B.input[inNum]);
					} else {
						this.connect(B.input, outNum, inNum);
					}
				} else {
					try {
						if (B instanceof AudioNode){
							this._nativeConnect(B, outNum, inNum);
						} else {
							this._nativeConnect(B, outNum);
						}
					} catch (e) {
						throw new Error("error connecting to node: "+B);
					}
				}
			};

			///////////////////////////////////////////////////////////////////////////
			//	TONE
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  @class  Tone is the base class of all other classes.  
			 *  
			 *  @constructor
			 *  @alias Tone
			 *  @param {number} [inputs=1] the number of input nodes
			 *  @param {number} [outputs=1] the number of output nodes
			 */
			var Tone = function(inputs, outputs){

				/**
				 *  the input node(s)
				 *  @type {GainNode|Array}
				 */
				if (isUndef(inputs) || inputs === 1){
					this.input = this.context.createGain();
				} else if (inputs > 1){
					this.input = new Array(inputs);
				}

				/**
				 *  the output node(s)
				 *  @type {GainNode|Array}
				 */
				if (isUndef(outputs) || outputs === 1){
					this.output = this.context.createGain();
				} else if (outputs > 1){
					this.output = new Array(inputs);
				}
			};

			/**
			 *  Set the parameters at once. Either pass in an
			 *  object mapping parameters to values, or to set a
			 *  single parameter, by passing in a string and value.
			 *  @example
			 *  //set values using an object
			 *  filter.set({
			 *  	"frequency" : 300,
			 *  	"type" : highpass
			 *  });
			 *  //or
			 *  filter.set("type", "highpass");
			 *  //ramp to the value 220 over 3 seconds. 
			 *  oscillator.set({
			 *  	"frequency" : 220
			 *  }, 3);
			 *  @param {Object|string} params
			 *  @param {number=} value
			 *  @param {Tone.Time=} rampTime
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.set = function(params, value, rampTime){
				if (typeof params === "object"){
					rampTime = value;
				} else if (typeof params === "string"){
					var tmpObj = {};
					tmpObj[params] = value;
					params = tmpObj;
				}
				for (var attr in params){
					var param = this[attr];
					if (isUndef(param)){
						continue;
					}
					value = params[attr];
					if (param instanceof Tone.Signal){
						if (param.value !== value){
							if (isUndef(rampTime)){
								param.value = value;
							} else {
								param.rampTo(value, rampTime);
							}
						}
					} else if (param instanceof AudioParam){
						if (param.value !== value){
							param.value = value;
						}				
					} else if (param instanceof Tone){
						param.set(value);
					} else if (param !== value){
						this[attr] = value;
					}
				}
				return this;
			};

			/**
			 *  Get the object's attributes. 
			 *  @example
			 *  osc.get();
			 *  //returns {"type" : "sine", "frequency" : 440, ...etc}
			 *  osc.get("type"); //returns { "type" : "sine"}
			 *  @param {Array=} params the parameters to get, otherwise will return 
			 *  					   all available.r
			 */
			Tone.prototype.get = function(params){
				if (isUndef(params)){
					params = this._collectDefaults(this.constructor);
				}
				var ret = {};
				for (var i = 0; i < params.length; i++){
					var attr = params[i];
					var param = this[attr];
					if (param instanceof Tone.Signal){
						ret[attr] = param.value;
					} else if (param instanceof AudioParam){
						ret[attr] = param.value;
					} else if (param instanceof Tone){
						ret[attr] = param.get();
					} else if (!isFunction(param) && !isUndef(param)){
						ret[attr] = param;
					} 
				}
				return ret;
			};

			/**
			 *  collect all of the default attributes in one
			 *  @private
			 *  @param {function} constr the constructor to find the defaults from
			 *  @return {Array} all of the attributes which belong to the class
			 */
			Tone.prototype._collectDefaults = function(constr){
				var ret = [];
				if (!isUndef(constr.defaults)){
					ret = Object.keys(constr.defaults);
				}
				if (!isUndef(constr._super)){
					ret = ret.concat(this._collectDefaults(constr._super));
				}
				return ret;
			};

			/**
			 *  Set the preset if it exists. 
			 *  @param {string} presetName the name of the preset
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.setPreset = function(presetName){
				if (!this.isUndef(this.preset) && this.preset.hasOwnProperty(presetName)){
					this.set(this.preset[presetName]);
				}
				return this;
			};

			///////////////////////////////////////////////////////////////////////////
			//	CLASS VARS
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  A static pointer to the audio context accessible as `Tone.context`. 
			 *  @type {AudioContext}
			 */
			Tone.context = audioContext;

			/**
			 *  The audio context.
			 *  @type {AudioContext}
			 */
			Tone.prototype.context = Tone.context;

			/**
			 *  the default buffer size
			 *  @type {number}
			 *  @static
			 *  @const
			 */
			Tone.prototype.bufferSize = 2048;

			/**
			 *  the delay time of a single buffer frame
			 *  @type {number}
			 *  @static
			 *  @const
			 */
			Tone.prototype.bufferTime = Tone.prototype.bufferSize / Tone.context.sampleRate;
			
			///////////////////////////////////////////////////////////////////////////
			//	CONNECTIONS
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  disconnect and dispose
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.dispose = function(){
				if (!this.isUndef(this.input)){
					if (this.input instanceof AudioNode){
						this.input.disconnect();
					} 
					this.input = null;
				}
				if (!this.isUndef(this.output)){
					if (this.output instanceof AudioNode){
						this.output.disconnect();
					} 
					this.output = null;
				}
				return this;
			};

			/**
			 *  a silent connection to the DesinationNode
			 *  which will ensure that anything connected to it
			 *  will not be garbage collected
			 *  
			 *  @private
			 */
			var _silentNode = null;

			/**
			 *  makes a connection to ensure that the node will not be garbage collected
			 *  until 'dispose' is explicitly called
			 *
			 *  use carefully. circumvents JS and WebAudio's normal Garbage Collection behavior
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.noGC = function(){
				this.output.connect(_silentNode);
				return this;
			};

			AudioNode.prototype.noGC = function(){
				this.connect(_silentNode);
				return this;
			};

			/**
			 *  connect the output of a ToneNode to an AudioParam, AudioNode, or ToneNode
			 *  @param  {Tone | AudioParam | AudioNode} unit 
			 *  @param {number} [outputNum=0] optionally which output to connect from
			 *  @param {number} [inputNum=0] optionally which input to connect to
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.connect = function(unit, outputNum, inputNum){
				if (Array.isArray(this.output)){
					outputNum = this.defaultArg(outputNum, 0);
					this.output[outputNum].connect(unit, 0, inputNum);
				} else {
					this.output.connect(unit, outputNum, inputNum);
				}
				return this;
			};

			/**
			 *  disconnect the output
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.disconnect = function(outputNum){
				if (Array.isArray(this.output)){
					outputNum = this.defaultArg(outputNum, 0);
					this.output[outputNum].disconnect();
				} else {
					this.output.disconnect();
				}
				return this;
			};

			/**
			 *  connect together all of the arguments in series
			 *  @param {...AudioParam|Tone|AudioNode}
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.connectSeries = function(){
				if (arguments.length > 1){
					var currentUnit = arguments[0];
					for (var i = 1; i < arguments.length; i++){
						var toUnit = arguments[i];
						currentUnit.connect(toUnit);
						currentUnit = toUnit;
					}
				}
				return this;
			};

			/**
			 *  fan out the connection from the first argument to the rest of the arguments
			 *  @param {...AudioParam|Tone|AudioNode}
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.connectParallel = function(){
				var connectFrom = arguments[0];
				if (arguments.length > 1){
					for (var i = 1; i < arguments.length; i++){
						var connectTo = arguments[i];
						connectFrom.connect(connectTo);
					}
				}
				return this;
			};

			/**
			 *  Connect the output of this node to the rest of the nodes in series.
			 *  @example
			 *  //connect a node to an effect, panVol and then to the master output
			 *  node.chain(effect, panVol, Tone.Master);
			 *  @param {...AudioParam|Tone|AudioNode} nodes
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.chain = function(){
				if (arguments.length > 0){
					var currentUnit = this;
					for (var i = 0; i < arguments.length; i++){
						var toUnit = arguments[i];
						currentUnit.connect(toUnit);
						currentUnit = toUnit;
					}
				}
				return this;
			};

			/**
			 *  connect the output of this node to the rest of the nodes in parallel.
			 *  @param {...AudioParam|Tone|AudioNode}
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.fan = function(){
				if (arguments.length > 0){
					for (var i = 0; i < arguments.length; i++){
						this.connect(arguments[i]);
					}
				}
				return this;
			};

			//give native nodes chain and fan methods
			AudioNode.prototype.chain = Tone.prototype.chain;
			AudioNode.prototype.fan = Tone.prototype.fan;

			///////////////////////////////////////////////////////////////////////////
			//	UTILITIES / HELPERS / MATHS
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  if a the given is undefined, use the fallback. 
			 *  if both given and fallback are objects, given
			 *  will be augmented with whatever properties it's
			 *  missing which are in fallback
			 *
			 *  warning: if object is self referential, it will go into an an 
			 *  infinite recursive loop. 
			 *  
			 *  @param  {*} given    
			 *  @param  {*} fallback 
			 *  @return {*}          
			 */
			Tone.prototype.defaultArg = function(given, fallback){
				if (typeof given === "object" && typeof fallback === "object"){
					var ret = {};
					//make a deep copy of the given object
					for (var givenProp in given) {
						ret[givenProp] = this.defaultArg(given[givenProp], given[givenProp]);
					}
					for (var prop in fallback) {
						ret[prop] = this.defaultArg(given[prop], fallback[prop]);
					}
					return ret;
				} else {
					return isUndef(given) ? fallback : given;
				}
			};

			/**
			 *  returns the args as an options object with given arguments
			 *  mapped to the names provided. 
			 *
			 *  if the args given is an array containing an object, it is assumed
			 *  that that's already the options object and will just return it. 
			 *  
			 *  @param  {Array} values  the 'arguments' object of the function
			 *  @param  {Array.<string>} keys the names of the arguments as they
			 *                                 should appear in the options object
			 *  @param {Object=} defaults optional defaults to mixin to the returned 
			 *                            options object                              
			 *  @return {Object}       the options object with the names mapped to the arguments
			 */
			Tone.prototype.optionsObject = function(values, keys, defaults){
				var options = {};
				if (values.length === 1 && typeof values[0] === "object"){
					options = values[0];
				} else {
					for (var i = 0; i < keys.length; i++){
						options[keys[i]] = values[i];
					}
				}
				if (!this.isUndef(defaults)){
					return this.defaultArg(options, defaults);
				} else {
					return options;
				}
			};

			/**
			 *  test if the arg is undefined
			 *  @param {*} arg the argument to test
			 *  @returns {boolean} true if the arg is undefined
			 *  @function
			 */
			Tone.prototype.isUndef = isUndef;

			/**
			 *  test if the arg is a function
			 *  @param {*} arg the argument to test
			 *  @returns {boolean} true if the arg is a function
			 *  @function
			 */
			Tone.prototype.isFunction = isFunction;

			/**
			 *  interpolate the input value (0-1) to be between outputMin and outputMax
			 *  @param  {number} input     
			 *  @param  {number} outputMin 
			 *  @param  {number} outputMax 
			 *  @return {number}           
			 */
			Tone.prototype.interpolate = function(input, outputMin, outputMax){
				return input*(outputMax - outputMin) + outputMin;
			};

			/**
			 *  normalize the input to 0-1 from between inputMin to inputMax
			 *  @param  {number} input    
			 *  @param  {number} inputMin 
			 *  @param  {number} inputMax 
			 *  @return {number}          
			 */
			Tone.prototype.normalize = function(input, inputMin, inputMax){
				//make sure that min < max
				if (inputMin > inputMax){
					var tmp = inputMax;
					inputMax = inputMin;
					inputMin = tmp;
				} else if (inputMin == inputMax){
					return 0;
				}
				return (input - inputMin) / (inputMax - inputMin);
			};

			///////////////////////////////////////////////////////////////////////////
			// GAIN CONVERSIONS
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  equal power gain scale
			 *  good for cross-fading
			 *  @param  {number} percent (0-1)
			 *  @return {number}         output gain (0-1)
			 */
			Tone.prototype.equalPowerScale = function(percent){
				var piFactor = 0.5 * Math.PI;
				return Math.sin(percent * piFactor);
			};

			/**
			 *  convert db scale to gain scale (0-1)
			 *  @param  {number} db
			 *  @return {number}   
			 */
			Tone.prototype.dbToGain = function(db) {
				return Math.pow(2, db / 6);
			};

			/**
			 *  convert gain scale to decibels
			 *  @param  {number} gain (0-1)
			 *  @return {number}   
			 */
			Tone.prototype.gainToDb = function(gain) {
				return  20 * (Math.log(gain) / Math.LN10);
			};

			///////////////////////////////////////////////////////////////////////////
			//	TIMING
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  @return {number} the currentTime from the AudioContext
			 */
			Tone.prototype.now = function(){
				return this.context.currentTime;
			};

			/**
			 *  convert a sample count to seconds
			 *  @param  {number} samples 
			 *  @return {number}         
			 */
			Tone.prototype.samplesToSeconds = function(samples){
				return samples / this.context.sampleRate;
			};

			/**
			 *  convert a time into samples
			 *  
			 *  @param  {Tone.time} time
			 *  @return {number}         
			 */
			Tone.prototype.toSamples = function(time){
				var seconds = this.toSeconds(time);
				return Math.round(seconds * this.context.sampleRate);
			};

			/**
			 *  convert time to seconds
			 *
			 *  this is a simplified version which only handles numbers and 
			 *  'now' relative numbers. If the Transport is included this 
			 *  method is overridden to include many other features including 
			 *  notationTime, Frequency, and transportTime
			 *  
			 *  @param  {number=} time 
			 *  @param {number=} now if passed in, this number will be 
			 *                       used for all 'now' relative timings
			 *  @return {number}   	seconds in the same timescale as the AudioContext
			 */
			Tone.prototype.toSeconds = function(time, now){
				now = this.defaultArg(now, this.now());
				if (typeof time === "number"){
					return time; //assuming that it's seconds
				} else if (typeof time === "string"){
					var plusTime = 0;
					if(time.charAt(0) === "+") {
						time = time.slice(1);	
						plusTime = now;			
					} 
					return parseFloat(time) + plusTime;
				} else {
					return now;
				}
			};

			///////////////////////////////////////////////////////////////////////////
			// FREQUENCY CONVERSION
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  true if the input is in the format number+hz
			 *  i.e.: 10hz
			 *
			 *  @param {number} freq 
			 *  @return {boolean} 
			 *  @function
			 */
			Tone.prototype.isFrequency = (function(){
				var freqFormat = new RegExp(/\d*\.?\d+hz$/i);
				return function(freq){
					return freqFormat.test(freq);
				};
			})();

			/**
			 *  Convert a frequency into seconds.
			 *  Accepts numbers and strings: i.e. `"10hz"` or 
			 *  `10` both return `0.1`. 
			 *  
			 *  @param  {number|string} freq 
			 *  @return {number}      
			 */
			Tone.prototype.frequencyToSeconds = function(freq){
				return 1 / parseFloat(freq);
			};

			/**
			 *  Convert a number in seconds to a frequency.
			 *  @param  {number} seconds 
			 *  @return {number}         
			 */
			Tone.prototype.secondsToFrequency = function(seconds){
				return 1/seconds;
			};

			///////////////////////////////////////////////////////////////////////////
			//	INHERITANCE
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  have a child inherit all of Tone's (or a parent's) prototype
			 *  to inherit the parent's properties, make sure to call 
			 *  Parent.call(this) in the child's constructor
			 *
			 *  based on closure library's inherit function
			 *
			 *  @static
			 *  @param  {function} 	child  
			 *  @param  {function=} parent (optional) parent to inherit from
			 *                             if no parent is supplied, the child
			 *                             will inherit from Tone
			 */
			Tone.extend = function(child, parent){
				if (isUndef(parent)){
					parent = Tone;
				}
				function TempConstructor(){}
				TempConstructor.prototype = parent.prototype;
				child.prototype = new TempConstructor();
				/** @override */
				child.prototype.constructor = child;
				child._super = parent;
			};

			///////////////////////////////////////////////////////////////////////////
			//	CONTEXT
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  array of callbacks to be invoked when a new context is added
			 *  @private 
			 *  @private
			 */
			var newContextCallbacks = [];

			/**
			 *  invoke this callback when a new context is added
			 *  will be invoked initially with the first context
			 *  @private 
			 *  @static
			 *  @param {function(AudioContext)} callback the callback to be invoked
			 *                                           with the audio context
			 */
			Tone._initAudioContext = function(callback){
				//invoke the callback with the existing AudioContext
				callback(Tone.context);
				//add it to the array
				newContextCallbacks.push(callback);
			};

			/**
			 *  Tone.js automatically creates a context on init, but if you are working
			 *  with other libraries which also create an AudioContext, it can be
			 *  useful to set your own. If you are going to set your own context, 
			 *  be sure to do it at the start of your code, before creating any objects.
			 *  @static
			 *  @param {AudioContext} ctx The new audio context to set
			 */
			Tone.setContext = function(ctx){
				//set the prototypes
				Tone.prototype.context = ctx;
				Tone.context = ctx;
				//invoke all the callbacks
				for (var i = 0; i < newContextCallbacks.length; i++){
					newContextCallbacks[i](ctx);
				}
			};

			/**
			 *  Bind this to a touchstart event to start the audio on mobile devices. 
			 *  <br>
			 *  http://stackoverflow.com/questions/12517000/no-sound-on-ios-6-web-audio-api/12569290#12569290
			 *  @static
			 */
			Tone.startMobile = function(){
				var osc = Tone.context.createOscillator();
				var silent = Tone.context.createGain();
				silent.gain.value = 0;
				osc.connect(silent);
				silent.connect(Tone.context.destination);
				var now = Tone.context.currentTime;
				osc.start(now);
				osc.stop(now+1);
			};

			//setup the context
			Tone._initAudioContext(function(audioContext){
				//set the bufferTime
				Tone.prototype.bufferTime = Tone.prototype.bufferSize / audioContext.sampleRate;
				_silentNode = audioContext.createGain();
				_silentNode.gain.value = 0;
				_silentNode.connect(audioContext.destination);
			});

			console.log("%c * Tone.js r4 * ", "background: #000; color: #fff");

			return Tone;
		});

		ToneModule( function(Tone){

			

			/**
			 *  @class  Base class for all Signals
			 *
			 *  @constructor
			 *  @extends {Tone}
			 */
			Tone.SignalBase = function(){

			};

			Tone.extend(Tone.SignalBase);

			/**
			 *  When signals connect to other signals or AudioParams, 
			 *  they take over the output value of that signal or AudioParam. 
			 *  For all other nodes, the behavior is the same as a normal `connect`. 
			 *
			 *  @override
			 *  @param {AudioParam|AudioNode|Tone.Signal|Tone} node 
			 *  @param {number} [outputNumber=0] 
			 *  @param {number} [inputNumber=0] 
			 *  @returns {Tone.SignalBase} `this`
			 */
			Tone.SignalBase.prototype.connect = function(node, outputNumber, inputNumber){
				//zero it out so that the signal can have full control
				if (node.constructor === Tone.Signal){
					//cancel changes
					node._value.cancelScheduledValues(0);
					//reset the value
					node._value.value = 0;
				} else if (node instanceof AudioParam){
					node.cancelScheduledValues(0);
					node.value = 0;
				} 
				Tone.prototype.connect.call(this, node, outputNumber, inputNumber);
				return this;
			};

			return Tone.SignalBase;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Wraps the WaveShaperNode
			 *
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @param {function(number, number)|Array|number} mapping the function used to define the values. 
			 *                                    The mapping function should take two arguments: 
			 *                                    the first is the value at the current position 
			 *                                    and the second is the array position. 
			 *                                    If the argument is an array, that array will be
			 *                                    set as the wave shapping function
			 *  @param {number} [bufferLen=1024] the length of the WaveShaperNode buffer.
			 *  @example
			 *  var timesTwo = new Tone.WaveShaper(function(val){
			 *  	return val * 2;
			 *  }, 2048);
			 */
			Tone.WaveShaper = function(mapping, bufferLen){

				/**
				 *  the waveshaper
				 *  @type {WaveShaperNode}
				 *  @private
				 */
				this._shaper = this.input = this.output = this.context.createWaveShaper();

				/**
				 *  the waveshapers curve
				 *  @type {Float32Array}
				 *  @private
				 */
				this._curve = null;

				if (Array.isArray(mapping)){
					this.curve = mapping;
				} else if (isFinite(mapping) || this.isUndef(mapping)){
					this._curve = new Float32Array(this.defaultArg(mapping, 1024));
				} else if (this.isFunction(mapping)){
					this._curve = new Float32Array(this.defaultArg(bufferLen, 1024));
					this.setMap(mapping);
				} 
			};

			Tone.extend(Tone.WaveShaper, Tone.SignalBase);

			/**
			 *  uses a mapping function to set the value of the curve
			 *  @param {function(number, number)} mapping the function used to define the values. 
			 *                                    The mapping function should take two arguments: 
			 *                                    the first is the value at the current position 
			 *                                    and the second is the array position
			 *  @returns {Tone.WaveShaper} `this`
			 */
			Tone.WaveShaper.prototype.setMap = function(mapping){
				for (var i = 0, len = this._curve.length; i < len; i++){
					var normalized = (i / (len)) * 2 - 1;
					this._curve[i] = mapping(normalized, i);
				}
				this._shaper.curve = this._curve;
				return this;
			};

			/**
			 * The array to set as the waveshaper curve
			 * @memberOf Tone.WaveShaper#
			 * @type {Array}
			 * @name curve
			 */
			Object.defineProperty(Tone.WaveShaper.prototype, "curve", {
				get : function(){
					return this._shaper.curve;
				},
				set : function(mapping){
					//fixes safari WaveShaperNode bug
					if (this._isSafari()){
						var first = mapping[0];
						mapping.unshift(first);	
					}
					this._curve = new Float32Array(mapping);
					this._shaper.curve = this._curve;
				}
			});

			/**
			 * The oversampling. Can either be "none", "2x" or "4x"
			 * @memberOf Tone.WaveShaper#
			 * @type {string}
			 * @name curve
			 */
			Object.defineProperty(Tone.WaveShaper.prototype, "oversample", {
				get : function(){
					return this._shaper.oversample;
				},
				set : function(oversampling){
					this._shaper.oversample = oversampling;
				}
			});

			/**
			 *  returns true if the browser is safari
			 *  @return  {boolean} 
			 *  @private
			 */
			Tone.WaveShaper.prototype._isSafari = function(){
				var ua = navigator.userAgent.toLowerCase(); 
				return ua.indexOf("safari") !== -1 && ua.indexOf("chrome") === -1;
			};

			/**
			 *  clean up
			 *  @returns {Tone.WaveShaper} `this`
			 */
			Tone.WaveShaper.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._shaper.disconnect();
				this._shaper = null;
				this._curve = null;
				return this;
			};

			return Tone.WaveShaper;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  Constant audio-rate signal.
			 *          Tone.Signal is a core component which allows for sample-accurate 
			 *          synchronization of many components. Tone.Signal can be scheduled 
			 *          with all of the functions available to AudioParams
			 *
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @param {number|AudioParam} [value=0] initial value or the AudioParam to control
			 *                                       note that the signal has no output
			 *                                       if an AudioParam is passed in.
			 *  @param {Tone.Signal.Unit} [units=Number] unit the units the signal is in
			 *  @example
			 *  var signal = new Tone.Signal(10);
			 */
			Tone.Signal = function(value, units){

				/**
				 * the units the signal is in
				 * @type {Tone.Signal.Type}
				 */
				this.units = this.defaultArg(units, Tone.Signal.Units.Number);

				/**
				 * The node where the constant signal value is scaled.
				 * @type {AudioParam}
				 * @private
				 */
				this.output = this._scaler = this.context.createGain();

				/**
				 * The node where the value is set.
				 * @type {AudioParam}
				 * @private
				 */
				this.input = this._value = this._scaler.gain;

				if (value instanceof AudioParam){
					this._scaler.connect(value);
					//zero out the value
					value.value = 0;
				} else {
					this.value = this.defaultArg(value, Tone.Signal.defaults.value);
				}

				//connect the constant 1 output to the node output
				Tone.Signal._constant.chain(this._scaler);
			};

			Tone.extend(Tone.Signal, Tone.SignalBase);

			/**
			 *  The default values
			 *  @type  {Object}
			 *  @static
			 *  @const
			 */
			Tone.Signal.defaults = {
				"value" : 0
			};

			/**
			 * The value of the signal. 
			 * @memberOf Tone.Signal#
			 * @type {Tone.Time|Tone.Frequency|number}
			 * @name value
			 */
			Object.defineProperty(Tone.Signal.prototype, "value", {
				get : function(){
					return this._toUnits(this._value.value);
				},
				set : function(value){
					var convertedVal = this._fromUnits(value);
					//is this what you want?
					this.cancelScheduledValues(0);
					this._value.value = convertedVal;
				}
			});

			/**
			 * @private
			 * @param  {Tone.Time|Tone.Volume|Tone.Frequency|number|undefined} val the value to convert
			 * @return {number}     the number which the value should be set to
			 */
			Tone.Signal.prototype._fromUnits = function(val){
				switch(this.units){
					case Tone.Signal.Units.Time: 
						return this.toSeconds(val);
					case Tone.Signal.Units.Frequency: 
						return this.toFrequency(val);
					case Tone.Signal.Units.Decibels: 
						return this.dbToGain(val);
					case Tone.Signal.Units.Normal: 
						return Math.min(Math.max(val, 0), 1);
					case Tone.Signal.Units.Audio: 
						return Math.min(Math.max(val, -1), 1);
					default:
						return val;
				}
			};

			/**
			 * convert to the desired units
			 * @private
			 * @param  {number} val the value to convert
			 * @return {number}
			 */
			Tone.Signal.prototype._toUnits = function(val){
				switch(this.units){
					case Tone.Signal.Units.Decibels: 
						return this.gainToDb(val);
					default:
						return val;
				}
			};

			/**
			 *  Schedules a parameter value change at the given time.
			 *  @param {number}		value 
			 *  @param {Tone.Time}  time 
			 *  @returns {Tone.Signal} `this`
			 */
			Tone.Signal.prototype.setValueAtTime = function(value, time){
				value = this._fromUnits(value);
				this._value.setValueAtTime(value, this.toSeconds(time));
				return this;
			};

			/**
			 *  Creates a schedule point with the current value at the current time.
			 *
			 *  @param {number=} now (optionally) pass the now value in
			 *  @returns {Tone.Signal} `this`
			 */
			Tone.Signal.prototype.setCurrentValueNow = function(now){
				now = this.defaultArg(now, this.now());
				var currentVal = this._value.value;
				this.cancelScheduledValues(now);
				this._value.setValueAtTime(currentVal, now);
				return this;
			};

			/**
			 *  Schedules a linear continuous change in parameter value from the 
			 *  previous scheduled parameter value to the given value.
			 *  
			 *  @param  {number} value   
			 *  @param  {Tone.Time} endTime 
			 *  @returns {Tone.Signal} `this`
			 */
			Tone.Signal.prototype.linearRampToValueAtTime = function(value, endTime){
				value = this._fromUnits(value);
				this._value.linearRampToValueAtTime(value, this.toSeconds(endTime));
				return this;
			};

			/**
			 *  Schedules an exponential continuous change in parameter value from 
			 *  the previous scheduled parameter value to the given value.
			 *  
			 *  @param  {number} value   
			 *  @param  {Tone.Time} endTime 
			 *  @returns {Tone.Signal} `this`
			 */
			Tone.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime){
				value = this._fromUnits(value);
				//can't go below a certain value
				value = Math.max(0.00001, value);
				this._value.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
				return this;
			};

			/**
			 *  Schedules an exponential continuous change in parameter value from 
			 *  the current time and current value to the given value.
			 *  
			 *  @param  {number} value   
			 *  @param  {Tone.Time} rampTime the time that it takes the 
			 *                               value to ramp from it's current value
			 *  @returns {Tone.Signal} `this`
			 *  @example
			 *  //exponentially ramp to the value 2 over 4 seconds. 
			 *  signal.exponentialRampToValueNow(2, 4);
			 */
			Tone.Signal.prototype.exponentialRampToValueNow = function(value, rampTime ){
				var now = this.now();
				this.setCurrentValueNow(now);
				this.exponentialRampToValueAtTime(value, now + this.toSeconds(rampTime ));
				return this;
			};

			/**
			 *  Schedules an linear continuous change in parameter value from 
			 *  the current time and current value to the given value at the given time.
			 *  
			 *  @param  {number} value   
			 *  @param  {Tone.Time} rampTime the time that it takes the 
			 *                               value to ramp from it's current value
			 *  @returns {Tone.Signal} `this`
			 *  @example
			 *  //linearly ramp to the value 4 over 3 seconds. 
			 *  signal.linearRampToValueNow(4, 3);
			 */
			Tone.Signal.prototype.linearRampToValueNow = function(value, rampTime){
				var now = this.now();
				this.setCurrentValueNow(now);
				this.linearRampToValueAtTime(value, now + this.toSeconds(rampTime));
				return this;
			};

			/**
			 *  Start exponentially approaching the target value at the given time with
			 *  a rate having the given time constant.
			 *  @param {number} value        
			 *  @param {Tone.Time} startTime    
			 *  @param {number} timeConstant 
			 *  @returns {Tone.Signal} `this`
			 */
			Tone.Signal.prototype.setTargetAtTime = function(value, startTime, timeConstant){
				value = this._fromUnits(value);
				this._value.setTargetAtTime(value, this.toSeconds(startTime), timeConstant);
				return this;
			};

			/**
			 *  Sets an array of arbitrary parameter values starting at the given time
			 *  for the given duration.
			 *  	
			 *  @param {Array<number>} values    
			 *  @param {Tone.Time} startTime 
			 *  @param {Tone.Time} duration  
			 *  @returns {Tone.Signal} `this`
			 */
			Tone.Signal.prototype.setValueCurveAtTime = function(values, startTime, duration){
				for (var i = 0; i < values.length; i++){
					values[i] = this._fromUnits(values[i]);
				}
				this._value.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
				return this;
			};

			/**
			 *  Cancels all scheduled parameter changes with times greater than or 
			 *  equal to startTime.
			 *  
			 *  @param  {Tone.Time} startTime
			 *  @returns {Tone.Signal} `this`
			 */
			Tone.Signal.prototype.cancelScheduledValues = function(startTime){
				this._value.cancelScheduledValues(this.toSeconds(startTime));
				return this;
			};

			/**
			 *  Ramps to the given value over the duration of the rampTime. 
			 *  Automatically selects the best ramp type (exponential or linear)
			 *  depending on the `units` of the signal
			 *  
			 *  @param  {number} value   
			 *  @param  {Tone.Time} rampTime the time that it takes the 
			 *                               value to ramp from it's current value
			 *  @returns {Tone.Signal} `this`
			 *  @example
			 *  //ramp to the value either linearly or exponentially 
			 *  //depending on the "units" value of the signal
			 *  signal.rampTo(0, 10);
			 */
			Tone.Signal.prototype.rampTo = function(value, rampTime){
				rampTime = this.defaultArg(rampTime, 0);
				if (this.units === Tone.Signal.Units.Frequency || this.units === Tone.Signal.Units.BPM){
					this.exponentialRampToValueNow(value, rampTime);
				} else {
					this.linearRampToValueNow(value, rampTime);
				}
				return this;
			};

			/**
			 *  dispose and disconnect
			 *  @returns {Tone.Signal} `this`
			 */
			Tone.Signal.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._value = null;
				this._scaler = null;
				return this;
			};

			/**
			 * The units the Signal is in
			 * @enum {string}
			 */
			Tone.Signal.Units = {
				/** The default type. */
				Number : "number",
				/** Tone.Time will be converted into seconds. */
				Time : "time",
				/** Tone.Frequency will be converted into hertz. */
				Frequency : "frequency",
				/** A Gain value. */
				Gain : "gain",
				/** Within normal range [0,1]. */
				Normal : "normal",
				/** Within normal range [-1,1]. */
				Audio : "audio",
				/** In decibels. */
				Decibels : "db",
				/** In half-step increments, i.e. 12 is an octave above the root. */
				Interval : "interval",
				/** Beats per minute. */
				BPM : "bpm"
			};

			///////////////////////////////////////////////////////////////////////////
			//	STATIC
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  the constant signal generator
			 *  @static
			 *  @private
			 *  @const
			 *  @type {OscillatorNode}
			 */
			Tone.Signal._generator = null;

			/**
			 *  the signal generator waveshaper. makes the incoming signal
			 *  only output 1 for all inputs.
			 *  @static
			 *  @private
			 *  @const
			 *  @type {Tone.WaveShaper}
			 */
			Tone.Signal._constant = null;

			/**
			 *  initializer function
			 */
			Tone._initAudioContext(function(audioContext){
				Tone.Signal._generator = audioContext.createOscillator();
				Tone.Signal._constant = new Tone.WaveShaper([1,1]);
				Tone.Signal._generator.connect(Tone.Signal._constant);
				Tone.Signal._generator.start(0);
				Tone.Signal._generator.noGC();
			});

			return Tone.Signal;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Pow applies an exponent to the incoming signal. The incoming signal
			 *         must be in the range -1,1
			 *
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @param {number} exp the exponent to apply to the incoming signal, must be at least 2. 
			 *  @example
			 *  var pow = new Tone.Pow(2);
			 *  var sig = new Tone.Signal(0.5).connect(pow);
			 *  //output of pow is 0.25. 
			 */
			Tone.Pow = function(exp){

				/**
				 * the exponent
				 * @private
				 * @type {number}
				 */
				this._exp = this.defaultArg(exp, 1);

				/**
				 *  @type {WaveShaperNode}
				 *  @private
				 */
				this._expScaler = this.input = this.output = new Tone.WaveShaper(this._expFunc(this._exp), 8192);
			};

			Tone.extend(Tone.Pow, Tone.SignalBase);

			/**
			 * The value of the exponent
			 * @memberOf Tone.Pow#
			 * @type {number}
			 * @name value
			 */
			Object.defineProperty(Tone.Pow.prototype, "value", {
				get : function(){
					return this._exp;
				},
				set : function(exp){
					this._exp = exp;
					this._expScaler.setMap(this._expFunc(this._exp));
				}
			});


			/**
			 *  the function which maps the waveshaper
			 *  @param   {number} exp
			 *  @return {function}
			 *  @private
			 */
			Tone.Pow.prototype._expFunc = function(exp){
				return function(val){
					return Math.pow(Math.abs(val), exp);
				};
			};

			/**
			 *  clean up
			 *  @returns {Tone.Pow} `this`
			 */
			Tone.Pow.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._expScaler.dispose();
				this._expScaler = null;
				return this;
			};

			return Tone.Pow;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  ADSR envelope generator attaches to an AudioParam or Signal. 
			 *
			 *  @constructor
			 *  @extends {Tone}
			 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
			 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
			 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
			 *  @param {Tone.Time} [release=1]	the release time in seconds
			 *  @example
			 *  var gainNode = Tone.context.createGain();
			 *  var env = new Tone.Envelope({
			 *  	"attack" : 0.1,
			 *  	"decay" : 0.2,
			 *  	"sustain" : 1,
			 *  	"release" : 0.8,
			 *  });
			 *  env.connect(gainNode.gain);
			 */
			Tone.Envelope = function(){

				//get all of the defaults
				var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);

				/** 
				 *  The attack time
				 *  @type {Tone.Time}
				 */
				this.attack = options.attack;

				/**
				 *  The decay time
				 *  @type {Tone.Time}
				 */
				this.decay = options.decay;
				
				/**
				 *  the sustain is a value between 0-1
				 *  @type {number}
				 */
				this.sustain = options.sustain;

				/**
				 *  The release time
				 *  @type {Tone.Time}
				 */
				this.release = options.release;

				/**
				 *  the signal
				 *  @type {Tone.Signal}
				 *  @private
				 */
				this._sig = this.output = new Tone.Signal(0);
			};

			Tone.extend(Tone.Envelope);

			/**
			 *  the default parameters
			 *  @static
			 *  @const
			 */
			Tone.Envelope.defaults = {
				"attack" : 0.01,
				"decay" : 0.1,
				"sustain" : 0.5,
				"release" : 1,
			};

			/**
			 *  the envelope time multipler
			 *  @type {number}
			 *  @private
			 */
			Tone.Envelope.prototype._timeMult = 0.25;

			/**
			 *  Trigger the attack/decay portion of the ADSR envelope. 
			 *  @param  {Tone.Time} [time=now]
			 *  @param {number} [velocity=1] the velocity of the envelope scales the vales.
			 *                               number between 0-1
			 *  @returns {Tone.Envelope} `this`
			 *  @example
			 *  //trigger the attack 0.5 seconds from now with a velocity of 0.2
			 *  env.triggerAttack("+0.5", 0.2);
			 */
			Tone.Envelope.prototype.triggerAttack = function(time, velocity){
				velocity = this.defaultArg(velocity, 1);
				var attack = this.toSeconds(this.attack);
				var decay = this.toSeconds(this.decay);
				var scaledMax = velocity;
				var sustainVal = this.sustain * scaledMax;
				time = this.toSeconds(time);
				this._sig.cancelScheduledValues(time);
				this._sig.setTargetAtTime(scaledMax, time, attack * this._timeMult);
				this._sig.setTargetAtTime(sustainVal, time + attack, decay * this._timeMult);	
				return this;
			};
			
			/**
			 *  Triggers the release of the envelope.
			 *  @param  {Tone.Time} [time=now]
			 *  @returns {Tone.Envelope} `this`
			 *  @example
			 *  //trigger release immediately
			 *  env.triggerRelease();
			 */
			Tone.Envelope.prototype.triggerRelease = function(time){
				time = this.toSeconds(time);
				this._sig.cancelScheduledValues(time);
				var release = this.toSeconds(this.release);
				this._sig.setTargetAtTime(0, time, release * this._timeMult);
				return this;
			};

			/**
			 *  Trigger the attack and release after a sustain time
			 *  @param {Tone.Time} duration the duration of the note
			 *  @param {Tone.Time} [time=now] the time of the attack
			 *  @param {number} [velocity=1] the velocity of the note
			 *  @returns {Tone.Envelope} `this`
			 *  @example
			 *  //trigger the attack and then the release after 0.6 seconds.
			 *  env.triggerAttackRelease(0.6);
			 */
			Tone.Envelope.prototype.triggerAttackRelease = function(duration, time, velocity) {
				time = this.toSeconds(time);
				this.triggerAttack(time, velocity);
				this.triggerRelease(time + this.toSeconds(duration));
				return this;
			};

			/**
			 *  Borrows the connect method from {@link Tone.Signal}
			 *  @function
			 */
			Tone.Envelope.prototype.connect = Tone.Signal.prototype.connect;

			/**
			 *  disconnect and dispose
			 *  @returns {Tone.Envelope} `this`
			 */
			Tone.Envelope.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._sig.dispose();
				this._sig = null;
				return this;
			};

			return Tone.Envelope;
		});

		ToneModule( function(Tone){

			

			/**
			 *  @class  An Envelope connected to a gain node which can be used as an amplitude envelope.
			 *  
			 *  @constructor
			 *  @extends {Tone.Envelope}
			 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
			 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
			 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
			 *  @param {Tone.Time} [release=1]	the release time in seconds
			 *  @example
			 *  
			 *  var ampEnv = new Tone.AmplitudeEnvelope(0.1, 0.2, 1, 0.8);
			 *  var osc = new Tone.Oscillator();
			 *  //or with an object
			 *  osc.chain(ampEnv, Tone.Master);
			 */
			Tone.AmplitudeEnvelope = function(){

				Tone.Envelope.apply(this, arguments);

				/**
				 *  the input node
				 *  @type {GainNode}
				 *  @private
				 */
				this.input = this.output = this.context.createGain();

				this._sig.connect(this.output.gain);
			};

			Tone.extend(Tone.AmplitudeEnvelope, Tone.Envelope);

			return Tone.AmplitudeEnvelope;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class A thin wrapper around the DynamicsCompressorNode
			 *
			 *  @extends {Tone}
			 *  @constructor
			 *  @param {number} [threshold=-24] threshold in decibels
			 *  @param {number} [ratio=12] gain reduction ratio
			 *  @example
			 *  var comp = new Tone.Compressor(-30, 3);
			 */
			Tone.Compressor = function(){

				var options = this.optionsObject(arguments, ["threshold", "ratio"], Tone.Compressor.defaults);

				/**
				 *  the compressor node
				 *  @type {DynamicsCompressorNode}
				 *  @private
				 */
				this._compressor = this.context.createDynamicsCompressor();

				/**
				 *  the input and output
				 */
				this.input = this.output = this._compressor;

				/**
				 *  the threshold vaue
				 *  @type {AudioParam}
				 */
				this.threshold = this._compressor.threshold;

				/**
				 *  The attack parameter
				 *  @type {Tone.Signal}
				 */
				this.attack = new Tone.Signal(this._compressor.attack, Tone.Signal.Units.Time);

				/**
				 *  The release parameter
				 *  @type {Tone.Signal}
				 */
				this.release = new Tone.Signal(this._compressor.release, Tone.Signal.Units.Time);

				/**
				 *  The knee parameter
				 *  @type {AudioParam}
				 */
				this.knee = this._compressor.knee;

				/**
				 *  The ratio value
				 *  @type {AudioParam}
				 */
				this.ratio = this._compressor.ratio;

				//set the defaults
				this.set(options);
			};

			Tone.extend(Tone.Compressor);

			/**
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.Compressor.defaults = {
				"ratio" : 12,
				"threshold" : -24,
				"release" : 0.25,
				"attack" : 0.003,
				"knee" : 30
			};

			/**
			 *  clean up
			 *  @returns {Tone.Compressor} `this`
			 */
			Tone.Compressor.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._compressor.disconnect();
				this._compressor = null;
				this.attack.dispose();
				this.attack = null;
				this.release.dispose();
				this.release = null;
				this.threshold = null;
				this.ratio = null;
				this.knee = null;
				return this;
			};

			return Tone.Compressor;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Add a signal and a number or two signals. <br><br>
			 *         input 0: augend. input 1: addend. <br><br>
			 *         Add can be used in two ways, either constructed with a value,
			 *         or constructed with no initial value and with signals connected
			 *         to each of its two inputs. 
			 *
			 *  @constructor
			 *  @extends {Tone.Signal}
			 *  @param {number=} value if no value is provided, Tone.Add will sum the first
			 *                         and second inputs. 
			 *  @example
			 *  var signal = new Tone.Signal(2);
			 *  var add = new Tone.Add(2);
			 *  signal.connect(add);
			 *  //the output of add equals 4
			 *
			 *  //if constructed with no arguments
			 *  //it will add the first and second inputs
			 *  var add = new Tone.Add();
			 *  var sig0 = new Tone.Signal(3).connect(add, 0, 0);
			 *  var sig1 = new Tone.Signal(4).connect(add, 0, 1);
			 *  //the output of add equals 7. 
			 */
			Tone.Add = function(value){

				Tone.call(this, 2, 0);

				/**
				 *  the summing node
				 *  @type {GainNode}
				 *  @private
				 */
				this._sum = this.input[0] = this.input[1] = this.output = this.context.createGain();

				/**
				 *  @private
				 *  @type {Tone.Signal}
				 */
				this._value = this.input[1] = new Tone.Signal(value);

				this._value.connect(this._sum);
			};

			Tone.extend(Tone.Add, Tone.Signal);
			
			/**
			 *  dispose method
			 *  @returns {Tone.Add} `this`
			 */
			Tone.Add.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._sum.disconnect();
				this._sum = null;
				this._value.dispose();
				this._value = null;
				return this;
			}; 

			return Tone.Add;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  Multiply the incoming signal by a number or Multiply two signals.
			 *          input 0: multiplicand.
			 *          input 1: multiplier.
			 *
			 *  @constructor
			 *  @extends {Tone.Signal}
			 *  @param {number=} value constant value to multiple. if no value is provided
			 *                         it will be multiplied by the value of input 1.
			 *  @example
			 *  var mult = new Tone.Multiply(3);
			 *  var sig = new Tone.Signal(2).connect(mult);
			 *  //output of mult is 6. 
			 */
			Tone.Multiply = function(value){

				Tone.call(this, 2, 0);

				/**
				 *  the input node is the same as the output node
				 *  it is also the GainNode which handles the scaling of incoming signal
				 *  
				 *  @type {GainNode}
				 *  @private
				 */
				this._mult = this.input[0] = this.output = this.context.createGain();

				/**
				 *  the scaling parameter
				 *  @type {AudioParam}
				 *  @private
				 */
				this._value = this.input[1] = this.output.gain;
				
				this._value.value = this.defaultArg(value, 0);
			};

			Tone.extend(Tone.Multiply, Tone.Signal);

			/**
			 *  clean up
			 *  @returns {Tone.Multiply} `this`
			 */
			Tone.Multiply.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._mult = null;
				this._value = null;
				return this;
			}; 

			return Tone.Multiply;
		});

		ToneModule( function(Tone){

			

			/**
			 *  @class Negate the incoming signal. i.e. an input signal of 10 will output -10
			 *
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @example
			 *  var neg = new Tone.Negate();
			 *  var sig = new Tone.Signal(-2).connect(neg);
			 *  //output of neg is positive 2. 
			 */
			Tone.Negate = function(){
				/**
				 *  negation is done by multiplying by -1
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._multiply = this.input = this.output= new Tone.Multiply(-1);
			};

			Tone.extend(Tone.Negate, Tone.SignalBase);

			/**
			 *  clean up
			 *  @returns {Tone.Negate} `this`
			 */
			Tone.Negate.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._multiply.dispose();
				this._multiply = null;
				return this;
			}; 

			return Tone.Negate;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Subtract a signal and a number or two signals. 
			 *         input 0 : minuend.
			 *         input 1 : subtrahend
			 *
			 *  @extends {Tone.Signal}
			 *  @constructor
			 *  @param {number=} value value to subtract from the incoming signal. If the value
			 *                         is omitted, it will subtract the second signal from the first
			 *  @example
			 *  var sub = new Tone.Subtract(1);
			 *  var sig = new Tone.Signal(4).connect(sub);
			 *  //the output of sub is 3. 
			 */
			Tone.Subtract = function(value){

				Tone.call(this, 2, 0);

				/**
				 *  the summing node
				 *  @type {GainNode}
				 *  @private
				 */
				this._sum = this.input[0] = this.output = this.context.createGain();

				/**
				 *  negate the input of the second input before connecting it
				 *  to the summing node.
				 *  @type {Tone.Negate}
				 *  @private
				 */
				this._neg = new Tone.Negate();

				/**
				 *  the node where the value is set
				 *  @private
				 *  @type {Tone.Signal}
				 */
				this._value = this.input[1] = new Tone.Signal(value);

				this._value.chain(this._neg, this._sum);
			};

			Tone.extend(Tone.Subtract, Tone.Signal);

			/**
			 *  clean up
			 *  @returns {Tone.SignalBase} `this`
			 */
			Tone.Subtract.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._neg.dispose();
				this._neg = null;
				this._sum.disconnect();
				this._sum = null;
				this._value.dispose();
				this._value = null;
				return this;
			};

			return Tone.Subtract;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  GreaterThanZero outputs 1 when the input is strictly greater than zero
			 *  
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @example
			 *  var gt0 = new Tone.GreaterThanZero();
			 *  var sig = new Tone.Signal(0.01).connect(gt0);
			 *  //the output of gt0 is 1. 
			 *  sig.value = 0;
			 *  //the output of gt0 is 0. 
			 */
			Tone.GreaterThanZero = function(){
				
				/**
				 *  @type {Tone.WaveShaper}
				 *  @private
				 */
				this._thresh = this.output = new Tone.WaveShaper(function(val){
					if (val <= 0){
						return 0;
					} else {
						return 1;
					}
				});

				/**
				 *  scale the first thresholded signal by a large value.
				 *  this will help with values which are very close to 0
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._scale = this.input = new Tone.Multiply(10000);

				//connections
				this._scale.connect(this._thresh);
			};

			Tone.extend(Tone.GreaterThanZero, Tone.SignalBase);

			/**
			 *  dispose method
			 *  @returns {Tone.GreaterThanZero} `this`
			 */
			Tone.GreaterThanZero.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._scale.dispose();
				this._scale = null;
				this._thresh.dispose();
				this._thresh = null;
				return this;
			};

			return Tone.GreaterThanZero;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  EqualZero outputs 1 when the input is strictly greater than zero
			 *  
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @example
			 *  var eq0 = new Tone.EqualZero();
			 *  var sig = new Tone.Signal(0).connect(eq0);
			 *  //the output of eq0 is 1. 
			 */
			Tone.EqualZero = function(){

				/**
				 *  scale the incoming signal by a large factor
				 *  @private
				 *  @type {Tone.Multiply}
				 */
				this._scale = this.input = new Tone.Multiply(10000);
				
				/**
				 *  @type {Tone.WaveShaper}
				 *  @private
				 */
				this._thresh = new Tone.WaveShaper(function(val){
					if (val === 0){
						return 1;
					} else {
						return 0;
					}
				}, 128);

				/**
				 *  threshold the output so that it's 0 or 1
				 *  @type {Tone.GreaterThanZero}
				 *  @private
				 */
				this._gtz = this.output = new Tone.GreaterThanZero();

				//connections
				this._scale.chain(this._thresh, this._gtz);
			};

			Tone.extend(Tone.EqualZero, Tone.SignalBase);

			/**
			 *  dispose method
			 *  @returns {Tone.EqualZero} `this`
			 */
			Tone.EqualZero.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._gtz.dispose();
				this._gtz = null;
				this._scale.dispose();
				this._scale = null;
				this._thresh.dispose();
				this._thresh = null;
				return this;
			};

			return Tone.EqualZero;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  Output 1 if the signal is equal to the value, otherwise outputs 0. 
			 *          Can accept two signals if connected to inputs 0 and 1.
			 *  
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @param {number} value the number to compare the incoming signal to
			 *  @example
			 *  var eq = new Tone.Equal(3);
			 *  var sig = new Tone.Signal(3).connect(eq);
			 *  //the output of eq is 1. 
			 */
			Tone.Equal = function(value){

				Tone.call(this, 2, 0);

				/**
				 *  subtract the value from the incoming signal
				 *  
				 *  @type {Tone.Add}
				 *  @private
				 */
				this._sub = this.input[0] = new Tone.Subtract(value);

				/**
				 *  @type {Tone.EqualZero}
				 *  @private
				 */
				this._equals = this.output = new Tone.EqualZero();

				this._sub.connect(this._equals);
				this.input[1] = this._sub.input[1];
			};

			Tone.extend(Tone.Equal, Tone.SignalBase);

			/**
			 * The value to compare to the incoming signal.
			 * @memberOf Tone.Equal#
			 * @type {number}
			 * @name value
			 */
			Object.defineProperty(Tone.Equal.prototype, "value", {
				get : function(){
					return this._sub.value;
				},
				set : function(value){
					this._sub.value = value;
				}
			});

			/**
			 *  dispose method
			 *  @returns {Tone.Equal} `this`
			 */
			Tone.Equal.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._equals.disconnect();
				this._equals = null;
				this._sub.dispose();
				this._sub = null;
				return this;
			};

			return Tone.Equal;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Select between any number of inputs, sending the one 
			 *         selected by the gate signal to the output
			 *
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @param {number} [sourceCount=2] the number of inputs the switch accepts
			 *  @example
			 *  var sel = new Tone.Select(2);
			 *  var sigA = new Tone.Signal(10).connect(sel, 0, 0);
			 *  var sigB = new Tone.Signal(20).connect(sel, 0, 1);
			 *  sel.gate.value = 0;
			 *  //sel outputs 10 (the value of sigA);
			 *  sel.gate.value = 1;
			 *  //sel outputs 20 (the value of sigB);
			 */
			Tone.Select = function(sourceCount){

				sourceCount = this.defaultArg(sourceCount, 2);

				Tone.call(this, sourceCount, 1);

				/**
				 *  the control signal
				 *  @type {Tone.Signal}
				 */
				this.gate = new Tone.Signal(0);

				//make all the inputs and connect them
				for (var i = 0; i < sourceCount; i++){
					var switchGate = new SelectGate(i);
					this.input[i] = switchGate;
					this.gate.connect(switchGate.selecter);
					switchGate.connect(this.output);
				}
			};

			Tone.extend(Tone.Select, Tone.SignalBase);

			/**
			 *  open one of the inputs and close the other
			 *  @param {number} which open one of the gates (closes the other)
			 *  @param {Tone.Time=} time the time when the switch will open
			 *  @returns {Tone.Select} `this`
			 *  @example
			 *  //open input 1 in a half second from now
			 *  sel.select(1, "+0.5");
			 */
			Tone.Select.prototype.select = function(which, time){
				//make sure it's an integer
				which = Math.floor(which);
				this.gate.setValueAtTime(which, this.toSeconds(time));
				return this;
			};

			/**
			 *  dispose method
			 *  @returns {Tone.Select} `this`
			 */
			Tone.Select.prototype.dispose = function(){
				this.gate.dispose();
				for (var i = 0; i < this.input.length; i++){
					this.input[i].dispose();
					this.input[i] = null;
				}
				Tone.prototype.dispose.call(this);
				this.gate = null;
				return this;
			}; 

			////////////START HELPER////////////

			/**
			 *  helper class for Tone.Select representing a single gate
			 *  @constructor
			 *  @extends {Tone}
			 *  @private
			 */
			var SelectGate = function(num){

				/**
				 *  the selector
				 *  @type {Tone.Equal}
				 */
				this.selecter = new Tone.Equal(num);

				/**
				 *  the gate
				 *  @type {GainNode}
				 */
				this.gate = this.input = this.output = this.context.createGain();

				//connect the selecter to the gate gain
				this.selecter.connect(this.gate.gain);
			};

			Tone.extend(SelectGate);

			/**
			 *  clean up
			 *  @private
			 */
			SelectGate.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this.selecter.dispose();
				this.gate.disconnect();
				this.selecter = null;
				this.gate = null;
			};

			////////////END HELPER////////////

			//return Tone.Select
			return Tone.Select;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class IfThenElse has three inputs. When the first input (if) is true (i.e. === 1), 
			 *         then it will pass the second input (then) through to the output, otherwise, 
			 *         if it's not true (i.e. === 0) then it will pass the third input (else) 
			 *         through to the output. 
			 *
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @example
			 *  var ifThenElse = new Tone.IfThenElse();
			 *  var ifSignal = new Tone.Signal(1).connect(ifThenElse, 0, 0);
			 *  var thenSignal = new Tone.PWMOscillator().connect(ifThenElse, 0, 1);
			 *  var elseSignal = new Tone.PulseOscillator().connect(ifThenElse, 0, 2);
			 *  //ifThenElse outputs thenSignal
			 *  signal.value = 0;
			 *  //now ifThenElse outputs elseSignal
			 */
			Tone.IfThenElse = function(){

				Tone.call(this, 3, 0);

				/**
				 *  the selector node which is responsible for the routing
				 *  @type {Tone.Select}
				 *  @private
				 */
				this._selector = this.output = new Tone.Select(2);

				//the input mapping
				this.if = this.input[0] = this._selector.gate;
				this.then = this.input[1] = this._selector.input[1];
				this.else = this.input[2] = this._selector.input[0];
			};

			Tone.extend(Tone.IfThenElse, Tone.SignalBase);

			/**
			 *  clean up
			 *  @returns {Tone.IfThenElse} `this`
			 */
			Tone.IfThenElse.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._selector.dispose();
				this._selector = null;
				this.if = null;
				this.then = null;
				this.else = null;
				return this;
			};

			return Tone.IfThenElse;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class OR the inputs together. True if at least one of the inputs is true. 
			 *
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @example
			 *  var or = new Tone.OR(2);
			 *  var sigA = new Tone.Signal(0)connect(or, 0, 0);
			 *  var sigB = new Tone.Signal(1)connect(or, 0, 1);
			 *  //output of or is 1 because at least
			 *  //one of the inputs is equal to 1. 
			 */
			Tone.OR = function(inputCount){

				inputCount = this.defaultArg(inputCount, 2);
				Tone.call(this, inputCount, 0);

				/**
				 *  a private summing node
				 *  @type {GainNode}
				 *  @private
				 */
				this._sum = this.context.createGain();

				/**
				 *  @type {Tone.Equal}
				 *  @private
				 */
				this._gtz = new Tone.GreaterThanZero();

				/**
				 *  the output
				 *  @type {Tone.Equal}
				 *  @private
				 */
				this.output = this._gtz;

				//make each of the inputs an alias
				for (var i = 0; i < inputCount; i++){
					this.input[i] = this._sum;
				}
				this._sum.connect(this._gtz);
			};

			Tone.extend(Tone.OR, Tone.SignalBase);

			/**
			 *  clean up
			 *  @returns {Tone.OR} `this`
			 */
			Tone.OR.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._gtz.dispose();
				this._gtz = null;
				this._sum.disconnect();
				this._sum = null;
				return this;
			};

			return Tone.OR;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class and returns 1 when all the inputs are equal to 1
			 *
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @param {number} [inputCount=2] the number of inputs. NOTE: all inputs are
			 *                                 connected to the single AND input node
			 *  @example
			 *  var and = new Tone.AND(2);
			 *  var sigA = new Tone.Signal(0).connect(and, 0, 0);
			 *  var sigB = new Tone.Signal(1).connect(and, 0, 1);
			 *  //the output of and is 0. 
			 */
			Tone.AND = function(inputCount){

				inputCount = this.defaultArg(inputCount, 2);

				Tone.call(this, inputCount, 0);

				/**
				 *  @type {Tone.Equal}
				 *  @private
				 */
				this._equals = this.output = new Tone.Equal(inputCount);

				//make each of the inputs an alias
				for (var i = 0; i < inputCount; i++){
					this.input[i] = this._equals;
				}
			};

			Tone.extend(Tone.AND, Tone.SignalBase);

			/**
			 *  clean up
			 *  @returns {Tone.AND} `this`
			 */
			Tone.AND.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._equals.dispose();
				this._equals = null;
				return this;
			};

			return Tone.AND;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  Just an alias for EqualZero. but has the same effect as a NOT operator. 
			 *          Outputs 1 when input equals 0. 
			 *  
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @example
			 *  var not = new Tone.NOT();
			 *  var sig = new Tone.Signal(1).connect(not);
			 *  //output of not equals 0. 
			 *  sig.value = 0;
			 *  //output of not equals 1.
			 */
			Tone.NOT = Tone.EqualZero;

			return Tone.NOT;
		});
		ToneModule( 
			function(Tone){

			

			/**
			 *  @class  Output 1 if the signal is greater than the value, otherwise outputs 0.
			 *          can compare two signals or a signal and a number. 
			 *  
			 *  @constructor
			 *  @extends {Tone.Signal}
			 *  @param {number} [value=0] the value to compare to the incoming signal
			 *  @example
			 *  var gt = new Tone.GreaterThan(2);
			 *  var sig = new Tone.Signal(4).connect(gt);
			 *  //output of gt is equal 1. 
			 */
			Tone.GreaterThan = function(value){

				Tone.call(this, 2, 0);
				
				/**
				 *  subtract the amount from the incoming signal
				 *  @type {Tone.Subtract}
				 *  @private
				 */
				this._value = this.input[0] = new Tone.Subtract(value);
				this.input[1] = this._value.input[1];

				/**
				 *  compare that amount to zero
				 *  @type {Tone.GreaterThanZero}
				 *  @private
				 */
				this._gtz = this.output = new Tone.GreaterThanZero();

				//connect
				this._value.connect(this._gtz);
			};

			Tone.extend(Tone.GreaterThan, Tone.Signal);

			/**
			 *  dispose method
			 *  @returns {Tone.GreaterThan} `this`
			 */
			Tone.GreaterThan.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._value.dispose();
				this._value = null;
				this._gtz.dispose();
				this._gtz = null;
				return this;
			};

			return Tone.GreaterThan;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  Output 1 if the signal is less than the value, otherwise outputs 0.
			 *          Can compare two signals or a signal and a number. <br><br>
			 *          input 0: left hand side of comparison.<br><br>
			 *          input 1: right hand side of comparison.
			 *  
			 *  @constructor
			 *  @extends {Tone.Signal}
			 *  @param {number} [value=0] the value to compare to the incoming signal
			 *  @example
			 *  var lt = new Tone.LessThan(2);
			 *  var sig = new Tone.Signal(-1).connect(lt);
			 *  //lt outputs 1 because sig < 2
			 */
			Tone.LessThan = function(value){

				Tone.call(this, 2, 0);

				/**
				 *  negate the incoming signal
				 *  @type {Tone.Negate}
				 *  @private
				 */
				this._neg = this.input[0] = new Tone.Negate();

				/**
				 *  input < value === -input > -value
				 *  @type {Tone.GreaterThan}
				 *  @private
				 */
				this._gt = this.output = new Tone.GreaterThan();

				/**
				 *  negate the signal coming from the second input
				 *  @private
				 *  @type {Tone.Negate}
				 */
				this._rhNeg = new Tone.Negate();

				/**
				 *  the node where the value is set
				 *  @private
				 *  @type {Tone.Signal}
				 */
				this._value = this.input[1] = new Tone.Signal(value);

				//connect
				this._neg.connect(this._gt);
				this._value.connect(this._rhNeg);	
				this._rhNeg.connect(this._gt, 0, 1);
			};

			Tone.extend(Tone.LessThan, Tone.Signal);

			/**
			 *  dispose method
			 *  @returns {Tone.LessThan} `this`
			 */
			Tone.LessThan.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._neg.dispose();
				this._neg = null;
				this._gt.dispose();
				this._gt = null;
				this._rhNeg.dispose();
				this._rhNeg = null;
				this._value.dispose();
				this._value = null;
				return this;
			};

			return Tone.LessThan;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class return the absolute value of an incoming signal
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @example
			 *  var signal = new Tone.Signal(-1);
			 *  var abs = new Tone.Abs();
			 *  signal.connect(abs);
			 *  //the output of abs is 1. 
			 */
			Tone.Abs = function(){
				Tone.call(this, 1, 0);

				/**
				 *  @type {Tone.LessThan}
				 *  @private
				 */
				this._ltz = new Tone.LessThan(0);

				/**
				 *  @type {Tone.Select}
				 *  @private
				 */
				this._switch = this.output = new Tone.Select(2);
				
				/**
				 *  @type {Tone.Negate}
				 *  @private
				 */
				this._negate = new Tone.Negate();

				//two signal paths, positive and negative
				this.input.connect(this._switch, 0, 0);
				this.input.connect(this._negate);
				this._negate.connect(this._switch, 0, 1);
				
				//the control signal
				this.input.chain(this._ltz, this._switch.gate);
			};

			Tone.extend(Tone.Abs, Tone.SignalBase);

			/**
			 *  dispose method
			 *  @returns {Tone.Abs} `this`
			 */
			Tone.Abs.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._switch.dispose();
				this._switch = null;
				this._ltz.dispose();
				this._ltz = null;
				this._negate.dispose();
				this._negate = null;
				return this;
			}; 

			return Tone.Abs;
		});
		ToneModule( function(Tone){

			

			/**
			 * 	@class  outputs the greater of two signals. If a number is provided in the constructor
			 * 	        it will use that instead of the signal. 
			 * 	
			 *  @constructor
			 *  @extends {Tone.Signal}
			 *  @param {number=} max max value if provided. if not provided, it will use the
			 *                       signal value from input 1. 
			 *  @example
			 *  var max = new Tone.Max(2);
			 *  var sig = new Tone.Signal(3).connect(max);
			 *  //max outputs 3
			 *  sig.value = 1;
			 *  //max outputs 2
			 */
			Tone.Max = function(max){

				Tone.call(this, 2, 0);
				this.input[0] = this.context.createGain();

				/**
				 *  the max signal
				 *  @type {Tone.Signal}
				 *  @private
				 */
				this._value = this.input[1] = new Tone.Signal(max);

				/**
				 *  @type {Tone.Select}
				 *  @private
				 */
				this._ifThenElse = this.output = new Tone.IfThenElse();

				/**
				 *  @type {Tone.Select}
				 *  @private
				 */
				this._gt = new Tone.GreaterThan();

				//connections
				this.input[0].chain(this._gt, this._ifThenElse.if);
				this.input[0].connect(this._ifThenElse.then);
				this._value.connect(this._ifThenElse.else);
				this._value.connect(this._gt, 0, 1);
			};

			Tone.extend(Tone.Max, Tone.Signal);

			/**
			 *  clean up
			 *  @returns {Tone.Max} `this`
			 */
			Tone.Max.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._value.dispose();
				this._ifThenElse.dispose();
				this._gt.dispose();
				this._value = null;
				this._ifThenElse = null;
				this._gt = null;
				return this;
			};

			return Tone.Max;
		});
		ToneModule( function(Tone){

			

			/**
			 * 	@class  Outputs the lesser of two signals. If a number is given 
			 * 	        in the constructor, it will use a signal and a number. 
			 * 	
			 *  @constructor
			 *  @extends {Tone.Signal}
			 *  @param {number} min the minimum to compare to the incoming signal
			 *  @example
			 *  var min = new Tone.Min(2);
			 *  var sig = new Tone.Signal(3).connect(min);
			 *  //min outputs 2
			 *  sig.value = 1;
			 *  //min outputs 1
			 */
			Tone.Min = function(min){

				Tone.call(this, 2, 0);
				this.input[0] = this.context.createGain();

				/**
				 *  @type {Tone.Select}
				 *  @private
				 */
				this._ifThenElse = this.output = new Tone.IfThenElse();

				/**
				 *  @type {Tone.Select}
				 *  @private
				 */
				this._lt = new Tone.LessThan();

				/**
				 *  the min signal
				 *  @type {Tone.Signal}
				 *  @private
				 */
				this._value = this.input[1] = new Tone.Signal(min);

				//connections
				this.input[0].chain(this._lt, this._ifThenElse.if);
				this.input[0].connect(this._ifThenElse.then);
				this._value.connect(this._ifThenElse.else);
				this._value.connect(this._lt, 0, 1);
			};

			Tone.extend(Tone.Min, Tone.Signal);

			/**
			 *  clean up
			 *  @returns {Tone.Min} `this`
			 */
			Tone.Min.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._value.dispose();
				this._ifThenElse.dispose();
				this._lt.dispose();
				this._value = null;
				this._ifThenElse = null;
				this._lt = null;
				return this;
			};

			return Tone.Min;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class Signal-rate modulo operator. Only works in audio range [-1, 1] and for modulus
			 *         values less than 1. 
			 *
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @param {number} modulus the modulus to apply
			 *  @example
			 *  var mod = new Tone.Modulo(0.2)
			 *  var sig = new Tone.Signal(0.5).connect(mod);
			 *  //mod outputs 0.1
			 */
			Tone.Modulo = function(modulus){

				Tone.call(this, 1, 1);

				/**
				 *  A waveshaper gets the integer multiple of 
				 *  the input signal and the modulus.
				 *  @private
				 *  @type {Tone.WaveShaper}
				 */
				this._shaper = new Tone.WaveShaper(Math.pow(2, 16));

				/**
				 *  the integer multiple is multiplied by the modulus
				 *  @type  {Tone.Multiply}
				 *  @private
				 */
				this._multiply = new Tone.Multiply();

				/**
				 *  and subtracted from the input signal
				 *  @type  {Tone.Subtract}
				 *  @private
				 */
				this._subtract = this.output = new Tone.Subtract();

				/**
				 *  the modulus signal
				 *  @type  {Tone.Signal}
				 *  @private
				 */
				this._modSignal = new Tone.Signal(modulus);

				//connections
				this.input.fan(this._shaper, this._subtract);
				this._modSignal.connect(this._multiply, 0, 0);
				this._shaper.connect(this._multiply, 0, 1);
				this._multiply.connect(this._subtract, 0, 1);
				this._setWaveShaper(modulus);
			};

			Tone.extend(Tone.Modulo, Tone.SignalBase);

			/**
			 *  @param  {number}  mod  the modulus to apply
			 *  @private
			 */
			Tone.Modulo.prototype._setWaveShaper = function(mod){
				this._shaper.setMap(function(val){
					var multiple = Math.floor((val + 0.0001) / mod);
					return multiple;
				});
			};

			/**
			 * The modulus value.
			 * @memberOf Tone.Modulo#
			 * @type {number}
			 * @name value
			 */
			Object.defineProperty(Tone.Modulo.prototype, "value", {
				get : function(){
					return this._modSignal.value;
				},
				set : function(mod){
					this._modSignal.value = mod;
					this._setWaveShaper(mod);
				}
			});

			/**
			 * clean up
			 *  @returns {Tone.Modulo} `this`
			 */
			Tone.Modulo.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._shaper.dispose();
				this._shaper = null;
				this._multiply.dispose();
				this._multiply = null;
				this._subtract.dispose();
				this._subtract = null;
				this._modSignal.dispose();
				this._modSignal = null;
				return this;
			};

			return Tone.Modulo;
		});
		ToneModule( 
			function(Tone){

			

			/**
			 *  @class evaluate an expression at audio rate. 
			 *         parsing code modified from https://code.google.com/p/tapdigit/
			 *         Copyright 2011 2012 Ariya Hidayat, New BSD License
			 *
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @param {string} expr the expression to generate
			 *  @example
			 *  //adds the signals from input 0 and input 1.
			 *  var expr = new Tone.Expr("$0 + $1");
			 */
			Tone.Expr = function(){

				var expr = this._replacements(Array.prototype.slice.call(arguments));
				var inputCount = this._parseInputs(expr);

				/**
				 *  hold onto all of the nodes for disposal
				 *  @type {Array}
				 *  @private
				 */
				this._nodes = [];

				/**
				 *  The inputs. The length is determined by the expression. 
				 *  @type {Array}
				 */
				this.input = new Array(inputCount);

				//create a gain for each input
				for (var i = 0; i < inputCount; i++){
					this.input[i] = this.context.createGain();
				}

				//parse the syntax tree
				var tree = this._parseTree(expr);
				//evaluate the results
				var result;
				try {
					result = this._eval(tree);
				} catch (e){
					this._disposeNodes();
					throw new Error("Could evaluate expression: "+expr);
				}

				/**
				 *  The output node is the result of the expression
				 *  @type {Tone}
				 */
				this.output = result;
			};

			Tone.extend(Tone.Expr, Tone.SignalBase);

			//some helpers to cut down the amount of code
			function applyBinary(Constructor, args, self){
				var op = new Constructor();
				self._eval(args[0]).connect(op, 0, 0);
				self._eval(args[1]).connect(op, 0, 1);
				return op;
			}
			function applyUnary(Constructor, args, self){
				var op = new Constructor();
				self._eval(args[0]).connect(op, 0, 0);
				return op;
			}
			function getNumber(arg){
				return arg ? parseFloat(arg) : undefined;
			}
			function literalNumber(arg){
				return arg && arg.args ? parseFloat(arg.args) : undefined;
			}

			/*
			 *  the Expressions that Tone.Expr can parse.
			 *
			 *  each expression belongs to a group and contains a regexp 
			 *  for selecting the operator as well as that operators method
			 *  
			 *  @type {Object}
			 *  @private
			 */
			Tone.Expr._Expressions = {
				//values
				"value" : {
					"signal" : {
						regexp : /^\d+\.\d+|^\d+/,
						method : function(arg){
							var sig = new Tone.Signal(getNumber(arg));
							return sig;
						}
					},
					"input" : {
						regexp : /^\$\d/,
						method : function(arg, self){
							return self.input[getNumber(arg.substr(1))];
						}
					}
				},
				//syntactic glue
				"glue" : {
					"(" : {
						regexp : /^\(/,
					},
					")" : {
						regexp : /^\)/,
					},
					"," : {
						regexp : /^,/,
					}
				},
				//functions
				"func" : {
					"abs" :  {
						regexp : /^abs/,
						method : applyUnary.bind(this, Tone.Abs)
					},
					"min" : {
						regexp : /^min/,
						method : applyBinary.bind(this, Tone.Min)
					},
					"max" : {
						regexp : /^max/,
						method : applyBinary.bind(this, Tone.Max)
					},
					"if" :  {
						regexp : /^if/,
						method : function(args, self){
							var op = new Tone.IfThenElse();
							self._eval(args[0]).connect(op.if);
							self._eval(args[1]).connect(op.then);
							self._eval(args[2]).connect(op.else);
							return op;
						}
					},
					"gt0" : {
						regexp : /^gt0/,
						method : applyUnary.bind(this, Tone.GreaterThanZero)
					},
					"eq0" : {
						regexp : /^eq0/,
						method : applyUnary.bind(this, Tone.EqualZero)
					},
					"mod" : {
						regexp : /^mod/,
						method : function(args, self){
							var modulus = literalNumber(args[1]);
							var op = new Tone.Modulo(modulus);
							self._eval(args[0]).connect(op);
							return op;
						}
					},
					"pow" : {
						regexp : /^pow/,
						method : function(args, self){
							var exp = literalNumber(args[1]);
							var op = new Tone.Pow(exp);
							self._eval(args[0]).connect(op);
							return op;
						}
					},
				},
				//binary expressions
				"binary" : {
					"+" : {
						regexp : /^\+/,
						precedence : 1,
						method : applyBinary.bind(this, Tone.Add)
					},
					"-" : {
						regexp : /^\-/,
						precedence : 1,
						method : function(args, self){
							//both unary and binary op
							if (args.length === 1){
								return applyUnary(Tone.Negate, args, self);
							} else {
								return applyBinary(Tone.Subtract, args, self);
							}
						}
					},
					"*" : {
						regexp : /^\*/,
						precedence : 0,
						method : applyBinary.bind(this, Tone.Multiply)
					},
					">" : {
						regexp : /^\>/,
						precedence : 2,
						method : applyBinary.bind(this, Tone.GreaterThan)
					},
					"<" : {
						regexp : /^</,
						precedence : 2,
						method : applyBinary.bind(this, Tone.LessThan)
					},
					"==" : {
						regexp : /^==/,
						precedence : 3,
						method : applyBinary.bind(this, Tone.Equal)
					},
					"&&" : {
						regexp : /^&&/,
						precedence : 4,
						method : applyBinary.bind(this, Tone.AND)
					},
					"||" : {
						regexp : /^\|\|/,
						precedence : 5,
						method : applyBinary.bind(this, Tone.OR)
					},
				},
				//unary expressions
				"unary" : {
					"-" : {
						regexp : /^\-/,
						method : applyUnary.bind(this, Tone.Negate)
					},
					"!" : {
						regexp : /^\!/,
						method : applyUnary.bind(this, Tone.NOT)
					},
				},
			};
				
			/**
			 *  @param   {string} expr the expression string
			 *  @return  {number}      the input count
			 *  @private
			 */
			Tone.Expr.prototype._parseInputs = function(expr){
				var inputArray = expr.match(/\$\d/g);
				var inputMax = 0;
				if (inputArray !== null){
					for (var i = 0; i < inputArray.length; i++){
						var inputNum = parseInt(inputArray[i].substr(1)) + 1;
						inputMax = Math.max(inputMax, inputNum);
					}
				}
				return inputMax;
			};

			/**
			 *  @param   {Array} args 	an array of arguments
			 *  @return  {string} the results of the replacements being replaced
			 *  @private
			 */
			Tone.Expr.prototype._replacements = function(args){
				var expr = args.shift();
				for (var i = 0; i < args.length; i++){
					expr = expr.replace(/\%/i, args[i]);
				}
				return expr;
			};

			/**
			 *  tokenize the expression based on the Expressions object
			 *  @param   {string} expr 
			 *  @return  {Object}      returns two methods on the tokenized list, next and peek
			 *  @private
			 */
			Tone.Expr.prototype._tokenize = function(expr){
				var position = -1;
				var tokens = [];

				while(expr.length > 0){
					expr = expr.trim();
					var token =  getNextToken(expr);
					tokens.push(token);
					expr = expr.substr(token.value.length);
				}

				function getNextToken(expr){
					for (var type in Tone.Expr._Expressions){
						var group = Tone.Expr._Expressions[type];
						for (var opName in group){
							var op = group[opName];
							var reg = op.regexp;
							var match = expr.match(reg);
							if (match !== null){
								return {
									type : type,
									value : match[0],
									method : op.method
								};
							}
						}
					}
					throw new SyntaxError("Unexpected token "+expr);
				}

				return {
					next : function(){
						return tokens[++position];
					},
					peek : function(){
						return tokens[position + 1];
					}
				};
			};

			/**
			 *  recursively parse the string expression into a syntax tree
			 *  
			 *  @param   {string} expr 
			 *  @return  {Object}
			 *  @private
			 */
			Tone.Expr.prototype._parseTree = function(expr){
				var lexer = this._tokenize(expr);
				var isUndef = this.isUndef.bind(this);

				function matchSyntax(token, syn) {
					return !isUndef(token) && 
						token.type === "glue" &&
						token.value === syn;
				}

				function matchGroup(token, groupName, prec) {
					var ret = false;
					var group = Tone.Expr._Expressions[groupName];
					if (!isUndef(token)){
						for (var opName in group){
							var op = group[opName];
							if (op.regexp.test(token.value)){
								if (!isUndef(prec)){
									if(op.precedence === prec){	
										return true;
									}
								} else {
									return true;
								}
							}
						}
					}
					return ret;
				}

				function parseExpression(precedence) {
					if (isUndef(precedence)){
						precedence = 5;
					}
					var expr;
					if (precedence < 0){
						expr = parseUnary();
					} else {
						expr = parseExpression(precedence-1);
					}
					var token = lexer.peek();
					while (matchGroup(token, "binary", precedence)) {
						token = lexer.next();
						expr = {
							operator: token.value,
							method : token.method,
							args : [
								expr,
								parseExpression(precedence)
							]
						};
						token = lexer.peek();
					}
					return expr;
				}

				function parseUnary() {
					var token, expr;
					token = lexer.peek();
					if (matchGroup(token, "unary")) {
						token = lexer.next();
						expr = parseUnary();
						return {
							operator: token.value,
							method : token.method,
							args : [expr]
						};
					}
					return parsePrimary();
				}

				function parsePrimary() {
					var token, expr;
					token = lexer.peek();
					if (isUndef(token)) {
						throw new SyntaxError("Unexpected termination of expression");
					}
					if (token.type === "func") {
						token = lexer.next();
						return parseFunctionCall(token);
					}
					if (token.type === "value") {
						token = lexer.next();
						return {
							method : token.method,
							args : token.value
						};
					}
					if (matchSyntax(token, "(")) {
						lexer.next();
						expr = parseExpression();
						token = lexer.next();
						if (!matchSyntax(token, ")")) {
							throw new SyntaxError("Expected )");
						}
						return expr;
					}
					throw new SyntaxError("Parse error, cannot process token " + token.value);
				}

				function parseFunctionCall(func) {
					var token, args = [];
					token = lexer.next();
					if (!matchSyntax(token, "(")) {
						throw new SyntaxError("Expected ( in a function call \"" + func.value + "\"");
					}
					token = lexer.peek();
					if (!matchSyntax(token, ")")) {
						args = parseArgumentList();
					}
					token = lexer.next();
					if (!matchSyntax(token, ")")) {
						throw new SyntaxError("Expected ) in a function call \"" + func.value + "\"");
					}
					return {
						method : func.method,
						args : args,
						name : name
					};
				}

				function parseArgumentList() {
					var token, expr, args = [];
					while (true) {
						expr = parseExpression();
						if (isUndef(expr)) {
							// TODO maybe throw exception?
							break;
						}
						args.push(expr);
						token = lexer.peek();
						if (!matchSyntax(token, ",")) {
							break;
						}
						lexer.next();
					}
					return args;
				}

				return parseExpression();
			};

			/**
			 *  recursively evaluate the expression tree
			 *  @param   {Object} tree 
			 *  @return  {AudioNode}      the resulting audio node from the expression
			 *  @private
			 */
			Tone.Expr.prototype._eval = function(tree){
				if (!this.isUndef(tree)){
					var node = tree.method(tree.args, this);
					this._nodes.push(node);
					return node;
				} 
			};

			/**
			 *  dispose all the nodes
			 *  @private
			 */
			Tone.Expr.prototype._disposeNodes = function(){
				for (var i = 0; i < this._nodes.length; i++){
					var node = this._nodes[i];
					if (this.isFunction(node.dispose)) {
						node.dispose();
					} else if (this.isFunction(node.disconnect)) {
						node.disconnect();
					}
					node = null;
					this._nodes[i] = null;
				}
				this._nodes = null;
			};

			/**
			 *  clean up
			 */
			Tone.Expr.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._disposeNodes();
			};

			return Tone.Expr;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Convert an incoming signal between 0, 1 to an equal power gain scale.
			 *
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @example
			 *  var eqPowGain = new Tone.EqualPowerGain();
			 */
			Tone.EqualPowerGain = function(){

				/**
				 *  @type {Tone.WaveShaper}
				 *  @private
				 */
				this._eqPower = this.input = this.output = new Tone.WaveShaper(function(val){
					if (Math.abs(val) < 0.001){
						//should output 0 when input is 0
						return 0;
					} else {
						return this.equalPowerScale(val);
					}
				}.bind(this), 4096);
			};

			Tone.extend(Tone.EqualPowerGain, Tone.SignalBase);

			/**
			 *  clean up
			 *  @returns {Tone.EqualPowerGain} `this`
			 */
			Tone.EqualPowerGain.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._eqPower.dispose();
				this._eqPower = null;
				return this;
			};

			return Tone.EqualPowerGain;
		});
		ToneModule( function(Tone){

			

			/**
			 * @class  Equal power fading control values:<br>
			 * 	       0 = 100% input 0<br>
			 * 	       1 = 100% input 1<br>
			 *
			 * @constructor
			 * @extends {Tone}
			 * @param {number} [initialFade=0.5]
			 * @example
			 * var crossFade = new Tone.CrossFade(0.5);
			 * effectA.connect(crossFade, 0, 0);
			 * effectB.connect(crossFade, 0, 1);
			 * crossFade.fade.value = 0;
			 * // ^ only effectA is output
			 * crossFade.fade.value = 1;
			 * // ^ only effectB is output
			 * crossFade.fade.value = 0.5;
			 * // ^ the two signals are mixed equally. 
			 */		
			Tone.CrossFade = function(initialFade){

				Tone.call(this, 2, 1);

				/**
				 *  the first input. input "a".
				 *  @type {GainNode}
				 */
				this.a = this.input[0] = this.context.createGain();

				/**
				 *  the second input. input "b"
				 *  @type {GainNode}
				 */
				this.b = this.input[1] = this.context.createGain();

				/**
				 *  0 is 100% signal `a` (input 0) and 1 is 100% signal `b` (input 1).
				 *  Values between 0-1.
				 *  
				 *  @type {Tone.Signal}
				 */
				this.fade = new Tone.Signal(this.defaultArg(initialFade, 0.5), Tone.Signal.Units.Normal);

				/**
				 *  equal power gain cross fade
				 *  @private
				 *  @type {Tone.EqualPowerGain}
				 */
				this._equalPowerA = new Tone.EqualPowerGain();

				/**
				 *  equal power gain cross fade
				 *  @private
				 *  @type {Tone.EqualPowerGain}
				 */
				this._equalPowerB = new Tone.EqualPowerGain();
				
				/**
				 *  invert the incoming signal
				 *  @private
				 *  @type {Tone}
				 */
				this._invert = new Tone.Expr("1 - $0");

				//connections
				this.a.connect(this.output);
				this.b.connect(this.output);
				this.fade.chain(this._equalPowerB, this.b.gain);
				this.fade.chain(this._invert, this._equalPowerA, this.a.gain);
			};

			Tone.extend(Tone.CrossFade);

			/**
			 *  clean up
			 *  @returns {Tone.CrossFade} `this`
			 */
			Tone.CrossFade.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._equalPowerA.dispose();
				this._equalPowerA = null;
				this._equalPowerB.dispose();
				this._equalPowerB = null;
				this.fade.dispose();
				this.fade = null;
				this._invert.dispose();
				this._invert = null;
				this.a.disconnect();
				this.a = null;
				this.b.disconnect();
				this.b = null;
				return this;
			};

			return Tone.CrossFade;
		});

		ToneModule( function(Tone){

			

			/**
			 *  @class  Filter object which allows for all of the same native methods
			 *          as the BiquadFilter (with AudioParams implemented as Tone.Signals)
			 *          but adds the ability to set the filter rolloff at -12 (default), 
			 *          -24 and -48. 
			 *
			 *  @constructor
			 *  @extends {Tone}
			 *  @param {number|Object} [freq=350] the frequency
			 *  @param {string} [type=lowpass] the type of filter
			 *  @param {number} [rolloff=-12] the rolloff which is the drop per octave. 
			 *                                 3 choices: -12, -24, and -48
			 *  @example
			 *  var filter = new Tone.Filter(200, "highpass");
			 */
			Tone.Filter = function(){
				Tone.call(this);

				var options = this.optionsObject(arguments, ["frequency", "type", "rolloff"], Tone.Filter.defaults);

				/**
				 *  the filter(s)
				 *  @type {Array.<BiquadFilterNode>}
				 *  @private
				 */
				this._filters = [];

				/**
				 *  the frequency of the filter
				 *  @type {Tone.Signal}
				 */
				this.frequency = new Tone.Signal(options.frequency, Tone.Signal.Units.Frequency);

				/**
				 *  the detune parameter
				 *  @type {Tone.Signal}
				 */
				this.detune = new Tone.Signal(0);

				/**
				 *  the gain of the filter, only used in certain filter types
				 *  @type {AudioParam}
				 */
				this.gain = new Tone.Signal(options.gain, Tone.Signal.Units.Decibels);

				/**
				 *  the Q or Quality of the filter
				 *  @type {Tone.Signal}
				 */
				this.Q = new Tone.Signal(options.Q);

				/**
				 *  the type of the filter
				 *  @type {string}
				 *  @private
				 */
				this._type = options.type;

				/**
				 *  the rolloff value of the filter
				 *  @type {number}
				 *  @private
				 */
				this._rolloff = options.rolloff;

				//set the rolloff;
				this.rolloff = options.rolloff;
			};

			Tone.extend(Tone.Filter);

			/**
			 *  the default parameters
			 *
			 *  @static
			 *  @type {Object}
			 */
			Tone.Filter.defaults = {
				"type" : "lowpass",
				"frequency" : 350,
				"rolloff" : -12,
				"Q" : 1,
				"gain" : 0,
			};

			/**
			 * The type of the filter. Types: "lowpass", "highpass", 
			 * "bandpass", "lowshelf", "highshelf", "notch", "allpass", or "peaking". 
			 * @memberOf Tone.Filter#
			 * @type {string}
			 * @name type
			 */
			Object.defineProperty(Tone.Filter.prototype, "type", {
				get : function(){
					return this._type;
				},
				set : function(type){
					var types = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
					if (types.indexOf(type)=== -1){
						throw new TypeError("Tone.Filter does not have filter type "+type);
					}
					this._type = type;
					for (var i = 0; i < this._filters.length; i++){
						this._filters[i].type = type;
					}
				}
			});

			/**
			 * The rolloff of the filter which is the drop in db
			 * per octave. Implemented internally by cascading filters.
			 * Only accepts the values -12, -24, and -48.
			 * @memberOf Tone.Filter#
			 * @type {number}
			 * @name rolloff
			 */
			Object.defineProperty(Tone.Filter.prototype, "rolloff", {
				get : function(){
					return this._rolloff;
				},
				set : function(rolloff){
					var cascadingCount = Math.log(rolloff / -12) / Math.LN2 + 1;
					//check the rolloff is valid
					if (cascadingCount % 1 !== 0){
						throw new RangeError("Filter rolloff can only be -12, -24, or -48");
					}
					this._rolloff = rolloff;
					//first disconnect the filters and throw them away
					this.input.disconnect();
					for (var i = 0; i < this._filters.length; i++) {
						this._filters[i].disconnect();
						this._filters[i] = null;
					}
					this._filters = new Array(cascadingCount);
					for (var count = 0; count < cascadingCount; count++){
						var filter = this.context.createBiquadFilter();
						filter.type = this._type;
						this.frequency.connect(filter.frequency);
						this.detune.connect(filter.detune);
						this.Q.connect(filter.Q);
						this.gain.connect(filter.gain);
						this._filters[count] = filter;
					}
					//connect them up
					var connectionChain = [this.input].concat(this._filters).concat([this.output]);
					this.connectSeries.apply(this, connectionChain);
				}
			});

			/**
			 *  clean up
			 *  @return {Tone.Filter} `this`
			 */
			Tone.Filter.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				for (var i = 0; i < this._filters.length; i++) {
					this._filters[i].disconnect();
					this._filters[i] = null;
				}
				this._filters = null;
				this.frequency.dispose();
				this.Q.dispose();
				this.frequency = null;
				this.Q = null;
				this.detune.dispose();
				this.detune = null;
				this.gain.dispose();
				this.gain = null;
				return this;
			};

			return Tone.Filter;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Split the incoming signal into three bands (low, mid, high)
			 *         with two crossover frequency controls. 
			 *
			 *  @extends {Tone}
			 *  @constructor
			 *  @param {number} lowFrequency the low/mid crossover frequency
			 *  @param {number} highFrequency the mid/high crossover frequency
			 */
			Tone.MultibandSplit = function(){
				var options = this.optionsObject(arguments, ["lowFrequency", "highFrequency"], Tone.MultibandSplit.defaults);

				/**
				 *  the input
				 *  @type {GainNode}
				 *  @private
				 */
				this.input = this.context.createGain();

				/**
				 *  the outputs
				 *  @type {Array}
				 *  @private
				 */
				this.output = new Array(3);

				/**
				 *  the low band
				 *  @type {Tone.Filter}
				 */
				this.low = this.output[0] = new Tone.Filter(0, "lowpass");

				/**
				 *  the lower filter of the mid band
				 *  @type {Tone.Filter}
				 *  @private
				 */
				this._lowMidFilter = new Tone.Filter(0, "highpass");

				/**
				 *  the mid band
				 *  @type {Tone.Filter}
				 */
				this.mid = this.output[1] = new Tone.Filter(0, "lowpass");

				/**
				 *  the high band
				 *  @type {Tone.Filter}
				 */
				this.high = this.output[2] = new Tone.Filter(0, "highpass");

				/**
				 *  the low/mid crossover frequency
				 *  @type {Tone.Signal}
				 */
				this.lowFrequency = new Tone.Signal(options.lowFrequency);

				/**
				 *  the mid/high crossover frequency
				 *  @type {Tone.Signal}
				 */
				this.highFrequency = new Tone.Signal(options.highFrequency);

				this.input.fan(this.low, this.high);
				this.input.chain(this._lowMidFilter, this.mid);
				//the frequency control signal
				this.lowFrequency.connect(this.low.frequency);
				this.lowFrequency.connect(this._lowMidFilter.frequency);
				this.highFrequency.connect(this.mid.frequency);
				this.highFrequency.connect(this.high.frequency);
			};

			Tone.extend(Tone.MultibandSplit);

			/**
			 *  @private
			 *  @static
			 *  @type {Object}
			 */
			Tone.MultibandSplit.defaults = {
				"lowFrequency" : 400,
				"highFrequency" : 2500
			};

			/**
			 *  clean up
			 *  @returns {Tone.MultibandSplit} `this`
			 */
			Tone.MultibandSplit.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this.low.dispose();
				this._lowMidFilter.dispose();
				this.mid.dispose();
				this.high.dispose();
				this.lowFrequency.dispose();
				this.highFrequency.dispose();
				this.low = null;
				this._lowMidFilter = null;
				this.mid = null;
				this.high = null;
				this.lowFrequency = null;
				this.highFrequency = null;
				return this;
			};

			return Tone.MultibandSplit;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class A 3 band EQ with control over low, mid, and high gain as
			 *         well as the low and high crossover frequencies. 
			 *
			 *  @constructor
			 *  @extends {Tone}
			 *  
			 *  @param {number|object} [lowLevel=0] the gain applied to the lows (in db)
			 *  @param {number} [midLevel=0] the gain applied to the mid (in db)
			 *  @param {number} [highLevel=0] the gain applied to the high (in db)
			 *  @example
			 *  var eq = new Tone.EQ(-10, 3, -20);
			 */
			Tone.EQ = function(){

				var options = this.optionsObject(arguments, ["low", "mid", "high"], Tone.EQ.defaults);

				/**
				 *  the output node
				 *  @type {GainNode}
				 *  @private
				 */
				this.output = this.context.createGain();

				/**
				 *  the multiband split
				 *  @type {Tone.MultibandSplit}
				 *  @private
				 */
				this._multibandSplit = this.input = new Tone.MultibandSplit({
					"lowFrequency" : options.lowFrequency,
					"highFrequency" : options.highFrequency
				});

				/**
				 *  the low gain
				 *  @type {GainNode}
				 *  @private
				 */
				this._lowGain = this.context.createGain();

				/**
				 *  the mid gain
				 *  @type {GainNode}
				 *  @private
				 */
				this._midGain = this.context.createGain();

				/**
				 *  the high gain
				 *  @type {GainNode}
				 *  @private
				 */
				this._highGain = this.context.createGain();

				/**
				 * The gain in decibels of the low part
				 * @type {Tone.Signal}
				 */
				this.low = new Tone.Signal(this._lowGain.gain, Tone.Signal.Units.Decibels);

				/**
				 * The gain in decibels of the mid part
				 * @type {Tone.Signal}
				 */
				this.mid = new Tone.Signal(this._midGain.gain, Tone.Signal.Units.Decibels);

				/**
				 * The gain in decibels of the high part
				 * @type {Tone.Signal}
				 */
				this.high = new Tone.Signal(this._highGain.gain, Tone.Signal.Units.Decibels);

				/**
				 *  the low/mid crossover frequency
				 *  @type {Tone.Signal}
				 */
				this.lowFrequency = this._multibandSplit.lowFrequency;

				/**
				 *  the mid/high crossover frequency
				 *  @type {Tone.Signal}
				 */
				this.highFrequency = this._multibandSplit.highFrequency;

				//the frequency bands
				this._multibandSplit.low.chain(this._lowGain, this.output);
				this._multibandSplit.mid.chain(this._midGain, this.output);
				this._multibandSplit.high.chain(this._highGain, this.output);
				//set the gains
				this.high.value = options.low;
				this.mid.value = options.mid;
				this.low.value = options.high;
			};

			Tone.extend(Tone.EQ);

			/**
			 *  the default values
			 *  @type {Object}
			 *  @static
			 */
			Tone.EQ.defaults = {
				"low" : 0,
				"mid" : 0,
				"high" : 0,
				"lowFrequency" : 400,
				"highFrequency" : 2500
			};

			/**
			 *  clean up
			 *  @returns {Tone.EQ} `this`
			 */
			Tone.EQ.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._multibandSplit.dispose();
				this._multibandSplit = null;
				this.lowFrequency = null;
				this.highFrequency = null;
				this._lowGain.disconnect();
				this._lowGain = null;
				this._midGain.disconnect();
				this._midGain = null;
				this._highGain.disconnect();
				this._highGain = null;
				this.low.dispose();
				this.low = null;
				this.mid.dispose();
				this.mid = null;
				this.high.dispose();
				this.high = null;
				return this;
			};

			return Tone.EQ;
		});
		ToneModule( function(Tone){

			
			
			/**
			 *  @class  Performs a linear scaling on an input signal.
			 *          Scales a normal gain input range [0,1] to between
			 *          outputMin and outputMax
			 *
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @param {number} [outputMin=0]
			 *  @param {number} [outputMax=1]
			 *  @example
			 *  var scale = new Tone.Scale(50, 100);
			 *  var signal = new Tone.Signal(0.5).connect(scale);
			 *  //the output of scale equals 75
			 */
			Tone.Scale = function(outputMin, outputMax){

				/** 
				 *  @private
				 *  @type {number}
				 */
				this._outputMin = this.defaultArg(outputMin, 0);

				/** 
				 *  @private
				 *  @type {number}
				 */
				this._outputMax = this.defaultArg(outputMax, 1);


				/** 
				 *  @private
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._scale = this.input = new Tone.Multiply(1);
				
				/** 
				 *  @private
				 *  @type {Tone.Add}
				 *  @private
				 */
				this._add = this.output = new Tone.Add(0);

				this._scale.connect(this._add);
				this._setRange();
			};

			Tone.extend(Tone.Scale, Tone.SignalBase);

			/**
			 * The minimum output value.
			 * @memberOf Tone.Scale#
			 * @type {number}
			 * @name min
			 */
			Object.defineProperty(Tone.Scale.prototype, "min", {
				get : function(){
					return this._outputMin;
				},
				set : function(min){
					this._outputMin = min;
					this._setRange();
				}
			});

			/**
			 * The maximum output value.
			 * @memberOf Tone.Scale#
			 * @type {number}
			 * @name max
			 */
			Object.defineProperty(Tone.Scale.prototype, "max", {
				get : function(){
					return this._outputMax;
				},
				set : function(max){
					this._outputMax = max;
					this._setRange();
				}
			});

			/**
			 *  set the values
			 *  @private
			 */
			Tone.Scale.prototype._setRange = function() {
				this._add.value = this._outputMin;
				this._scale.value = this._outputMax - this._outputMin;
			};

			/**
			 *  clean up
			 *  @returns {Tone.Scale} `this`
			 */
			Tone.Scale.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._add.dispose();
				this._add = null;
				this._scale.dispose();
				this._scale = null;
				return this;
			}; 

			return Tone.Scale;
		});

		ToneModule( 
		function(Tone){
			
			/**
			 *  @class  Performs an exponential scaling on an input signal.
			 *          Scales a normal gain range [0,1] exponentially
			 *          to the output range of outputMin to outputMax.
			 *
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @param {number} [outputMin=0]
			 *  @param {number} [outputMax=1]
			 *  @param {number} [exponent=2] the exponent which scales the incoming signal
			 */
			Tone.ScaleExp = function(outputMin, outputMax, exponent){

				/**
				 *  scale the input to the output range
				 *  @type {Tone.Scale}
				 *  @private
				 */
				this._scale = this.output = new Tone.Scale(outputMin, outputMax);

				/**
				 *  @private
				 *  @type {Tone.Pow}
				 *  @private
				 */
				this._exp = this.input = new Tone.Pow(this.defaultArg(exponent, 2));

				this._exp.connect(this._scale);
			};

			Tone.extend(Tone.ScaleExp, Tone.SignalBase);

			/**
			 * The minimum output value.
			 * @memberOf Tone.ScaleExp#
			 * @type {number}
			 * @name exponent
			 */
			Object.defineProperty(Tone.ScaleExp.prototype, "exponent", {
				get : function(){
					return this._exp.value;
				},
				set : function(exp){
					this._exp.value = exp;
				}
			});

			/**
			 * The minimum output value.
			 * @memberOf Tone.ScaleExp#
			 * @type {number}
			 * @name min
			 */
			Object.defineProperty(Tone.ScaleExp.prototype, "min", {
				get : function(){
					return this._scale.min;
				},
				set : function(min){
					this._scale.min = min;
				}
			});

			/**
			 * The maximum output value.
			 * @memberOf Tone.ScaleExp#
			 * @type {number}
			 * @name max
			 */
			Object.defineProperty(Tone.ScaleExp.prototype, "max", {
				get : function(){
					return this._scale.max;
				},
				set : function(max){
					this._scale.max = max;
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.ScaleExp} `this`
			 */
			Tone.ScaleExp.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._scale.dispose();
				this._scale = null;
				this._exp.dispose();
				this._exp = null;
				return this;
			}; 


			return Tone.ScaleExp;
		});

		ToneModule( function(Tone){

			

			/**
			 *  @class A comb filter with feedback.
			 *
			 *  @extends {Tone}
			 *  @constructor
			 *  @param {number} [minDelay=0.01] the minimum delay time which the filter can have
			 *  @param {number} [maxDelay=1] the maximum delay time which the filter can have
			 */
			Tone.FeedbackCombFilter = function(){

				Tone.call(this);
				var options = this.optionsObject(arguments, ["minDelay", "maxDelay"], Tone.FeedbackCombFilter.defaults);

				var minDelay = options.minDelay;
				var maxDelay = options.maxDelay;
				//the delay * samplerate = number of samples. 
				// buffersize / number of samples = number of delays needed per buffer frame
				var delayCount = Math.ceil(this.bufferSize / (minDelay * this.context.sampleRate));
				//set some ranges
				delayCount = Math.min(delayCount, 10);
				delayCount = Math.max(delayCount, 1);

				/**
				 *  the number of filter delays
				 *  @type {number}
				 *  @private
				 */
				this._delayCount = delayCount;

				/**
				 *  @type {Array.<FilterDelay>}
				 *  @private
				 */
				this._delays = new Array(this._delayCount);

				/**
				 *  the resonance control
				 *  @type {Tone.Signal}
				 */
				this.resonance = new Tone.Signal(options.resonance, Tone.Signal.Units.Normal);

				/**
				 *  scale the resonance value to the normal range
				 *  @type {Tone.Scale}
				 *  @private
				 */
				this._resScale = new Tone.ScaleExp(0.01, 1 / this._delayCount - 0.001, 0.5);

				/**
				 *  internal flag for keeping track of when frequency
				 *  correction has been used
				 *  @type {boolean}
				 *  @private
				 */
				this._highFrequencies = false;

				/**
				 *  internal counter of delayTime
				 *  @type {Tone.TIme}
				 *  @private
				 */
				this._delayTime = options.delayTime;

				/**
				 *  the feedback node
				 *  @type {GainNode}
				 *  @private
				 */
				this._feedback = this.context.createGain();

				//make the filters
				for (var i = 0; i < this._delayCount; i++) {
					var delay = this.context.createDelay(maxDelay);
					delay.delayTime.value = minDelay;
					delay.connect(this._feedback);
					this._delays[i] = delay;
				}

				//connections
				this.connectSeries.apply(this, this._delays);
				this.input.connect(this._delays[0]);
				//set the delay to the min value initially
				this._feedback.connect(this._delays[0]);
				//resonance control
				this.resonance.chain(this._resScale, this._feedback.gain);
				this._feedback.connect(this.output);
				this.delayTime = options.delayTime;
			};

			Tone.extend(Tone.FeedbackCombFilter);

			/**
			 *  the default parameters
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.FeedbackCombFilter.defaults = {
				"resonance" : 0.5,
				"minDelay" : 0.1,
				"maxDelay" : 1,
				"delayTime" : 0.1
			};

			/**
			 * the delay time of the FeedbackCombFilter
			 * @memberOf Tone.FeedbackCombFilter#
			 * @type {Tone.Time}
			 * @name delayTime
			 */
			Object.defineProperty(Tone.FeedbackCombFilter.prototype, "delayTime", {
				get : function(){
					return this._delayTime;
				},
				set : function(delayAmount){
					this._delayTime = delayAmount;
					delayAmount = this.toSeconds(delayAmount);
					//the number of samples to delay by
					var sampleRate = this.context.sampleRate;
					var delaySamples = sampleRate * delayAmount;
					// delayTime corection when frequencies get high
					var now = this.now() + this.bufferTime;
					var cutoff = 100;
					if (delaySamples < cutoff){
						this._highFrequencies = true;
						var changeNumber = Math.round((delaySamples / cutoff) * this._delayCount);
						for (var i = 0; i < changeNumber; i++) {
							this._delays[i].delayTime.setValueAtTime(1 / sampleRate + delayAmount, now);
						}
						delayAmount = Math.floor(delaySamples) / sampleRate;
					} else if (this._highFrequencies){
						this._highFrequencies = false;
						for (var j = 0; j < this._delays.length; j++) {
							this._delays[j].delayTime.setValueAtTime(delayAmount, now);
						}
					}
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.FeedbackCombFilter} `this`
			 */
			Tone.FeedbackCombFilter.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				//dispose the filter delays
				for (var i = 0; i < this._delays.length; i++) {
					this._delays[i].disconnect();
					this._delays[i] = null;
				}
				this._delays = null;
				this.resonance.dispose();
				this.resonance = null;
				this._resScale.dispose();
				this._resScale = null;
				this._feedback.disconnect();
				this._feedback = null;
				return this;
			};

			return Tone.FeedbackCombFilter;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  Follow the envelope of the incoming signal. 
			 *          Careful with small (< 0.02) attack or decay values. 
			 *          The follower has some ripple which gets exaggerated
			 *          by small values. 
			 *  
			 *  @constructor
			 *  @extends {Tone}
			 *  @param {Tone.Time} [attack = 0.05] 
			 *  @param {Tone.Time} [release = 0.5] 
			 *  @example
			 *  var follower = new Tone.Follower(0.2, 0.4);
			 */
			Tone.Follower = function(){

				Tone.call(this);
				var options = this.optionsObject(arguments, ["attack", "release"], Tone.Follower.defaults);

				/**
				 *  @type {Tone.Abs}
				 *  @private
				 */
				this._abs = new Tone.Abs();

				/**
				 *  the lowpass filter which smooths the input
				 *  @type {BiquadFilterNode}
				 *  @private
				 */
				this._filter = this.context.createBiquadFilter();
				this._filter.type = "lowpass";
				this._filter.frequency.value = 0;
				this._filter.Q.value = -100;

				/**
				 *  @type {WaveShaperNode}
				 *  @private
				 */
				this._frequencyValues = new Tone.WaveShaper();
				
				/**
				 *  @type {Tone.Subtract}
				 *  @private
				 */
				this._sub = new Tone.Subtract();

				/**
				 *  @type {DelayNode}
				 *  @private
				 */
				this._delay = this.context.createDelay();
				this._delay.delayTime.value = this.bufferTime;

				/**
				 *  this keeps it far from 0, even for very small differences
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._mult = new Tone.Multiply(10000);

				/**
				 *  @private
				 *  @type {number}
				 */
				this._attack = options.attack;

				/**
				 *  @private
				 *  @type {number}
				 */
				this._release = options.release;

				//the smoothed signal to get the values
				this.input.chain(this._abs, this._filter, this.output);
				//the difference path
				this._abs.connect(this._sub, 0, 1);
				this._filter.chain(this._delay, this._sub);
				//threshold the difference and use the thresh to set the frequency
				this._sub.chain(this._mult, this._frequencyValues, this._filter.frequency);
				//set the attack and release values in the table
				this._setAttackRelease(this._attack, this._release);
			};

			Tone.extend(Tone.Follower);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.Follower.defaults = {
				"attack" : 0.05, 
				"release" : 0.5
			};

			/**
			 *  sets the attack and release times in the wave shaper
			 *  @param   {Tone.Time} attack  
			 *  @param   {Tone.Time} release 
			 *  @private
			 */
			Tone.Follower.prototype._setAttackRelease = function(attack, release){
				var minTime = this.bufferTime;
				attack = this.secondsToFrequency(this.toSeconds(attack));
				release = this.secondsToFrequency(this.toSeconds(release));
				attack = Math.max(attack, minTime);
				release = Math.max(release, minTime);
				this._frequencyValues.setMap(function(val){
					if (val <= 0){
						return attack;
					} else {
						return release;
					} 
				});
			};

			/**
			 * The attack time.
			 * @memberOf Tone.Follower#
			 * @type {Tone.Time}
			 * @name attack
			 */
			Object.defineProperty(Tone.Follower.prototype, "attack", {
				get : function(){
					return this._attack;
				},
				set : function(attack){
					this._attack = attack;
					this._setAttackRelease(this._attack, this._release);	
				}
			});

			/**
			 * The release time.
			 * @memberOf Tone.Follower#
			 * @type {Tone.Time}
			 * @name release
			 */
			Object.defineProperty(Tone.Follower.prototype, "release", {
				get : function(){
					return this._release;
				},
				set : function(release){
					this._release = release;
					this._setAttackRelease(this._attack, this._release);	
				}
			});

			/**
			 *  borrows the connect method from Signal so that the output can be used
			 *  as a control signal {@link Tone.Signal}
			 *  @function
			 */
			Tone.Follower.prototype.connect = Tone.Signal.prototype.connect;

			/**
			 *  dispose
			 *  @returns {Tone.Follower} `this`
			 */
			Tone.Follower.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._filter.disconnect();
				this._filter = null;
				this._frequencyValues.disconnect();
				this._frequencyValues = null;
				this._delay.disconnect();
				this._delay = null;
				this._sub.disconnect();
				this._sub = null;
				this._abs.dispose();
				this._abs = null;
				this._mult.dispose();
				this._mult = null;
				this._curve = null;
				return this;
			};

			return Tone.Follower;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  Only pass signal through when it's signal exceeds the
			 *          specified threshold.
			 *  
			 *  @constructor
			 *  @extends {Tone}
			 *  @param {number} [threshold = -40] the threshold in Decibels
			 *  @param {Tone.Time} [attack = 0.1] the follower's attack time
			 *  @param {Tone.Time} [release = 0.1] the follower's release time
			 *  @example
			 *  var gate = new Tone.Gate(-30, 0.2, 0.3);
			 */
			Tone.Gate = function(){
				
				Tone.call(this);
				var options = this.optionsObject(arguments, ["threshold", "attack", "release"], Tone.Gate.defaults);

				/**
				 *  @type {Tone.Follower}
				 *  @private
				 */
				this._follower = new Tone.Follower(options.attack, options.release);

				/**
				 *  @type {Tone.GreaterThan}
				 *  @private
				 */
				this._gt = new Tone.GreaterThan(this.dbToGain(options.threshold));

				//the connections
				this.input.connect(this.output);
				//the control signal
				this.input.chain(this._gt, this._follower, this.output.gain);
			};

			Tone.extend(Tone.Gate);

			/**
			 *  @const
			 *  @static
			 *  @type {Object}
			 */
			Tone.Gate.defaults = {
				"attack" : 0.1, 
				"release" : 0.1,
				"threshold" : -40
			};

			/**
			 * The threshold of the gate in decibels
			 * @memberOf Tone.Gate#
			 * @type {number}
			 * @name threshold
			 */
			Object.defineProperty(Tone.Gate.prototype, "threshold", {
				get : function(){
					return this.gainToDb(this._gt.value);
				}, 
				set : function(thresh){
					this._gt.value = this.dbToGain(thresh);
				}
			});

			/**
			 * The attack speed of the gate
			 * @memberOf Tone.Gate#
			 * @type {Tone.Time}
			 * @name attack
			 */
			Object.defineProperty(Tone.Gate.prototype, "attack", {
				get : function(){
					return this._follower.attack;
				}, 
				set : function(attackTime){
					this._follower.attack = attackTime;
				}
			});

			/**
			 * The release speed of the gate
			 * @memberOf Tone.Gate#
			 * @type {Tone.Time}
			 * @name release
			 */
			Object.defineProperty(Tone.Gate.prototype, "release", {
				get : function(){
					return this._follower.release;
				}, 
				set : function(releaseTime){
					this._follower.release = releaseTime;
				}
			});

			/**
			 *  dispose
			 *  @returns {Tone.Gate} `this`
			 */
			Tone.Gate.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._follower.dispose();
				this._gt.dispose();
				this._follower = null;
				this._gt = null;
				return this;
			};

			return Tone.Gate;
		});
		ToneModule( function(Tone){

			
			
			/**
			 *  @class  a sample accurate clock built on an oscillator.
			 *          Invokes the tick method at the set rate
			 *
			 * 	@private
			 * 	@constructor
			 * 	@extends {Tone}
			 * 	@param {Tone.Frequency} frequency the rate of the callback
			 * 	@param {function} callback the callback to be invoked with the time of the audio event
			 */
			Tone.Clock = function(frequency, callback){

				/**
				 *  the oscillator
				 *  @type {OscillatorNode}
				 *  @private
				 */
				this._oscillator = null;

				/**
				 *  the script processor which listens to the oscillator
				 *  @type {ScriptProcessorNode}
				 *  @private
				 */
				this._jsNode = this.context.createScriptProcessor(this.bufferSize, 1, 1);
				this._jsNode.onaudioprocess = this._processBuffer.bind(this);

				/**
				 *  the rate control signal
				 *  @type {Tone.Signal}
				 */
				this.frequency = new Tone.Signal(frequency);

				/**
				 *  whether the tick is on the up or down
				 *  @type {boolean}
				 *  @private
				 */
				this._upTick = false;

				/**
				 *  the callback which is invoked on every tick
				 *  with the time of that tick as the argument
				 *  @type {function(number)}
				 */
				this.tick = callback;

				//setup
				this._jsNode.noGC();
			};

			Tone.extend(Tone.Clock);

			/**
			 *  start the clock
			 *  @param {Tone.Time} time the time when the clock should start
			 *  @returns {Tone.Clock} `this`
			 */
			Tone.Clock.prototype.start = function(time){
				if (!this._oscillator){
					this._oscillator = this.context.createOscillator();
					this._oscillator.type = "square";
					this._oscillator.connect(this._jsNode);
					//connect it up
					this.frequency.connect(this._oscillator.frequency);
					this._upTick = false;
					var startTime = this.toSeconds(time);
					this._oscillator.start(startTime);
				}
				return this;
			};

			/**
			 *  stop the clock
			 *  @param {Tone.Time} time the time when the clock should stop
			 *  @param {function} onend called when the oscilator stops
			 *  @returns {Tone.Clock} `this`
			 */
			Tone.Clock.prototype.stop = function(time, onend){
				if (this._oscillator){
					var now = this.now();
					var stopTime = this.toSeconds(time, now);
					this._oscillator.stop(stopTime);
					this._oscillator = null;
					//set a timeout for when it stops
					if (time){
						setTimeout(onend, (stopTime - now) * 1000);
					} else {
						onend();
					}
				}
				return this;
			};

			/**
			 *  @private
			 *  @param  {AudioProcessingEvent} event
			 */
			Tone.Clock.prototype._processBuffer = function(event){
				var now = this.defaultArg(event.playbackTime, this.now());
				var bufferSize = this._jsNode.bufferSize;
				var incomingBuffer = event.inputBuffer.getChannelData(0);
				var upTick = this._upTick;
				var self = this;
				for (var i = 0; i < bufferSize; i++){
					var sample = incomingBuffer[i];
					if (sample > 0 && !upTick){
						upTick = true;	
						//get the callback out of audio thread
						setTimeout(function(){
							//to account for the double buffering
							var tickTime = now + self.samplesToSeconds(i + bufferSize * 2);
							return function(){
								if (self.tick){
									self.tick(tickTime);
								}
							};
						}(), 0); // jshint ignore:line
					} else if (sample < 0 && upTick){
						upTick = false;
					}
				}
				this._upTick = upTick;
			};

			/**
			 *  clean up
			 *  @returns {Tone.Clock} `this`
			 */
			Tone.Clock.prototype.dispose = function(){
				this._jsNode.disconnect();
				this.frequency.dispose();
				this.frequency = null;
				if (this._oscillator){
					this._oscillator.disconnect();
					this._oscillator = null;
				}
				this._jsNode.onaudioprocess = function(){};
				this._jsNode = null;
				this.tick = null;
				return this;
			};

			return Tone.Clock;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  Time can be descibed in a number of ways. 
			 *  Any Method which accepts Tone.Time as a parameter will accept: 
			 *  
			 *  Numbers, which will be taken literally as the time (in seconds). 
			 *  
			 *  Notation, ("4n", "8t") describes time in BPM and time signature relative values. 
			 *  
			 *  Transport Time, ("4:3:2") will also provide tempo and time signature relative times 
			 *  in the form BARS:QUARTERS:SIXTEENTHS.
			 *  
			 *  Frequency, ("8hz") is converted to the length of the cycle in seconds.
			 *  
			 *  Now-Relative, ("+1") prefix any of the above with "+" and it will be interpreted as 
			 *  "the current time plus whatever expression follows".
			 *  
			 *  Expressions, ("3:0 + 2 - (1m / 7)") any of the above can also be combined 
			 *  into a mathematical expression which will be evaluated to compute the desired time.
			 *  
			 *  No Argument, for methods which accept time, no argument will be interpreted as 
			 *  "now" (i.e. the currentTime).
			 *
			 *  [Tone.Time Wiki](https://github.com/TONEnoTONE/Tone.js/wiki/Time)
			 *  
			 *  @typedef {number|string|undefined} Tone.Time 
			 */

			/**
			 *  @class  Oscillator-based transport allows for simple musical timing
			 *          supports tempo curves and time changes. Do not construct
			 *          an instance of the transport. One is automatically created 
			 *          on init and additional transports cannot be created. <br><br>
			 *          If you need to schedule highly independent callback functions,
			 *          check out {@link Tone.Clock}.
			 *
			 *  @extends {Tone}
			 */
			Tone.Transport = function(){

				/**
				 *  watches the main oscillator for timing ticks
				 *  initially starts at 120bpm
				 *  
				 *  @private
				 *  @type {Tone.Clock}
				 */
				this._clock = new Tone.Clock(0, this._processTick.bind(this));

				/** 
				 * 	If the transport loops or not.
				 *  @type {boolean}
				 */
				this.loop = false;

				/**
				 *  the bpm value
				 *  @type {Tone.Signal}
				 */
				this.bpm = new Tone.Signal(120, Tone.Signal.Units.BPM);

				/**
				 *  the signal scalar
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._bpmMult = new Tone.Multiply(1/60 * tatum);

				/**
				 * 	The state of the transport. 
				 *  @type {TransportState}
				 */
				this.state = TransportState.STOPPED;

				//connect it all up
				this.bpm.chain(this._bpmMult, this._clock.frequency);
			};

			Tone.extend(Tone.Transport);

			/**
			 *  the defaults
			 *  @type {Object}
			 *  @const
			 *  @static
			 */
			Tone.Transport.defaults = {
				"bpm" : 120,
				"swing" : 0,
				"swingSubdivision" : "16n",
				"timeSignature" : 4,
				"loopStart" : 0,
				"loopEnd" : "4m"
			};

			/** 
			 * @private
			 * @type {number}
			 */
			var tatum = 12;

			/** 
			 * @private 
			 * @type {number} 
			 */
			var timelineTicks = 0;

			/** 
			 * @private 
			 * @type {number} 
			 */
			var transportTicks = 0;

			/**
			 *  Which subdivision the swing is applied to.
			 *  defaults to an 16th note
			 *  @private
			 *  @type {number}
			 */
			var swingSubdivision = "16n";

			/**
			 *  controls which beat the swing is applied to
			 *  defaults to an 16th note
			 *  @private
			 *  @type {number}
			 */
			var swingTatum = 3;

			/**
			 *  controls which beat the swing is applied to
			 *  @private
			 *  @type {number}
			 */
			var swingAmount = 0;

			/** 
			 * @private
			 * @type {number}
			 */
			var transportTimeSignature = 4;

			/** 
			 * @private
			 * @type {number}
			 */
			var loopStart = 0;

			/** 
			 * @private
			 * @type {number}
			 */
			var loopEnd = tatum * 4;

			/** 
			 * @private
			 * @type {Array}
			 */
			var intervals = [];
			
			/** 
			 * @private
			 * @type {Array}
			 */
			var timeouts = [];
			
			/** 
			 * @private
			 * @type {Array}
			 */
			var transportTimeline = [];
			
			/** 
			 * @private
			 * @type {number}
			 */
			var timelineProgress = 0;

			/** 
			 *  All of the synced components
			 *  @private 
			 *  @type {Array<Tone>}
			 */
			var SyncedSources = [];

			/** 
			 *  All of the synced Signals
			 *  @private 
			 *  @type {Array<Tone.Signal>}
			 */
			var SyncedSignals = [];

			/**
			 *  @enum
			 */
			 var TransportState = {
			 	STARTED : "started",
			 	PAUSED : "paused",
			 	STOPPED : "stopped"
			 };

			///////////////////////////////////////////////////////////////////////////////
			//	TICKS
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  called on every tick
			 *  @param   {number} tickTime clock relative tick time
			 *  @private
			 */
			Tone.Transport.prototype._processTick = function(tickTime){
				if (this.state === TransportState.STARTED){
					if (swingAmount > 0 && 
						timelineTicks % tatum !== 0 && //not on a downbeat
						timelineTicks % swingTatum === 0){
						//add some swing
						tickTime += this._ticksToSeconds(swingTatum) * swingAmount;
					}
					processIntervals(tickTime);
					processTimeouts(tickTime);
					processTimeline(tickTime);
					transportTicks += 1;
					timelineTicks += 1;
					if (this.loop){
						if (timelineTicks === loopEnd){
							this._setTicks(loopStart);
						}
					}
				}
			};

			/**
			 *  jump to a specific tick in the timeline
			 *  updates the timeline callbacks
			 *  
			 *  @param   {number} ticks the tick to jump to
			 *  @private
			 */
			Tone.Transport.prototype._setTicks = function(ticks){
				timelineTicks = ticks;
				for (var i = 0; i < transportTimeline.length; i++){
					var timeout = transportTimeline[i];
					if (timeout.callbackTick() >= ticks){
						timelineProgress = i;
						break;
					}
				}
			};

			///////////////////////////////////////////////////////////////////////////////
			//	EVENT PROCESSING
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  process the intervals
			 *  @param  {number} time 
			 */
			var processIntervals = function(time){
				for (var i = 0, len = intervals.length; i<len; i++){
					var interval = intervals[i];
					if (interval.testInterval(transportTicks)){
						interval.doCallback(time);
					}
				}
			};

			/**
			 *  process the timeouts
			 *  @param  {number} time 
			 */
			var processTimeouts = function(time){
				var removeTimeouts = 0;
				for (var i = 0, len = timeouts.length; i<len; i++){
					var timeout = timeouts[i];
					var callbackTick = timeout.callbackTick();
					if (callbackTick <= transportTicks){
						timeout.doCallback(time);
						removeTimeouts++;
					} else if (callbackTick > transportTicks){
						break;
					} 
				}
				//remove the timeouts off the front of the array after they've been called
				timeouts.splice(0, removeTimeouts);
			};

			/**
			 *  process the transportTimeline events
			 *  @param  {number} time 
			 */
			var processTimeline = function(time){
				for (var i = timelineProgress, len = transportTimeline.length; i<len; i++){
					var evnt = transportTimeline[i];
					var callbackTick = evnt.callbackTick();
					if (callbackTick === timelineTicks){
						timelineProgress = i;
						evnt.doCallback(time);
					} else if (callbackTick > timelineTicks){
						break;
					} 
				}
			};

			///////////////////////////////////////////////////////////////////////////////
			//	INTERVAL
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  Set a callback for a recurring event.
			 *
			 *  @param {function} callback
			 *  @param {Tone.Time}   interval 
			 *  @return {number} the id of the interval
			 *  @example
			 *  //triggers a callback every 8th note with the exact time of the event
			 *  Tone.Transport.setInterval(function(time){
			 *  	envelope.triggerAttack(time);
			 *  }, "8n");
			 */
			Tone.Transport.prototype.setInterval = function(callback, interval, ctx){
				var tickTime = this._toTicks(interval);
				var timeout = new TimelineEvent(callback, ctx, tickTime, transportTicks);
				intervals.push(timeout);
				return timeout.id;
			};

			/**
			 *  clear an interval from the processing array
			 *  @param  {number} rmInterval 	the interval to remove
			 *  @return {boolean}            	true if the event was removed
			 */
			Tone.Transport.prototype.clearInterval = function(rmInterval){
				for (var i = 0; i < intervals.length; i++){
					var interval = intervals[i];
					if (interval.id === rmInterval){
						intervals.splice(i, 1);
						return true;
					}
				}
				return false;
			};

			/**
			 *  removes all of the intervals that are currently set
			 *  @return {boolean}            	true if the event was removed
			 */
			Tone.Transport.prototype.clearIntervals = function(){
				var willRemove = intervals.length > 0;
				intervals = [];
				return willRemove;
			};

			///////////////////////////////////////////////////////////////////////////////
			//	TIMEOUT
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  Set a timeout to occur after time from now. NB: the transport must be 
			 *  running for this to be triggered. All timeout events are cleared when the 
			 *  transport is stopped. 
			 *
			 *  @param {function} callback 
			 *  @param {Tone.Time}   time     
			 *  @return {number} the id of the timeout for clearing timeouts
			 *  @example
			 *  //trigger an event to happen 1 second from now
			 *  Tone.Transport.setTimeout(function(time){
			 *  	player.start(time);
			 *  }, 1)
			 */
			Tone.Transport.prototype.setTimeout = function(callback, time, ctx){
				var ticks = this._toTicks(time);
				var timeout = new TimelineEvent(callback, ctx, ticks + transportTicks, 0);
				//put it in the right spot
				for (var i = 0, len = timeouts.length; i<len; i++){
					var testEvnt = timeouts[i];
					if (testEvnt.callbackTick() > timeout.callbackTick()){
						timeouts.splice(i, 0, timeout);
						return timeout.id;
					}
				}
				//otherwise push it on the end
				timeouts.push(timeout);
				return timeout.id;
			};

			/**
			 *  clear the timeout based on it's ID
			 *  @param  {number} timeoutID 
			 *  @return {boolean}           true if the timeout was removed
			 */
			Tone.Transport.prototype.clearTimeout = function(timeoutID){
				for (var i = 0; i < timeouts.length; i++){
					var testTimeout = timeouts[i];
					if (testTimeout.id === timeoutID){
						timeouts.splice(i, 1);
						return true;
					}
				}
				return false;
			};

			/**
			 *  removes all of the timeouts that are currently set
			 *  @return {boolean}            	true if the event was removed
			 */
			Tone.Transport.prototype.clearTimeouts = function(){
				var willRemove = timeouts.length > 0;
				timeouts = [];
				return willRemove;
			};

			///////////////////////////////////////////////////////////////////////////////
			//	TIMELINE
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  Timeline events are synced to the transportTimeline of the Tone.Transport
			 *  Unlike Timeout, Timeline events will restart after the 
			 *  Tone.Transport has been stopped and restarted. 
			 *
			 *  @param {function} 	callback 	
			 *  @param {Tome.Time}  timeout  
			 *  @return {number} 				the id for clearing the transportTimeline event
			 *  @example
			 *  //trigger the start of a part on the 16th measure
			 *  Tone.Transport.setTimeline(function(time){
			 *  	part.start(time);
			 *  }, "16m");
			 */
			Tone.Transport.prototype.setTimeline = function(callback, timeout, ctx){
				var ticks = this._toTicks(timeout);
				var timelineEvnt = new TimelineEvent(callback, ctx, ticks, 0);
				//put it in the right spot
				for (var i = timelineProgress, len = transportTimeline.length; i<len; i++){
					var testEvnt = transportTimeline[i];
					if (testEvnt.callbackTick() > timelineEvnt.callbackTick()){
						transportTimeline.splice(i, 0, timelineEvnt);
						return timelineEvnt.id;
					}
				}
				//otherwise push it on the end
				transportTimeline.push(timelineEvnt);
				return timelineEvnt.id;
			};

			/**
			 *  clear the transportTimeline event from the 
			 *  @param  {number} timelineID 
			 *  @return {boolean} true if it was removed
			 */
			Tone.Transport.prototype.clearTimeline = function(timelineID){
				for (var i = 0; i < transportTimeline.length; i++){
					var testTimeline = transportTimeline[i];
					if (testTimeline.id === timelineID){
						transportTimeline.splice(i, 1);
						return true;
					}
				}
				return false;
			};

			/**
			 *  remove all events from the timeline
			 *  @returns {boolean} true if the events were removed
			 */
			Tone.Transport.prototype.clearTimelines = function(){
				timelineProgress = 0;
				var willRemove = transportTimeline.length > 0;
				transportTimeline = [];
				return willRemove;
			};

			///////////////////////////////////////////////////////////////////////////////
			//	TIME CONVERSIONS
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  turns the time into
			 *  @param  {Tone.Time} time
			 *  @return {number}   
			 *  @private   
			 */
			Tone.Transport.prototype._toTicks = function(time){
				//get the seconds
				var seconds = this.toSeconds(time);
				var quarter = this.notationToSeconds("4n");
				var quarters = seconds / quarter;
				var tickNum = quarters * tatum;
				//quantize to tick value
				return Math.round(tickNum);
			};

			/**
			 *  convert ticks into seconds
			 *  
			 *  @param  {number} ticks 
			 *  @param {number=} bpm 
			 *  @param {number=} timeSignature
			 *  @return {number}               seconds
			 *  @private
			 */
			Tone.Transport.prototype._ticksToSeconds = function(ticks, bpm, timeSignature){
				ticks = Math.floor(ticks);
				var quater = this.notationToSeconds("4n", bpm, timeSignature);
				return (quater * ticks) / (tatum);
			};

			/**
			 *  returns the time of the next beat
			 *  @param  {string} [subdivision="4n"]
			 *  @return {number} 	the time in seconds of the next subdivision
			 */
			Tone.Transport.prototype.nextBeat = function(subdivision){
				subdivision = this.defaultArg(subdivision, "4n");
				var tickNum = this._toTicks(subdivision);
				var remainingTicks = (transportTicks % tickNum);
				var nextTick = remainingTicks;
				if (remainingTicks > 0){
					nextTick = tickNum - remainingTicks;
				}
				return this._ticksToSeconds(nextTick);
			};


			///////////////////////////////////////////////////////////////////////////////
			//	START/STOP/PAUSE
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  start the transport and all sources synced to the transport
			 *  
			 *  @param  {Tone.Time} time
			 *  @param  {Tone.Time=} offset the offset position to start
			 *  @returns {Tone.Transport} `this`
			 */
			Tone.Transport.prototype.start = function(time, offset){
				if (this.state === TransportState.STOPPED || this.state === TransportState.PAUSED){
					if (!this.isUndef(offset)){
						this._setTicks(this._toTicks(offset));
					}
					this.state = TransportState.STARTED;
					var startTime = this.toSeconds(time);
					this._clock.start(startTime);
					//call start on each of the synced sources
					for (var i = 0; i < SyncedSources.length; i++){
						var source = SyncedSources[i].source;
						var delay = SyncedSources[i].delay;
						source.start(startTime + delay);
					}
				}
				return this;
			};


			/**
			 *  stop the transport and all sources synced to the transport
			 *  
			 *  @param  {Tone.Time} time
			 *  @returns {Tone.Transport} `this`
			 */
			Tone.Transport.prototype.stop = function(time){
				if (this.state === TransportState.STARTED || this.state === TransportState.PAUSED){
					var stopTime = this.toSeconds(time);
					this._clock.stop(stopTime, this._onended.bind(this));
					//call start on each of the synced sources
					for (var i = 0; i < SyncedSources.length; i++){
						var source = SyncedSources[i].source;
						source.stop(stopTime);
					}
				} else {
					this._onended();
				}
				return this;
			};

			/**
			 *  invoked when the transport is stopped
			 *  @private
			 */
			Tone.Transport.prototype._onended = function(){
				transportTicks = 0;
				this._setTicks(0);
				this.clearTimeouts();
				this.state = TransportState.STOPPED;
			};

			/**
			 *  pause the transport and all sources synced to the transport
			 *  
			 *  @param  {Tone.Time} time
			 *  @returns {Tone.Transport} `this`
			 */
			Tone.Transport.prototype.pause = function(time){
				if (this.state === TransportState.STARTED){
					this.state = TransportState.PAUSED;
					var stopTime = this.toSeconds(time);
					this._clock.stop(stopTime);
					//call pause on each of the synced sources
					for (var i = 0; i < SyncedSources.length; i++){
						var source = SyncedSources[i].source;
						source.pause(stopTime);
					}
				}
				return this;
			};

			///////////////////////////////////////////////////////////////////////////////
			//	SETTERS/GETTERS
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  Time signature as just the numerator over 4. 
			 *  For example 4/4 would be just 4 and 6/8 would be 3.
			 *  @memberOf Tone.Transport#
			 *  @type {number}
			 *  @name timeSignature
			 */
			Object.defineProperty(Tone.Transport.prototype, "timeSignature", {
				get : function(){
					return transportTimeSignature;
				},
				set : function(numerator){
					transportTimeSignature = numerator;
				}
			});


			/**
			 * The loop start point
			 * @memberOf Tone.Transport#
			 * @type {Tone.Time}
			 * @name loopStart
			 */
			Object.defineProperty(Tone.Transport.prototype, "loopStart", {
				get : function(){
					return this._ticksToSeconds(loopStart);
				},
				set : function(startPosition){
					loopStart = this._toTicks(startPosition);
				}
			});

			/**
			 * The loop end point
			 * @memberOf Tone.Transport#
			 * @type {Tone.Time}
			 * @name loopEnd
			 */
			Object.defineProperty(Tone.Transport.prototype, "loopEnd", {
				get : function(){
					return this._ticksToSeconds(loopEnd);
				},
				set : function(endPosition){
					loopEnd = this._toTicks(endPosition);
				}
			});

			/**
			 *  shorthand loop setting
			 *  @param {Tone.Time} startPosition 
			 *  @param {Tone.Time} endPosition   
			 *  @returns {Tone.Transport} `this`
			 */
			Tone.Transport.prototype.setLoopPoints = function(startPosition, endPosition){
				this.loopStart = startPosition;
				this.loopEnd = endPosition;
				return this;
			};

			/**
			 *  The swing value. Between 0-1 where 1 equal to 
			 *  the note + half the subdivision.
			 *  @memberOf Tone.Transport#
			 *  @type {number}
			 *  @name swing
			 */
			Object.defineProperty(Tone.Transport.prototype, "swing", {
				get : function(){
					return swingAmount * 2;
				},
				set : function(amount){
					//scale the values to a normal range
					swingAmount = amount * 0.5;
				}
			});

			/**
			 *  Set the subdivision which the swing will be applied to. 
			 *  The default values is a 16th note. Value must be less 
			 *  than a quarter note.
			 *  
			 *  
			 *  @memberOf Tone.Transport#
			 *  @type {Tone.Time}
			 *  @name swingSubdivision
			 */
			Object.defineProperty(Tone.Transport.prototype, "swingSubdivision", {
				get : function(){
					return swingSubdivision;
				},
				set : function(subdivision){
					//scale the values to a normal range
					swingSubdivision = subdivision;
					swingTatum = this._toTicks(subdivision);
				}
			});

			/**
			 *  The Transport's position in MEASURES:BEATS:SIXTEENTHS.
			 *  Setting the value will jump to that position right away. 
			 *  
			 *  @memberOf Tone.Transport#
			 *  @type {string}
			 *  @name position
			 */
			Object.defineProperty(Tone.Transport.prototype, "position", {
				get : function(){
					var quarters = timelineTicks / tatum;
					var measures = Math.floor(quarters / transportTimeSignature);
					var sixteenths = Math.floor((quarters % 1) * 4);
					quarters = Math.floor(quarters) % transportTimeSignature;
					var progress = [measures, quarters, sixteenths];
					return progress.join(":");
				},
				set : function(progress){
					var ticks = this._toTicks(progress);
					this._setTicks(ticks);
				}
			});

			///////////////////////////////////////////////////////////////////////////////
			//	SYNCING
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  Sync a source to the transport so that 
			 *  @param  {Tone.Source} source the source to sync to the transport
			 *  @param {Tone.Time} delay (optionally) start the source with a delay from the transport
			 *  @returns {Tone.Transport} `this`
			 */
			Tone.Transport.prototype.syncSource = function(source, startDelay){
				SyncedSources.push({
					source : source,
					delay : this.toSeconds(this.defaultArg(startDelay, 0))
				});
				return this;
			};

			/**
			 *  remove the source from the list of Synced Sources
			 *  
			 *  @param  {Tone.Source} source [description]
			 *  @returns {Tone.Transport} `this`
			 */
			Tone.Transport.prototype.unsyncSource = function(source){
				for (var i = 0; i < SyncedSources.length; i++){
					if (SyncedSources[i].source === source){
						SyncedSources.splice(i, 1);
					}
				}
				return this;
			};

			/**
			 *  attaches the signal to the tempo control signal so that 
			 *  any changes in the tempo will change the signal in the same
			 *  ratio. 
			 *  
			 *  @param  {Tone.Signal} signal 
			 *  @param {number=} ratio Optionally pass in the ratio between
			 *                         the two signals. Otherwise it will be computed
			 *                         based on their current values. 
			 *  @returns {Tone.Transport} `this`
			 */
			Tone.Transport.prototype.syncSignal = function(signal, ratio){
				if (!ratio){
					//get the sync ratio
					if (signal._value.value !== 0){
						ratio = signal._value.value / this.bpm.value;
					} else {
						ratio = 0;
					}
				}
				var ratioSignal = this.context.createGain();
				ratioSignal.gain.value = ratio;
				this.bpm.chain(ratioSignal, signal._value);
				SyncedSignals.push({
					"ratio" : ratioSignal,
					"signal" : signal,
					"initial" : signal._value.value
				});
				signal._value.value = 0;
				return this;
			};

			/**
			 *  Unsyncs a previously synced signal from the transport's control
			 *  @param  {Tone.Signal} signal 
			 *  @returns {Tone.Transport} `this`
			 */
			Tone.Transport.prototype.unsyncSignal = function(signal){
				for (var i = 0; i < SyncedSignals.length; i++){
					var syncedSignal = SyncedSignals[i];
					if (syncedSignal.signal === signal){
						syncedSignal.ratio.disconnect();
						syncedSignal.signal._value.value = syncedSignal.initial;
						SyncedSignals.splice(i, 1);
					}
				}
				return this;
			};

			/**
			 *  clean up
			 *  @returns {Tone.Transport} `this`
			 */
			Tone.Transport.prototype.dispose = function(){
				this._clock.dispose();
				this._clock = null;
				this.bpm.dispose();
				this.bpm = null;
				this._bpmMult.dispose();
				this._bpmMult = null;
				return this;
			};

			///////////////////////////////////////////////////////////////////////////////
			//	TIMELINE EVENT
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  @static
			 *  @type {number}
			 */
			var TimelineEventIDCounter = 0;

			/**
			 *  A Timeline event
			 *
			 *  @constructor
			 *  @private
			 *  @param {function(number)} callback   
			 *  @param {Object}   context    
			 *  @param {number}   tickTime
		 	 *  @param {number}   startTicks
			 */
			var TimelineEvent = function(callback, context, tickTime, startTicks){
				this.startTicks = startTicks;
				this.tickTime = tickTime;
				this.callback = callback;
				this.context = context;
				this.id = TimelineEventIDCounter++;
			};
			
			/**
			 *  invoke the callback in the correct context
			 *  passes in the playback time
			 *  
			 *  @param  {number} playbackTime 
			 */
			TimelineEvent.prototype.doCallback = function(playbackTime){
				this.callback.call(this.context, playbackTime); 
			};

			/**
			 *  get the tick which the callback is supposed to occur on
			 *  
			 *  @return {number} 
			 */
			TimelineEvent.prototype.callbackTick = function(){
				return this.startTicks + this.tickTime;
			};

			/**
			 *  test if the tick occurs on the interval
			 *  
			 *  @param  {number} tick 
			 *  @return {boolean}      
			 */
			TimelineEvent.prototype.testInterval = function(tick){
				return (tick - this.startTicks) % this.tickTime === 0;
			};


			///////////////////////////////////////////////////////////////////////////////
			//	AUGMENT TONE'S PROTOTYPE TO INCLUDE TRANSPORT TIMING
			///////////////////////////////////////////////////////////////////////////////

			/**
			 *  tests if a string is musical notation
			 *  i.e.:
			 *  	4n = quarter note
			 *   	2m = two measures
			 *    	8t = eighth-note triplet
			 *  defined in "Tone/core/Transport"
			 *  
			 *  @return {boolean} 
			 *  @method isNotation
			 *  @lends Tone.prototype.isNotation
			 */
			Tone.prototype.isNotation = (function(){
				var notationFormat = new RegExp(/[0-9]+[mnt]$/i);
				return function(note){
					return notationFormat.test(note);
				};
			})();

			/**
			 *  tests if a string is transportTime
			 *  i.e. :
			 *  	1:2:0 = 1 measure + two quarter notes + 0 sixteenth notes
			 *  defined in "Tone/core/Transport"
			 *  	
			 *  @return {boolean} 
			 *
			 *  @method isTransportTime
			 *  @lends Tone.prototype.isTransportTime
			 */
			Tone.prototype.isTransportTime = (function(){
				var transportTimeFormat = new RegExp(/^\d+(\.\d+)?:\d+(\.\d+)?(:\d+(\.\d+)?)?$/i);
				return function(transportTime){
					return transportTimeFormat.test(transportTime);
				};
			})();

			/**
			 *
			 *  convert notation format strings to seconds
			 *  defined in "Tone/core/Transport"
			 *  
			 *  @param  {string} notation     
			 *  @param {number=} bpm 
			 *  @param {number=} timeSignature 
			 *  @return {number} 
			 *                
			 */
			Tone.prototype.notationToSeconds = function(notation, bpm, timeSignature){
				bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
				timeSignature = this.defaultArg(timeSignature, transportTimeSignature);
				var beatTime = (60 / bpm);
				var subdivision = parseInt(notation, 10);
				var beats = 0;
				if (subdivision === 0){
					beats = 0;
				}
				var lastLetter = notation.slice(-1);
				if (lastLetter === "t"){
					beats = (4 / subdivision) * 2/3;
				} else if (lastLetter === "n"){
					beats = 4 / subdivision;
				} else if (lastLetter === "m"){
					beats = subdivision * timeSignature;
				} else {
					beats = 0;
				}
				return beatTime * beats;
			};

			/**
			 *  convert transportTime into seconds
			 *  defined in "Tone/core/Transport"
			 *  
			 *  ie: 4:2:3 == 4 measures + 2 quarters + 3 sixteenths
			 *
			 *  @param  {string} transportTime 
			 *  @param {number=} bpm 
			 *  @param {number=} timeSignature
			 *  @return {number}               seconds
			 *
			 *  @lends Tone.prototype.transportTimeToSeconds
			 */
			Tone.prototype.transportTimeToSeconds = function(transportTime, bpm, timeSignature){
				bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
				timeSignature = this.defaultArg(timeSignature, transportTimeSignature);
				var measures = 0;
				var quarters = 0;
				var sixteenths = 0;
				var split = transportTime.split(":");
				if (split.length === 2){
					measures = parseFloat(split[0]);
					quarters = parseFloat(split[1]);
				} else if (split.length === 1){
					quarters = parseFloat(split[0]);
				} else if (split.length === 3){
					measures = parseFloat(split[0]);
					quarters = parseFloat(split[1]);
					sixteenths = parseFloat(split[2]);
				}
				var beats = (measures * timeSignature + quarters + sixteenths / 4);
				return beats * this.notationToSeconds("4n");
			};

			/**
			 *  Convert seconds to the closest transportTime in the form 
			 *  	measures:quarters:sixteenths
			 *  defined in "Tone/core/Transport"
			 *
			 *  @method toTransportTime
			 *  
			 *  @param {Tone.Time} seconds 
			 *  @param {number=} bpm 
			 *  @param {number=} timeSignature
			 *  @return {string}  
			 *  
			 *  @lends Tone.prototype.toTransportTime
			 */
			Tone.prototype.toTransportTime = function(time, bpm, timeSignature){
				var seconds = this.toSeconds(time, bpm, timeSignature);
				bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
				timeSignature = this.defaultArg(timeSignature, transportTimeSignature);
				var quarterTime = this.notationToSeconds("4n");
				var quarters = seconds / quarterTime;
				var measures = Math.floor(quarters / timeSignature);
				var sixteenths = Math.floor((quarters % 1) * 4);
				quarters = Math.floor(quarters) % timeSignature;
				var progress = [measures, quarters, sixteenths];
				return progress.join(":");
			};

			/**
			 *  Convert a frequency representation into a number.
			 *  Defined in "Tone/core/Transport".
			 *  	
			 *  @param  {Tone.Frequency} freq 
			 *  @param {number=} 	now 	if passed in, this number will be 
			 *                        		used for all 'now' relative timings
			 *  @return {number}      the frequency in hertz
			 */
			Tone.prototype.toFrequency = function(freq, now){
				if (this.isFrequency(freq)){
					return parseFloat(freq);
				} else if (this.isNotation(freq) || this.isTransportTime(freq)) {
					return this.secondsToFrequency(this.toSeconds(freq, now));
				} else {
					return freq;
				}
			};

			/**
			 *  Convert Tone.Time into seconds.
			 *  Defined in "Tone/core/Transport".
			 *  
			 *  Unlike the method which it overrides, this takes into account 
			 *  transporttime and musical notation.
			 *
			 *  Time : 1.40
			 *  Notation: 4n|1m|2t
			 *  TransportTime: 2:4:1 (measure:quarters:sixteens)
			 *  Now Relative: +3n
			 *  Math: 3n+16n or even very complicated expressions ((3n*2)/6 + 1)
			 *
			 *  @override
			 *  @param  {Tone.Time} time       
			 *  @param {number=} 	now 	if passed in, this number will be 
			 *                        		used for all 'now' relative timings
			 *  @return {number} 
			 */
			Tone.prototype.toSeconds = function(time, now){
				now = this.defaultArg(now, this.now());
				if (typeof time === "number"){
					return time; //assuming that it's seconds
				} else if (typeof time === "string"){
					var plusTime = 0;
					if(time.charAt(0) === "+") {
						plusTime = now;
						time = time.slice(1);
					} 
					var components = time.split(/[\(\)\-\+\/\*]/);
					if (components.length > 1){
						var originalTime = time;
						for(var i = 0; i < components.length; i++){
							var symb = components[i].trim();
							if (symb !== ""){
								var val = this.toSeconds(symb);
								time = time.replace(symb, val);
							}
						}
						try {
							//i know eval is evil, but i think it's safe here
							time = eval(time); // jshint ignore:line
						} catch (e){
							throw new EvalError("problem evaluating Tone.Time: "+originalTime);
						}
					} else if (this.isNotation(time)){
						time = this.notationToSeconds(time);
					} else if (this.isTransportTime(time)){
						time = this.transportTimeToSeconds(time);
					} else if (this.isFrequency(time)){
						time = this.frequencyToSeconds(time);
					} else {
						time = parseFloat(time);
					}
					return time + plusTime;
				} else {
					return now;
				}
			};

			var TransportConstructor = Tone.Transport;

			Tone._initAudioContext(function(){
				if (typeof Tone.Transport === "function"){
					//a single transport object
					Tone.Transport = new Tone.Transport();
				} else {
					//stop the clock
					Tone.Transport.stop();
					//get the previous bpm
					var bpm = Tone.Transport.bpm.value;
					//destory the old clock
					Tone.Transport._clock.dispose();
					//make new Transport insides
					TransportConstructor.call(Tone.Transport);
					//set the bpm
					Tone.Transport.bpm.value = bpm;
				}
			});

			return Tone.Transport;
		});

		ToneModule( function(Tone){

			
			
			/**
			 *  @class  A single master output which is connected to the
			 *          AudioDestinationNode. It provides useful conveniences
			 *          such as the ability to set the global volume and mute
			 *          the entire application. Additionally, it accepts
			 *          a master send/receive for adding final compression, 
			 *          limiting or effects to your application. <br><br>
			 *          Like the Transport, the Master output is created for you
			 *          on initialization. It does not need to be created.
			 *
			 *  @constructor
			 *  @extends {Tone}
			 */
			Tone.Master = function(){
				Tone.call(this);

				/**
				 * the unmuted volume
				 * @type {number}
				 * @private
				 */
				this._unmutedVolume = 1;

				/**
				 * the volume of the output in decibels
				 * @type {Tone.Signal}
				 */
				this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);
				
				//connections
				this.input.chain(this.output, this.context.destination);
			};

			Tone.extend(Tone.Master);

			/**
			 *  Mutethe output
			 *  @returns {Tone.Master} `this`
			 */
			Tone.Master.prototype.mute = function(){
				this._unmutedVolume = this.volume.value;
				//maybe it should ramp here?
				this.volume.value = -Infinity;
				return this;
			};

			/**
			 *  Unmute the output. Will return the volume to it's value before 
			 *  the output was muted. 
			 *  @returns {Tone.Master} `this`
			 */
			Tone.Master.prototype.mute = function(){
				this.volume.value = this._unmutedVolume;
				return this;
			};

			/**
			 *  route the master signal to the node's input. 
			 *  NOTE: this will disconnect the previously connected node
			 *  @param {AudioNode|Tone} node the node to use as the entry
			 *                               point to the master chain
			 *  @returns {Tone.Master} `this`
			 */
			Tone.Master.prototype.send = function(node){
				//disconnect the previous node
				this.input.disconnect();
				this.input.connect(node);
				return this;
			};

			/**
			 *  the master effects chain return point
			 *  @param {AudioNode|Tone} node the node to connect 
			 *  @returns {Tone.Master} `this`
			 */
			Tone.Master.prototype.receive = function(node){
				node.connect(this.output);
				return this;
			};

			///////////////////////////////////////////////////////////////////////////
			//	AUGMENT TONE's PROTOTYPE
			///////////////////////////////////////////////////////////////////////////

			/**
			 *  connect 'this' to the master output
			 *  defined in "Tone/core/Master"
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.toMaster = function(){
				this.connect(Tone.Master);
				return this;
			};

			/**
			 *  Also augment AudioNode's prototype to include toMaster
			 *  as a convenience
			 *  @returns {AudioNode} `this`
			 */
			AudioNode.prototype.toMaster = function(){
				this.connect(Tone.Master);
				return this;
			};

			var MasterConstructor = Tone.Master;

			/**
			 *  initialize the module and listen for new audio contexts
			 */
			Tone._initAudioContext(function(){
				//a single master output
				if (!Tone.prototype.isUndef(Tone.Master)){
					Tone.Master = new MasterConstructor();
				} else {
					MasterConstructor.prototype.dispose.call(Tone.Master);
					MasterConstructor.call(Tone.Master);
				}
			});

			return Tone.Master;
		});
		ToneModule( function(Tone){

			
			
			/**
			 *  @class  Base class for sources.
			 *          Sources have start/stop/pause and 
			 *          the ability to be synced to the 
			 *          start/stop/pause of Tone.Transport.
			 *
			 *  @constructor
			 *  @extends {Tone}
			 */	
			Tone.Source = function(options){
				//unlike most ToneNodes, Sources only have an output and no input
				Tone.call(this, 0, 1);
				options = this.defaultArg(options, Tone.Source.defaults);

				/**
				 * The onended callback when the source is done playing.
				 * @type {function}
				 * @example
				 *  source.onended = function(){
				 *  	console.log("the source is done playing");
				 *  }
				 */
				this.onended = options.onended;

				/**
				 *  the next time the source is started
				 *  @type {number}
				 *  @private
				 */
				this._nextStart = Infinity;

				/**
				 *  the next time the source is stopped
				 *  @type {number}
				 *  @private
				 */
				this._nextStop = Infinity;

				/**
				 * The volume of the output in decibels.
				 * @type {Tone.Signal}
				 * @example
				 * source.volume.value = -6;
				 */
				this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);

				/**
				 * 	keeps track of the timeout for chaning the state
				 * 	and calling the onended
				 *  @type {number}
				 *  @private
				 */
				this._timeout = -1;
			};

			Tone.extend(Tone.Source);

			/**
			 *  The default parameters
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.Source.defaults = {
				"onended" : function(){},
				"volume" : 0,
			};

			/**
			 *  @enum {string}
			 */
			Tone.Source.State = {
				STARTED : "started",
				PAUSED : "paused",
				STOPPED : "stopped",
		 	};

			/**
			 *  Returns the playback state of the source, either "started" or "stopped".
			 *  @type {Tone.Source.State}
			 *  @readOnly
			 *  @memberOf Tone.Source#
			 *  @name state
			 */
			Object.defineProperty(Tone.Source.prototype, "state", {
				get : function(){
					return this._stateAtTime(this.now());
				}
			});

			/**
			 *  Get the state of the source at the specified time.
			 *  @param  {Tone.Time}  time
			 *  @return  {Tone.Source.State} 
			 *  @private
			 */
			Tone.Source.prototype._stateAtTime = function(time){
				time = this.toSeconds(time);
				if (this._nextStart <= time && this._nextStop > time){
					return Tone.Source.State.STARTED;
				} else if (this._nextStop <= time){
					return Tone.Source.State.STOPPED;
				} else {
					return Tone.Source.State.STOPPED;
				}
			};

			/**
			 *  Start the source at the time.
			 *  @param  {Tone.Time} [time=now]
			 *  @returns {Tone.Source} `this`
			 *  @example
			 *  source.start("+0.5"); //starts the source 0.5 seconds from now
			 */
			Tone.Source.prototype.start = function(time){
				time = this.toSeconds(time);
				if (this._stateAtTime(time) !== Tone.Source.State.STARTED || this.retrigger){
					this._nextStart = time;
					this._nextStop = Infinity;
					this._start.apply(this, arguments);
				}
				return this;
			};

			/**
			 * 	stop the source
			 *  @param  {Tone.Time} [time=now]
			 *  @returns {Tone.Source} `this`
			 *  @example
			 *  source.stop(); // stops the source immediately
			 */
			Tone.Source.prototype.stop = function(time){
				var now = this.now();
				time = this.toSeconds(time, now);
				if (this._stateAtTime(time) === Tone.Source.State.STARTED){
					this._nextStop = this.toSeconds(time);
					clearTimeout(this._timeout);
					var diff = time - now;
					if (diff > 0){
						//add a small buffer before invoking the callback
						this._timeout = setTimeout(this.onended, diff * 1000 + 20);
					} else {
						this.onended();
					}
					this._stop.apply(this, arguments);
				}
				return this;
			};

			/**
			 *  Not ready yet. 
		 	 *  @private
		 	 *  @abstract
			 *  @param  {Tone.Time} time 
			 *  @returns {Tone.Source} `this`
			 */
			Tone.Source.prototype.pause = function(time){
				//if there is no pause, just stop it
				this.stop(time);
				return this;
			};

			/**
			 *  Sync the source to the Transport so that when the transport
			 *  is started, this source is started and when the transport is stopped
			 *  or paused, so is the source. 
			 *
			 *  @param {Tone.Time} [delay=0] Delay time before starting the source after the
			 *                               Transport has started. 
			 *  @returns {Tone.Source} `this`
			 */
			Tone.Source.prototype.sync = function(delay){
				Tone.Transport.syncSource(this, delay);
				return this;
			};

			/**
			 *  Unsync the source to the Transport. See {@link Tone.Source#sync}
			 *  @returns {Tone.Source} `this`
			 */
			Tone.Source.prototype.unsync = function(){
				Tone.Transport.unsyncSource(this);
				return this;
			};

			/**
			 *	clean up
			 *  @return {Tone.Source} `this`
			 */
			Tone.Source.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this.stop();
				clearTimeout(this._timeout);
				this.onended = function(){};
				this.volume.dispose();
				this.volume = null;
			};

			return Tone.Source;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class Oscilator with start, pause, stop and sync to Transport methods
			 *
			 *  @constructor
			 *  @extends {Tone.Source}
			 *  @param {number|string} [frequency=440] starting frequency
			 *  @param {string} [type="sine"] type of oscillator (sine|square|triangle|sawtooth)
			 *  @example
			 *  var osc = new Tone.Oscillator(440, "sine");
			 */
			Tone.Oscillator = function(){
				
				var options = this.optionsObject(arguments, ["frequency", "type"], Tone.Oscillator.defaults);
				Tone.Source.call(this, options);

				/**
				 *  the main oscillator
				 *  @type {OscillatorNode}
				 *  @private
				 */
				this._oscillator = null;
				
				/**
				 *  The frequency control signal in hertz.
				 *  @type {Tone.Signal}
				 */
				this.frequency = new Tone.Signal(options.frequency, Tone.Signal.Units.Frequency);

				/**
				 *  The detune control signal in cents. 
				 *  @type {Tone.Signal}
				 */
				this.detune = new Tone.Signal(options.detune);

				/**
				 *  the periodic wave
				 *  @type {PeriodicWave}
				 *  @private
				 */
				this._wave = null;

				/**
				 *  the phase of the oscillator
				 *  between 0 - 360
				 *  @type {number}
				 *  @private
				 */
				this._phase = options.phase;

				/**
				 *  the type of the oscillator
				 *  @type {string}
				 *  @private
				 */
				this._type = null;
				
				//setup
				this.type = options.type;
				this.phase = this._phase;
			};

			Tone.extend(Tone.Oscillator, Tone.Source);

			/**
			 *  the default parameters
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.Oscillator.defaults = {
				"type" : "sine",
				"frequency" : 440,
				"detune" : 0,
				"phase" : 0
			};

			/**
			 *  start the oscillator
			 *  @param  {Tone.Time} [time=now] 
			 *  @private
			 */
			Tone.Oscillator.prototype._start = function(time){
				//new oscillator with previous values
				this._oscillator = this.context.createOscillator();
				this._oscillator.setPeriodicWave(this._wave);
				//connect the control signal to the oscillator frequency & detune
				this._oscillator.connect(this.output);
				this.frequency.connect(this._oscillator.frequency);
				this.detune.connect(this._oscillator.detune);
				//start the oscillator
				this._oscillator.start(this.toSeconds(time));
			};

			/**
			 *  stop the oscillator
			 *  @private
			 *  @param  {Tone.Time} [time=now] (optional) timing parameter
			 *  @returns {Tone.Oscillator} `this`
			 */
			Tone.Oscillator.prototype._stop = function(time){
				if (this._oscillator){
					this._oscillator.stop(this.toSeconds(time));
					this._oscillator = null;
				}
				return this;
			};

			/**
			 *  Sync the signal to the Transport's bpm. Any changes to the transports bpm,
			 *  will also affect the oscillators frequency. 
			 *  @returns {Tone.Oscillator} `this`
			 *  @example
			 *  Tone.Transport.bpm.value = 120;
			 *  osc.frequency.value = 440;
			 *  osc.syncFrequency();
			 *  Tone.Transport.bpm.value = 240; 
			 *  // the frequency of the oscillator is doubled to 880
			 */
			Tone.Oscillator.prototype.syncFrequency = function(){
				Tone.Transport.syncSignal(this.frequency);
				return this;
			};

			/**
			 *  Unsync the oscillator's frequency from the Transport. 
			 *  See {@link Tone.Oscillator#syncFrequency}.
			 *  @returns {Tone.Oscillator} `this`
			 */
			Tone.Oscillator.prototype.unsyncFrequency = function(){
				Tone.Transport.unsyncSignal(this.frequency);
				return this;
			};

			/**
			 * The type of the oscillator: either sine, square, triangle, or sawtooth.
			 *
			 * Uses PeriodicWave internally even for native types so that it can set the phase.
			 *
			 * PeriodicWave equations are from the Web Audio Source code:
			 * https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/modules/webaudio/PeriodicWave.cpp&sq=package:chromium
			 *  
			 * @memberOf Tone.Oscillator#
			 * @type {string}
			 * @name type
			 * @example
			 * osc.type = "square";
			 * osc.type; //returns "square"
			 */
			Object.defineProperty(Tone.Oscillator.prototype, "type", {
				get : function(){
					return this._type;
				},
				set : function(type){
					if (this.type !== type){

						var fftSize = 4096;
						var halfSize = fftSize / 2;

						var real = new Float32Array(halfSize);
						var imag = new Float32Array(halfSize);
						
						// Clear DC and Nyquist.
						real[0] = 0;
						imag[0] = 0;

						var shift = this._phase;	
						for (var n = 1; n < halfSize; ++n) {
							var piFactor = 2 / (n * Math.PI);
							var b; 
							switch (type) {
								case "sine": 
									b = (n === 1) ? 1 : 0;
									break;
								case "square":
									b = (n & 1) ? 2 * piFactor : 0;
									break;
								case "sawtooth":
									b = piFactor * ((n & 1) ? 1 : -1);
									break;
								case "triangle":
									if (n & 1) {
										b = 2 * (piFactor * piFactor) * ((((n - 1) >> 1) & 1) ? -1 : 1);
									} else {
										b = 0;
									}
									break;
								default:
									throw new TypeError("invalid oscillator type: "+type);
							}
							if (b !== 0){
								real[n] = -b * Math.sin(shift);
								imag[n] = b * Math.cos(shift);
							} else {
								real[n] = 0;
								imag[n] = 0;
							}
						}
						var periodicWave = this.context.createPeriodicWave(real, imag);
						this._wave = periodicWave;
						if (this._oscillator !== null){
							this._oscillator.setPeriodicWave(this._wave);
						}
						this._type = type;
					}
				}
			});

			/**
			 * The phase of the oscillator in degrees. 
			 * @memberOf Tone.Oscillator#
			 * @type {number}
			 * @name phase
			 * @example
			 * osc.phase = 180; //flips the phase of the oscillator
			 */
			Object.defineProperty(Tone.Oscillator.prototype, "phase", {
				get : function(){
					return this._phase * (180 / Math.PI);
				}, 
				set : function(phase){
					this._phase = phase * Math.PI / 180;
					//reset the type
					this.type = this._type;
				}
			});

			/**
			 *  dispose and disconnect
			 *  @return {Tone.Oscillator} `this`
			 */
			Tone.Oscillator.prototype.dispose = function(){
				Tone.Source.prototype.dispose.call(this);
				if (this._oscillator !== null){
					this._oscillator.disconnect();
					this._oscillator = null;
				}
				this.frequency.dispose();
				this.frequency = null;
				this.detune.dispose();
				this.detune = null;
				this._wave = null;
				return this;
			};

			return Tone.Oscillator;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class AudioToGain converts an input range of -1,1 to 0,1
			 *
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @example
			 *  var a2g = new Tone.AudioToGain();
			 */
			Tone.AudioToGain = function(){

				/**
				 *  @type {WaveShaperNode}
				 *  @private
				 */
				this._norm = this.input = this.output = new Tone.WaveShaper([0,1]);
			};

			Tone.extend(Tone.AudioToGain, Tone.SignalBase);

			/**
			 *  clean up
			 *  @returns {Tone.AND} `this`
			 */
			Tone.AudioToGain.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._norm.disconnect();
				this._norm = null;
				return this;
			};

			return Tone.AudioToGain;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  The Low Frequency Oscillator produces an output signal 
			 *          which can be attached to an AudioParam or Tone.Signal 
			 *          for constant control over that parameter. the LFO can 
			 *          also be synced to the transport to start/stop/pause
			 *          and change when the tempo changes.
			 *
			 *  @constructor
			 *  @extends {Tone.Oscillator}
			 *  @param {Tone.Time} [frequency="4n"]
			 *  @param {number} [outputMin=0]
			 *  @param {number} [outputMax=1]
			 *  @example
			 *  var lfo = new Tone.LFO("4n", 400, 4000);
			 *  lfo.connect(filter.frequency);
			 */
			Tone.LFO = function(){

				var options = this.optionsObject(arguments, ["frequency", "min", "max"], Tone.LFO.defaults);

				/** 
				 *  the oscillator
				 *  @type {Tone.Oscillator}
				 */
				this.oscillator = new Tone.Oscillator({
					"frequency" : options.frequency, 
					"type" : options.type, 
					"phase" : options.phase
				});

				/**
				 *  the lfo's frequency
				 *  @type {Tone.Signal}
				 */
				this.frequency = this.oscillator.frequency;

				/**
				 * The amplitude of the LFO, which controls the output range between
				 * the min and max output. For example if the min is -10 and the max 
				 * is 10, setting the amplitude to 0.5 would make the LFO modulate
				 * between -5 and 5. 
				 * @type {Tone.Signal}
				 */
				this.amplitude = this.oscillator.volume;
				this.amplitude.units = Tone.Signal.Units.Normal;
				this.amplitude.value = options.amplitude;

				/**
				 *  @type {Tone.AudioToGain} 
				 *  @private
				 */
				this._a2g = new Tone.AudioToGain();

				/**
				 *  @type {Tone.Scale} 
				 *  @private
				 */
				this._scaler = this.output = new Tone.Scale(options.min, options.max);

				//connect it up
				this.oscillator.chain(this._a2g, this._scaler);
			};

			Tone.extend(Tone.LFO, Tone.Oscillator);

			/**
			 *  the default parameters
			 *
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.LFO.defaults = {
				"type" : "sine",
				"min" : 0,
				"max" : 1,
				"phase" : 0,
				"frequency" : "4n",
				"amplitude" : 1
			};

			/**
			 *  Start the LFO. 
			 *  @param  {Tone.Time} [time=now] the time the LFO will start
			 *  @returns {Tone.LFO} `this`
			 */
			Tone.LFO.prototype.start = function(time){
				this.oscillator.start(time);
				return this;
			};

			/**
			 *  Stop the LFO. 
			 *  @param  {Tone.Time} [time=now] the time the LFO will stop
			 *  @returns {Tone.LFO} `this`
			 */
			Tone.LFO.prototype.stop = function(time){
				this.oscillator.stop(time);
				return this;
			};

			/**
			 *  Sync the start/stop/pause to the transport 
			 *  and the frequency to the bpm of the transport
			 *
			 *  @param {Tone.Time} [delay=0] the time to delay the start of the
			 *                                LFO from the start of the transport
			 *  @returns {Tone.LFO} `this`
			 *  @example
			 *  lfo.frequency.value = "8n";
			 *  lfo.sync();
			 *  // the rate of the LFO will always be an eighth note, 
			 *  // even as the tempo changes
			 */
			Tone.LFO.prototype.sync = function(delay){
				this.oscillator.sync(delay);
				this.oscillator.syncFrequency();
				return this;
			};

			/**
			 *  unsync the LFO from transport control
			 *  @returns {Tone.LFO} `this`
			 */
			Tone.LFO.prototype.unsync = function(){
				this.oscillator.unsync();
				this.oscillator.unsyncFrequency();
				return this;
			};

			/**
			 * The miniumum output of the LFO.
			 * @memberOf Tone.LFO#
			 * @type {number}
			 * @name min
			 */
			Object.defineProperty(Tone.LFO.prototype, "min", {
				get : function(){
					return this._scaler.min;
				},
				set : function(min){
					this._scaler.min = min;
				}
			});

			/**
			 * The maximum output of the LFO.
			 * @memberOf Tone.LFO#
			 * @type {number}
			 * @name max
			 */
			Object.defineProperty(Tone.LFO.prototype, "max", {
				get : function(){
					return this._scaler.max;
				},
				set : function(max){
					this._scaler.max = max;
				}
			});

			/**
			 * The type of the oscillator: sine, square, sawtooth, triangle. 
			 * @memberOf Tone.LFO#
			 * @type {string}
			 * @name type
			 */
			 Object.defineProperty(Tone.LFO.prototype, "type", {
				get : function(){
					return this.oscillator.type;
				},
				set : function(type){
					this.oscillator.type = type;
				}
			});

			/**
			 * The phase of the LFO
			 * @memberOf Tone.LFO#
			 * @type {string}
			 * @name phase
			 */
			 Object.defineProperty(Tone.LFO.prototype, "phase", {
				get : function(){
					return this.oscillator.phase;
				},
				set : function(phase){
					this.oscillator.phase = phase;
				}
			});

			/**
			 *	Override the connect method so that it 0's out the value 
			 *	if attached to an AudioParam or Tone.Signal. Borrowed from {@link Tone.Signal}
			 *  @function
			 */
			Tone.LFO.prototype.connect = Tone.Signal.prototype.connect;

			/**
			 *  disconnect and dispose
			 *  @returns {Tone.LFO} `this`
			 */
			Tone.LFO.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this.oscillator.dispose();
				this.oscillator = null;
				this._scaler.dispose();
				this._scaler = null;
				this._a2g.dispose();
				this._a2g = null;
				this.frequency = null;
				this.amplitude = null;
				return this;
			};

			return Tone.LFO;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class A limiter on the incoming signal. Composed of a Tone.Compressor
			 *         with a fast attack and decay value. 
			 *
			 *  @extends {Tone}
			 *  @constructor
			 *  @param {number} threshold the threshold in decibels
			 *  @example
			 *  var limiter = new Tone.Limiter(-6);
			 */
			Tone.Limiter = function(threshold){

				/**
				 *  the compressor
				 *  @private
				 *  @type {Tone.Compressor}
				 */
				this._compressor = this.input = this.output = new Tone.Compressor({
					"attack" : 0.0001,
					"decay" : 0.0001,
					"threshold" : threshold
				});

				/**
				 * The threshold of of the limiter
				 * @type {AudioParam}
				 */
				this.threshold = this._compressor.threshold;
			};

			Tone.extend(Tone.Limiter);

			/**
			 *  clean up
			 *  @returns {Tone.Limiter} `this`
			 */
			Tone.Limiter.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._compressor.dispose();
				this._compressor = null;
				this.threshold = null;
				return this;
			};

			return Tone.Limiter;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class A lowpass feedback comb filter. 
			 *         DelayNode -> Lowpass Filter -> feedback
			 *
			 *  @extends {Tone}
			 *  @constructor
			 *  @param {number} [minDelay=0.1] the minimum delay time which the filter can have
			 *  @param {number} [maxDelay=1] the maximum delay time which the filter can have
			 */
			Tone.LowpassCombFilter = function(){

				Tone.call(this);

				var options = this.optionsObject(arguments, ["minDelay", "maxDelay"], Tone.LowpassCombFilter.defaults);

				//the delay * samplerate = number of samples. 
				// buffersize / number of samples = number of delays needed per buffer frame
				var delayCount = Math.ceil(this.bufferSize / (options.minDelay * this.context.sampleRate));
				//set some ranges
				delayCount = Math.min(delayCount, 10);
				delayCount = Math.max(delayCount, 1);

				/**
				 *  the number of filter delays
				 *  @type {number}
				 *  @private
				 */
				this._filterDelayCount = delayCount;

				/**
				 *  @type {Array.<FilterDelay>}
				 *  @private
				 */
				this._filterDelays = new Array(this._filterDelayCount);

				/**
				 *  the dampening control
				 *  @type {Tone.Signal}
				 */
				this.dampening = new Tone.Signal(options.dampening, Tone.Signal.Units.Frequency);

				/**
				 *  the resonance control
				 *  @type {Tone.Signal}
				 */
				this.resonance = new Tone.Signal(options.resonance, Tone.Signal.Units.Normal);

				/**
				 *  scale the resonance value to the normal range
				 *  @type {Tone.Scale}
				 *  @private
				 */
				this._resScale = new Tone.ScaleExp(0.01, 1 / this._filterDelayCount - 0.001, 0.5);

				/**
				 *  internal flag for keeping track of when frequency
				 *  correction has been used
				 *  @type {boolean}
				 *  @private
				 */
				this._highFrequencies = false;

				/**
				 *  internal counter of delayTime
				 *  @type {Tone.Time}
				 *  @private
				 */
				this._delayTime = options.delayTime;

				/**
				 *  the feedback node
				 *  @type {GainNode}
				 *  @private
				 */
				this._feedback = this.context.createGain();

				//make the filters
				for (var i = 0; i < this._filterDelayCount; i++) {
					var filterDelay = new FilterDelay(options.minDelay, this.dampening);
					filterDelay.connect(this._feedback);
					this._filterDelays[i] = filterDelay;
				}

				//connections
				this.input.connect(this._filterDelays[0]);
				this._feedback.connect(this._filterDelays[0]);
				this.connectSeries.apply(this, this._filterDelays);
				//resonance control
				this.resonance.chain(this._resScale, this._feedback.gain);
				this._feedback.connect(this.output);
				//set the delay to the min value initially
				this.delayTime = options.delayTime;
			};

			Tone.extend(Tone.LowpassCombFilter);

			/**
			 *  the default parameters
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.LowpassCombFilter.defaults = {
				"resonance" : 0.5,
				"dampening" : 3000,
				"minDelay" : 0.1,
				"maxDelay" : 1,
				"delayTime" : 0.1
			};

			/**
			 * The delay time of the LowpassCombFilter. Auto corrects
			 * for sample offsets for small delay amounts.
			 * @memberOf Tone.LowpassCombFilter#
			 * @type {Tone.Time}
			 * @name delayTime
			 */
			Object.defineProperty(Tone.LowpassCombFilter.prototype, "delayTime", {
				get : function(){
					return this._delayTime;
				},
				set : function(delayAmount){
					this.setDelayTimeAtTime(delayAmount);
				}
			});

			/**
			 * set the delay time for the comb filter at a specific time. 
			 * @param {Tone.Time} delayAmount the amount of delay time
			 * @param {Tone.Time} [time=now] when the delay time should be set
			 */
			Tone.LowpassCombFilter.prototype.setDelayTimeAtTime = function(delayAmount, time){
				this._delayTime = this.toSeconds(delayAmount);
				//the number of samples to delay by
				var sampleRate = this.context.sampleRate;
				var delaySamples = sampleRate * this._delayTime;
				// delayTime corection when frequencies get high
				time = this.toSeconds(time);
				var cutoff = 100;
				if (delaySamples < cutoff){
					this._highFrequencies = true;
					var changeNumber = Math.round((delaySamples / cutoff) * this._filterDelayCount);
					for (var i = 0; i < changeNumber; i++) {
						this._filterDelays[i].setDelay(1 / sampleRate + this._delayTime, time);
					}
					this._delayTime = Math.floor(delaySamples) / sampleRate;
				} else if (this._highFrequencies){
					this._highFrequencies = false;
					for (var j = 0; j < this._filterDelays.length; j++) {
						this._filterDelays[j].setDelay(this._delayTime, time);
					}
				}
			};

			/**
			 *  clean up
			 *  @returns {Tone.LowpassCombFilter} `this`
			 */
			Tone.LowpassCombFilter.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				//dispose the filter delays
				for (var i = 0; i < this._filterDelays.length; i++) {
					this._filterDelays[i].dispose();
					this._filterDelays[i] = null;
				}
				this._filterDelays = null;
				this.dampening.dispose();
				this.dampening = null;
				this.resonance.dispose();
				this.resonance = null;
				this._resScale.dispose();
				this._resScale = null;
				this._feedback.disconnect();
				this._feedback = null;
				return this;
			};

			// BEGIN HELPER CLASS //

			/**
			 *  FilterDelay
			 *  @private
			 *  @constructor
			 *  @extends {Tone}
			 */
			var FilterDelay = function(maxDelay, filterFreq){
				this.delay = this.input = this.context.createDelay(maxDelay);
				this.delay.delayTime.value = maxDelay;

				this.filter = this.output = this.context.createBiquadFilter();
				filterFreq.connect(this.filter.frequency);

				this.filter.type = "lowpass";
				this.filter.Q.value = 0;

				this.delay.connect(this.filter);
			};

			Tone.extend(FilterDelay);

			FilterDelay.prototype.setDelay = function(amount, time) {
				this.delay.delayTime.setValueAtTime(amount, time);
			};

			/**
			 *  clean up
			 */
			FilterDelay.prototype.dispose = function(){
				this.delay.disconnect();
				this.delay = null;
				this.filter.disconnect();
				this.filter = null;
			};

			// END HELPER CLASS //

			return Tone.LowpassCombFilter;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  Merge a left and a right channel into a single stereo channel.
			 *
			 *  @constructor
			 *  @extends {Tone}
			 *  @example
			 *  var merge = new Tone.Merge();
			 *  sigLeft.connect(merge.left);
			 *  sigRight.connect(merge.right);
			 */
			Tone.Merge = function(){

				Tone.call(this, 2, 0);

				/**
				 *  The left input channel.
				 *  Alias for input 0
				 *  @type {GainNode}
				 */
				this.left = this.input[0] = this.context.createGain();

				/**
				 *  The right input channel.
				 *  Alias for input 1.
				 *  @type {GainNode}
				 */
				this.right = this.input[1] = this.context.createGain();

				/**
				 *  the merger node for the two channels
				 *  @type {ChannelMergerNode}
				 *  @private
				 */
				this._merger = this.output = this.context.createChannelMerger(2);

				//connections
				this.left.connect(this._merger, 0, 0);
				this.right.connect(this._merger, 0, 1);
			};

			Tone.extend(Tone.Merge);

			/**
			 *  clean up
			 *  @returns {Tone.Merge} `this`
			 */
			Tone.Merge.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this.left.disconnect();
				this.left = null;
				this.right.disconnect();
				this.right = null;
				this._merger.disconnect();
				this._merger = null;
				return this;
			}; 

			return Tone.Merge;
		});

		ToneModule( function(Tone){

			

			/**
			 *  @class  Get the rms of the input signal with some averaging.
			 *          Can also just get the value of the signal
			 *          or the value in dB. inspired by https://github.com/cwilso/volume-meter/blob/master/volume-meter.js<br><br>
			 *          Note that for signal processing, it's better to use {@link Tone.Follower} which will produce
			 *          an audio-rate envelope follower instead of needing to poll the Meter to get the output.
			 *
			 *  @constructor
			 *  @extends {Tone}
			 *  @param {number} [channels=1] number of channels being metered
			 *  @param {number} [smoothing=0.8] amount of smoothing applied to the volume
			 *  @param {number} [clipMemory=0.5] number in seconds that a "clip" should be remembered
			 */
			Tone.Meter = function(channels, smoothing, clipMemory){
				//extends Unit
				Tone.call(this);

				/** 
				 *  The channel count
				 *  @type  {number}
				 *  @private
				 */
				this._channels = this.defaultArg(channels, 1);

				/** 
				 *  the smoothing value
				 *  @type  {number}
				 *  @private
				 */
				this._smoothing = this.defaultArg(smoothing, 0.8);

				/** 
				 *  the amount of time a clip is remember for. 
				 *  @type  {number}
				 *  @private
				 */
				this._clipMemory = this.defaultArg(clipMemory, 0.5) * 1000;

				/** 
				 *  the rms for each of the channels
				 *  @private
				 *  @type {Array<number>}
				 */
				this._volume = new Array(this._channels);

				/** 
				 *  the raw values for each of the channels
				 *  @private
				 *  @type {Array<number>}
				 */
				this._values = new Array(this._channels);

				//zero out the volume array
				for (var i = 0; i < this._channels; i++){
					this._volume[i] = 0;
					this._values[i] = 0;
				}

				/** 
				 *  last time the values clipped
				 *  @private
				 *  @type {number}
				 */
				this._lastClip = 0;
				
				/** 
				 *  @private
				 *  @type {ScriptProcessorNode}
				 */
				this._jsNode = this.context.createScriptProcessor(this.bufferSize, this._channels, 1);
				this._jsNode.onaudioprocess = this._onprocess.bind(this);
				//so it doesn't get garbage collected
				this._jsNode.noGC();

				//signal just passes
				this.input.connect(this.output);
				this.input.connect(this._jsNode);
			};

			Tone.extend(Tone.Meter);

			/**
			 *  called on each processing frame
			 *  @private
			 *  @param  {AudioProcessingEvent} event 
			 */
			Tone.Meter.prototype._onprocess = function(event){
				var bufferSize = this._jsNode.bufferSize;
				var smoothing = this._smoothing;
				for (var channel = 0; channel < this._channels; channel++){
					var input = event.inputBuffer.getChannelData(channel);
					var sum = 0;
					var total = 0;
					var x;
					var clipped = false;
					for (var i = 0; i < bufferSize; i++){
						x = input[i];
						if (!clipped && x > 0.95){
							clipped = true;
							this._lastClip = Date.now();
						}
						total += x;
				    	sum += x * x;
					}
					var average = total / bufferSize;
					var rms = Math.sqrt(sum / bufferSize);
					this._volume[channel] = Math.max(rms, this._volume[channel] * smoothing);
					this._values[channel] = average;
				}
			};

			/**
			 *  get the rms of the signal
			 *  	
			 *  @param  {number} [channel=0] which channel
			 *  @return {number}         the value
			 */
			Tone.Meter.prototype.getLevel = function(channel){
				channel = this.defaultArg(channel, 0);
				var vol = this._volume[channel];
				if (vol < 0.00001){
					return 0;
				} else {
					return vol;
				}
			};

			/**
			 *  get the value of the signal
			 *  @param  {number=} channel 
			 *  @return {number}         
			 */
			Tone.Meter.prototype.getValue = function(channel){
				channel = this.defaultArg(channel, 0);
				return this._values[channel];
			};

			/**
			 *  get the volume of the signal in dB
			 *  @param  {number=} channel 
			 *  @return {number}         
			 */
			Tone.Meter.prototype.getDb = function(channel){
				return this.gainToDb(this.getLevel(channel));
			};

			/**
			 * @returns {boolean} if the audio has clipped in the last 500ms
			 */
			Tone.Meter.prototype.isClipped = function(){
				return Date.now() - this._lastClip < this._clipMemory;
			};

			/**
			 *  clean up
			 *  @returns {Tone.Meter} `this`
			 */
			Tone.Meter.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._jsNode.disconnect();
				this._jsNode.onaudioprocess = null;
				this._volume = null;
				this._values = null;
				return this;
			};

			return Tone.Meter;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Coerces the incoming mono or stereo signal into a stereo signal
			 *         where both left and right channels have the same value. 
			 *
			 *  @extends {Tone}
			 *  @constructor
			 */
			Tone.Mono = function(){
				Tone.call(this, 1, 0);

				/**
				 *  merge the signal
				 *  @type {Tone.Merge}
				 *  @private
				 */
				this._merge = this.output = new Tone.Merge();

				this.input.connect(this._merge, 0, 0);
				this.input.connect(this._merge, 0, 1);
				this.input.gain.value = this.dbToGain(-10);
			};

			Tone.extend(Tone.Mono);

			/**
			 *  clean up
			 *  @returns {Tone.Mono} `this`
			 */
			Tone.Mono.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._merge.dispose();
				this._merge = null;
				return this;
			};

			return Tone.Mono;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class A compressor with seperate controls over low/mid/high dynamics
			 *
			 *  @extends {Tone}
			 *  @constructor
			 *  @param {Object} options the low/mid/high compressor settings in a single object
			 *  @example
			 *  var multiband = new Tone.MultibandCompressor({
			 *  	"lowFrequency" : 200,
			 *  	"highFrequency" : 1300
			 *  	"low" : {
			 *  		"threshold" : -12
			 *  	}
			 *  })
			 */
			Tone.MultibandCompressor = function(options){

				options = this.defaultArg(arguments, Tone.MultibandCompressor.defaults);

				/**
				 *  split the incoming signal into high/mid/low
				 *  @type {Tone.MultibandSplit}
				 *  @private
				 */
				this._splitter = this.input = new Tone.MultibandSplit({
					"lowFrequency" : options.lowFrequency,
					"highFrequency" : options.highFrequency
				});

				/**
				 *  low/mid crossover frequency
				 *  @type {Tone.Signal}
				 */
				this.lowFrequency = this._splitter.lowFrequency;

				/**
				 *  mid/high crossover frequency
				 *  @type {Tone.Signal}
				 */
				this.highFrequency = this._splitter.highFrequency;

				/**
				 *  the output
				 *  @type {GainNode}
				 *  @private
				 */
				this.output = this.context.createGain();

				/**
				 *  the low compressor
				 *  @type {Tone.Compressor}
				 */
				this.low = new Tone.Compressor(options.low);

				/**
				 *  the mid compressor
				 *  @type {Tone.Compressor}
				 */
				this.mid = new Tone.Compressor(options.mid);

				/**
				 *  the high compressor
				 *  @type {Tone.Compressor}
				 */
				this.high = new Tone.Compressor(options.high);

				//connect the compressor
				this._splitter.low.chain(this.low, this.output);
				this._splitter.mid.chain(this.mid, this.output);
				this._splitter.high.chain(this.high, this.output);
			};

			Tone.extend(Tone.MultibandCompressor);

			/**
			 *  @const
			 *  @static
			 *  @type {Object}
			 */
			Tone.MultibandCompressor.defaults = {
				"low" : Tone.Compressor.defaults,
				"mid" : Tone.Compressor.defaults,
				"high" : Tone.Compressor.defaults,
				"lowFrequency" : 250,
				"highFrequency" : 2000
			};

			/**
			 *  clean up
			 *  @returns {Tone.MultibandCompressor} `this`
			 */
			Tone.MultibandCompressor.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._splitter.dispose();
				this.low.dispose();
				this.mid.dispose();
				this.high.dispose();
				this._splitter = null;
				this.low = null;
				this.mid = null;
				this.high = null;
				this.lowFrequency = null;
				this.highFrequency = null;
				return this;
			};

			return Tone.MultibandCompressor;
		});
		ToneModule( function(Tone){

			

			/**
			 *	@class  Split the incoming signal into left and right channels
			 *	
			 *  @constructor
			 *  @extends {Tone}
			 *  @example
			 *  var split = new Tone.Split();
			 *  stereoSignal.connect(split);
			 */
			Tone.Split = function(){

				Tone.call(this, 1, 2);

				/** 
				 *  @type {ChannelSplitterNode}
				 *  @private
				 */
				this._splitter = this.context.createChannelSplitter(2);

				/** 
				 *  left channel output
				 *  alais for the first output
				 *  @type {GainNode}
				 */
				this.left = this.output[0] = this.context.createGain();

				/**
				 *  the right channel output
				 *  alais for the second output
				 *  @type {GainNode}
				 */
				this.right = this.output[1] = this.context.createGain();
				
				//connections
				this.input.connect(this._splitter);
				this._splitter.connect(this.left, 0, 0);
				this._splitter.connect(this.right, 1, 0);
			};

			Tone.extend(Tone.Split);

			/**
			 *  dispose method
			 *  @returns {Tone.Split} `this`
			 */
			Tone.Split.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._splitter.disconnect();
				this.left.disconnect();
				this.right.disconnect();
				this.left = null;
				this.right = null;
				this._splitter = null;
				return this;
			}; 

			return Tone.Split;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  Panner. 
			 *  
			 *  @class  Equal Power Gain L/R Panner. Not 3D. 
			 *          0 = 100% Left
			 *          1 = 100% Right
			 *  
			 *  @constructor
			 *  @extends {Tone}
			 *  @param {number} [initialPan=0.5] the initail panner value (defaults to 0.5 = center)
			 *  @example
			 *  var panner = new Tone.Panner(1);
			 *  // ^ pan the input signal hard right. 
			 */
			Tone.Panner = function(initialPan){

				Tone.call(this, 1, 0);
				
				/**
				 *  the dry/wet knob
				 *  @type {Tone.CrossFade}
				 *  @private
				 */
				this._crossFade = new Tone.CrossFade();
				
				/**
				 *  @type {Tone.Merge}
				 *  @private
				 */
				this._merger = this.output = new Tone.Merge();
				
				/**
				 *  @type {Tone.Split}
				 *  @private
				 */
				this._splitter = new Tone.Split();
				
				/**
				 *  the pan control
				 *  @type {Tone.Signal}
				 */	
				this.pan = this._crossFade.fade;

				//CONNECTIONS:
				this.input.connect(this._splitter.left);
				this.input.connect(this._splitter.right);
				//left channel is dry, right channel is wet
				this._splitter.connect(this._crossFade, 0, 0);
				this._splitter.connect(this._crossFade, 1, 1);
				//merge it back together
				this._crossFade.a.connect(this._merger.left);
				this._crossFade.b.connect(this._merger.right);

				//initial value
				this.pan.value = this.defaultArg(initialPan, 0.5);
			};

			Tone.extend(Tone.Panner);

			/**
			 *  clean up
			 *  @returns {Tone.Panner} `this`
			 */
			Tone.Panner.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._crossFade.dispose();
				this._crossFade = null;
				this._splitter.dispose();
				this._splitter = null;
				this._merger.dispose();
				this._merger = null;
				this.pan = null;
				return this;
			};

			return Tone.Panner;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class A Panner and volume in one.
			 *
			 *  @extends {Tone}
			 *  @constructor
			 *  @example
			 *  var panVol = new Tone.PanVol(0.25, -12);
			 */
			Tone.PanVol = function(pan, volume){
				/**
				 *  the panning node
				 *  @type {Tone.Panner}
				 *  @private
				 */
				this._panner = this.input = new Tone.Panner(pan);

				/**
				 * the output node
				 * @type {GainNode}
				 */
				this.output = this.context.createGain();

				/**
				 *  The volume control in decibels. 
				 *  @type {Tone.Signal}
				 */
				this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);
				this.volume.value = this.defaultArg(volume, 0);

				/**
				 *  the panning control
				 *  @type {Tone.Panner}
				 *  @private
				 */
				this.pan = this._panner.pan;

				//connections
				this._panner.connect(this.output);
			};

			Tone.extend(Tone.PanVol);

			/**
			 *  clean up
			 *  @returns {Tone.PanVol} `this`
			 */
			Tone.PanVol.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._panner.dispose();
				this._panner = null;
				this.volume.dispose();
				this.volume = null;
				this.pan = null;
				return this;
			};

			return Tone.PanVol;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @deprecated
			 *  @class  Record an input into an array or AudioBuffer. 
			 *          it is limited in that the recording length needs to be known beforehand. 
			 *          Mostly used internally for testing. 
			 *
			 *  @constructor
			 *  @extends {Tone}
			 *  @param {number} channels 
			 */
			Tone.Recorder = function(channels){

				console.warn("Tone.Recorder is deprecated. It will be removed in next version");

				Tone.call(this);

				/**
				 *  the number of channels in the recording
				 *  @type {number}
				 */
				this.channels = this.defaultArg(channels, 1);

				/**
				 *  @private
				 *  @type {ScriptProcessorNode}
				 */
				this._jsNode = this.context.createScriptProcessor(this.bufferSize, this.channels, 1);
				this._jsNode.onaudioprocess = this._audioprocess.bind(this);

				/**
				 *  Float32Array for each channel
				 *  @private
				 *  @type {Array<Float32Array>}
				 */
				this._recordBuffers = new Array(this.channels);

				/**
				 *  @type {number}
				 *  @private
				 */
				this._recordStartSample = 0;

				/**
				 *  @type {number}
				 *  @private
				 */
				this._recordEndSample = 0;

				/**
				 *  @type {number}
				 *  @private
				 */
				this._recordDuration = 0;

				/**
				 *  @type {RecordState}
				 */
				this.state = RecordState.STOPPED;

				/** 
				 *  @private
				 *  @type {number}
				 */
				this._recordBufferOffset = 0;

				/** 
				 *  callback invoked when the recording is over
				 *  @private
				 *  @type {function(Float32Array)}
				 */
				this._callback = function(){};

				//connect it up
				this.input.connect(this._jsNode);
				//pass thru audio
				this.input.connect(this.output);
				//so it doesn't get garbage collected
				this._jsNode.noGC();
				//clear it to start
				this.clear();
			};

			Tone.extend(Tone.Recorder);

			/**
			 *  internal method called on audio process
			 *  
			 *  @private
			 *  @param   {AudioProcessorEvent} event 
			 */
			Tone.Recorder.prototype._audioprocess = function(event){
				if (this.state === RecordState.STOPPED){
					return;
				} else if (this.state === RecordState.RECORDING){
					//check if it's time yet
					var now = this.defaultArg(event.playbackTime, this.now());
					var processPeriodStart = this.toSamples(now);
					var bufferSize = this._jsNode.bufferSize;
					var processPeriodEnd = processPeriodStart + bufferSize;
					var bufferOffset, len;
					if (processPeriodStart > this._recordEndSample){
						this.state = RecordState.STOPPED;
						this._callback(this._recordBuffers);
					} else if (processPeriodStart > this._recordStartSample) {
						bufferOffset = 0;
						len = Math.min(this._recordEndSample - processPeriodStart, bufferSize);
						this._recordChannels(event.inputBuffer, bufferOffset, len, bufferSize);
					} else if (processPeriodEnd > this._recordStartSample) {
						len = processPeriodEnd - this._recordStartSample;
						bufferOffset = bufferSize - len;
						this._recordChannels(event.inputBuffer, bufferOffset, len, bufferSize);
					} 

				}
			};

			/**
			 *  record an input channel
			 *  @param   {AudioBuffer} inputBuffer        
			 *  @param   {number} from  
			 *  @param   {number} to  
			 *  @private
			 */
			Tone.Recorder.prototype._recordChannels = function(inputBuffer, from, to, bufferSize){
				var offset = this._recordBufferOffset;
				var buffers = this._recordBuffers;
				for (var channelNum = 0; channelNum < inputBuffer.numberOfChannels; channelNum++){
					var channel = inputBuffer.getChannelData(channelNum);
					if ((from === 0) && (to === bufferSize)){
						//set the whole thing
						this._recordBuffers[channelNum].set(channel, offset);
					} else {
						for (var i = from; i < from + to; i++){
							var zeroed = i - from; 
							buffers[channelNum][zeroed + offset] = channel[i];				
						}
					}
				}
				this._recordBufferOffset += to;
			};	

			/**
			 *  Record for a certain period of time
			 *  
			 *  will clear the internal buffer before starting
			 *  
			 *  @param  {Tone.Time} duration 
			 *  @param  {Tone.Time} wait the wait time before recording
			 *  @param {function(Float32Array)} callback the callback to be invoked when the buffer is done recording
			 *  @returns {Tone.Recorder} `this`
			 */
			Tone.Recorder.prototype.record = function(duration, startTime, callback){
				if (this.state === RecordState.STOPPED){
					this.clear();
					this._recordBufferOffset = 0;
					startTime = this.defaultArg(startTime, 0);
					this._recordDuration = this.toSamples(duration);
					this._recordStartSample = this.toSamples("+"+startTime);
					this._recordEndSample = this._recordStartSample + this._recordDuration;
					for (var i = 0; i < this.channels; i++){
						this._recordBuffers[i] = new Float32Array(this._recordDuration);
					}
					this.state = RecordState.RECORDING;
					this._callback = this.defaultArg(callback, function(){});
				}
				return this;
			};

			/**
			 *  clears the recording buffer
			 *  @returns {Tone.PanVol} `this`
			 */
			Tone.Recorder.prototype.clear = function(){
				for (var i = 0; i < this.channels; i++){
					this._recordBuffers[i] = null;
				}
				this._recordBufferOffset = 0;
				return this;
			};


			/**
			 *  true if there is nothing in the buffers
			 *  @return {boolean} 
			 */
			Tone.Recorder.prototype.isEmpty = function(){
				return this._recordBuffers[0] === null;
			};

			/**
			 *  @return {Array<Float32Array>}
			 */
			Tone.Recorder.prototype.getFloat32Array = function(){
				if (this.isEmpty()){
					return null;
				} else {
					return this._recordBuffers;
				}
			};

			/**
			 *  @return {AudioBuffer}
			 */
			Tone.Recorder.prototype.getAudioBuffer = function(){
				if (this.isEmpty()){
					return null;
				} else {
					var audioBuffer = this.context.createBuffer(this.channels, this._recordBuffers[0].length, this.context.sampleRate);
					for (var channelNum = 0; channelNum < audioBuffer.numberOfChannels; channelNum++){
						var channel = audioBuffer.getChannelData(channelNum);
						channel.set(this._recordBuffers[channelNum]);
					}
					return audioBuffer;
				}
			};

			/**
			 *  clean up
			 *  @returns {Tone.PanVol} `this`
			 */
			Tone.Recorder.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._jsNode.disconnect();
				this._jsNode.onaudioprocess = undefined;
				this._jsNode = null;
				this._recordBuffers = null;
				return this;
			};

			/**
			 *  @enum {string}
			 */
			var RecordState = {
				STOPPED : "stopped",
				SCHEDULED : "scheduled",
				RECORDING : "recording"
			};

			return Tone.Recorder;
		});
		ToneModule( 
			function(Tone){

			

			/**
			 *  @class An envelope which can be scaled to any range. 
			 *         Useful for applying an envelope to a filter
			 *
			 *  @extends {Tone.Envelope}
			 *  @constructor
			 *  @param {Tone.Time|Object} [attack=0.01]	the attack time in seconds
			 *  @param {Tone.Time} [decay=0.1]	the decay time in seconds
			 *  @param {number} [sustain=0.5] 	a percentage (0-1) of the full amplitude
			 *  @param {Tone.Time} [release=1]	the release time in seconds
			 *  @example
			 *  var scaledEnv = new Tone.ScaledEnvelope({
			 *  	"attack" : 0.2,
			 *  	"min" : 200,
			 *  	"max" : 2000
			 *  });
			 *  scaledEnv.connect(oscillator.frequency);
			 */
			Tone.ScaledEnvelope = function(){

				//get all of the defaults
				var options = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], Tone.Envelope.defaults);
				Tone.Envelope.call(this, options);
				options = this.defaultArg(options, Tone.ScaledEnvelope.defaults);

				/** 
				 *  scale the incoming signal by an exponent
				 *  @type {Tone.Pow}
				 *  @private
				 */
				this._exp = this.output = new Tone.Pow(options.exponent);

				/**
				 *  scale the signal to the desired range
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._scale = this.output = new Tone.Scale(options.min, options.max);

				this._sig.chain(this._exp, this._scale);
			};

			Tone.extend(Tone.ScaledEnvelope, Tone.Envelope);

			/**
			 *  the default parameters
			 *  @static
			 */
			Tone.ScaledEnvelope.defaults = {
				"min" : 0,
				"max" : 1,
				"exponent" : 1
			};

			/**
			 * The envelope's min output value. This is the value which it
			 * starts at. 
			 * @memberOf Tone.ScaledEnvelope#
			 * @type {number}
			 * @name min
			 */
			Object.defineProperty(Tone.ScaledEnvelope.prototype, "min", {
				get : function(){
					return this._scale.min;
				},
				set : function(min){
					this._scale.min = min;
				}
			});

			/**
			 * The envelope's max output value. In other words, the value
			 * at the peak of the attack portion of the envelope. 
			 * @memberOf Tone.ScaledEnvelope#
			 * @type {number}
			 * @name max
			 */
			Object.defineProperty(Tone.ScaledEnvelope.prototype, "max", {
				get : function(){
					return this._scale.max;
				},
				set : function(max){
					this._scale.max = max;
				}
			});

			/**
			 * The envelope's exponent value. 
			 * @memberOf Tone.ScaledEnvelope#
			 * @type {number}
			 * @name exponent
			 */
			Object.defineProperty(Tone.ScaledEnvelope.prototype, "exponent", {
				get : function(){
					return this._exp.value;
				},
				set : function(exp){
					this._exp.value = exp;
				}
			});
			
			/**
			 *  clean up
			 *  @returns {Tone.ScaledEnvelope} `this`
			 */
			Tone.ScaledEnvelope.prototype.dispose = function(){
				Tone.Envelope.prototype.dispose.call(this);
				this._scale.dispose();
				this._scale = null;
				this._exp.dispose();
				this._exp = null;
				return this;
			};

			return Tone.ScaledEnvelope;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  Buffer loading and storage. Tone.Buffer is used internally by all 
			 *          classes that make requests for audio files such as {@link Tone.Player},
			 *          {@link Tone.Sampler} and {@link Tone.Convolver} .
			 *          <br><br>Aside from load callbacks from individual buffers, Tone.Buffer 
			 *  		provides static methods which keep track of the loading progress 
			 *  		of all of the buffers. These methods are `onload`, `onprogress`,
			 *  		and `onerror`. 
			 *
			 *  @constructor 
			 *  @param {AudioBuffer|string} url the url to load, or the audio buffer to set
			 */
			Tone.Buffer = function(){

				var options = this.optionsObject(arguments, ["url", "onload"], Tone.Buffer.defaults);

				/**
				 *  stores the loaded AudioBuffer
				 *  @type {AudioBuffer}
				 *  @private
				 */
				this._buffer = null;

				/**
				 *  the url of the buffer. `undefined` if it was 
				 *  constructed with a buffer
				 *  @type {string}
				 *  @readOnly
				 */
				this.url = undefined;

				/**
				 *  indicates if the buffer is loaded or not
				 *  @type {boolean}
				 *  @readOnly
				 */
				this.loaded = false;

				/**
				 *  the callback to invoke when everything is loaded
				 *  @type {function}
				 */
				this.onload = options.onload.bind(this, this);

				if (options.url instanceof AudioBuffer){
					this._buffer.set(options.url);
					this.onload(this);
				} else if (typeof options.url === "string"){
					this.url = options.url;
					Tone.Buffer._addToQueue(options.url, this);
				}
			};

			Tone.extend(Tone.Buffer);

			/**
			 *  the default parameters
			 *
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.Buffer.defaults = {
				"url" : undefined,
				"onload" : function(){},
			};

			/**
			 *  set the buffer
			 *  @param {AudioBuffer|Tone.Buffer} buffer the buffer
			 *  @returns {Tone.Buffer} `this`
			 */
			Tone.Buffer.prototype.set = function(buffer){
				if (buffer instanceof Tone.Buffer){
					this._buffer = buffer.get();
				} else {
					this._buffer = buffer;
				}
				this.loaded = true;
				return this;
			};

			/**
			 *  @return {AudioBuffer} the audio buffer
			 */
			Tone.Buffer.prototype.get = function(){
				return this._buffer;
			};

			/**
			 *  @param {string} url the url to load
			 *  @param {function=} callback the callback to invoke on load. 
			 *                              don't need to set if `onload` is
			 *                              already set.
			 *  @returns {Tone.Buffer} `this`
			 */
			Tone.Buffer.prototype.load = function(url, callback){
				this.url = url;
				this.onload = this.defaultArg(callback, this.onload);
				Tone.Buffer._addToQueue(url, this);
				return this;
			};

			/**
			 *  dispose and disconnect
			 *  @returns {Tone.Buffer} `this`
			 */
			Tone.Buffer.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				Tone.Buffer._removeFromQueue(this);
				this._buffer = null;
				this.onload = null;
				return this;
			};

			/**
			 * the duration of the buffer
			 * @memberOf Tone.Buffer#
			 * @type {number}
			 * @name duration
			 * @readOnly
			 */
			Object.defineProperty(Tone.Buffer.prototype, "duration", {
				get : function(){
					if (this._buffer){
						return this._buffer.duration;
					} else {
						return 0;
					}
				},
			});

			///////////////////////////////////////////////////////////////////////////
			// STATIC METHODS
			///////////////////////////////////////////////////////////////////////////
			 
			/**
			 *  the static queue for all of the xhr requests
			 *  @type {Array}
			 *  @private
			 */
			Tone.Buffer._queue = [];

			/**
			 *  the array of current downloads
			 *  @type {Array}
			 *  @private
			 */
			Tone.Buffer._currentDownloads = [];

			/**
			 *  the total number of downloads
			 *  @type {number}
			 *  @private
			 */
			Tone.Buffer._totalDownloads = 0;

			/**
			 *  the maximum number of simultaneous downloads
			 *  @static
			 *  @type {number}
			 */
			Tone.Buffer.MAX_SIMULTANEOUS_DOWNLOADS = 6;
			
			/**
			 *  Adds a file to be loaded to the loading queue
			 *  @param   {string}   url      the url to load
			 *  @param   {function} callback the callback to invoke once it's loaded
			 *  @private
			 */
			Tone.Buffer._addToQueue = function(url, buffer){
				Tone.Buffer._queue.push({
					url : url,
					Buffer : buffer,
					progress : 0,
					xhr : null
				});
				this._totalDownloads++;
				Tone.Buffer._next();
			};

			/**
			 *  Remove an object from the queue's (if it's still there)
			 *  Abort the XHR if it's in progress
			 *  @param {Tone.Buffer} buffer the buffer to remove
			 *  @private
			 */
			Tone.Buffer._removeFromQueue = function(buffer){
				var i;
				for (i = 0; i < Tone.Buffer._queue.length; i++){
					var q = Tone.Buffer._queue[i];
					if (q.Buffer === buffer){
						Tone.Buffer._queue.splice(i, 1);
					}
				}
				for (i = 0; i < Tone.Buffer._currentDownloads.length; i++){
					var dl = Tone.Buffer._currentDownloads[i];
					if (dl.Buffer === buffer){
						Tone.Buffer._currentDownloads.splice(i, 1);
						dl.xhr.abort();
						dl.xhr.onprogress = null;
						dl.xhr.onload = null;
						dl.xhr.onerror = null;
					}
				}
			};

			/**
			 *  load the next buffer in the queue
			 *  @private
			 */
			Tone.Buffer._next = function(){
				if (Tone.Buffer._queue.length > 0){
					if (Tone.Buffer._currentDownloads.length < Tone.Buffer.MAX_SIMULTANEOUS_DOWNLOADS){
						var next = Tone.Buffer._queue.shift();
						Tone.Buffer._currentDownloads.push(next);
						next.xhr = Tone.Buffer.load(next.url, function(buffer){
							//remove this one from the queue
							var index = Tone.Buffer._currentDownloads.indexOf(next);
							Tone.Buffer._currentDownloads.splice(index, 1);
							next.Buffer.set(buffer);
							next.Buffer.onload(next.Buffer);
							Tone.Buffer._onprogress();
							Tone.Buffer._next();
						});
						next.xhr.onprogress = function(event){
							next.progress = event.loaded / event.total;
							Tone.Buffer._onprogress();
						};
						next.xhr.onerror = Tone.Buffer.onerror;
					} 
				} else if (Tone.Buffer._currentDownloads.length === 0){
					Tone.Buffer.onload();
					//reset the downloads
					Tone.Buffer._totalDownloads = 0;
				}
			};

			/**
			 *  internal progress event handler
			 *  @private
			 */
			Tone.Buffer._onprogress = function(){
				var curretDownloadsProgress = 0;
				var currentDLLen = Tone.Buffer._currentDownloads.length;
				var inprogress = 0;
				if (currentDLLen > 0){
					for (var i = 0; i < currentDLLen; i++){
						var dl = Tone.Buffer._currentDownloads[i];
						curretDownloadsProgress += dl.progress;
					}
					inprogress = curretDownloadsProgress;
				}
				var currentDownloadProgress = currentDLLen - inprogress;
				var completed = Tone.Buffer._totalDownloads - Tone.Buffer._queue.length - currentDownloadProgress;
				Tone.Buffer.onprogress(completed / Tone.Buffer._totalDownloads);
			};

			/**
			 *  makes an xhr reqest for the selected url
			 *  Load the audio file as an audio buffer.
			 *  Decodes the audio asynchronously and invokes
			 *  the callback once the audio buffer loads.
			 *  @param {string} url the url of the buffer to load.
			 *                      filetype support depends on the
			 *                      browser.
			 *  @param {function} callback function
			 *  @returns {XMLHttpRequest} returns the XHR
			 */
			Tone.Buffer.load = function(url, callback){
				var request = new XMLHttpRequest();
				request.open("GET", url, true);
				request.responseType = "arraybuffer";
				// decode asynchronously
				request.onload = function() {
					Tone.context.decodeAudioData(request.response, function(buff) {
						if(!buff){
							throw new Error("could not decode audio data:" + url);
						}
						callback(buff);
					});
				};
				//send the request
				request.send();
				return request;
			};

			/**
			 *  callback when all of the buffers in the queue have loaded
			 *  @static
			 *  @type {function}
			 *  @example
			 * //invoked when all of the queued samples are done loading
			 * Tone.Buffer.onload = function(){
			 * 	console.log("everything is loaded");
			 * };
			 */
			Tone.Buffer.onload = function(){};

			/**
			 *  Callback function is invoked with the progress of all of the loads in the queue. 
			 *  The value passed to the callback is between 0-1.
			 *  @static
			 *  @type {function}
			 *  @example
			 * Tone.Buffer.onprogress = function(percent){
			 * 	console.log("progress:" + (percent * 100).toFixed(1) + "%");
			 * };
			 */
			Tone.Buffer.onprogress = function(){};

			/**
			 *  Callback if one of the buffers in the queue encounters an error. The error
			 *  is passed in as the argument. 
			 *  @static
			 *  @type {function}
			 *  @example
			 * Tone.Buffer.onerror = function(e){
			 * 	console.log("there was an error while loading the buffers: "+e);
			 * }
			 */
			Tone.Buffer.onerror = function(){};

			return Tone.Buffer;
		});
		ToneModule( function(Tone){

			

			/**
			 *  buses are another way of routing audio
			 *
			 *  augments Tone.prototype to include send and recieve
			 */

			 /**
			  *  All of the routes
			  *  
			  *  @type {Object}
			  *  @static
			  *  @private
			  */
			var Buses = {};

			/**
			 *  send signal to a channel name
			 *  defined in "Tone/core/Bus"
			 *
			 *  @param  {string} channelName 
			 *  @param  {number} amount      
			 *  @return {GainNode}             
			 */
			Tone.prototype.send = function(channelName, amount){
				if (!Buses.hasOwnProperty(channelName)){
					Buses[channelName] = this.context.createGain();
				}
				var sendKnob = this.context.createGain();
				sendKnob.gain.value = this.defaultArg(amount, 1);
				this.output.chain(sendKnob, Buses[channelName]);
				return sendKnob;		
			};

			/**
			 *  recieve the input from the desired channelName to the input
			 *  defined in "Tone/core/Bus"
			 *
			 *  @param  {string} channelName 
			 *  @param {AudioNode} [input=this.input] if no input is selected, the
			 *                                         input of the current node is
			 *                                         chosen. 
			 *  @returns {Tone} `this`
			 */
			Tone.prototype.receive = function(channelName, input){
				if (!Buses.hasOwnProperty(channelName)){
					Buses[channelName] = this.context.createGain();	
				}
				if (this.isUndef(input)){
					input = this.input;
				}
				Buses[channelName].connect(input);
				return this;
			};

			return Tone;
		});
		ToneModule( function(Tone){

			

			/**
			 *  Frequency can be described similar to time, except ultimately the
			 *  values are converted to frequency instead of seconds. A number
			 *  is taken literally as the value in hertz. Additionally any of the 
			 *  {@link Tone.Time} encodings can be used. Note names in the form
			 *  of NOTE OCTAVE (i.e. `C4`) are also accepted and converted to their
			 *  frequency value. 
			 *  
			 *  @typedef {number|string|Tone.Time} Tone.Frequency
			 */

			/**
			 *  @class  A timed note. Creating a note will register a callback 
			 *          which will be invoked on the channel at the time with
			 *          whatever value was specified. 
			 *
			 *  @constructor
			 *  @param {number|string} channel the channel name of the note
			 *  @param {Tone.Time} time the time when the note will occur
			 *  @param {string|number|Object|Array} value the value of the note
			 */
			Tone.Note = function(channel, time, value){

				/**
				 *  the value of the note. This value is returned
				 *  when the channel callback is invoked.
				 *  
				 *  @type {string|number|Object}
				 */
				this.value = value;

				/**
				 *  the channel name or number
				 *  
				 *  @type {string|number}
				 *  @private
				 */
				this._channel = channel;

				/**
				 *  an internal reference to the id of the timeline
				 *  callback which is set. 
				 *  
				 *  @type {number}
				 *  @private
				 */
				this._timelineID = Tone.Transport.setTimeline(this._trigger.bind(this), time);
			};

			/**
			 *  invoked by the timeline
			 *  @private
			 *  @param {number} time the time at which the note should play
			 */
			Tone.Note.prototype._trigger = function(time){
				//invoke the callback
				channelCallbacks(this._channel, time, this.value);
			};

			/**
			 *  clean up
			 *  @returns {Tone.Note} `this`
			 */
			Tone.Note.prototype.dispose = function(){ 
				Tone.Tranport.clearTimeline(this._timelineID);
				this.value = null;
				return this;
			};

			/**
			 *  @private
			 *  @static
			 *  @type {Object}
			 */
			var NoteChannels = {};

			/**
			 *  invoke all of the callbacks on a specific channel
			 *  @private
			 */
			function channelCallbacks(channel, time, value){
				if (NoteChannels.hasOwnProperty(channel)){
					var callbacks = NoteChannels[channel];
					for (var i = 0, len = callbacks.length; i < len; i++){
						var callback = callbacks[i];
						if (Array.isArray(value)){
							callback.apply(window, [time].concat(value));
						} else {
							callback(time, value);
						}
					}
				}
			}

			/**
			 *  listen to a specific channel, get all of the note callbacks
			 *  @static
			 *  @param {string|number} channel the channel to route note events from
			 *  @param {function(*)} callback callback to be invoked when a note will occur
			 *                                        on the specified channel
			 */
			Tone.Note.route = function(channel, callback){
				if (NoteChannels.hasOwnProperty(channel)){
					NoteChannels[channel].push(callback);
				} else {
					NoteChannels[channel] = [callback];
				}
			};

			/**
			 *  Remove a previously routed callback from a channel. 
			 *  @static
			 *  @param {string|number} channel The channel to unroute note events from
			 *  @param {function(*)} callback Callback which was registered to the channel.
			 */
			Tone.Note.unroute = function(channel, callback){
				if (NoteChannels.hasOwnProperty(channel)){
					var channelCallback = NoteChannels[channel];
					var index = channelCallback.indexOf(callback);
					if (index !== -1){
						NoteChannels[channel].splice(index, 1);
					}
				}
			};

			/**
			 *  Parses a score and registers all of the notes along the timeline. 
			 *
			 *  Scores are a JSON object with instruments at the top level
			 *  and an array of time and values. The value of a note can be 0 or more 
			 *  parameters. 
			 *
			 *  The only requirement for the score format is that the time is the first (or only)
			 *  value in the array. All other values are optional and will be passed into the callback
			 *  function registered using `Note.route(channelName, callback)`.
			 *
			 *  To convert MIDI files to score notation, take a look at utils/MidiToScore.js
			 *
			 *  @example
			 *  //an example JSON score which sets up events on channels
			 *  var score = { 
			 *  	"synth"  : [["0", "C3"], ["0:1", "D3"], ["0:2", "E3"], ... ],
			 *  	"bass"  : [["0", "C2"], ["1:0", "A2"], ["2:0", "C2"], ["3:0", "A2"], ... ],
			 *  	"kick"  : ["0", "0:2", "1:0", "1:2", "2:0", ... ],
			 *  	//...
			 *  };
			 *  //parse the score into Notes
			 *  Tone.Note.parseScore(score);
			 *  //route all notes on the "synth" channel
			 *  Tone.Note.route("synth", function(time, note){
			 *  	//trigger synth
			 *  });
			 *  @static
			 *  @param {Object} score
			 *  @return {Array<Tone.Note>} an array of all of the notes that were created
			 */
			Tone.Note.parseScore = function(score){
				var notes = [];
				for (var inst in score){
					var part = score[inst];
					if (inst === "tempo"){
						Tone.Transport.bpm.value = part;
					} else if (inst === "timeSignature"){
						Tone.Transport.timeSignature = part[0] / (part[1] / 4);
					} else if (Array.isArray(part)){
						for (var i = 0; i < part.length; i++){
							var noteDescription = part[i];
							var note;
							if (Array.isArray(noteDescription)){
								var time = noteDescription[0];
								var value = noteDescription.slice(1);
								note = new Tone.Note(inst, time, value);
							} else {
								note = new Tone.Note(inst, noteDescription);
							}
							notes.push(note);
						}
					} else {
						throw new TypeError("score parts must be Arrays");
					}
				}
				return notes;
			};

			///////////////////////////////////////////////////////////////////////////
			//	MUSIC NOTES
			//	
			//	Augments Tone.prototype to include note methods
			///////////////////////////////////////////////////////////////////////////

			var noteToIndex = { "c" : 0, "c#" : 1, "db" : 1, "d" : 2, "d#" : 3, "eb" : 3, 
				"e" : 4, "f" : 5, "f#" : 6, "gb" : 6, "g" : 7, "g#" : 8, "ab" : 8, 
				"a" : 9, "a#" : 10, "bb" : 10, "b" : 11
			};

			var noteIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

			var middleC = 261.6255653005986;

			/**
			 *  convert a note name to frequency (i.e. A4 to 440)
			 *  defined in "Tone/core/Note"
			 *  
			 *  @param  {string} note
			 *  @return {number}         
			 */
			Tone.prototype.noteToFrequency = function(note){
				//break apart the note by frequency and octave
				var parts = note.split(/(\d+)/);
				if (parts.length === 3){
					var index = noteToIndex[parts[0].toLowerCase()];
					var octave = parts[1];
					var noteNumber = index + parseInt(octave, 10) * 12;
					return Math.pow(2, (noteNumber - 48) / 12) * middleC;
				} else {
					return 0;
				}
			};

			/**
			 *  test if a string is in note format: i.e. "C4"
			 *  @param  {string|number}  note the note to test
			 *  @return {boolean}      true if it's in the form of a note
			 *  @method isNotation
			 *  @lends Tone.prototype.isNotation
			 */
			Tone.prototype.isNote = ( function(){
				var noteFormat = new RegExp(/[a-g]{1}([b#]{1}|[b#]{0})[0-9]+$/i);
				return function(note){
					if (typeof note === "string"){
						note = note.toLowerCase();
					} 
					return noteFormat.test(note);
				};
			})();

			/**
			 *  a pointer to the previous toFrequency method
			 *  @private
			 *  @function
			 */
			Tone.prototype._overwrittenToFrequency = Tone.prototype.toFrequency;

			/**
			 *  A method which accepts frequencies in the form
			 *  of notes (`"C#4"`), frequencies as strings ("49hz"), frequency numbers,
			 *  or Tone.Time and converts them to their frequency as a number in hertz.
			 *  @param  {Tone.Frequency} note the note name or notation
			 *  @param {number=} 	now 	if passed in, this number will be 
			 *                        		used for all 'now' relative timings
			 *  @return {number}      the frequency as a number
			 */
			Tone.prototype.toFrequency = function(note, now){
				if (this.isNote(note)){
					note = this.noteToFrequency(note);
				} 
				return this._overwrittenToFrequency(note, now);
			};

			/**
			 *  Convert a note name (i.e. A4, C#5, etc to a frequency).
			 *  Defined in "Tone/core/Note"
			 *  @param  {number} freq
			 *  @return {string}         
			 */
			Tone.prototype.frequencyToNote = function(freq){
				var log = Math.log(freq / middleC) / Math.LN2;
				var noteNumber = Math.round(12 * log) + 48;
				var octave = Math.floor(noteNumber/12);
				var noteName = noteIndexToNote[noteNumber % 12];
				return noteName + octave.toString();
			};

			/**
			 *  Convert an interval (in semitones) to a frequency ratio.
			 *
			 *  @param  {number} interval the number of semitones above the base note
			 *  @return {number}          the frequency ratio
			 *  @example
			 *  tone.intervalToFrequencyRatio(0); // returns 1
			 *  tone.intervalToFrequencyRatio(12); // returns 2
			 */
			Tone.prototype.intervalToFrequencyRatio = function(interval){
				return Math.pow(2,(interval/12));
			};

			/**
			 *  Convert a midi note number into a note name/
			 *
			 *  @param  {number} midiNumber the midi note number
			 *  @return {string}            the note's name and octave
			 *  @example
			 *  tone.midiToNote(60); // returns "C3"
			 */
			Tone.prototype.midiToNote = function(midiNumber){
				var octave = Math.floor(midiNumber / 12) - 2;
				var note = midiNumber % 12;
				return noteIndexToNote[note] + octave;
			};

			/**
			 *  convert a note to it's midi value
			 *  defined in "Tone/core/Note"
			 *
			 *  @param  {string} note the note name (i.e. "C3")
			 *  @return {number} the midi value of that note
			 *  @example
			 *  tone.noteToMidi("C3"); // returns 60
			 */
			Tone.prototype.noteToMidi = function(note){
				//break apart the note by frequency and octave
				var parts = note.split(/(\d+)/);
				if (parts.length === 3){
					var index = noteToIndex[parts[0].toLowerCase()];
					var octave = parts[1];
					return index + (parseInt(octave, 10) + 2) * 12;
				} else {
					return 0;
				}
			};

			return Tone.Note;
		});
		ToneModule( function(Tone){

			
			
			/**
			 * 	@class  Effect is the base class for effects. connect the effect between
			 * 	        the effectSend and effectReturn GainNodes. then control the amount of
			 * 	        effect which goes to the output using the dry/wet control.
			 *
			 *  @constructor
			 *  @extends {Tone}
			 *  @param {number} [initialWet=0] the starting wet value
			 *                                 defaults to 100% wet
			 */
			Tone.Effect = function(){

				Tone.call(this);

				//get all of the defaults
				var options = this.optionsObject(arguments, ["wet"], Tone.Effect.defaults);

				/**
				 *  the drywet knob to control the amount of effect
				 *  @type {Tone.CrossFade}
				 *  @private
				 */
				this._dryWet = new Tone.CrossFade(options.wet);

				/**
				 *  The wet control, i.e. how much of the effected
				 *  will pass through to the output. 
				 *  @type {Tone.Signal}
				 */
				this.wet = this._dryWet.fade;

				/**
				 *  connect the effectSend to the input of hte effect
				 *  
				 *  @type {GainNode}
				 *  @private
				 */
				this.effectSend = this.context.createGain();

				/**
				 *  connect the output of the effect to the effectReturn
				 *  
				 *  @type {GainNode}
				 *  @private
				 */
				this.effectReturn = this.context.createGain();

				//connections
				this.input.connect(this._dryWet.a);
				this.input.connect(this.effectSend);
				this.effectReturn.connect(this._dryWet.b);
				this._dryWet.connect(this.output);
			};

			Tone.extend(Tone.Effect);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.Effect.defaults = {
				"wet" : 1
			};

			/**
			 *  bypass the effect
			 *  @returns {Tone.Effect} `this`
			 */
			Tone.Effect.prototype.bypass = function(){
				this.wet.value = 0;
				return this;
			};

			/**
			 *  chains the effect in between the effectSend and effectReturn
			 *  @param  {Tone} effect
			 *  @private
			 *  @returns {Tone.Effect} `this`
			 */
			Tone.Effect.prototype.connectEffect = function(effect){
				this.effectSend.chain(effect, this.effectReturn);
				return this;
			};

			/**
			 *  tear down
			 *  @returns {Tone.Effect} `this`
			 */
			Tone.Effect.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._dryWet.dispose();
				this._dryWet = null;
				this.effectSend.disconnect();
				this.effectSend = null;
				this.effectReturn.disconnect();
				this.effectReturn = null;
				this.wet = null;
				return this;
			};

			return Tone.Effect;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class AutoPanner is a Tone.Panner with an LFO connected to the pan amount
			 *
			 *  @constructor
			 *  @extends {Tone.Effect}
			 *  @param {number} [frequency=1] (optional) rate in HZ of the left-right pan
			 *  @example
			 *  var autoPanner = new Tone.AutoPanner("4n");
			 */
			Tone.AutoPanner = function(){

				var options = this.optionsObject(arguments, ["frequency"], Tone.AutoPanner.defaults);
				Tone.Effect.call(this, options);

				/**
				 *  the lfo which drives the panning
				 *  @type {Tone.LFO}
				 *  @private
				 */
				this._lfo = new Tone.LFO(options.frequency, 0, 1);

				/**
				 * The amount of panning between left and right. 
				 * 0 = always center. 1 = full range between left and right. 
				 * @type {Tone.Signal}
				 */
				this.amount = this._lfo.amplitude;

				/**
				 *  the panner node which does the panning
				 *  @type {Tone.Panner}
				 *  @private
				 */
				this._panner = new Tone.Panner();

				/**
				 * How fast the panner modulates
				 * @type {Tone.Signal}
				 */
				this.frequency = this._lfo.frequency;

				//connections
				this.connectEffect(this._panner);
				this._lfo.connect(this._panner.pan);
				this.type = options.type;
			};

			//extend Effect
			Tone.extend(Tone.AutoPanner, Tone.Effect);

			/**
			 *  defaults
			 *  @static
			 *  @type {Object}
			 */
			Tone.AutoPanner.defaults = {
				"frequency" : 1,
				"type" : "sine",
				"amount" : 1
			};
			
			/**
			 * Start the panner.
			 * @param {Tone.Time} [time=now] the panner begins.
			 * @returns {Tone.AutoPanner} `this`
			 */
			Tone.AutoPanner.prototype.start = function(time){
				this._lfo.start(time);
				return this;
			};

			/**
			 * Stop the panner.
			 * @param {Tone.Time} [time=now] the panner stops.
			 * @returns {Tone.AutoPanner} `this`
			 */
			Tone.AutoPanner.prototype.stop = function(time){
				this._lfo.stop(time);
				return this;
			};

			/**
			 * Sync the panner to the transport.
			 * @returns {Tone.AutoPanner} `this`
			 */
			Tone.AutoPanner.prototype.sync = function(){
				this._lfo.sync();
				return this;
			};

			/**
			 * Unsync the panner from the transport
			 * @returns {Tone.AutoPanner} `this`
			 */
			Tone.AutoPanner.prototype.unsync = function(){
				this._lfo.unsync();
				return this;
			};

			/**
			 * Type of oscillator attached to the AutoPanner.
			 * @memberOf Tone.AutoPanner#
			 * @type {string}
			 * @name type
			 */
			Object.defineProperty(Tone.AutoPanner.prototype, "type", {
				get : function(){
					return this._lfo.type;
				},
				set : function(type){
					this._lfo.type = type;
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.AutoPanner} `this`
			 */
			Tone.AutoPanner.prototype.dispose = function(){
				Tone.Effect.prototype.dispose.call(this);
				this._lfo.dispose();
				this._lfo = null;
				this._panner.dispose();
				this._panner = null;
				this.frequency = null;
				this.amount = null;
				return this;
			};

			return Tone.AutoPanner;
		});

		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  AutoWah connects an envelope follower to a bandpass filter.
			 *          Some inspiration from Tuna.js https://github.com/Dinahmoe/tuna
			 *
			 *  @constructor
			 *  @extends {Tone.Effect}
			 *  @param {number} [baseFrequency=100] the frequency the filter is set 
			 *                                       to at the low point of the wah
			 *  @param {number} [octaves=5] the number of octaves above the baseFrequency
			 *                               the filter will sweep to when fully open
			 *  @param {number} [sensitivity=0] the decibel threshold sensitivity for 
			 *                                   the incoming signal. Normal range of -40 to 0. 
			 *  @example
			 *  var autoWah = new Tone.AutoWah(100, 6, -20);
			 */
			Tone.AutoWah = function(){

				var options = this.optionsObject(arguments, ["baseFrequency", "octaves", "sensitivity"], Tone.AutoWah.defaults);
				Tone.Effect.call(this, options);

				/**
				 *  the envelope follower
				 *  @type {Tone.Follower}
				 *  @private
				 */
				this.follower = new Tone.Follower(options.follower);

				/**
				 *  scales the follower value to the frequency domain
				 *  @type {Tone}
				 *  @private
				 */
				this._sweepRange = new Tone.ScaleExp(0, 1, 0.5);

				/**
				 *  @type {number}
				 *  @private
				 */
				this._baseFrequency = options.baseFrequency;

				/**
				 *  @type {number}
				 *  @private
				 */
				this._octaves = options.octaves;

				/**
				 *  the input gain to adjust the senstivity
				 *  @type {GainNode}
				 *  @private
				 */
				this._inputBoost = this.context.createGain();

				/**
				 *  @type {BiquadFilterNode}
				 *  @private
				 */
				this._bandpass = new Tone.Filter({
					"rolloff" : -48,
					"frequency" : 0,
					"Q" : options.Q,
				});
			
				/**
				 *  @type {Tone.Filter}
				 *  @private
				 */
				this._peaking = new Tone.Filter(0, "peaking");
				this._peaking.gain.value = options.gain;

				/**
				 * the gain of the filter.
				 * @type {Tone.Signal}
				 */
				this.gain = this._peaking.gain;

				/**
				 * The quality of the filter.
				 * @type {Tone.Signal}
				 */
				this.Q = this._bandpass.Q;

				//the control signal path
				this.effectSend.chain(this._inputBoost, this.follower, this._sweepRange);
				this._sweepRange.connect(this._bandpass.frequency);
				this._sweepRange.connect(this._peaking.frequency);
				//the filtered path
				this.effectSend.chain(this._bandpass, this._peaking, this.effectReturn);
				//set the initial value
				this._setSweepRange();
				this.sensitivity = options.sensitivity;
			};

			Tone.extend(Tone.AutoWah, Tone.Effect);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.AutoWah.defaults = {
				"baseFrequency" : 100,
				"octaves" : 6,
				"sensitivity" : 0,
				"Q" : 2,
				"gain" : 2,
				"follower" : {
					"attack" : 0.3,
					"release" : 0.5
				}
			};

			/**
			 * The number of octaves that the filter will sweep.
			 * @memberOf Tone.AutoWah#
			 * @type {number}
			 * @name octaves
			 */
			Object.defineProperty(Tone.AutoWah.prototype, "octaves", {
				get : function(){
					return this._octaves;
				}, 
				set : function(octaves){
					this._octaves = octaves;
					this._setSweepRange();
				}
			});

			/**
			 * The base frequency from which the sweep will start from.
			 * @memberOf Tone.AutoWah#
			 * @type {Tone.Frequency}
			 * @name baseFrequency
			 */
			Object.defineProperty(Tone.AutoWah.prototype, "baseFrequency", {
				get : function(){
					return this._baseFrequency;
				}, 
				set : function(baseFreq){
					this._baseFrequency = baseFreq;
					this._setSweepRange();
				}
			});

			/**
			 * The sensitivity to control how responsive to the input signal the filter is. 
			 * in Decibels. 
			 * @memberOf Tone.AutoWah#
			 * @type {number}
			 * @name sensitivity
			 */
			Object.defineProperty(Tone.AutoWah.prototype, "sensitivity", {
				get : function(){
					return this.gainToDb(1 / this._inputBoost.gain.value);
				}, 
				set : function(sensitivy){
					this._inputBoost.gain.value = 1 / this.dbToGain(sensitivy);
				}
			});

			/**
			 *  sets the sweep range of the scaler
			 *  @private
			 */
			Tone.AutoWah.prototype._setSweepRange = function(){
				this._sweepRange.min = this._baseFrequency;
				this._sweepRange.max = Math.min(this._baseFrequency * Math.pow(2, this._octaves), this.context.sampleRate / 2);
			};

			/**
			 *  clean up
			 *  @returns {Tone.AutoWah} `this`
			 */
			Tone.AutoWah.prototype.dispose = function(){
				Tone.Effect.prototype.dispose.call(this);
				this.follower.dispose();
				this.follower = null;
				this._sweepRange.dispose();
				this._sweepRange = null;
				this._bandpass.dispose();
				this._bandpass = null;
				this._peaking.dispose();
				this._peaking = null;
				this._inputBoost.disconnect();
				this._inputBoost = null;
				this.gain = null;
				this.Q = null;
				return this;
			};

			return Tone.AutoWah;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class Downsample incoming signal to a different bitdepth. 
			 *
			 *  @constructor
			 *  @extends {Tone.Effect}
			 *  @param {number} bits 1-8. 
			 *  @example
			 *  var crusher = new Tone.BitCrusher(4);
			 */
			Tone.BitCrusher = function(){

				var options = this.optionsObject(arguments, ["bits"], Tone.BitCrusher.defaults);
				Tone.Effect.call(this, options);

				var invStepSize = 1 / Math.pow(2, options.bits - 1);

				/**
				 *  Subtract the input signal and the modulus of the input signal
				 *  @type {Tone.Subtract}
				 *  @private
				 */
				this._subtract = new Tone.Subtract();

				/**
				 *  The mod function
				 *  @type  {Tone.Modulo}
				 *  @private
				 */
				this._modulo = new Tone.Modulo(invStepSize);

				/**
				 *  keeps track of the bits
				 *  @type {number}
				 *  @private
				 */
				this._bits = options.bits;

				//connect it up
				this.effectSend.fan(this._subtract, this._modulo);
				this._modulo.connect(this._subtract, 0, 1);
				this._subtract.connect(this.effectReturn);
			};

			Tone.extend(Tone.BitCrusher, Tone.Effect);

			/**
			 *  the default values
			 *  @static
			 *  @type {Object}
			 */
			Tone.BitCrusher.defaults = {
				"bits" : 4
			};

			/**
			 * The bit depth of the BitCrusher
			 * @memberOf Tone.BitCrusher#
			 * @type {number}
			 * @name bits
			 */
			Object.defineProperty(Tone.BitCrusher.prototype, "bits", {
				get : function(){
					return this._bits;
				},
				set : function(bits){
					this._bits = bits;
					var invStepSize = 1 / Math.pow(2, bits - 1);
					this._modulo.value = invStepSize;
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.BitCrusher} `this`
			 */
			Tone.BitCrusher.prototype.dispose = function(){
				Tone.Effect.prototype.dispose.call(this);
				this._subtract.dispose();
				this._subtract = null;
				this._modulo.dispose();
				this._modulo = null;
				return this;
			}; 

			return Tone.BitCrusher;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class A Chebyshev waveshaper. Good for making different types of distortion sounds.
			 *         Note that odd orders sound very different from even ones. order = 1 is no change. 
			 *         http://music.columbia.edu/cmc/musicandcomputers/chapter4/04_06.php
			 *
			 *  @extends {Tone.Effect}
			 *  @constructor
			 *  @param {number} order The order of the chebyshev polynomial. Normal range between 1-100. 
			 *  @example
			 *  var cheby = new Tone.Chebyshev(50);
			 */
			Tone.Chebyshev = function(){

				var options = this.optionsObject(arguments, ["order"], Tone.Chebyshev.defaults);
				Tone.Effect.call(this);

				/**
				 *  @type {WaveShaperNode}
				 *  @private
				 */
				this._shaper = new Tone.WaveShaper(4096);

				/**
				 * holds onto the order of the filter
				 * @type {number}
				 * @private
				 */
				this._order = options.order;

				this.connectEffect(this._shaper);
				this.order = options.order;
				this.oversample = options.oversample;
			};

			Tone.extend(Tone.Chebyshev, Tone.Effect);

			/**
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.Chebyshev.defaults = {
				"order" : 1,
				"oversample" : "none"
			};
			
			/**
			 *  get the coefficient for that degree
			 *  @param {number} x the x value
			 *  @param   {number} degree 
			 *  @param {Object} memo memoize the computed value. 
			 *                       this speeds up computation greatly. 
			 *  @return  {number}       the coefficient 
			 *  @private
			 */
			Tone.Chebyshev.prototype._getCoefficient = function(x, degree, memo){
				if (memo.hasOwnProperty(degree)){
					return memo[degree];
				} else if (degree === 0){
					memo[degree] = 0;
				} else if (degree === 1){
					memo[degree] = x;
				} else {
					memo[degree] = 2 * x * this._getCoefficient(x, degree - 1, memo) - this._getCoefficient(x, degree - 2, memo);
				}
				return memo[degree];
			};

			/**
			 * The order of the Chebyshev polynomial i.e.
			 * order = 2 -> 2x^2 + 1. order = 3 -> 4x^3 + 3x. 
			 * @memberOf Tone.Chebyshev#
			 * @type {number}
			 * @name order
			 */
			Object.defineProperty(Tone.Chebyshev.prototype, "order", {
				get : function(){
					return this._order;
				},
				set : function(order){
					this._order = order;
					var curve = new Array(4096);
					var len = curve.length;
					for (var i = 0; i < len; ++i) {
						var x = i * 2 / len - 1;
						if (x === 0){
							//should output 0 when input is 0
							curve[i] = 0;
						} else {
							curve[i] = this._getCoefficient(x, order, {});
						}
					}
					this._shaper.curve = curve;
				} 
			});

			/**
			 * The oversampling of the effect. Can either be "none", "2x" or "4x".
			 * @memberOf Tone.Chebyshev#
			 * @type {string}
			 * @name oversample
			 */
			Object.defineProperty(Tone.Chebyshev.prototype, "oversample", {
				get : function(){
					return this._shaper.oversample;
				},
				set : function(oversampling){
					this._shaper.oversample = oversampling;
				} 
			});


			/**
			 *  clean up
			 *  @returns {Tone.Chebyshev} `this`
			 */
			Tone.Chebyshev.prototype.dispose = function(){
				Tone.Effect.prototype.dispose.call(this);
				this._shaper.dispose();
				this._shaper = null;
				return this;
			};

			return Tone.Chebyshev;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class Creates an effect with an effectSendL/R and effectReturnL/R
			 *
			 *	@constructor
			 *	@extends {Tone.Effect}
			 */
			Tone.StereoEffect = function(){

				Tone.call(this);
				//get the defaults
				var options = this.optionsObject(arguments, ["wet"], Tone.Effect.defaults);

				/**
				 *  the drywet knob to control the amount of effect
				 *  @type {Tone.CrossFade}
				 *  @private
				 */
				this._dryWet = new Tone.CrossFade(options.wet);

				/**
				 *  The wet control, i.e. how much of the effected
				 *  will pass through to the output. 
				 *  @type {Tone.Signal}
				 */
				this.wet = this._dryWet.fade;

				/**
				 *  then split it
				 *  @type {Tone.Split}
				 *  @private
				 */
				this._split = new Tone.Split();

				/**
				 *  the effects send LEFT
				 *  @type {GainNode}
				 *  @private
				 */
				this.effectSendL = this._split.left;

				/**
				 *  the effects send RIGHT
				 *  @type {GainNode}
				 *  @private
				 */
				this.effectSendR = this._split.right;

				/**
				 *  the stereo effect merger
				 *  @type {Tone.Merge}
				 *  @private
				 */
				this._merge = new Tone.Merge();

				/**
				 *  the effect return LEFT
				 *  @type {GainNode}
				 */
				this.effectReturnL = this._merge.left;

				/**
				 *  the effect return RIGHT
				 *  @type {GainNode}
				 */
				this.effectReturnR = this._merge.right;

				//connections
				this.input.connect(this._split);
				//dry wet connections
				this.input.connect(this._dryWet, 0, 0);
				this._merge.connect(this._dryWet, 0, 1);
				this._dryWet.connect(this.output);
			};

			Tone.extend(Tone.StereoEffect, Tone.Effect);

			/**
			 *  clean up
			 *  @returns {Tone.StereoEffect} `this`
			 */
			Tone.StereoEffect.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._dryWet.dispose();
				this._dryWet = null;
				this._split.dispose();
				this._split = null;
				this._merge.dispose();
				this._merge = null;
				this.effectSendL = null;
				this.effectSendR = null;
				this.effectReturnL = null;
				this.effectReturnR = null;
				this.wet = null;
				return this;
			};

			return Tone.StereoEffect;
		});
		ToneModule( function(Tone){

			
			
			/**
			 * 	@class  Feedback Effect (a sound loop between an audio source and its own output)
			 *
			 *  @constructor
			 *  @extends {Tone.Effect}
			 *  @param {number|Object} [initialFeedback=0.125] the initial feedback value
			 */
			Tone.FeedbackEffect = function(){

				var options = this.optionsObject(arguments, ["feedback"]);
				options = this.defaultArg(options, Tone.FeedbackEffect.defaults);

				Tone.Effect.call(this, options);

				/**
				 *  controls the amount of feedback
				 *  @type {Tone.Signal}
				 */
				this.feedback = new Tone.Signal(options.feedback, Tone.Signal.Units.Normal);
				
				/**
				 *  the gain which controls the feedback
				 *  @type {GainNode}
				 *  @private
				 */
				this._feedbackGain = this.context.createGain();

				//the feedback loop
				this.effectReturn.chain(this._feedbackGain, this.effectSend);
				this.feedback.connect(this._feedbackGain.gain);
			};

			Tone.extend(Tone.FeedbackEffect, Tone.Effect);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.FeedbackEffect.defaults = {
				"feedback" : 0.125
			};

			/**
			 *  clean up
			 *  @returns {Tone.FeedbackEffect} `this`
			 */
			Tone.FeedbackEffect.prototype.dispose = function(){
				Tone.Effect.prototype.dispose.call(this);
				this.feedback.dispose();
				this.feedback = null;
				this._feedbackGain.disconnect();
				this._feedbackGain = null;
				return this;
			};

			return Tone.FeedbackEffect;
		});

		ToneModule( 
		function(Tone){

			

			/**
			 *  @class Just like a stereo feedback effect, but the feedback is routed from left to right
			 *         and right to left instead of on the same channel.
			 *
			 *	@constructor
			 *	@extends {Tone.FeedbackEffect}
			 */
			Tone.StereoXFeedbackEffect = function(){

				var options = this.optionsObject(arguments, ["feedback"], Tone.FeedbackEffect.defaults);
				Tone.StereoEffect.call(this, options);

				/**
				 *  controls the amount of feedback
				 *  @type {Tone.Signal}
				 */
				this.feedback = new Tone.Signal(options.feedback);

				/**
				 *  the left side feeback
				 *  @type {GainNode}
				 *  @private
				 */
				this._feedbackLR = this.context.createGain();

				/**
				 *  the right side feeback
				 *  @type {GainNode}
				 *  @private
				 */
				this._feedbackRL = this.context.createGain();

				//connect it up
				this.effectReturnL.chain(this._feedbackLR, this.effectSendR);
				this.effectReturnR.chain(this._feedbackRL, this.effectSendL);
				this.feedback.fan(this._feedbackLR.gain, this._feedbackRL.gain);
			};

			Tone.extend(Tone.StereoXFeedbackEffect, Tone.FeedbackEffect);

			/**
			 *  clean up
			 *  @returns {Tone.StereoXFeedbackEffect} `this`
			 */
			Tone.StereoXFeedbackEffect.prototype.dispose = function(){
				Tone.StereoEffect.prototype.dispose.call(this);
				this.feedback.dispose();
				this.feedback = null;
				this._feedbackLR.disconnect();
				this._feedbackLR = null;
				this._feedbackRL.disconnect();
				this._feedbackRL = null;
				return this;
			};

			return Tone.StereoXFeedbackEffect;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class A Chorus effect with feedback. inspiration from https://github.com/Dinahmoe/tuna/blob/master/tuna.js
			 *
			 *	@constructor
			 *	@extends {Tone.StereoXFeedbackEffect}
			 *	@param {number|Object} [frequency=2] the frequency of the effect
			 *	@param {number} [delayTime=3.5] the delay of the chorus effect in ms
			 *	@param {number} [depth=0.7] the depth of the chorus
			 *	@example
			 * 	var chorus = new Tone.Chorus(4, 2.5, 0.5);
			 */
			Tone.Chorus = function(){

				var options = this.optionsObject(arguments, ["frequency", "delayTime", "depth"], Tone.Chorus.defaults);
				Tone.StereoXFeedbackEffect.call(this, options);

				/**
				 *  the depth of the chorus
				 *  @type {number}
				 *  @private
				 */
				this._depth = options.depth;

				/**
				 *  the delayTime
				 *  @type {number}
				 *  @private
				 */
				this._delayTime = options.delayTime / 1000;

				/**
				 *  the lfo which controls the delayTime
				 *  @type {Tone.LFO}
				 *  @private
				 */
				this._lfoL = new Tone.LFO(options.rate, 0, 1);

				/**
				 *  another LFO for the right side with a 180 degree phase diff
				 *  @type {Tone.LFO}
				 *  @private
				 */
				this._lfoR = new Tone.LFO(options.rate, 0, 1);
				this._lfoR.phase = 180;

				/**
				 *  delay for left
				 *  @type {DelayNode}
				 *  @private
				 */
				this._delayNodeL = this.context.createDelay();

				/**
				 *  delay for right
				 *  @type {DelayNode}
				 *  @private
				 */
				this._delayNodeR = this.context.createDelay();

				/**
				 * The frequency the chorus will modulate at. 
				 * @type {Tone.Signal}
				 */
				this.frequency = this._lfoL.frequency;

				//connections
				this.connectSeries(this.effectSendL, this._delayNodeL, this.effectReturnL);
				this.connectSeries(this.effectSendR, this._delayNodeR, this.effectReturnR);
				//and pass through
				this.effectSendL.connect(this.effectReturnL);
				this.effectSendR.connect(this.effectReturnR);
				//lfo setup
				this._lfoL.connect(this._delayNodeL.delayTime);
				this._lfoR.connect(this._delayNodeR.delayTime);
				//start the lfo
				this._lfoL.start();
				this._lfoR.start();
				//have one LFO frequency control the other
				this._lfoL.frequency.connect(this._lfoR.frequency);
				//set the initial values
				this.depth = this._depth;
				this.frequency.value = options.frequency;
				this.type = options.type;
			};

			Tone.extend(Tone.Chorus, Tone.StereoXFeedbackEffect);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.Chorus.defaults = {
				"frequency" : 1.5, 
				"delayTime" : 3.5,
				"depth" : 0.7,
				"feedback" : 0.1,
				"type" : "sine"
			};

			/**
			 * The depth of the effect. 
			 * @memberOf Tone.Chorus#
			 * @type {number}
			 * @name depth
			 */
			Object.defineProperty(Tone.Chorus.prototype, "depth", {
				get : function(){
					return this._depth;
				},
				set : function(depth){
					this._depth = depth;
					var deviation = this._delayTime * depth;
					this._lfoL.min = this._delayTime - deviation;
					this._lfoL.max = this._delayTime + deviation;
					this._lfoR.min = this._delayTime - deviation;
					this._lfoR.max = this._delayTime + deviation;
				}
			});

			/**
			 * The delayTime in milliseconds
			 * @memberOf Tone.Chorus#
			 * @type {number}
			 * @name delayTime
			 */
			Object.defineProperty(Tone.Chorus.prototype, "delayTime", {
				get : function(){
					return this._delayTime * 1000;
				},
				set : function(delayTime){
					this._delayTime = delayTime / 1000;
					this.depth = this._depth;
				}
			});

			/**
			 * The lfo type for the chorus. 
			 * @memberOf Tone.Chorus#
			 * @type {string}
			 * @name type
			 */
			Object.defineProperty(Tone.Chorus.prototype, "type", {
				get : function(){
					return this._lfoL.type;
				},
				set : function(type){
					this._lfoL.type = type;
					this._lfoR.type = type;
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.Chorus} `this`
			 */
			Tone.Chorus.prototype.dispose = function(){
				Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
				this._lfoL.dispose();
				this._lfoL = null;
				this._lfoR.dispose();
				this._lfoR = null;
				this._delayNodeL.disconnect();
				this._delayNodeL = null;
				this._delayNodeR.disconnect();
				this._delayNodeR = null;
				this.frequency = null;
				return this;
			};

			return Tone.Chorus;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  Convolver wrapper for reverb and emulation.
			 *  
			 *  @constructor
			 *  @extends {Tone.Effect}
			 *  @param {string|AudioBuffer=} url
			 *  @example
			 *  var convolver = new Tone.Convolver("./path/to/ir.wav");
			 */
			Tone.Convolver = function(url){

				Tone.Effect.apply(this, arguments);

			  	/**
				 *  convolver node
				 *  @type {ConvolverNode}
				 *  @private
				 */
				this._convolver = this.context.createConvolver();

				/**
				 *  the convolution buffer
				 *  @type {Tone.Buffer}
				 *  @private
				 */
				this._buffer = new Tone.Buffer(url, function(buffer){
					this.buffer = buffer;
				}.bind(this));

				this.connectEffect(this._convolver);
			};

			Tone.extend(Tone.Convolver, Tone.Effect);

			/**
			 *  The convolver's buffer
			 *  @memberOf Tone.Convolver#
			 *  @type {AudioBuffer}
			 *  @name buffer
			 */
			Object.defineProperty(Tone.Convolver.prototype, "buffer", {
				get : function(){
					return this._buffer.get();
				},
				set : function(buffer){
					this._buffer.set(buffer);
					this._convolver.buffer = buffer;
				}
			});

			/**
			 *  Load an impulse response url as an audio buffer.
			 *  Decodes the audio asynchronously and invokes
			 *  the callback once the audio buffer loads.
			 *  @param {string} url the url of the buffer to load.
			 *                      filetype support depends on the
			 *                      browser.
			 *  @param  {function=} callback
			 *  @returns {Tone.Convolver} `this`
			 */
			Tone.Convolver.prototype.load = function(url, callback){
				this._buffer.load(url, function(buff){
					this.buffer = buff;
					if (callback){
						callback();
					}
				}.bind(this));
				return this;
			};

			/**
			 *  dispose and disconnect
			 *  @returns {Tone.Convolver} `this`
			 */
			Tone.Convolver.prototype.dispose = function(){
				Tone.Effect.prototype.dispose.call(this);
				this._convolver.disconnect();
				this._convolver = null;
				this._buffer.dispose();
				this._buffer = null;
				return this;
			}; 

			return Tone.Convolver;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class A simple distortion effect using the waveshaper node
			 *         algorithm from http://stackoverflow.com/a/22313408
			 *
			 *  @extends {Tone.Effect}
			 *  @constructor
			 *  @param {number} distortion the amount of distortion (nominal range of 0-1)
			 *  @example
			 *  var dist = new Tone.Distortion(0.8);
			 */
			Tone.Distortion = function(){

				var options = this.optionsObject(arguments, ["distortion"], Tone.Distortion.defaults);

				Tone.Effect.call(this);

				/**
				 *  @type {Tone.WaveShaper}
				 *  @private
				 */
				this._shaper = new Tone.WaveShaper(4096);

				/**
				 * holds the distortion amount
				 * @type {number}
				 * @private
				 */
				this._distortion = options.distortion;

				this.connectEffect(this._shaper);
				this.distortion = options.distortion;
				this.oversample = options.oversample;
			};

			Tone.extend(Tone.Distortion, Tone.Effect);

			/**
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.Distortion.defaults = {
				"distortion" : 0.4,
				"oversample" : "none"
			};

			/**
			 * The amount of distortion. Range between 0-1. 
			 * @memberOf Tone.Distortion#
			 * @type {number}
			 * @name distortion
			 */
			Object.defineProperty(Tone.Distortion.prototype, "distortion", {
				get : function(){
					return this._distortion;
				},
				set : function(amount){
					this._distortion = amount;
					var k = amount * 100;
					var deg = Math.PI / 180;
					this._shaper.setMap(function(x){
						if (Math.abs(x) < 0.001){
							//should output 0 when input is 0
							return 0;
						} else {
							return ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
						}
					});
				} 
			});

			/**
			 * The oversampling of the effect. Can either be "none", "2x" or "4x".
			 * @memberOf Tone.Distortion#
			 * @type {string}
			 * @name oversample
			 */
			Object.defineProperty(Tone.Distortion.prototype, "oversample", {
				get : function(){
					return this._shaper.oversample;
				},
				set : function(oversampling){
					this._shaper.oversample = oversampling;
				} 
			});

			/**
			 *  clean up
			 *  @returns {Tone.Distortion} `this`
			 */
			Tone.Distortion.prototype.dispose = function(){
				Tone.Effect.prototype.dispose.call(this);
				this._shaper.dispose();
				this._shaper = null;
				return this;
			};

			return Tone.Distortion;
		});
		ToneModule( function(Tone){

			
			
			/**
			 *  @class  A feedback delay
			 *
			 *  @constructor
			 *  @extends {Tone.FeedbackEffect}
			 *  @param {Tone.Time} [delayTime=0.25] The delay time in seconds. 
			 *  @param {number=} feedback The amount of the effected signal which 
			 *                            is fed back through the delay.
			 *  @example
			 *  var feedbackDelay = new Tone.FeedbackDelay("8n", 0.25);
			 */
			Tone.FeedbackDelay = function(){
				
				var options = this.optionsObject(arguments, ["delayTime", "feedback"], Tone.FeedbackDelay.defaults);
				Tone.FeedbackEffect.call(this, options);

				/**
				 *  Tone.Signal to control the delay amount
				 *  @type {Tone.Signal}
				 */
				this.delayTime = new Tone.Signal(options.delayTime, Tone.Signal.Units.Time);

				/**
				 *  the delay node
				 *  @type {DelayNode}
				 *  @private
				 */
				this._delayNode = this.context.createDelay(4);

				// connect it up
				this.connectEffect(this._delayNode);
				this.delayTime.connect(this._delayNode.delayTime);
			};

			Tone.extend(Tone.FeedbackDelay, Tone.FeedbackEffect);

			/**
			 *  The default values. 
			 *  @const
			 *  @static
			 *  @type {Object}
			 */
			Tone.FeedbackDelay.defaults = {
				"delayTime" : 0.25,
			};
			
			/**
			 *  clean up
			 *  @returns {Tone.FeedbackDelay} `this`
			 */
			Tone.FeedbackDelay.prototype.dispose = function(){
				Tone.FeedbackEffect.prototype.dispose.call(this);
				this.delayTime.dispose();
				this._delayNode.disconnect();
				this._delayNode = null;
				this.delayTime = null;
				return this;
			};

			return Tone.FeedbackDelay;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  an array of comb filter delay values from Freeverb implementation
			 *  @static
			 *  @private
			 *  @type {Array}
			 */
			var combFilterTunings = [1557 / 44100, 1617 / 44100, 1491 / 44100, 1422 / 44100, 1277 / 44100, 1356 / 44100, 1188 / 44100, 1116 / 44100];

			/**
			 *  an array of allpass filter frequency values from Freeverb implementation
			 *  @private
			 *  @static
			 *  @type {Array}
			 */
			var allpassFilterFrequencies = [225, 556, 441, 341];

			/**
			 *  @class Reverb based on the Freeverb
			 *
			 *  @extends {Tone.Effect}
			 *  @constructor
			 *  @param {number} [roomSize=0.7] correlated to the decay time. 
			 *                                 value between (0,1)
			 *  @param {number} [dampening=0.5] filtering which is applied to the reverb. 
			 *                                  value between [0,1]
			 *  @example
			 *  var freeverb = new Tone.Freeverb(0.4, 0.2);
			 */
			Tone.Freeverb = function(){

				var options = this.optionsObject(arguments, ["roomSize", "dampening"], Tone.Freeverb.defaults);
				Tone.StereoEffect.call(this, options);

				/**
				 *  the roomSize value between (0,1)
				 *  @type {Tone.Signal}
				 */
				this.roomSize = new Tone.Signal(options.roomSize);

				/**
				 *  the amount of dampening
				 *  value between [0,1]
				 *  @type {Tone.Signal}
				 */
				this.dampening = new Tone.Signal(options.dampening);

				/**
				 *  scale the dampening
				 *  @type {Tone.ScaleExp}
				 *  @private
				 */
				this._dampeningScale = new Tone.ScaleExp(100, 8000, 0.5);

				/**
				 *  the comb filters
				 *  @type {Array.<Tone.LowpassCombFilter>}
				 *  @private
				 */
				this._combFilters = [];

				/**
				 *  the allpass filters on the left
				 *  @type {Array.<BiqaudFilterNode>}
				 *  @private
				 */
				this._allpassFiltersL = [];

				/**
				 *  the allpass filters on the right
				 *  @type {Array.<BiqaudFilterNode>}
				 *  @private
				 */
				this._allpassFiltersR = [];

				//make the allpass filters on teh right
				for (var l = 0; l < allpassFilterFrequencies.length; l++){
					var allpassL = this.context.createBiquadFilter();
					allpassL.type = "allpass";
					allpassL.frequency.value = allpassFilterFrequencies[l];
					this._allpassFiltersL.push(allpassL);
				}

				//make the allpass filters on the left
				for (var r = 0; r < allpassFilterFrequencies.length; r++){
					var allpassR = this.context.createBiquadFilter();
					allpassR.type = "allpass";
					allpassR.frequency.value = allpassFilterFrequencies[r];
					this._allpassFiltersR.push(allpassR);
				}

				//make the comb filters
				for (var c = 0; c < combFilterTunings.length; c++){
					var lfpf = new Tone.LowpassCombFilter(combFilterTunings[c]);
					if (c < combFilterTunings.length / 2){
						this.effectSendL.chain(lfpf, this._allpassFiltersL[0]);
					} else {
						this.effectSendR.chain(lfpf, this._allpassFiltersR[0]);
					}
					this.roomSize.connect(lfpf.resonance);
					this._dampeningScale.connect(lfpf.dampening);
					this._combFilters.push(lfpf);
				}

				//chain the allpass filters togetehr
				this.connectSeries.apply(this, this._allpassFiltersL);
				this.connectSeries.apply(this, this._allpassFiltersR);
				this._allpassFiltersL[this._allpassFiltersL.length - 1].connect(this.effectReturnL);
				this._allpassFiltersR[this._allpassFiltersR.length - 1].connect(this.effectReturnR);
				this.dampening.connect(this._dampeningScale);
			};

			Tone.extend(Tone.Freeverb, Tone.StereoEffect);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.Freeverb.defaults = {
				"roomSize" : 0.7, 
				"dampening" : 0.5
			};

			/**
			 *  clean up
			 *  @returns {Tone.Freeverb} `this`
			 */
			Tone.Freeverb.prototype.dispose = function(){
				Tone.StereoEffect.prototype.dispose.call(this);
				for (var al = 0; al < this._allpassFiltersL.length; al++) {
					this._allpassFiltersL[al].disconnect();
					this._allpassFiltersL[al] = null;
				}
				this._allpassFiltersL = null;
				for (var ar = 0; ar < this._allpassFiltersR.length; ar++) {
					this._allpassFiltersR[ar].disconnect();
					this._allpassFiltersR[ar] = null;
				}
				this._allpassFiltersR = null;
				for (var cf = 0; cf < this._combFilters.length; cf++) {
					this._combFilters[cf].dispose();
					this._combFilters[cf] = null;
				}
				this._combFilters = null;
				this.roomSize.dispose();
				this.dampening.dispose();
				this._dampeningScale.dispose();
				this.roomSize = null;
				this.dampening = null;
				this._dampeningScale = null;
				return this;
			};

			return Tone.Freeverb;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  an array of the comb filter delay time values
			 *  @private
			 *  @static
			 *  @type {Array}
			 */
			var combFilterDelayTimes = [1687 / 25000, 1601 / 25000, 2053 / 25000, 2251 / 25000];

			/**
			 *  the resonances of each of the comb filters
			 *  @private
			 *  @static
			 *  @type {Array}
			 */
			var combFilterResonances = [0.773, 0.802, 0.753, 0.733];

			/**
			 *  the allpass filter frequencies
			 *  @private
			 *  @static
			 *  @type {Array}
			 */
			var allpassFilterFreqs = [347, 113, 37];

			/**
			 *  @class a simple Schroeder Reverberators tuned by John Chowning in 1970
			 *         made up of 3 allpass filters and 4 feedback comb filters. 
			 *         https://ccrma.stanford.edu/~jos/pasp/Schroeder_Reverberators.html
			 *
			 *  @extends {Tone.Effect}
			 *  @constructor
			 *  @param {number} roomSize Coorelates to the decay time. Value between 0,1
			 *  @example
			 *  var freeverb = new Tone.Freeverb(0.4);
			 */
			Tone.JCReverb = function(){

				var options = this.optionsObject(arguments, ["roomSize"], Tone.JCReverb.defaults);
				Tone.StereoEffect.call(this, options);

				/**
				 *  room size control values between [0,1]
				 *  @type {Tone.Signal}
				 */
				this.roomSize = new Tone.Signal(options.roomSize, Tone.Signal.Units.Normal);

				/**
				 *  scale the room size
				 *  @type {Tone.Scale}
				 *  @private
				 */
				this._scaleRoomSize = new Tone.Scale(-0.733, 0.197);

				/**
				 *  a series of allpass filters
				 *  @type {Array.<BiquadFilterNode>}
				 *  @private
				 */
				this._allpassFilters = [];

				/**
				 *  parallel feedback comb filters
				 *  @type {Array.<Tone.FeedbackCombFilter>}
				 *  @private
				 */
				this._feedbackCombFilters = [];

				//make the allpass filters
				for (var af = 0; af < allpassFilterFreqs.length; af++) {
					var allpass = this.context.createBiquadFilter();
					allpass.type = "allpass";
					allpass.frequency.value = allpassFilterFreqs[af];
					this._allpassFilters.push(allpass);
				}

				//and the comb filters
				for (var cf = 0; cf < combFilterDelayTimes.length; cf++) {
					var fbcf = new Tone.FeedbackCombFilter(combFilterDelayTimes[cf], 0.1);
					this._scaleRoomSize.connect(fbcf.resonance);
					fbcf.resonance.value = combFilterResonances[cf];
					this._allpassFilters[this._allpassFilters.length - 1].connect(fbcf);
					if (cf < combFilterDelayTimes.length / 2){
						fbcf.connect(this.effectReturnL);
					} else {
						fbcf.connect(this.effectReturnR);
					}
					this._feedbackCombFilters.push(fbcf);
				}

				//chain the allpass filters together
				this.roomSize.connect(this._scaleRoomSize);
				this.connectSeries.apply(this, this._allpassFilters);
				this.effectSendL.connect(this._allpassFilters[0]);
				this.effectSendR.connect(this._allpassFilters[0]);
			};

			Tone.extend(Tone.JCReverb, Tone.StereoEffect);

			/**
			 *  the default values
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.JCReverb.defaults = {
				"roomSize" : 0.5
			};

			/**
			 *  clean up
			 *  @returns {Tone.JCReverb} `this`
			 */
			Tone.JCReverb.prototype.dispose = function(){
				Tone.StereoEffect.prototype.dispose.call(this);
				for (var apf = 0; apf < this._allpassFilters.length; apf++) {
					this._allpassFilters[apf].disconnect();
					this._allpassFilters[apf] = null;
				}
				this._allpassFilters = null;
				for (var fbcf = 0; fbcf < this._feedbackCombFilters.length; fbcf++) {
					this._feedbackCombFilters[fbcf].dispose();
					this._feedbackCombFilters[fbcf] = null;
				}
				this._feedbackCombFilters = null;
				this.roomSize.dispose();
				this.roomSize = null;
				this._scaleRoomSize.dispose();
				this._scaleRoomSize = null;
				return this;
			};

			return Tone.JCReverb;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Applies a Mid/Side seperation and recombination
			 *         http://musicdsp.org/showArchiveComment.php?ArchiveID=173
			 *         http://www.kvraudio.com/forum/viewtopic.php?t=212587
			 *         M = (L+R)/sqrt(2);   // obtain mid-signal from left and right
			 *         S = (L-R)/sqrt(2);   // obtain side-signal from left and righ
			 *         // amplify mid and side signal seperately:
			 *         M/S send/return
			 *         L = (M+S)/sqrt(2);   // obtain left signal from mid and side
			 *         R = (M-S)/sqrt(2);   // obtain right signal from mid and side
			 *
			 *  @extends {Tone.StereoEffect}
			 *  @constructor
			 */
			Tone.MidSideEffect = function(){
				Tone.StereoEffect.call(this);

				/**
				 *  a constant signal equal to 1 / sqrt(2)
				 *  @type {Tone.Signal}
				 *  @private
				 */
				this._sqrtTwo = new Tone.Signal(1 / Math.sqrt(2));

				/**
				 *  the mid send.
				 *  connect to mid processing
				 *  @type {Tone.Expr}
				 */
				this.midSend = new Tone.Expr("($0 + $1) * $2");

				/**
				 *  the side send.
				 *  connect to side processing
				 *  @type {Tone.Expr}
				 */
				this.sideSend = new Tone.Expr("($0 - $1) * $2");

				/**
				 *  recombine the mid/side into Left
				 *  @type {Tone.Expr}
				 *  @private
				 */
				this._left = new Tone.Expr("($0 + $1) * $2");

				/**
				 *  recombine the mid/side into Right
				 *  @type {Tone.Expr}
				 *  @private
				 */
				this._right = new Tone.Expr("($0 - $1) * $2");

				/**
				 *  the mid return connection
				 *  @type {GainNode}
				 */
				this.midReturn = this.context.createGain();

				/**
				 *  the side return connection
				 *  @type {GainNode}
				 */
				this.sideReturn = this.context.createGain();

				//connections
				this.effectSendL.connect(this.midSend, 0, 0);
				this.effectSendR.connect(this.midSend, 0, 1);
				this.effectSendL.connect(this.sideSend, 0, 0);
				this.effectSendR.connect(this.sideSend, 0, 1);
				this._left.connect(this.effectReturnL);
				this._right.connect(this.effectReturnR);
				this.midReturn.connect(this._left, 0, 0);
				this.sideReturn.connect(this._left, 0, 1);
				this.midReturn.connect(this._right, 0, 0);
				this.sideReturn.connect(this._right, 0, 1);
				this._sqrtTwo.connect(this.midSend, 0, 2);
				this._sqrtTwo.connect(this.sideSend, 0, 2);
				this._sqrtTwo.connect(this._left, 0, 2);
				this._sqrtTwo.connect(this._right, 0, 2);
			};

			Tone.extend(Tone.MidSideEffect, Tone.StereoEffect);

			/**
			 *  clean up
			 *  @returns {Tone.MidSideEffect} `this`
			 */
			Tone.MidSideEffect.prototype.dispose = function(){
				Tone.StereoEffect.prototype.dispose.call(this);
				this._sqrtTwo.dispose();
				this._sqrtTwo = null;
				this.midSend.dispose();
				this.midSend = null;
				this.sideSend.dispose();
				this.sideSend = null;
				this._left.dispose();
				this._left = null;
				this._right.dispose();
				this._right = null;
				this.midReturn.disconnect();
				this.midReturn = null;
				this.sideReturn.disconnect();
				this.sideReturn = null;
				return this;
			};

			return Tone.MidSideEffect;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class A Phaser effect. inspiration from https://github.com/Dinahmoe/tuna/
			 *
			 *	@extends {Tone.StereoEffect}
			 *	@constructor
			 *	@param {number|Object} [frequency=0.5] the speed of the phasing
			 *	@param {number} [depth=10] the depth of the effect
			 *	@param {number} [baseFrequency=400] the base frequency of the filters
			 *	@example
			 * 	var phaser = new Tone.Phaser(0.4, 12, 550);
			 */
			Tone.Phaser = function(){

				//set the defaults
				var options = this.optionsObject(arguments, ["frequency", "depth", "baseFrequency"], Tone.Phaser.defaults);
				Tone.StereoEffect.call(this, options);

				/**
				 *  the lfo which controls the frequency on the left side
				 *  @type {Tone.LFO}
				 *  @private
				 */
				this._lfoL = new Tone.LFO(options.frequency, 0, 1);

				/**
				 *  the lfo which controls the frequency on the right side
				 *  @type {Tone.LFO}
				 *  @private
				 */
				this._lfoR = new Tone.LFO(options.frequency, 0, 1);
				this._lfoR.phase = 180;

				/**
				 *  the base modulation frequency
				 *  @type {number}
				 *  @private
				 */
				this._baseFrequency = options.baseFrequency;

				/**
				 *  the depth of the phasing
				 *  @type {number}
				 *  @private
				 */
				this._depth = options.depth;
				
				/**
				 *  the array of filters for the left side
				 *  @type {Array.<Tone.Filter>}
				 *  @private
				 */
				this._filtersL = this._makeFilters(options.stages, this._lfoL, options.Q);

				/**
				 *  the array of filters for the left side
				 *  @type {Array.<Tone.Filter>}
				 *  @private
				 */
				this._filtersR = this._makeFilters(options.stages, this._lfoR, options.Q);

				/**
				 * the frequency of the effect
				 * @type {Tone.Signal}
				 */
				this.frequency = this._lfoL.frequency;
				this.frequency.value = options.frequency;
				
				//connect them up
				this.effectSendL.connect(this._filtersL[0]);
				this.effectSendR.connect(this._filtersR[0]);
				this._filtersL[options.stages - 1].connect(this.effectReturnL);
				this._filtersR[options.stages - 1].connect(this.effectReturnR);
				this.effectSendL.connect(this.effectReturnL);
				this.effectSendR.connect(this.effectReturnR);
				//control the frequency with one LFO
				this._lfoL.frequency.connect(this._lfoR.frequency);
				//set the options
				this.baseFrequency = options.baseFrequency;
				this.depth = options.depth;
				//start the lfo
				this._lfoL.start();
				this._lfoR.start();
			};

			Tone.extend(Tone.Phaser, Tone.StereoEffect);

			/**
			 *  defaults
			 *  @static
			 *  @type {object}
			 */
			Tone.Phaser.defaults = {
				"frequency" : 0.5,
				"depth" : 10,
				"stages" : 4,
				"Q" : 100,
				"baseFrequency" : 400,
			};

			/**
			 *  @param {number} stages
			 *  @returns {Array} the number of filters all connected together
			 *  @private
			 */
			Tone.Phaser.prototype._makeFilters = function(stages, connectToFreq, Q){
				var filters = new Array(stages);
				//make all the filters
				for (var i = 0; i < stages; i++){
					var filter = this.context.createBiquadFilter();
					filter.type = "allpass";
					filter.Q.value = Q;
					connectToFreq.connect(filter.frequency);
					filters[i] = filter;
				}
				this.connectSeries.apply(this, filters);
				return filters;
			};

			/**
			 * The depth of the effect. 
			 * @memberOf Tone.Phaser#
			 * @type {number}
			 * @name depth
			 */
			Object.defineProperty(Tone.Phaser.prototype, "depth", {
				get : function(){
					return this._depth;
				},
				set : function(depth){
					this._depth = depth;
					var max = this._baseFrequency + this._baseFrequency * depth;
					this._lfoL.max = max;
					this._lfoR.max = max;
				}
			});

			/**
			 * The the base frequency of the filters. 
			 * @memberOf Tone.Phaser#
			 * @type {string}
			 * @name baseFrequency
			 */
			Object.defineProperty(Tone.Phaser.prototype, "baseFrequency", {
				get : function(){
					return this._baseFrequency;
				},
				set : function(freq){
					this._baseFrequency = freq;	
					this._lfoL.min = freq;
					this._lfoR.min = freq;
					this.depth = this._depth;
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.Phaser} `this`
			 */
			Tone.Phaser.prototype.dispose = function(){
				Tone.StereoEffect.prototype.dispose.call(this);
				this._lfoL.dispose();
				this._lfoL = null;
				this._lfoR.dispose();
				this._lfoR = null;
				for (var i = 0; i < this._filtersL.length; i++){
					this._filtersL[i].disconnect();
					this._filtersL[i] = null;
				}
				this._filtersL = null;
				for (var j = 0; j < this._filtersR.length; j++){
					this._filtersR[j].disconnect();
					this._filtersR[j] = null;
				}
				this._filtersR = null;
				this.frequency = null;
				return this;
			};

			return Tone.Phaser;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  PingPongDelay is a dual delay effect where the echo is heard
			 *          first in one channel and next in the opposite channel
			 *
			 * 	@constructor
			 * 	@extends {Tone.StereoXFeedbackEffect}
			 *  @param {Tone.Time|Object} [delayTime=0.25] is the interval between consecutive echos
			 *  @param {number=} feedback The amount of the effected signal which 
			 *                            is fed back through the delay.
			 *  @example
			 *  var pingPong = new Tone.PingPongDelay("4n", 0.2);
			 */
			Tone.PingPongDelay = function(){
				
				var options = this.optionsObject(arguments, ["delayTime", "feedback"], Tone.PingPongDelay.defaults);
				Tone.StereoXFeedbackEffect.call(this, options);

				/**
				 *  the delay node on the left side
				 *  @type {DelayNode}
				 *  @private
				 */
				this._leftDelay = this.context.createDelay(options.maxDelayTime);

				/**
				 *  the delay node on the right side
				 *  @type {DelayNode}
				 *  @private
				 */
				this._rightDelay = this.context.createDelay(options.maxDelayTime);

				/**
				 *  the predelay on the right side
				 *  @type {DelayNode}
				 *  @private
				 */
				this._rightPreDelay = this.context.createDelay(options.maxDelayTime);

				/**
				 *  the delay time signal
				 *  @type {Tone.Signal}
				 */
				this.delayTime = new Tone.Signal(options.delayTime, Tone.Signal.Units.Time);

				//connect it up
				this.effectSendL.chain(this._leftDelay, this.effectReturnL);
				this.effectSendR.chain(this._rightPreDelay, this._rightDelay, this.effectReturnR);
				this.delayTime.fan(this._leftDelay.delayTime, this._rightDelay.delayTime, this._rightPreDelay.delayTime);
				//rearranged the feedback to be after the rightPreDelay
				this._feedbackLR.disconnect();
				this._feedbackLR.connect(this._rightDelay);
			};

			Tone.extend(Tone.PingPongDelay, Tone.StereoXFeedbackEffect);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.PingPongDelay.defaults = {
				"delayTime" : 0.25,
				"maxDelayTime" : 1
			};

			/**
			 *  clean up
			 *  @returns {Tone.PingPongDelay} `this`
			 */
			Tone.PingPongDelay.prototype.dispose = function(){
				Tone.StereoXFeedbackEffect.prototype.dispose.call(this);
				this._leftDelay.disconnect();
				this._leftDelay = null;
				this._rightDelay.disconnect();
				this._rightDelay = null;
				this._rightPreDelay.disconnect();
				this._rightPreDelay = null;
				this.delayTime.dispose();
				this.delayTime = null;
				return this;
			};

			return Tone.PingPongDelay;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class A stereo feedback effect where the feedback is on the same channel
			 *
			 *	@constructor
			 *	@extends {Tone.FeedbackEffect}
			 */
			Tone.StereoFeedbackEffect = function(){

				var options = this.optionsObject(arguments, ["feedback"], Tone.FeedbackEffect.defaults);
				Tone.StereoEffect.call(this, options);

				/**
				 *  controls the amount of feedback
				 *  @type {Tone.Signal}
				 */
				this.feedback = new Tone.Signal(options.feedback);

				/**
				 *  the left side feeback
				 *  @type {GainNode}
				 *  @private
				 */
				this._feedbackL = this.context.createGain();

				/**
				 *  the right side feeback
				 *  @type {GainNode}
				 *  @private
				 */
				this._feedbackR = this.context.createGain();

				//connect it up
				this.effectReturnL.chain(this._feedbackL, this.effectSendL);
				this.effectReturnR.chain(this._feedbackR, this.effectSendR);
				this.feedback.fan(this._feedbackL.gain, this._feedbackR.gain);
			};

			Tone.extend(Tone.StereoFeedbackEffect, Tone.FeedbackEffect);

			/**
			 *  clean up
			 *  @returns {Tone.StereoFeedbackEffect} `this`
			 */
			Tone.StereoFeedbackEffect.prototype.dispose = function(){
				Tone.StereoEffect.prototype.dispose.call(this);
				this.feedback.dispose();
				this.feedback = null;
				this._feedbackL.disconnect();
				this._feedbackL = null;
				this._feedbackR.disconnect();
				this._feedbackR = null;
				return this;
			};

			return Tone.StereoFeedbackEffect;
		});
		ToneModule( 
			function(Tone){

			

			/**
			 *  @class Applies a width factor (0-1) to the mid/side seperation. 
			 *         0 is all mid and 1 is all side. <br><br>
			 *         http://musicdsp.org/showArchiveComment.php?ArchiveID=173<br><br>
			 *         http://www.kvraudio.com/forum/viewtopic.php?t=212587<br><br>
			 *         M *= 2*(1-width)<br><br>
			 *         S *= 2*width<br><br>
			 *
			 *  @extends {Tone.MidSideEffect}
			 *  @constructor
			 *  @param {number|Object} [width=0.5] the stereo width. A width of 0 is mono and 1 is stereo. 0.5 is no change.
			 */
			Tone.StereoWidener = function(){

				var options = this.optionsObject(arguments, ["width"], Tone.StereoWidener.defaults);
				Tone.MidSideEffect.call(this, options);

				/**
				 *  The width control. 0 = 100% mid. 1 = 100% side. 
				 *  @type {Tone.Signal}
				 */
				this.width = new Tone.Signal(0.5, Tone.Signal.Units.Normal);

				/**
				 *  Mid multiplier
				 *  @type {Tone.Expr}
				 *  @private
				 */
				this._midMult = new Tone.Expr("$0 * ($1 * (1 - $2))");

				/**
				 *  Side multiplier
				 *  @type {Tone.Expr}
				 *  @private
				 */
				this._sideMult = new Tone.Expr("$0 * ($1 * $2)");

				/**
				 *  constant output of 2
				 *  @type {Tone}
				 *  @private
				 */
				this._two = new Tone.Signal(2);

				//the mid chain
				this._two.connect(this._midMult, 0, 1);
				this.width.connect(this._midMult, 0, 2);
				//the side chain
				this._two.connect(this._sideMult, 0, 1);
				this.width.connect(this._sideMult, 0, 2);
				//connect it to the effect send/return
				this.midSend.chain(this._midMult, this.midReturn);
				this.sideSend.chain(this._sideMult, this.sideReturn);
			};

			Tone.extend(Tone.StereoWidener, Tone.MidSideEffect);

			/**
			 *  the default values
			 *  @static
			 *  @type {Object}
			 */
			Tone.StereoWidener.defaults = {
				"width" : 0.5
			};

			/**
			 *  clean up
			 *  @returns {Tone.StereoWidener} `this`
			 */
			Tone.StereoWidener.prototype.dispose = function(){
				Tone.MidSideEffect.prototype.dispose.call(this);
				this.width.dispose();
				this.width = null;
				this._midMult.dispose();
				this._midMult = null;
				this._sideMult.dispose();
				this._sideMult = null;
				this._two.dispose();
				this._two = null;
				return this;
			};

			return Tone.StereoWidener;
		});
		ToneModule(
		function(Tone){

			

			/**
			 *  @class Pulse Oscillator with control over width
			 *
			 *  @constructor
			 *  @extends {Tone.Oscillator}
			 *  @param {number} [frequency=440] the frequency of the oscillator
			 *  @param {number} [width = 0.2] the width of the pulse
			 *  @example
			 *  var pulse = new Tone.PulseOscillator("E5", 0.4);
			 */
			Tone.PulseOscillator = function(){

				var options = this.optionsObject(arguments, ["frequency", "width"], Tone.Oscillator.defaults);
				Tone.Source.call(this, options);

				/**
				 *  the width of the pulse
				 *  @type {Tone.Signal}
				 */
				this.width = new Tone.Signal(options.width, Tone.Signal.Units.Normal);

				/**
				 *  gate the width amount
				 *  @type {GainNode}
				 *  @private
				 */
				this._widthGate = this.context.createGain();

				/**
				 *  the sawtooth oscillator
				 *  @type {Tone.Oscillator}
				 *  @private
				 */
				this._sawtooth = new Tone.Oscillator({
					frequency : options.frequency,
					detune : options.detune,
					type : "sawtooth",
					phase : options.phase
				});

				/**
				 *  The frequency in hertz
				 *  @type {Tone.Signal}
				 */
				this.frequency = this._sawtooth.frequency;

				/**
				 *  The detune in cents. 
				 *  @type {Tone.Signal}
				 */
				this.detune = this._sawtooth.detune;

				/**
				 *  Threshold the signal to turn it into a square
				 *  @type {Tone.WaveShaper}
				 *  @private
				 */
				this._thresh = new Tone.WaveShaper(function(val){
					if (val < 0){
						return -1;
					} else {
						return 1;
					}
				});

				//connections
				this._sawtooth.chain(this._thresh, this.output);
				this.width.chain(this._widthGate, this._thresh);
			};

			Tone.extend(Tone.PulseOscillator, Tone.Oscillator);

			/**
			 *  The default parameters.
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.PulseOscillator.defaults = {
				"frequency" : 440,
				"detune" : 0,
				"phase" : 0,
				"width" : 0.2,
			};

			/**
			 *  start the oscillator
			 *  @param  {Tone.Time} time 
			 *  @private
			 */
			Tone.PulseOscillator.prototype._start = function(time){
				time = this.toSeconds(time);
				this._sawtooth.start(time);
				this._widthGate.gain.setValueAtTime(1, time);
			};

			/**
			 *  stop the oscillator
			 *  @param  {Tone.Time} time 
			 *  @private
			 */
			Tone.PulseOscillator.prototype._stop = function(time){
				time = this.toSeconds(time);
				this._sawtooth.stop(time);
				//the width is still connected to the output. 
				//that needs to be stopped also
				this._widthGate.gain.setValueAtTime(0, time);
			};

			/**
			 * The phase of the oscillator in degrees.
			 * @memberOf Tone.PulseOscillator#
			 * @type {number}
			 * @name phase
			 */
			Object.defineProperty(Tone.PulseOscillator.prototype, "phase", {
				get : function(){
					return this._sawtooth.phase;
				}, 
				set : function(phase){
					this._sawtooth.phase = phase;
				}
			});

			/**
			 * The type of the oscillator. Always returns "pulse".
			 * @readOnly
			 * @memberOf Tone.PulseOscillator#
			 * @type {string}
			 * @name type
			 */
			Object.defineProperty(Tone.PulseOscillator.prototype, "type", {
				get : function(){
					return "pulse";
				}
			});

			/**
			 *  Clean up method
			 *  @return {Tone.PulseOscillator} `this`
			 */
			Tone.PulseOscillator.prototype.dispose = function(){
				Tone.Source.prototype.dispose.call(this);
				this._sawtooth.dispose();
				this._sawtooth = null;
				this.width.dispose();
				this.width = null;
				this._widthGate.disconnect();
				this._widthGate = null;
				this._thresh.disconnect();
				this._thresh = null;
				this.frequency = null;
				this.detune = null;
				return this;
			};

			return Tone.PulseOscillator;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class takes an array of Oscillator descriptions and mixes them together
			 *         with the same detune and frequency controls. 
			 *
			 *  @extends {Tone.Oscillator}
			 *  @constructor
			 *  @param {frequency} frequency frequency of the oscillator (meaningless for noise types)
			 *  @param {number} modulationFrequency the modulation frequency of the oscillator
			 *  @example
			 *  var pwm = new Tone.PWMOscillator("Ab3", 0.3);
			 */
			Tone.PWMOscillator = function(){
				var options = this.optionsObject(arguments, ["frequency", "modulationFrequency"], Tone.PWMOscillator.defaults);
				Tone.Source.call(this, options);

				/**
				 *  the pulse oscillator
				 */
				this._pulse = new Tone.PulseOscillator(options.modulationFrequency);
				//change the pulse oscillator type
				this._pulse._sawtooth.type = "sine";

				/**
				 *  the modulator
				 *  @type {Tone.Oscillator}
				 *  @private
				 */
				this._modulator = new Tone.Oscillator({
					"frequency" : options.frequency,
					"detune" : options.detune
				});

				/**
				 *  Scale the oscillator so it doesn't go silent 
				 *  at the extreme values.
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._scale = new Tone.Multiply(1.01);

				/**
				 *  the frequency control
				 *  @type {Tone.Signal}
				 */
				this.frequency = this._modulator.frequency;

				/**
				 *  the detune control
				 *  @type {Tone.Signal}
				 */
				this.detune = this._modulator.detune;

				/**
				 *  the modulation rate of the oscillator
				 *  @type {Tone.Signal}
				 */
				this.modulationFrequency = this._pulse.frequency;	

				//connections
				this._modulator.chain(this._scale, this._pulse.width);
				this._pulse.connect(this.output);
			};

			Tone.extend(Tone.PWMOscillator, Tone.Oscillator);

			/**
			 *  default values
			 *  @static
			 *  @type {Object}
			 *  @const
			 */
			Tone.PWMOscillator.defaults = {
				"frequency" : 440,
				"detune" : 0,
				"modulationFrequency" : 0.4,
			};

			/**
			 *  start the oscillator
			 *  @param  {Tone.Time} [time=now]
			 *  @private
			 */
			Tone.PWMOscillator.prototype._start = function(time){
				time = this.toSeconds(time);
				this._modulator.start(time);
				this._pulse.start(time);
			};

			/**
			 *  stop the oscillator
			 *  @param  {Tone.Time} time (optional) timing parameter
			 *  @private
			 */
			Tone.PWMOscillator.prototype._stop = function(time){
				time = this.toSeconds(time);
				this._modulator.stop(time);
				this._pulse.stop(time);
			};

			/**
			 * The type of the oscillator. Always returns "pwm".
			 * @readOnly
			 * @memberOf Tone.PWMOscillator#
			 * @type {string}
			 * @name type
			 */
			Object.defineProperty(Tone.PWMOscillator.prototype, "type", {
				get : function(){
					return "pwm";
				}
			});

			/**
			 * The phase of the oscillator in degrees.
			 * @memberOf Tone.PWMOscillator#
			 * @type {number}
			 * @name phase
			 */
			Object.defineProperty(Tone.PWMOscillator.prototype, "phase", {
				get : function(){
					return this._modulator.phase;
				}, 
				set : function(phase){
					this._modulator.phase = phase;
				}
			});

			/**
			 *  clean up
			 *  @return {Tone.PWMOscillator} `this`
			 */
			Tone.PWMOscillator.prototype.dispose = function(){
				Tone.Source.prototype.dispose.call(this);
				this._pulse.dispose();
				this._pulse = null;
				this._scale.dispose();
				this._scale = null;
				this._modulator.dispose();
				this._modulator = null;
				this.frequency = null;
				this.detune = null;
				this.modulationFrequency = null;
				return this;
			};

			return Tone.PWMOscillator;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class OmniOscillator aggregates Tone.Oscillator, Tone.PulseOscillator,
			 *         and Tone.PWMOscillator which allows it to have the types: 
			 *         sine, square, triangle, sawtooth, pulse or pwm. 
			 *
			 *  @extends {Tone.Oscillator}
			 *  @constructor
			 *  @param {frequency} frequency frequency of the oscillator (meaningless for noise types)
			 *  @param {string} type the type of the oscillator
			 *  @example
			 *  var omniOsc = new Tone.OmniOscillator("C#4", "pwm");
			 */
			Tone.OmniOscillator = function(){
				var options = this.optionsObject(arguments, ["frequency", "type"], Tone.OmniOscillator.defaults);
				Tone.Source.call(this, options);

				/**
				 *  the frequency control
				 *  @type {Tone.Signal}
				 */
				this.frequency = new Tone.Signal(options.frequency, Tone.Signal.Units.Frequency);

				/**
				 *  the detune control
				 *  @type {Tone.Signal}
				 */
				this.detune = new Tone.Signal(options.detune);

				/**
				 *  the type of the oscillator source
				 *  @type {string}
				 *  @private
				 */
				this._sourceType = undefined;

				/**
				 *  the oscillator
				 *  @type {Tone.Oscillator|Tone.PWMOscillator|Tone.PulseOscillator}
				 *  @private
				 */
				this._oscillator = null;

				//set the oscillator
				this.type = options.type;
			};

			Tone.extend(Tone.OmniOscillator, Tone.Oscillator);

			/**
			 *  default values
			 *  @static
			 *  @type {Object}
			 *  @const
			 */
			Tone.OmniOscillator.defaults = {
				"frequency" : 440,
				"detune" : 0,
				"type" : "sine",
				"width" : 0.4, //only applies if the oscillator is set to "pulse",
				"modulationFrequency" : 0.4, //only applies if the oscillator is set to "pwm",
			};

			/**
			 *  @enum {string}
			 *  @private
			 */
			var OmniOscType = {
				PulseOscillator : "PulseOscillator",
				PWMOscillator : "PWMOscillator",
				Oscillator : "Oscillator"
			};

			/**
			 *  start the oscillator
			 *  @param {Tone.Time} [time=now] the time to start the oscillator
			 *  @private
			 */
			Tone.OmniOscillator.prototype._start = function(time){
				this._oscillator.start(time);
			};

			/**
			 *  start the oscillator
			 *  @param {Tone.Time} [time=now] the time to start the oscillator
			 *  @private
			 */
			Tone.OmniOscillator.prototype._stop = function(time){
				this._oscillator.stop(time);
			};

			/**
			 * The type of the oscillator. sine, square, triangle, sawtooth, pwm, or pulse. 
			 *  
			 * @memberOf Tone.OmniOscillator#
			 * @type {string}
			 * @name type
			 */
			Object.defineProperty(Tone.OmniOscillator.prototype, "type", {
				get : function(){
					return this._oscillator.type;
				}, 
				set : function(type){
					if (type === "sine" || type === "square" || type === "triangle" || type === "sawtooth"){
						if (this._sourceType !== OmniOscType.Oscillator){
							this._sourceType = OmniOscType.Oscillator;
							this._createNewOscillator(Tone.Oscillator);
						}
						this._oscillator.type = type;
					} else if (type === "pwm"){
						if (this._sourceType !== OmniOscType.PWMOscillator){
							this._sourceType = OmniOscType.PWMOscillator;
							this._createNewOscillator(Tone.PWMOscillator);
						}
					} else if (type === "pulse"){
						if (this._sourceType !== OmniOscType.PulseOscillator){
							this._sourceType = OmniOscType.PulseOscillator;
							this._createNewOscillator(Tone.PulseOscillator);
						}
					} else {
						throw new TypeError("Tone.OmniOscillator does not support type "+type);
					}
				}
			});

			/**
			 *  connect the oscillator to the frequency and detune signals
			 *  @private
			 */
			Tone.OmniOscillator.prototype._createNewOscillator = function(OscillatorConstructor){
				//short delay to avoid clicks on the change
				var now = this.now() + this.bufferTime;
				if (this._oscillator !== null){
					var oldOsc = this._oscillator;
					oldOsc.stop(now);
					oldOsc.onended = function(){
						oldOsc.dispose();
						oldOsc = null;
					};
				}
				this._oscillator = new OscillatorConstructor();
				this.frequency.connect(this._oscillator.frequency);
				this.detune.connect(this._oscillator.detune);
				this._oscillator.connect(this.output);
				if (this.state === Tone.Source.State.STARTED){
					this._oscillator.start(now);
				}
			};

			/**
			 * The phase of the oscillator in degrees
			 * @memberOf Tone.OmniOscillator#
			 * @type {number}
			 * @name phase
			 */
			Object.defineProperty(Tone.OmniOscillator.prototype, "phase", {
				get : function(){
					return this._oscillator.phase;
				}, 
				set : function(phase){
					this._oscillator.phase = phase;
				}
			});

			/**
			 * The width of the oscillator (only if the oscillator is set to pulse)
			 * @memberOf Tone.OmniOscillator#
			 * @type {Tone.Signal}
			 * @name width
			 * @example
			 * var omniOsc = new Tone.OmniOscillator(440, "pulse");
			 * //can access the width attribute only if type === "pulse"
			 * omniOsc.width.value = 0.2; 
			 */
			Object.defineProperty(Tone.OmniOscillator.prototype, "width", {
				get : function(){
					if (this._sourceType === OmniOscType.PulseOscillator){
						return this._oscillator.width;
					} 
				}
			});

			/**
			 * The modulationFrequency Signal of the oscillator 
			 * (only if the oscillator type is set to pwm).
			 * @memberOf Tone.OmniOscillator#
			 * @type {Tone.Signal}
			 * @name modulationFrequency
			 * @example
			 * var omniOsc = new Tone.OmniOscillator(440, "pwm");
			 * //can access the modulationFrequency attribute only if type === "pwm"
			 * omniOsc.modulationFrequency.value = 0.2; 
			 */
			Object.defineProperty(Tone.OmniOscillator.prototype, "modulationFrequency", {
				get : function(){
					if (this._sourceType === OmniOscType.PWMOscillator){
						return this._oscillator.modulationFrequency;
					} 
				}
			});

			/**
			 *  clean up
			 *  @return {Tone.OmniOscillator} `this`
			 */
			Tone.OmniOscillator.prototype.dispose = function(){
				Tone.Source.prototype.dispose.call(this);
				this.detune.dispose();
				this.detune = null;
				this.frequency.dispose();
				this.frequency = null;
				this._oscillator.dispose();
				this._oscillator = null;
				this._sourceType = null;
				return this;
			};

			return Tone.OmniOscillator;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  Base-class for all instruments
			 *  
			 *  @constructor
			 *  @extends {Tone}
			 */
			Tone.Instrument = function(){

				/**
				 *  the output
				 *  @type {GainNode}
				 *  @private
				 */
				this.output = this.context.createGain();

				/**
				 * the volume of the output in decibels
				 * @type {Tone.Signal}
				 */
				this.volume = new Tone.Signal(this.output.gain, Tone.Signal.Units.Decibels);
			};

			Tone.extend(Tone.Instrument);

			/**
			 *  @abstract
			 *  @param {string|number} note the note to trigger
			 *  @param {Tone.Time} [time=now] the time to trigger the ntoe
			 *  @param {number} [velocity=1] the velocity to trigger the note
			 */
			Tone.Instrument.prototype.triggerAttack = function(){};

			/**
			 *  @abstract
			 *  @param {Tone.Time} [time=now] when to trigger the release
			 */
			Tone.Instrument.prototype.triggerRelease = function(){};

			/**
			 *  trigger the attack and then the release
			 *  @param  {string|number} note     the note to trigger
			 *  @param  {Tone.Time} duration the duration of the note
			 *  @param {Tone.Time} [time=now]     the time of the attack
			 *  @param  {number} velocity the velocity
			 *  @returns {Tone.Instrument} `this`
			 */
			Tone.Instrument.prototype.triggerAttackRelease = function(note, duration, time, velocity){
				time = this.toSeconds(time);
				duration = this.toSeconds(duration);
				this.triggerAttack(note, time, velocity);
				this.triggerRelease(time + duration);
				return this;
			};

			/**
			 *  clean up
			 *  @returns {Tone.Instrument} `this`
			 */
			Tone.Instrument.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this.volume.dispose();
				this.volume = null;
				return this;
			};

			return Tone.Instrument;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  this is a base class for monophonic instruments. 
			 *          it defines their interfaces
			 *
			 *  @constructor
			 *  @abstract
			 *  @extends {Tone.Instrument}
			 */
			Tone.Monophonic = function(options){

				Tone.Instrument.call(this);

				//get the defaults
				options = this.defaultArg(options, Tone.Monophonic.defaults);

				/**
				 *  The glide time between notes. 
				 *  @type {Tone.Time}
				 */
				this.portamento = options.portamento;
			};

			Tone.extend(Tone.Monophonic, Tone.Instrument);

			/**
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.Monophonic.defaults = {
				"portamento" : 0
			};

			/**
			 *  trigger the attack. start the note, at the time with the velocity
			 *  
			 *  @param  {string|string} note     the note
			 *  @param  {Tone.Time} [time=now]     the time, if not given is now
			 *  @param  {number} [velocity=1] velocity defaults to 1
			 *  @returns {Tone.Monophonic} `this`
			 */
			Tone.Monophonic.prototype.triggerAttack = function(note, time, velocity) {
				time = this.toSeconds(time);
				this.triggerEnvelopeAttack(time, velocity);
				this.setNote(note, time);
				return this;
			};

			/**
			 *  trigger the release portion of the envelope
			 *  @param  {Tone.Time} [time=now] if no time is given, the release happens immediatly
			 *  @returns {Tone.Monophonic} `this`
			 */
			Tone.Monophonic.prototype.triggerRelease = function(time){
				this.triggerEnvelopeRelease(time);
				return this;
			};

			/**
			 *  override this method with the actual method
			 *  @abstract
			 *  @param {Tone.Time} [time=now] the time the attack should happen
			 *  @param {number} [velocity=1] the velocity of the envelope
			 *  @returns {Tone.Monophonic} `this`
			 */	
			Tone.Monophonic.prototype.triggerEnvelopeAttack = function() {};

			/**
			 *  override this method with the actual method
			 *  @abstract
			 *  @param {Tone.Time} [time=now] the time the attack should happen
			 *  @param {number} [velocity=1] the velocity of the envelope
			 *  @returns {Tone.Monophonic} `this`
			 */	
			Tone.Monophonic.prototype.triggerEnvelopeRelease = function() {};

			/**
			 *  set the note to happen at a specific time
			 *  @param {number|string} note if the note is a string, it will be 
			 *                              parsed as (NoteName)(Octave) i.e. A4, C#3, etc
			 *                              otherwise it will be considered as the frequency
			 *  @returns {Tone.Monophonic} `this`
			 */
			Tone.Monophonic.prototype.setNote = function(note, time){
				time = this.toSeconds(time);
				if (this.portamento > 0){
					var currentNote = this.frequency.value;
					this.frequency.setValueAtTime(currentNote, time);
					var portTime = this.toSeconds(this.portamento);
					this.frequency.exponentialRampToValueAtTime(note, time + portTime);
				} else {
					this.frequency.setValueAtTime(note, time);
				}
				return this;
			};

			return Tone.Monophonic;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  the MonoSynth is a single oscillator, monophonic synthesizer
			 *          with a filter, and two envelopes (on the filter and the amplitude). 
			 *
			 * Flow: 
			 * 
			 * <pre>
			 * OmniOscillator+-->AmplitudeEnvelope+-->Filter 
			 *                                          ^    
			 *                                          |    
			 *                         ScaledEnvelope+--+
			 * </pre>
			 *  
			 *
			 *  @constructor
			 *  @extends {Tone.Monophonic}
			 *  @param {Object} options the options available for the synth 
			 *                          see defaults below
			 */
			Tone.MonoSynth = function(options){

				//get the defaults
				options = this.defaultArg(options, Tone.MonoSynth.defaults);
				Tone.Monophonic.call(this, options);

				/**
				 *  the first oscillator
				 *  @type {Tone.OmniOscillator}
				 */
				this.oscillator = new Tone.OmniOscillator(options.oscillator);

				/**
				 *  the frequency control signal
				 *  @type {Tone.Signal}
				 */
				this.frequency = this.oscillator.frequency;

				/**
				 *  the detune control signal
				 *  @type {Tone.Signal}
				 */
				this.detune = this.oscillator.detune;

				/**
				 *  the filter
				 *  @type {Tone.Filter}
				 */
				this.filter = new Tone.Filter(options.filter);

				/**
				 *  the filter envelope
				 *  @type {Tone.Envelope}
				 */
				this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

				/**
				 *  the amplitude envelope
				 *  @type {Tone.Envelope}
				 */
				this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

				//connect the oscillators to the output
				this.oscillator.chain(this.filter, this.envelope, this.output);
				//start the oscillators
				this.oscillator.start();
				//connect the filter envelope
				this.filterEnvelope.connect(this.filter.frequency);
			};

			Tone.extend(Tone.MonoSynth, Tone.Monophonic);

			/**
			 *  @const
			 *  @static
			 *  @type {Object}
			 */
			Tone.MonoSynth.defaults = {
				"oscillator" : {
					"type" : "square"
				},
				"filter" : {
					"Q" : 6,
					"type" : "lowpass",
					"rolloff" : -24
				},
				"envelope" : {
					"attack" : 0.005,
					"decay" : 0.1,
					"sustain" : 0.9,
					"release" : 1
				},
				"filterEnvelope" : {
					"attack" : 0.06,
					"decay" : 0.2,
					"sustain" : 0.5,
					"release" : 2,
					"min" : 20,
					"max" : 4000,
					"exponent" : 2
				}
			};

			/**
			 *  start the attack portion of the envelope
			 *  @param {Tone.Time} [time=now] the time the attack should start
			 *  @param {number} [velocity=1] the velocity of the note (0-1)
			 *  @returns {Tone.MonoSynth} `this`
			 */
			Tone.MonoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
				//the envelopes
				this.envelope.triggerAttack(time, velocity);
				this.filterEnvelope.triggerAttack(time);	
				return this;	
			};

			/**
			 *  start the release portion of the envelope
			 *  @param {Tone.Time} [time=now] the time the release should start
			 *  @returns {Tone.MonoSynth} `this`
			 */
			Tone.MonoSynth.prototype.triggerEnvelopeRelease = function(time){
				this.envelope.triggerRelease(time);
				this.filterEnvelope.triggerRelease(time);
				return this;
			};


			/**
			 *  clean up
			 *  @returns {Tone.MonoSynth} `this`
			 */
			Tone.MonoSynth.prototype.dispose = function(){
				Tone.Monophonic.prototype.dispose.call(this);
				this.oscillator.dispose();
				this.oscillator = null;
				this.envelope.dispose();
				this.envelope = null;
				this.filterEnvelope.dispose();
				this.filterEnvelope = null;
				this.filter.dispose();
				this.filter = null;
				this.frequency = null;
				this.detune = null;
				return this;
			};

			return Tone.MonoSynth;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  the AMSynth is an amplitude modulation synthesizer
			 *          composed of two MonoSynths where one MonoSynth is the 
			 *          carrier and the second is the modulator.
			 *
			 *  @constructor
			 *  @extends {Tone.Monophonic}
			 *  @param {Object} options the options available for the synth 
			 *                          see defaults below
			 *  @example
			 *  var synth = new Tone.AMSynth();
			 */
			Tone.AMSynth = function(options){

				options = this.defaultArg(options, Tone.AMSynth.defaults);
				Tone.Monophonic.call(this, options);

				/**
				 *  the first voice
				 *  @type {Tone.MonoSynth}
				 */
				this.carrier = new Tone.MonoSynth(options.carrier);
				this.carrier.volume.value = -10;

				/**
				 *  the second voice
				 *  @type {Tone.MonoSynth}
				 */
				this.modulator = new Tone.MonoSynth(options.modulator);
				this.modulator.volume.value = -10;

				/**
				 *  the frequency control
				 *  @type {Tone.Signal}
				 */
				this.frequency = new Tone.Signal(440, Tone.Signal.Units.Frequency);

				/**
				 *  the ratio between the two voices
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._harmonicity = new Tone.Multiply(options.harmonicity);

				/**
				 *  convert the -1,1 output to 0,1
				 *  @type {Tone.AudioToGain}
				 *  @private
				 */
				this._modulationScale = new Tone.AudioToGain();

				/**
				 *  the node where the modulation happens
				 *  @type {GainNode}
				 *  @private
				 */
				this._modulationNode = this.context.createGain();

				//control the two voices frequency
				this.frequency.connect(this.carrier.frequency);
				this.frequency.chain(this._harmonicity, this.modulator.frequency);
				this.modulator.chain(this._modulationScale, this._modulationNode.gain);
				this.carrier.chain(this._modulationNode, this.output);
			};

			Tone.extend(Tone.AMSynth, Tone.Monophonic);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.AMSynth.defaults = {
				"harmonicity" : 3,
				"carrier" : {
					"volume" : -10,
					"portamento" : 0,
					"oscillator" : {
						"type" : "sine"
					},
					"envelope" : {
						"attack" : 0.01,
						"decay" : 0.01,
						"sustain" : 1,
						"release" : 0.5
					},
					"filterEnvelope" : {
						"attack" : 0.01,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5,
						"min" : 20000,
						"max" : 20000
					}
				},
				"modulator" : {
					"volume" : -10,
					"portamento" : 0,
					"oscillator" : {
						"type" : "square"
					},
					"envelope" : {
						"attack" : 2,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5
					},
					"filterEnvelope" : {
						"attack" : 4,
						"decay" : 0.2,
						"sustain" : 0.5,
						"release" : 0.5,
						"min" : 20,
						"max" : 1500
					}
				}
			};

			/**
			 *  trigger the attack portion of the note
			 *  
			 *  @param  {Tone.Time} [time=now] the time the note will occur
			 *  @param {number} [velocity=1] the velocity of the note
			 *  @returns {Tone.AMSynth} `this`
			 */
			Tone.AMSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
				//the port glide
				time = this.toSeconds(time);
				//the envelopes
				this.carrier.envelope.triggerAttack(time, velocity);
				this.modulator.envelope.triggerAttack(time);
				this.carrier.filterEnvelope.triggerAttack(time);
				this.modulator.filterEnvelope.triggerAttack(time);
				return this;
			};

			/**
			 *  trigger the release portion of the note
			 *  
			 *  @param  {Tone.Time} [time=now] the time the note will release
			 *  @returns {Tone.AMSynth} `this`
			 */
			Tone.AMSynth.prototype.triggerEnvelopeRelease = function(time){
				this.carrier.triggerRelease(time);
				this.modulator.triggerRelease(time);
				return this;
			};

			/**
			 * The ratio between the two carrier and the modulator. 
			 * @memberOf Tone.AMSynth#
			 * @type {number}
			 * @name harmonicity
			 */
			Object.defineProperty(Tone.AMSynth.prototype, "harmonicity", {
				get : function(){
					return this._harmonicity.value;
				},
				set : function(harm){
					this._harmonicity.value = harm;
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.AMSynth} `this`
			 */
			Tone.AMSynth.prototype.dispose = function(){
				Tone.Monophonic.prototype.dispose.call(this);
				this.carrier.dispose();
				this.carrier = null;
				this.modulator.dispose();
				this.modulator = null;
				this.frequency.dispose();
				this.frequency = null;
				this._harmonicity.dispose();
				this._harmonicity = null;
				this._modulationScale.dispose();
				this._modulationScale = null;
				this._modulationNode.disconnect();
				this._modulationNode = null;
				return this;
			};

			return Tone.AMSynth;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  the DuoSynth is a monophonic synth composed of two 
			 *          MonoSynths run in parallel with control over the 
			 *          frequency ratio between the two voices and vibrato effect.
			 *
			 *  @constructor
			 *  @extends {Tone.Monophonic}
			 *  @param {Object} options the options available for the synth 
			 *                          see defaults below
			 *  @example
			 *  var duoSynth = new Tone.DuoSynth();
			 */
			Tone.DuoSynth = function(options){

				options = this.defaultArg(options, Tone.DuoSynth.defaults);
				Tone.Monophonic.call(this, options);

				/**
				 *  the first voice
				 *  @type {Tone.MonoSynth}
				 */
				this.voice0 = new Tone.MonoSynth(options.voice0);
				this.voice0.volume.value = -10;

				/**
				 *  the second voice
				 *  @type {Tone.MonoSynth}
				 */
				this.voice1 = new Tone.MonoSynth(options.voice1);
				this.voice1.volume.value = -10;

				/**
				 *  The vibrato LFO. 
				 *  @type {Tone.LFO}
				 *  @private
				 */
				this._vibrato = new Tone.LFO(options.vibratoRate, -50, 50);
				this._vibrato.start();

				/**
				 * the vibrato frequency
				 * @type {Tone.Signal}
				 */
				this.vibratoRate = this._vibrato.frequency;

				/**
				 *  the vibrato gain
				 *  @type {GainNode}
				 *  @private
				 */
				this._vibratoGain = this.context.createGain();

				/**
				 * The amount of vibrato
				 * @type {Tone.Signal}
				 */
				this.vibratoAmount = new Tone.Signal(this._vibratoGain.gain, Tone.Signal.Units.Gain);
				this.vibratoAmount.value = options.vibratoAmount;

				/**
				 *  the delay before the vibrato starts
				 *  @type {number}
				 *  @private
				 */
				this._vibratoDelay = this.toSeconds(options.vibratoDelay);

				/**
				 *  the frequency control
				 *  @type {Tone.Signal}
				 */
				this.frequency = new Tone.Signal(440, Tone.Signal.Units.Frequency);

				/**
				 *  the ratio between the two voices
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._harmonicity = new Tone.Multiply(options.harmonicity);

				//control the two voices frequency
				this.frequency.connect(this.voice0.frequency);
				this.frequency.chain(this._harmonicity, this.voice1.frequency);
				this._vibrato.connect(this._vibratoGain);
				this._vibratoGain.fan(this.voice0.detune, this.voice1.detune);
				this.voice0.connect(this.output);
				this.voice1.connect(this.output);
			};

			Tone.extend(Tone.DuoSynth, Tone.Monophonic);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.DuoSynth.defaults = {
				"vibratoAmount" : 0.5,
				"vibratoRate" : 5,
				"vibratoDelay" : 1,
				"harmonicity" : 1.5,
				"voice0" : {
					"volume" : -10,
					"portamento" : 0,
					"oscillator" : {
						"type" : "sine"
					},
					"filterEnvelope" : {
						"attack" : 0.01,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5
					},
					"envelope" : {
						"attack" : 0.01,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5
					}
				},
				"voice1" : {
					"volume" : -10,
					"portamento" : 0,
					"oscillator" : {
						"type" : "sine"
					},
					"filterEnvelope" : {
						"attack" : 0.01,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5
					},
					"envelope" : {
						"attack" : 0.01,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5
					}
				}
			};

			/**
			 *  start the attack portion of the envelopes
			 *  
			 *  @param {Tone.Time} [time=now] the time the attack should start
			 *  @param {number} [velocity=1] the velocity of the note (0-1)
			 *  @returns {Tone.DuoSynth} `this`
			 */
			Tone.DuoSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
				time = this.toSeconds(time);
				this.voice0.envelope.triggerAttack(time, velocity);
				this.voice1.envelope.triggerAttack(time, velocity);
				this.voice0.filterEnvelope.triggerAttack(time);
				this.voice1.filterEnvelope.triggerAttack(time);
				return this;
			};

			/**
			 *  start the release portion of the envelopes
			 *  
			 *  @param {Tone.Time} [time=now] the time the release should start
			 *  @returns {Tone.DuoSynth} `this`
			 */
			Tone.DuoSynth.prototype.triggerEnvelopeRelease = function(time){
				this.voice0.triggerRelease(time);
				this.voice1.triggerRelease(time);
				return this;
			};

			/**
			 * The ratio between the two carrier and the modulator. 
			 * @memberOf Tone.DuoSynth#
			 * @type {number}
			 * @name harmonicity
			 */
			Object.defineProperty(Tone.DuoSynth.prototype, "harmonicity", {
				get : function(){
					return this._harmonicity.value;
				},
				set : function(harm){
					this._harmonicity.value = harm;
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.DuoSynth} `this`
			 */
			Tone.DuoSynth.prototype.dispose = function(){
				Tone.Monophonic.prototype.dispose.call(this);
				this.voice0.dispose();
				this.voice0 = null;
				this.voice1.dispose();
				this.voice1 = null;
				this.frequency.dispose();
				this.frequency = null;
				this._vibrato.dispose();
				this._vibrato = null;
				this._vibratoGain.disconnect();
				this._vibratoGain = null;
				this._harmonicity.dispose();
				this._harmonicity = null;
				this.vibratoAmount.dispose();
				this.vibratoAmount = null;
				this.vibratoRate = null;
				return this;
			};

			return Tone.DuoSynth;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  the FMSynth is composed of two MonoSynths where one MonoSynth is the 
			 *          carrier and the second is the modulator.
			 *
			 *  @constructor
			 *  @extends {Tone.Monophonic}
			 *  @param {Object} options the options available for the synth 
			 *                          see defaults below
			 *  @example
			 *  var fmSynth = new Tone.FMSynth();
			 */
			Tone.FMSynth = function(options){

				options = this.defaultArg(options, Tone.FMSynth.defaults);
				Tone.Monophonic.call(this, options);

				/**
				 *  the first voice
				 *  @type {Tone.MonoSynth}
				 */
				this.carrier = new Tone.MonoSynth(options.carrier);
				this.carrier.volume.value = -10;

				/**
				 *  the second voice
				 *  @type {Tone.MonoSynth}
				 */
				this.modulator = new Tone.MonoSynth(options.modulator);
				this.modulator.volume.value = -10;

				/**
				 *  the frequency control
				 *  @type {Tone.Signal}
				 */
				this.frequency = new Tone.Signal(440, Tone.Signal.Units.Frequency);

				/**
				 *  the ratio between the two voices
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._harmonicity = new Tone.Multiply(options.harmonicity);

				/**
				 *  
				 *
				 *	@type {Tone.Multiply}
				 *	@private
				 */
				this._modulationIndex = new Tone.Multiply(options.modulationIndex);

				/**
				 *  the node where the modulation happens
				 *  @type {GainNode}
				 *  @private
				 */
				this._modulationNode = this.context.createGain();

				//control the two voices frequency
				this.frequency.connect(this.carrier.frequency);
				this.frequency.chain(this._harmonicity, this.modulator.frequency);
				this.frequency.chain(this._modulationIndex, this._modulationNode);
				this.modulator.connect(this._modulationNode.gain);
				this._modulationNode.gain.value = 0;
				this._modulationNode.connect(this.carrier.frequency);
				this.carrier.connect(this.output);
			};

			Tone.extend(Tone.FMSynth, Tone.Monophonic);

			/**
			 *  @static
			 *  @type {Object}
			 */
			Tone.FMSynth.defaults = {
				"harmonicity" : 3,
				"modulationIndex" : 10,
				"carrier" : {
					"volume" : -10,
					"portamento" : 0,
					"oscillator" : {
						"type" : "sine"
					},
					"envelope" : {
						"attack" : 0.01,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5
					},
					"filterEnvelope" : {
						"attack" : 0.01,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5,
						"min" : 20000,
						"max" : 20000
					}
				},
				"modulator" : {
					"volume" : -10,
					"portamento" : 0,
					"oscillator" : {
						"type" : "triangle"
					},
					"envelope" : {
						"attack" : 0.01,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5
					},
					"filterEnvelope" : {
						"attack" : 0.01,
						"decay" : 0.0,
						"sustain" : 1,
						"release" : 0.5,
						"min" : 20000,
						"max" : 20000
					}
				}
			};

			/**
			 *  trigger the attack portion of the note
			 *  
			 *  @param  {Tone.Time} [time=now] the time the note will occur
			 *  @param {number} [velocity=1] the velocity of the note
			 *  @returns {Tone.FMSynth} `this`
			 */
			Tone.FMSynth.prototype.triggerEnvelopeAttack = function(time, velocity){
				//the port glide
				time = this.toSeconds(time);
				//the envelopes
				this.carrier.envelope.triggerAttack(time, velocity);
				this.modulator.envelope.triggerAttack(time);
				this.carrier.filterEnvelope.triggerAttack(time);
				this.modulator.filterEnvelope.triggerAttack(time);
				return this;
			};

			/**
			 *  trigger the release portion of the note
			 *  
			 *  @param  {Tone.Time} [time=now] the time the note will release
			 *  @returns {Tone.FMSynth} `this`
			 */
			Tone.FMSynth.prototype.triggerEnvelopeRelease = function(time){
				this.carrier.triggerRelease(time);
				this.modulator.triggerRelease(time);
				return this;
			};

			/**
			 * The ratio between the two carrier and the modulator. 
			 * @memberOf Tone.FMSynth#
			 * @type {number}
			 * @name harmonicity
			 */
			Object.defineProperty(Tone.FMSynth.prototype, "harmonicity", {
				get : function(){
					return this._harmonicity.value;
				},
				set : function(harm){
					this._harmonicity.value = harm;
				}
			});

			/**
			 * The modulation index which is in essence the depth or amount of the modulation. In other terms it is the 
			 *  ratio of the frequency of the modulating signal (mf) to the amplitude of the 
			 *  modulating signal (ma) -- as in ma/mf. 
			 * @memberOf Tone.FMSynth#
			 * @type {number}
			 * @name modulationIndex
			 */
			Object.defineProperty(Tone.FMSynth.prototype, "modulationIndex", {
				get : function(){
					return this._modulationIndex.value;
				},
				set : function(mod){
					this._modulationIndex.value = mod;
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.FMSynth} `this`
			 */
			Tone.FMSynth.prototype.dispose = function(){
				Tone.Monophonic.prototype.dispose.call(this);
				this.carrier.dispose();
				this.carrier = null;
				this.modulator.dispose();
				this.modulator = null;
				this.frequency.dispose();
				this.frequency = null;
				this._modulationIndex.dispose();
				this._modulationIndex = null;
				this._harmonicity.dispose();
				this._harmonicity = null;
				this._modulationNode.disconnect();
				this._modulationNode = null;
				return this;
			};

			return Tone.FMSynth;
		});
		ToneModule( function(Tone){

			
			
			/**
			 *  @class  Audio file player with start, loop, stop.
			 *  
			 *  @constructor
			 *  @extends {Tone.Source} 
			 *  @param {string|AudioBuffer} url Either the AudioBuffer or the url from
			 *                                  which to load the AudioBuffer
			 *  @param {function=} onload The function to invoke when the buffer is loaded. 
			 *                            Recommended to use {@link Tone.Buffer#onload} instead.
			 *  @example
			 *  var player = new Tone.Player("./path/to/sample.mp3");
			 */
			Tone.Player = function(){
				
				var options = this.optionsObject(arguments, ["url", "onload"], Tone.Player.defaults);
				Tone.Source.call(this, options);

				/**
				 *  @private
				 *  @type {AudioBufferSourceNode}
				 */
				this._source = null;
				
				/**
				 *  the buffer
				 *  @private
				 *  @type {Tone.Buffer}
				 */
				this._buffer = new Tone.Buffer(options.url, options.onload.bind(null, this));

				/**
				 *  if the buffer should loop once it's over
				 *  @type {boolean}
				 *  @private
				 */
				this._loop = options.loop;

				/**
				 *  if 'loop' is true, the loop will start at this position
				 *  @type {Tone.Time}
				 *  @private
				 */
				this._loopStart = options.loopStart;

				/**
				 *  if 'loop' is true, the loop will end at this position
				 *  @type {Tone.Time}
				 *  @private
				 */
				this._loopEnd = options.loopEnd;

				/**
				 *  the playback rate
				 *  @private
				 *  @type {number}
				 */
				this._playbackRate = options.playbackRate;

				/**
				 *  Enabling retrigger will allow a player to be restarted
				 *  before the the previous 'start' is done playing.
				 *  @type {boolean}
				 */
				this.retrigger = options.retrigger;
			};

			Tone.extend(Tone.Player, Tone.Source);
			
			/**
			 *  the default parameters
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.Player.defaults = {
				"onload" : function(){},
				"playbackRate" : 1,
				"loop" : false,
				"loopStart" : 0,
				"loopEnd" : 0,
				"retrigger" : false,
			};

			/**
			 *  Load the audio file as an audio buffer.
			 *  Decodes the audio asynchronously and invokes
			 *  the callback once the audio buffer loads. 
			 *  Note: this does not need to be called, if a url
			 *  was passed in to the constructor. Only use this
			 *  if you want to manually load a new url. 
			 * @param {string} url The url of the buffer to load.
			 *                     filetype support depends on the
			 *                     browser.
			 *  @param  {function(Tone.Player)=} callback
			 *  @returns {Tone.Player} `this`
			 */
			Tone.Player.prototype.load = function(url, callback){
				this._buffer.load(url, callback.bind(this, this));
				return this;
			};

			/**
			 *  play the buffer between the desired positions
			 *  
			 *  @private
			 *  @param  {Tone.Time} [startTime=now] when the player should start.
			 *  @param  {Tone.Time} [offset=0] the offset from the beginning of the sample
			 *                                 to start at. 
			 *  @param  {Tone.Time=} duration how long the sample should play. If no duration
			 *                                is given, it will default to the full length 
			 *                                of the sample (minus any offset)
			 *  @returns {Tone.Player} `this`
			 */
			Tone.Player.prototype._start = function(startTime, offset, duration){
				if (this._buffer.loaded){
					//if it's a loop the default offset is the loopstart point
					if (this._loop){
						offset = this.defaultArg(offset, this._loopStart);
						offset = this.toSeconds(offset);
					} else {
						//otherwise the default offset is 0
						offset = this.defaultArg(offset, 0);
					}
					duration = this.defaultArg(duration, this._buffer.duration - offset);
					//the values in seconds
					startTime = this.toSeconds(startTime);
					duration = this.toSeconds(duration);
					//make the source
					this._source = this.context.createBufferSource();
					this._source.buffer = this._buffer.get();
					//set the looping properties
					if (this._loop){
						this._source.loop = this._loop;
						this._source.loopStart = this.toSeconds(this._loopStart);
						this._source.loopEnd = this.toSeconds(this._loopEnd);
					} else {
						this._nextStop = startTime + duration;
					}
					//and other properties
					this._source.playbackRate.value = this._playbackRate;
					this._source.onended = this.onended;
					this._source.connect(this.output);
					//start it
					this._source.start(startTime, offset, duration);
				} else {
					throw Error("tried to start Player before the buffer was loaded");
				}
				return this;
			};

			/**
			 *  Stop playback.
			 *  @private
			 *  @param  {Tone.Time} [time=now]
			 *  @returns {Tone.Player} `this`
			 */
			Tone.Player.prototype._stop = function(time){
				if (this._source){
					this._source.stop(this.toSeconds(time));
					this._source = null;
				}
				return this;
			};

			/**
			 *  Set the loop start and end. Will only loop if `loop` is 
			 *  set to `true`. 
			 *  @param {Tone.Time} loopStart The loop end time
			 *  @param {Tone.Time} loopEnd The loop end time
			 *  @returns {Tone.Player} `this`
			 *  @example
			 *  player.setLoopPoints(0.2, 0.3);
			 *  player.loop = true;
			 */
			Tone.Player.prototype.setLoopPoints = function(loopStart, loopEnd){
				this.loopStart = loopStart;
				this.loopEnd = loopEnd;
				return this;
			};

			/**
			 * If `loop` is true, the loop will start at this position. 
			 * @memberOf Tone.Player#
			 * @type {Tone.Time}
			 * @name loopStart
			 */
			Object.defineProperty(Tone.Player.prototype, "loopStart", {
				get : function(){
					return this._loopStart;
				}, 
				set : function(loopStart){
					this._loopStart = loopStart;
					if (this._source){
						this._source.loopStart = this.toSeconds(loopStart);
					}
				}
			});

			/**
			 * If `loop` is true, the loop will end at this position.
			 * @memberOf Tone.Player#
			 * @type {Tone.Time}
			 * @name loopEnd
			 */
			Object.defineProperty(Tone.Player.prototype, "loopEnd", {
				get : function(){
					return this._loopEnd;
				}, 
				set : function(loopEnd){
					this._loopEnd = loopEnd;
					if (this._source){
						this._source.loopEnd = this.toSeconds(loopEnd);
					}
				}
			});

			/**
			 * The audio buffer belonging to the player. 
			 * @memberOf Tone.Player#
			 * @type {AudioBuffer}
			 * @name buffer
			 */
			Object.defineProperty(Tone.Player.prototype, "buffer", {
				get : function(){
					return this._buffer;
				}, 
				set : function(buffer){
					this._buffer.set(buffer);
				}
			});

			/**
			 * If the buffer should loop once it's over. 
			 * @memberOf Tone.Player#
			 * @type {boolean}
			 * @name loop
			 */
			Object.defineProperty(Tone.Player.prototype, "loop", {
				get : function(){
					return this._loop;
				}, 
				set : function(loop){
					this._loop = loop;
					if (this._source){
						this._source.loop = loop;
					}
				}
			});

			/**
			 * The playback speed. 1 is normal speed. 
			 * Note that this is not a Tone.Signal because of a bug in Blink. 
			 * Please star this issue if this an important thing to you: 
			 * https://code.google.com/p/chromium/issues/detail?id=311284
			 * 
			 * @memberOf Tone.Player#
			 * @type {number}
			 * @name playbackRate
			 */
			Object.defineProperty(Tone.Player.prototype, "playbackRate", {
				get : function(){
					return this._playbackRate;
				}, 
				set : function(rate){
					this._playbackRate = rate;
					if (this._source) {
						this._source.playbackRate.value = rate;
					}
				}
			});

			/**
			 *  dispose and disconnect
			 *  @return {Tone.Player} `this`
			 */
			Tone.Player.prototype.dispose = function(){
				Tone.Source.prototype.dispose.call(this);
				if (this._source !== null){
					this._source.disconnect();
					this._source = null;
				}
				this._buffer.dispose();
				this._buffer = null;
				return this;
			};

			return Tone.Player;
		});

		ToneModule( 
		function(Tone){

			

			/**
			 *  @class A simple sampler instrument which plays an audio buffer 
			 *         through an amplitude envelope and a filter envelope. Nested
			 *         lists will be flattened.
			 *
			 *  @constructor
			 *  @extends {Tone.Instrument}
			 *  @param {Object|string} urls the urls of the audio file
			 *  @param {Object} options the options object for the synth
			 *  @example
			 *  var sampler = new Sampler({
			 *  	A : {
			 *  		1 : {"./audio/casio/A1.mp3",
			 *  		2 : "./audio/casio/A2.mp3",
			 *  	},
			 *  	"B.1" : "./audio/casio/B1.mp3",
			 *  });
			 *  //...once samples have loaded
			 *  sampler.triggerAttack("A.1", time, velocity);
			 */
			Tone.Sampler = function(urls, options){

				Tone.Instrument.call(this);
				options = this.defaultArg(options, Tone.Sampler.defaults);

				/**
				 *  the sample player
				 *  @type {Tone.Player}
				 */
				this.player = new Tone.Player(options.player);
				this.player.retrigger = true;

				/**
				 *  the buffers
				 *  @type {Object<Tone.Buffer>}
				 *  @private
				 */
				this._buffers = {};

				/**
				 *  The amplitude envelope. 
				 *  @type {Tone.Envelope}
				 */
				this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

				/**
				 *  The filter envelope. 
				 *  @type {Tone.Envelope}
				 */
				this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

				/**
				 *  The name of the current sample. 
				 *  @type {string}
				 */
				this._sample = options.sample;

				/**
				 * the private reference to the pitch
				 * @type {number}
				 * @private
				 */
				this._pitch = options.pitch;

				/**
				 *  The filter.
				 *  @type {BiquadFilterNode}
				 */
				this.filter = new Tone.Filter(options.filter);

				//connections / setup
				this._loadBuffers(urls);
				this.pitch = options.pitch;
				this.player.chain(this.filter, this.envelope, this.output);
				this.filterEnvelope.connect(this.filter.frequency);
			};

			Tone.extend(Tone.Sampler, Tone.Instrument);

			/**
			 *  the default parameters
			 *  @static
			 */
			Tone.Sampler.defaults = {
				"sample" : 0,
				"pitch" : 0,
				"player" : {
					"loop" : false,
				},
				"envelope" : {
					"attack" : 0.001,
					"decay" : 0,
					"sustain" : 1,
					"release" : 0.1
				},
				"filterEnvelope" : {
					"attack" : 0.001,
					"decay" : 0.001,
					"sustain" : 1,
					"release" : 0.5,
					"min" : 20,
					"max" : 20000,
					"exponent" : 2,
				},
				"filter" : {
					"type" : "lowpass"
				}
			};

			/**
			 *  load the buffers
			 *  @param   {Object} urls   the urls
			 *  @private
			 */
			Tone.Sampler.prototype._loadBuffers = function(urls){
				if (typeof urls === "string"){
					this._buffers["0"] = new Tone.Buffer(urls, function(){
						this.sample = "0";
					}.bind(this));
				} else {
					urls = this._flattenUrls(urls);
					for (var buffName in urls){
						this._sample = buffName;
						var urlString = urls[buffName];
						this._buffers[buffName] = new Tone.Buffer(urlString);
					}
				}
			};

			/**
			 *  flatten an object into a single depth object
			 *  https://gist.github.com/penguinboy/762197
			 *  @param   {Object} ob 	
			 *  @return  {Object}    
			 *  @private
			 */
			Tone.Sampler.prototype._flattenUrls = function(ob) {
				var toReturn = {};
				for (var i in ob) {
					if (!ob.hasOwnProperty(i)) continue;
					if ((typeof ob[i]) == "object") {
						var flatObject = this._flattenUrls(ob[i]);
						for (var x in flatObject) {
							if (!flatObject.hasOwnProperty(x)) continue;
							toReturn[i + "." + x] = flatObject[x];
						}
					} else {
						toReturn[i] = ob[i];
					}
				}
				return toReturn;
			};

			/**
			 *  start the sample.
			 *  @param {string=} sample the name of the samle to trigger, defaults to
			 *                          the last sample used
			 *  @param {Tone.Time} [time=now] the time when the note should start
			 *  @param {number} [velocity=1] the velocity of the note
			 *  @returns {Tone.Sampler} `this`
			 */
			Tone.Sampler.prototype.triggerAttack = function(name, time, velocity){
				time = this.toSeconds(time);
				if (name){
					this.sample = name;
				}
				this.player.start(time, 0);
				this.envelope.triggerAttack(time, velocity);
				this.filterEnvelope.triggerAttack(time);
				return this;
			};

			/**
			 *  start the release portion of the sample
			 *  
			 *  @param {Tone.Time} [time=now] the time when the note should release
			 *  @returns {Tone.Sampler} `this`
			 */
			Tone.Sampler.prototype.triggerRelease = function(time){
				time = this.toSeconds(time);
				this.filterEnvelope.triggerRelease(time);
				this.envelope.triggerRelease(time);
				this.player.stop(this.toSeconds(this.envelope.release) + time);
				return this;
			};

			/**
			 * The name of the sample to trigger.
			 * @memberOf Tone.Sampler#
			 * @type {number|string}
			 * @name sample
			 */
			Object.defineProperty(Tone.Sampler.prototype, "sample", {
				get : function(){
					return this._sample;
				},
				set : function(name){
					if (this._buffers.hasOwnProperty(name)){
						this._sample = name;
						this.player.buffer = this._buffers[name];
					} else {
						throw new Error("Sampler does not have a sample named "+name);
					}
				}
			});

			/**
			 * Repitch the sampled note by some interval (measured
			 * in semi-tones). 
			 * @memberOf Tone.Sampler#
			 * @type {number}
			 * @name pitch
			 * @example
			 * sampler.pitch = -12; //down one octave
			 * sampler.pitch = 7; //up a fifth
			 */
			Object.defineProperty(Tone.Sampler.prototype, "pitch", {
				get : function(){
					return this._pitch;
				},
				set : function(interval){
					this._pitch = interval;
					this.player.playbackRate = this.intervalToFrequencyRatio(interval);
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.Sampler} `this`
			 */
			Tone.Sampler.prototype.dispose = function(){
				Tone.Instrument.prototype.dispose.call(this);
				this.player.dispose();
				this.filterEnvelope.dispose();
				this.envelope.dispose();
				this.filter.dispose();
				this.player = null;
				this.filterEnvelope = null;
				this.envelope = null;
				this.filter = null;
				for (var sample in this._buffers){
					this._buffers[sample].dispose();
					this._buffers[sample] = null;
				}
				this._buffers = null;
				return this;
			};

			return Tone.Sampler;
		});

		ToneModule( 
		function(Tone){

			

			/**
			 *  @class Deprecated.
			 *
			 *  @constructor
			 *  @deprecated Use Tone.PolySynth with Tone.Sampler as the voice.
			 *  @extends {Tone.Instrument}
			 *  @param {Object} samples the samples used in this
			 *  @param {function} onload the callback to invoke when all 
			 *                           of the samples have been loaded
			 */
			Tone.MultiSampler = function(samples, onload){

				console.warn("Tone.MultiSampler is deprecated - use Tone.PolySynth with Tone.Sampler as the voice");
			 	Tone.Instrument.call(this);

			 	/**
			 	 *  the array of voices
			 	 *  @type {Tone.Sampler}
			 	 */
				this.samples = {};

				//make the samples
				this._createSamples(samples, onload);
			};

			Tone.extend(Tone.MultiSampler, Tone.Instrument);

			/**
			 *  creates all of the samples and tracks their loading
			 *  
			 *  @param   {Object} samples the samples
			 *  @param   {function} onload  the onload callback
			 *  @private
			 */
			Tone.MultiSampler.prototype._createSamples = function(samples, onload){
				//object which tracks the number of loaded samples
				var loadCounter = {
					total : 0,
					loaded : 0
				};
				//get the count
				for (var s in samples){ //jshint ignore:line
					loadCounter.total++;
				}
				//the function to invoke when a sample is loaded
				var onSampleLoad = function(){
					loadCounter.loaded++;
					if (loadCounter.loaded === loadCounter.total){
						if (onload){
							onload();
						}
					}
				};
				for (var samp in samples){
					var url = samples[samp];
					var sampler = new Tone.Sampler(url, onSampleLoad);
					sampler.connect(this.output);
					this.samples[samp] = sampler;
				}
			};

			/**
			 *  start a sample
			 *  
			 *  @param  {string} sample the note name to start
			 *  @param {Tone.Time} [time=now] the time when the note should start
			 *  @param {number} [velocity=1] the velocity of the note
			 */
			Tone.MultiSampler.prototype.triggerAttack = function(sample, time, velocity){
				if (this.samples.hasOwnProperty(sample)){
					this.samples[sample].triggerAttack(0, time, velocity);
				}
			};

			/**
			 *  start the release portion of the note
			 *  
			 *  @param  {string} sample the note name to release
			 *  @param {Tone.Time} [time=now] the time when the note should release
			 */
			Tone.MultiSampler.prototype.triggerRelease = function(sample, time){
				if (this.samples.hasOwnProperty(sample)){
					this.samples[sample].triggerRelease(time);
				}
			};

			/**
			  *  start the release portion of the note
			  *  
			  *  @param  {string} sample the note name to release
			  *  @param {Tone.Time} duration the duration of the note
			  *  @param {Tone.Time} [time=now] the time when the note should start
			  *  @param {number} [velocity=1] the velocity of the note
			  */
			Tone.MultiSampler.prototype.triggerAttackRelease = function(sample, duration, time, velocity){
				if (this.samples.hasOwnProperty(sample)){
					time = this.toSeconds(time);
					duration = this.toSeconds(duration);
					var samp = this.samples[sample];
					samp.triggerAttack(0, time, velocity);
					samp.triggerRelease(time + duration);
				}
			};

			/**
			 *  sets all the samplers with these settings
			 *  @param {object} params the parameters to be applied 
			 *                         to all internal samplers
			 */
			Tone.MultiSampler.prototype.set = function(params){
				for (var samp in this.samples){
					this.samples[samp].set(params);
				}
			};

			/**
			 *  clean up
			 */
			Tone.MultiSampler.prototype.dispose = function(){
				Tone.Instrument.prototype.dispose.call(this);
				for (var samp in this.samples){
					this.samples[samp].dispose();
					this.samples[samp] = null;
				}
				this.samples = null;
			};

			return Tone.MultiSampler;
		});

		ToneModule( function(Tone){

			

			/**
			 *  @class  Noise generator. 
			 *          Uses looped noise buffers to save on performance. 
			 *
			 *  @constructor
			 *  @extends {Tone.Source}
			 *  @param {string} type the noise type (white|pink|brown)
			 *  @example
			 *  var noise = new Tone.Noise("pink");
			 */
			Tone.Noise = function(){

				var options = this.optionsObject(arguments, ["type"], Tone.Noise.defaults);
				Tone.Source.call(this, options);

				/**
				 *  @private
				 *  @type {AudioBufferSourceNode}
				 */
				this._source = null;
				
				/**
				 *  the buffer
				 *  @private
				 *  @type {AudioBuffer}
				 */
				this._buffer = null;

				this.type = options.type;
			};

			Tone.extend(Tone.Noise, Tone.Source);

			/**
			 *  the default parameters
			 *
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.Noise.defaults = {
				"type" : "white",
			};

			/**
			 * The type of the noise. Can be "white", "brown", or "pink". 
			 * @memberOf Tone.Noise#
			 * @type {string}
			 * @name type
			 * @example
			 * noise.type = "white";
			 */
			Object.defineProperty(Tone.Noise.prototype, "type", {
				get : function(){
					if (this._buffer === _whiteNoise){
						return "white";
					} else if (this._buffer === _brownNoise){
						return "brown";
					} else if (this._buffer === _pinkNoise){
						return "pink";
					}
				}, 
				set : function(type){
					if (this.type !== type){
						switch (type){
							case "white" : 
								this._buffer = _whiteNoise;
								break;
							case "pink" : 
								this._buffer = _pinkNoise;
								break;
							case "brown" : 
								this._buffer = _brownNoise;
								break;
							default : 
								this._buffer = _whiteNoise;
						}
						//if it's playing, stop and restart it
						if (this.state === Tone.Source.State.STARTED){
							var now = this.now() + this.bufferTime;
							//remove the listener
							this._source.onended = undefined;
							this._stop(now);
							this._start(now);
						}
					}
				}
			});

			/**
			 *  internal start method
			 *  
			 *  @param {Tone.Time} time
			 *  @private
			 */
			Tone.Noise.prototype._start = function(time){		
				this._source = this.context.createBufferSource();
				this._source.buffer = this._buffer;
				this._source.loop = true;
				this.connectSeries(this._source, this.output);
				this._source.start(this.toSeconds(time));
				this._source.onended = this.onended;
			};

			/**
			 *  internal stop method
			 *  
			 *  @param {Tone.Time} time
			 *  @private
			 */
			Tone.Noise.prototype._stop = function(time){
				if (this._source){
					this._source.stop(this.toSeconds(time));
				}
			};

			/**
			 *  dispose all the components
			 *  @returns {Tone.Noise} `this`
			 */
			Tone.Noise.prototype.dispose = function(){
				Tone.Source.prototype.dispose.call(this);
				if (this._source !== null){
					this._source.disconnect();
					this._source = null;
				}
				this._buffer = null;
				return this;
			};


			///////////////////////////////////////////////////////////////////////////
			// THE BUFFERS
			// borred heavily from http://noisehack.com/generate-noise-web-audio-api/
			///////////////////////////////////////////////////////////////////////////

			/**
			 *	static noise buffers
			 *  
			 *  @static
			 *  @private
			 *  @type {AudioBuffer}
			 */
			var _pinkNoise = null, _brownNoise = null, _whiteNoise = null;

			Tone._initAudioContext(function(audioContext){

				var sampleRate = audioContext.sampleRate;
				
				//four seconds per buffer
				var bufferLength = sampleRate * 4;

				//fill the buffers
				_pinkNoise = (function() {
					var buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
					for (var channelNum = 0; channelNum < buffer.numberOfChannels; channelNum++){
						var channel = buffer.getChannelData(channelNum);
						var b0, b1, b2, b3, b4, b5, b6;
						b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
						for (var i = 0; i < bufferLength; i++) {
							var white = Math.random() * 2 - 1;
							b0 = 0.99886 * b0 + white * 0.0555179;
							b1 = 0.99332 * b1 + white * 0.0750759;
							b2 = 0.96900 * b2 + white * 0.1538520;
							b3 = 0.86650 * b3 + white * 0.3104856;
							b4 = 0.55000 * b4 + white * 0.5329522;
							b5 = -0.7616 * b5 - white * 0.0168980;
							channel[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
							channel[i] *= 0.11; // (roughly) compensate for gain
							b6 = white * 0.115926;
						}
					}
					return buffer;
				}());

				_brownNoise = (function() {
					var buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
					for (var channelNum = 0; channelNum < buffer.numberOfChannels; channelNum++){
						var channel = buffer.getChannelData(channelNum);
						var lastOut = 0.0;
						for (var i = 0; i < bufferLength; i++) {
							var white = Math.random() * 2 - 1;
							channel[i] = (lastOut + (0.02 * white)) / 1.02;
							lastOut = channel[i];
							channel[i] *= 3.5; // (roughly) compensate for gain
						}
					}
					return buffer;
				})();

				_whiteNoise = (function(){
					var buffer = audioContext.createBuffer(2, bufferLength, sampleRate);
					for (var channelNum = 0; channelNum < buffer.numberOfChannels; channelNum++){
						var channel = buffer.getChannelData(channelNum);
						for (var i = 0; i < bufferLength; i++){
							channel[i] =  Math.random() * 2 - 1;
						}
					}
					return buffer;
				}());
			});

			return Tone.Noise;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  the NoiseSynth is a single oscillator, monophonic synthesizer
			 *          with a filter, and two envelopes (on the filter and the amplitude)
			 *
			 *  @constructor
			 *  @extends {Tone.Instrument}
			 *  @param {Object} options the options available for the synth 
			 *                          see defaults below
			 * @example
			 * var noiseSynth = new Tone.NoiseSynth();
			 */
			Tone.NoiseSynth = function(options){

				//get the defaults
				options = this.defaultArg(options, Tone.NoiseSynth.defaults);
				Tone.Instrument.call(this);

				/**
				 *  The noise source. Set the type by setting
				 *  `noiseSynth.noise.type`. 
				 *  @type {Tone.Noise}
				 */
				this.noise = new Tone.Noise();

				/**
				 *  The filter .
				 *  @type {Tone.Filter}
				 */
				this.filter = new Tone.Filter(options.filter);

				/**
				 *  The filter envelope. 
				 *  @type {Tone.Envelope}
				 */
				this.filterEnvelope = new Tone.ScaledEnvelope(options.filterEnvelope);

				/**
				 *  The amplitude envelope. 
				 *  @type {Tone.Envelope}
				 */
				this.envelope = new Tone.AmplitudeEnvelope(options.envelope);

				//connect the noise to the output
				this.noise.chain(this.filter, this.envelope, this.output);
				//start the noise
				this.noise.start();
				//connect the filter envelope
				this.filterEnvelope.connect(this.filter.frequency);
			};

			Tone.extend(Tone.NoiseSynth, Tone.Instrument);

			/**
			 *  @const
			 *  @static
			 *  @type {Object}
			 */
			Tone.NoiseSynth.defaults = {
				"noise" : {
					"type" : "white"
				},
				"filter" : {
					"Q" : 6,
					"type" : "highpass",
					"rolloff" : -24
				},
				"envelope" : {
					"attack" : 0.005,
					"decay" : 0.1,
					"sustain" : 0.0,
				},
				"filterEnvelope" : {
					"attack" : 0.06,
					"decay" : 0.2,
					"sustain" : 0,
					"release" : 2,
					"min" : 20,
					"max" : 4000,
					"exponent" : 2
				}
			};

			/**
			 *  start the attack portion of the envelope
			 *  @param {Tone.Time} [time=now] the time the attack should start
			 *  @param {number} [velocity=1] the velocity of the note (0-1)
			 *  @returns {Tone.NoiseSynth} `this`
			 */
			Tone.NoiseSynth.prototype.triggerAttack = function(time, velocity){
				//the envelopes
				this.envelope.triggerAttack(time, velocity);
				this.filterEnvelope.triggerAttack(time);	
				return this;	
			};

			/**
			 *  start the release portion of the envelope
			 *  @param {Tone.Time} [time=now] the time the release should start
			 *  @returns {Tone.NoiseSynth} `this`
			 */
			Tone.NoiseSynth.prototype.triggerRelease = function(time){
				this.envelope.triggerRelease(time);
				this.filterEnvelope.triggerRelease(time);
				return this;
			};

			/**
			 *  trigger the attack and then the release
			 *  @param  {Tone.Time} duration the duration of the note
			 *  @param  {Tone.Time} [time=now]     the time of the attack
			 *  @param  {number} [velocity=1] the velocity
			 *  @returns {Tone.NoiseSynth} `this`
			 */
			Tone.NoiseSynth.prototype.triggerAttackRelease = function(duration, time, velocity){
				time = this.toSeconds(time);
				duration = this.toSeconds(duration);
				this.triggerAttack(time, velocity);
				console.log(time + duration);
				this.triggerRelease(time + duration);
				return this;
			};

			/**
			 *  clean up
			 *  @returns {Tone.NoiseSynth} `this`
			 */
			Tone.NoiseSynth.prototype.dispose = function(){
				Tone.Instrument.prototype.dispose.call(this);
				this.noise.dispose();
				this.noise = null;
				this.envelope.dispose();
				this.envelope = null;
				this.filterEnvelope.dispose();
				this.filterEnvelope = null;
				this.filter.dispose();
				this.filter = null;
				return this;
			};

			return Tone.NoiseSynth;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Karplus-String string synthesis. 
			 *  
			 *  @constructor
			 *  @extends {Tone.Instrument}
			 *  @param {Object} options see the defaults
			 *  @example
			 *  var plucky = new Tone.PluckSynth();
			 */
			Tone.PluckSynth = function(options){

				options = this.defaultArg(options, Tone.PluckSynth.defaults);
				Tone.Instrument.call(this);

				/**
				 *  @type {Tone.Noise}
				 *  @private
				 */
				this._noise = new Tone.Noise("pink");

				/**
				 *  The amount of noise at the attack. 
				 *  Nominal range of [0.1, 20]
				 *  @type {number}
				 */
				this.attackNoise = 1;

				/**
				 *  the LFCF
				 *  @type {Tone.LowpassCombFilter}
				 *  @private
				 */
				this._lfcf = new Tone.LowpassCombFilter(1 / 440);

				/**
				 *  the resonance control
				 *  @type {Tone.Signal}
				 */
				this.resonance = this._lfcf.resonance;

				/**
				 *  the dampening control. i.e. the lowpass filter frequency of the comb filter
				 *  @type {Tone.Signal}
				 */
				this.dampening = this._lfcf.dampening;

				//connections
				this._noise.connect(this._lfcf);
				this._lfcf.connect(this.output);
			};

			Tone.extend(Tone.PluckSynth, Tone.Instrument);

			/**
			 *  @static
			 *  @const
			 *  @type {Object}
			 */
			Tone.PluckSynth.defaults = {
				"attackNoise" : 1,
				"dampening" : 4000,
				"resonance" : 0.5
			};

			/**
			 *  trigger the attack portion
			 *  @param {string|number} note the note name or frequency
			 *  @param {Tone.Time} [time=now] the time of the note
			 *  @returns {Tone.PluckSynth} `this`
			 */
			Tone.PluckSynth.prototype.triggerAttack = function(note, time) {
				note = this.toFrequency(note);
				time = this.toSeconds(time);
				var delayAmount = 1 / note;
				this._lfcf.setDelayTimeAtTime(delayAmount, time);		
				this._noise.start(time);
				this._noise.stop(time + delayAmount * this.attackNoise);
				return this;
			};

			/**
			 *  clean up
			 *  @returns {Tone.PluckSynth} `this`
			 */
			Tone.PluckSynth.prototype.dispose = function(){
				Tone.Instrument.prototype.dispose.call(this);
				this._noise.dispose();
				this._lfcf.dispose();
				this._noise = null;
				this._lfcf = null;
				this.dampening = null;
				this.resonance = null;
				return this;
			};

			return Tone.PluckSynth;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class  Creates a polyphonic synthesizer out of 
			 *          the monophonic voice which is passed in. 
			 *
			 *  @constructor
			 *  @extends {Tone.Instrument}
			 *  @param {number|Object} [polyphony=4] the number of voices to create
			 *  @param {function} [voice=Tone.MonoSynth] the constructor of the voices
			 *                                            uses Tone.MonoSynth by default
			 *  @example
			 *  //a polysynth composed of 6 Voices of MonoSynth
			 *  var synth = new Tone.PolySynth(6, Tone.MonoSynth);
			 *  //set a MonoSynth preset
			 *  synth.setPreset("Pianoetta");
			 */
			Tone.PolySynth = function(){

				Tone.Instrument.call(this);

				var options = this.optionsObject(arguments, ["polyphony", "voice"], Tone.PolySynth.defaults);

				/**
				 *  the array of voices
				 *  @type {Array}
				 */
				this.voices = new Array(options.polyphony);

				/**
				 *  the queue of free voices
				 *  @private
				 *  @type {Array}
				 */
				this._freeVoices = [];

				/**
				 *  keeps track of which notes are down
				 *  @private
				 *  @type {Object}
				 */
				this._activeVoices = {};

				//create the voices
				for (var i = 0; i < options.polyphony; i++){
					var v = new options.voice(arguments[2], arguments[3]);
					this.voices[i] = v;
					v.connect(this.output);
				}

				//make a copy of the voices
				this._freeVoices = this.voices.slice(0);
				//get the prototypes and properties
			};

			Tone.extend(Tone.PolySynth, Tone.Instrument);

			/**
			 *  the defaults
			 *  @const
			 *  @static
			 *  @type {Object}
			 */
			Tone.PolySynth.defaults = {
				"polyphony" : 4,
				"voice" : Tone.MonoSynth
			};

			/**
			 * Pull properties from the 
			 */

			/**
			 *  trigger the attack
			 *  @param  {string|number|Object|Array} value the value of the note(s) to start.
			 *                                             if the value is an array, it will iterate
			 *                                             over the array to play each of the notes
			 *  @param  {Tone.Time} [time=now]  the start time of the note
			 *  @param {number} [velocity=1] the velocity of the note
			 *  @returns {Tone.PolySynth} `this`
			 */
			Tone.PolySynth.prototype.triggerAttack = function(value, time, velocity){
				if (!Array.isArray(value)){
					value = [value];
				}
				for (var i = 0; i < value.length; i++){
					var val = value[i];
					var stringified = JSON.stringify(val);
					if (this._activeVoices[stringified]){
						this._activeVoices[stringified].triggerAttack(val, time, velocity);
					} else if (this._freeVoices.length > 0){
						var voice = this._freeVoices.shift();
						voice.triggerAttack(val, time, velocity);
						this._activeVoices[stringified] = voice;
					}
				}
				return this;
			};

			/**
			 *  trigger the attack and release after the specified duration
			 *  
			 *  @param  {string|number|Object|Array} value the note(s).
			 *                                             if the value is an array, it will iterate
			 *                                             over the array to play each of the notes
			 *  @param  {Tone.Time} duration the duration of the note
			 *  @param  {Tone.Time} [time=now]     if no time is given, defaults to now
			 *  @param  {number} [velocity=1] the velocity of the attack (0-1)
			 *  @returns {Tone.PolySynth} `this`
			 */
			Tone.PolySynth.prototype.triggerAttackRelease = function(value, duration, time, velocity){
				time = this.toSeconds(time);
				this.triggerAttack(value, time, velocity);
				this.triggerRelease(value, time + this.toSeconds(duration));
				return this;
			};

			/**
			 *  trigger the release of a note
			 *  @param  {string|number|Object|Array} value the value of the note(s) to release.
			 *                                             if the value is an array, it will iterate
			 *                                             over the array to play each of the notes
			 *  @param  {Tone.Time} [time=now]  the release time of the note
			 *  @returns {Tone.PolySynth} `this`
			 */
			Tone.PolySynth.prototype.triggerRelease = function(value, time){
				if (!Array.isArray(value)){
					value = [value];
				}
				for (var i = 0; i < value.length; i++){
					//get the voice
					var stringified = JSON.stringify(value[i]);
					var voice = this._activeVoices[stringified];
					if (voice){
						voice.triggerRelease(time);
						this._freeVoices.push(voice);
						this._activeVoices[stringified] = null;
					}
				}
				return this;
			};

			/**
			 *  set the options on all of the voices
			 *  @param {Object} params 
			 *  @returns {Tone.PolySynth} `this`
			 */
			Tone.PolySynth.prototype.set = function(params){
				for (var i = 0; i < this.voices.length; i++){
					this.voices[i].set(params);
				}
				return this;
			};

			/**
			 *  get a group of parameters
			 *  @param {Array=} params the parameters to get, otherwise will return 
			 *  					   all available.
			 */
			Tone.PolySynth.prototype.get = function(params){
				return this.voices[0].get(params);
			};

			/**
			 *  @param {string} presetName the preset name
			 *  @returns {Tone.PolySynth} `this`
			 */
			Tone.PolySynth.prototype.setPreset = function(presetName){
				for (var i = 0; i < this.voices.length; i++){
					this.voices[i].setPreset(presetName);
				}
				return this;
			};

			/**
			 *  clean up
			 *  @returns {Tone.PolySynth} `this`
			 */
			Tone.PolySynth.prototype.dispose = function(){
				Tone.Instrument.prototype.dispose.call(this);
				for (var i = 0; i < this.voices.length; i++){
					this.voices[i].dispose();
					this.voices[i] = null;
				}
				this.voices = null;
				this._activeVoices = null;
				this._freeVoices = null;
				return this;
			};

			return Tone.PolySynth;
		});
		ToneModule( function(Tone){

			

			/**
			 * 	@class  Clip the incoming signal so that the output is always between min and max
			 * 	
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @param {number} min the minimum value of the outgoing signal
			 *  @param {number} max the maximum value of the outgoing signal
			 *  @example
			 *  var clip = new Tone.Clip(0.5, 1);
			 *  var osc = new Tone.Oscillator().connect(clip);
			 *  //clips the output of the oscillator to between 0.5 and 1.
			 */
			Tone.Clip = function(min, max){
				//make sure the args are in the right order
				if (min > max){
					var tmp = min;
					min = max;
					max = tmp;
				}
				
				/**
				 *  The min clip value
				 *  @type {Tone.Signal}
				 */
				this.min = this.input = new Tone.Min(max);

				/**
				 *  The max clip value
				 *  @type {Tone.Signal}
				 */
				this.max = this.output = new Tone.Max(min);

				this.min.connect(this.max);
			};

			Tone.extend(Tone.Clip, Tone.SignalBase);

			/**
			 *  clean up
			 *  @returns {Tone.Clip} `this`
			 */
			Tone.Clip.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this.min.dispose();
				this.min = null;
				this.max.dispose();
				this.max = null;
				return this;
			};

			return Tone.Clip;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  this is the maximum value that the divide can handle	
			 *  @type {number}
			 *  @const
			 */
			var MAX_VALUE = Math.pow(2, 13);

			/**
			 *  @private
			 *  @static
			 *  @type {Array}
			 */
			var guessCurve = new Array(MAX_VALUE);
			//set the value
			for (var i = 0; i < guessCurve.length; i++){
				var normalized = (i / (guessCurve.length - 1)) * 2 - 1;
				if (normalized === 0){
					guessCurve[i] = 0;
				} else {
					guessCurve[i] = 1 / (normalized * MAX_VALUE);
				}
			}

			/**
			 *  @class Compute the inverse of the input.
			 *         Uses this approximation algorithm: 
			 *         http://en.wikipedia.org/wiki/Multiplicative_inverse#Algorithms
			 *
			 *  @deprecated
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @param {number} [precision=3] the precision of the calculation
			 */
			Tone.Inverse = function(precision){

				console.warn("Tone.Inverse has been deprecated. Multiply is always more efficient than dividing.");

				Tone.call(this);

				precision = this.defaultArg(precision, 3);

				/**
				 *  a constant generator of the value 2
				 *  @private
				 *  @type {Tone.Signal}
				 */
				this._two = new Tone.Signal(2);

				/**
				 *  starting guess is 0.1 times the input
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._guessMult = new Tone.Multiply(1/MAX_VALUE);

				/**
				 *  produces a starting guess based on the input
				 *  @type {WaveShaperNode}
				 *  @private
				 */
				this._guess = new Tone.WaveShaper(guessCurve);
				this.input.chain(this._guessMult, this._guess);

				/**
				 *  the array of inverse helpers
				 *  @type {Array}
				 *  @private
				 */
				this._inverses = new Array(precision);

				//create the helpers
				for (var i = 0; i < precision; i++){
					var guess;
					if (i === 0){
						guess = this._guess;
					} else {
						guess = this._inverses[i-1];
					}
					var inv = new InverseHelper(guess, this._two);
					this.input.connect(inv);
					this._inverses[i] = inv;
				}
				this._inverses[precision-1].connect(this.output);
			};

			Tone.extend(Tone.Inverse, Tone.SignalBase);

			/**
			 *  clean up
			 *  @returns {Tone.Inverse} `this`
			 */
			Tone.Inverse.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				for (var i = 0; i < this._inverses.length; i++){
					this._inverses[i].dispose();
					this._inverses[i] = null;
				}
				this._inverses = null;
				this._two.dispose();
				this._two = null;
				this._guessMult.dispose();
				this._guessMult = null;
				this._guess.disconnect();
				this._guess = null;
				return this;
			};

			// BEGIN INVERSE HELPER ///////////////////////////////////////////////////

			/**
			 *  internal helper function for computing the inverse of a signal
			 *  @extends {Tone}
			 *  @constructor
			 *  @private
			 */
			var InverseHelper = function(guess, two){
				this._outerMultiply = new Tone.Multiply();
				this._innerMultiply = new Tone.Multiply();
				this._subtract = new Tone.Subtract();
				//connections
				guess.connect(this._innerMultiply, 0, 1);
				two.connect(this._subtract, 0, 0);
				this._innerMultiply.connect(this._subtract, 0, 1);
				this._subtract.connect(this._outerMultiply, 0, 1);
				guess.connect(this._outerMultiply, 0, 0);
				this.output = this._outerMultiply;
				this.input = this._innerMultiply;
			};

			Tone.extend(InverseHelper);

			InverseHelper.prototype.dispose = function(){
				this._outerMultiply.dispose();
				this._outerMultiply = null;
				this._innerMultiply.dispose();
				this._innerMultiply = null;
				this._subtract.dispose();
				this._subtract = null;
			};
			
			// END INVERSE HELPER /////////////////////////////////////////////////////

			return Tone.Inverse;
		});
		ToneModule( 
		function(Tone){

			

			/**
			 *  @class Divide by a value or signal. 
			 *         input 0: numerator. input 1: divisor. 
			 *
			 *  @deprecated
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @param {number=} divisor if no value is provided, Tone.Divide will divide the first
			 *                         and second inputs. 
			 *  @param {number} [precision=3] the precision of the calculation
			 */
			Tone.Divide = function(divisor, precision){

				console.warn("Tone.Divide has been deprecated. If possible, it's much more efficient to multiply by the inverse value.");

				Tone.call(this, 2, 0);

				/**
				 *  the denominator value
				 *  @type {Tone.Signal}
				 *  @private
				 */
				this._denominator = null;

				/**
				 *  the inverse
				 *  @type {Tone}
				 *  @private
				 */
				this._inverse = new Tone.Inverse(precision);

				/**
				 *  multiply input 0 by the inverse
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._mult = new Tone.Multiply();

				if (isFinite(divisor)){
					this._denominator = new Tone.Signal(divisor);
					this._denominator.connect(this._inverse);
				}
				this.input[1] = this._inverse;
				this._inverse.connect(this._mult, 0, 1);
				this.input[0] = this.output = this._mult.input[0];
			};

			Tone.extend(Tone.Divide, Tone.SignalBase);

			/**
			 * The value being divided from the incoming signal. Note, that
			 * if Divide was constructed without a divisor, it expects
			 * that the signals to numberator will be connected to input 0 and 
			 * the denominator to input 1 and therefore will throw an error when 
			 * trying to set/get the value. 
			 * 
			 * @memberOf Tone.Divide#
			 * @type {number}
			 * @name value
			 */
			Object.defineProperty(Tone.Divide.prototype, "value", {
				get : function(){
					if (this._denominator !== null){
						return this._denominator.value;
					} else {
						throw new Error("cannot switch from signal to number");
					}
				},
				set : function(value){
					if (this._denominator !== null){
						this._denominator.value = value;
					} else {
						throw new Error("cannot switch from signal to number");
					}
				}
			});

			/**
			 *  clean up
			 *  @returns {Tone.Divide} `this`
			 */
			Tone.Divide.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				if (this._denominator){
					this._denominator.dispose();
					this._denominator = null;
				}
				this._inverse.dispose();
				this._inverse = null;
				this._mult.dispose();
				this._mult = null;
				return this;
			};

			return Tone.Divide;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Normalize takes an input min and max and maps it linearly to [0,1]
			 *
			 *  @extends {Tone.SignalBase}
			 *  @constructor
			 *  @example
			 *  var norm = new Tone.Normalize(2, 4);
			 *  var sig = new Tone.Signal(3).connect(norm);
			 *  //output of norm is 0.5. 
			 */
			Tone.Normalize = function(inputMin, inputMax){

				/**
				 *  the min input value
				 *  @type {number}
				 *  @private
				 */
				this._inputMin = this.defaultArg(inputMin, 0);

				/**
				 *  the max input value
				 *  @type {number}
				 *  @private
				 */
				this._inputMax = this.defaultArg(inputMax, 1);

				/**
				 *  subtract the min from the input
				 *  @type {Tone.Add}
				 *  @private
				 */
				this._sub = this.input = new Tone.Add(0);

				/**
				 *  divide by the difference between the input and output
				 *  @type {Tone.Multiply}
				 *  @private
				 */
				this._div = this.output = new Tone.Multiply(1);

				this._sub.connect(this._div);
				this._setRange();
			};

			Tone.extend(Tone.Normalize, Tone.SignalBase);

			/**
			 * The minimum value the input signal will reach.
			 * @memberOf Tone.Normalize#
			 * @type {number}
			 * @name min
			 */
			Object.defineProperty(Tone.Normalize.prototype, "min", {
				get : function(){
					return this._inputMin;
				},
				set : function(min){
					this._inputMin = min;
					this._setRange();
				}
			});

			/**
			 * The maximum value the input signal will reach.
			 * @memberOf Tone.Normalize#
			 * @type {number}
			 * @name max
			 */
			Object.defineProperty(Tone.Normalize.prototype, "max", {
				get : function(){
					return this._inputMax;
				},
				set : function(max){
					this._inputMax = max;
					this._setRange();
				}
			});

			/**
			 *  set the values
			 *  @private
			 */
			Tone.Normalize.prototype._setRange = function() {
				this._sub.value = -this._inputMin;
				this._div.value = 1 / (this._inputMax - this._inputMin);
			};

			/**
			 *  clean up
			 *  @returns {Tone.Normalize} `this`
			 */
			Tone.Normalize.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this._sub.dispose();
				this._sub = null;
				this._div.dispose();
				this._div = null;
				return this;
			};

			return Tone.Normalize;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class Route a single input to the specified output
			 *
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @param {number} [outputCount=2] the number of inputs the switch accepts
			 *  @example
			 *  var route = new Tone.Route(4);
			 *  var signal = new Tone.Signal(3).connect(route);
			 *  route.gate.value = 0;
			 *  //signal is routed through output 0
			 *  route.gate.value = 3;
			 *  //signal is now routed through output 3
			 */
			Tone.Route = function(outputCount){

				outputCount = this.defaultArg(outputCount, 2);
				Tone.call(this, 1, outputCount);

				/**
				 *  the control signal
				 *  @type {Tone.Signal}
				 */
				this.gate = new Tone.Signal(0);

				//make all the inputs and connect them
				for (var i = 0; i < outputCount; i++){
					var routeGate = new RouteGate(i);
					this.output[i] = routeGate;
					this.gate.connect(routeGate.selecter);
					this.input.connect(routeGate);
				}
			};

			Tone.extend(Tone.Route, Tone.SignalBase);

			/**
			 *  routes the signal to one of the outputs and close the others
			 *  @param {number} [which=0] open one of the gates (closes the other)
			 *  @param {Tone.Time} time the time when the switch will open
			 *  @returns {Tone.Route} `this`
			 */
			Tone.Route.prototype.select = function(which, time){
				//make sure it's an integer
				which = Math.floor(which);
				this.gate.setValueAtTime(which, this.toSeconds(time));
				return this;
			};

			/**
			 *  dispose method
			 *  @returns {Tone.Route} `this`
			 */
			Tone.Route.prototype.dispose = function(){
				this.gate.dispose();
				for (var i = 0; i < this.output.length; i++){
					this.output[i].dispose();
					this.output[i] = null;
				}
				Tone.prototype.dispose.call(this);
				this.gate = null;
				return this;
			}; 

			////////////START HELPER////////////

			/**
			 *  helper class for Tone.Route representing a single gate
			 *  @constructor
			 *  @extends {Tone}
			 *  @private
			 */
			var RouteGate = function(num){

				/**
				 *  the selector
				 *  @type {Tone.Equal}
				 */
				this.selecter = new Tone.Equal(num);

				/**
				 *  the gate
				 *  @type {GainNode}
				 */
				this.gate = this.input = this.output = this.context.createGain();

				//connect the selecter to the gate gain
				this.selecter.connect(this.gate.gain);
			};

			Tone.extend(RouteGate);

			/**
			 *  clean up
			 *  @private
			 */
			RouteGate.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this.selecter.dispose();
				this.gate.disconnect();
				this.selecter = null;
				this.gate = null;
			};

			////////////END HELPER////////////

			//return Tone.Route
			return Tone.Route;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  When the gate is set to 0, the input signal does not pass through to the output. 
			 *          If the gate is set to 1, the input signal passes through.
			 *          the gate is initially closed.
			 *
			 *  @constructor
			 *  @extends {Tone.SignalBase}
			 *  @example
			 *  var sigSwitch = new Tone.Switch();
			 *  var signal = new Tone.Signal(2).connect(sigSwitch);
			 *  //initially no output from sigSwitch
			 *  sigSwitch.gate.value = 1;
			 *  //open the switch and allow the signal through
			 *  //the output of sigSwitch is now 2. 
			 */
			Tone.Switch = function(){
				Tone.call(this);

				/**
				 *  the control signal for the switch
				 *  when this value is 0, the input signal will not pass through,
				 *  when it is high (1), the input signal will pass through.
				 *  
				 *  @type {Tone.Signal}
				 */
				this.gate = new Tone.Signal(0);

				/**
				 *  thresh the control signal to either 0 or 1
				 *  @type {Tone.GreaterThan}
				 *  @private
				 */
				this._thresh = new Tone.GreaterThan(0.5);

				this.input.connect(this.output);
				this.gate.chain(this._thresh, this.output.gain);
			};

			Tone.extend(Tone.Switch, Tone.SignalBase);

			/**
			 *  open the switch at a specific time
			 *
			 *  @param {Tone.Time=} time the time when the switch will be open
			 *  @returns {Tone.Switch} `this`
			 *  @example
			 *  //open the switch to let the signal through
			 *  sigSwitch.open();
			 */
			Tone.Switch.prototype.open = function(time){
				this.gate.setValueAtTime(1, this.toSeconds(time));
				return this;
			}; 

			/**
			 *  close the switch at a specific time
			 *
			 *  @param {Tone.Time} time the time when the switch will be open
			 *  @returns {Tone.Switch} `this`
			 *  @example
			 *  //close the switch a half second from now
			 *  sigSwitch.close("+0.5");
			 */
			Tone.Switch.prototype.close = function(time){
				this.gate.setValueAtTime(0, this.toSeconds(time));
				return this;
			}; 

			/**
			 *  clean up
			 *  @returns {Tone.Switch} `this`
			 */
			Tone.Switch.prototype.dispose = function(){
				Tone.prototype.dispose.call(this);
				this.gate.dispose();
				this._thresh.dispose();
				this.gate = null;
				this._thresh = null;
				return this;
			}; 

			return Tone.Switch;
		});
		ToneModule( function(Tone){

			

			/**
			 *  @class  WebRTC Microphone. 
			 *          CHROME ONLY (for now) because of the 
			 *          use of the MediaStreamAudioSourceNode
			 *
			 *  @constructor
			 *  @extends {Tone.Source}
			 *  @param {number=} inputNum 
			 */
			Tone.Microphone = function(inputNum){
				Tone.Source.call(this);

				/**
				 *  @type {MediaStreamAudioSourceNode}
				 *  @private
				 */
				this._mediaStream = null;
				
				/**
				 *  @type {LocalMediaStream}
				 *  @private
				 */
				this._stream = null;
				
				/**
				 *  @type {Object}
				 *  @private
				 */
				this._constraints = {"audio" : true};

				//get the option
				var self = this;
				MediaStreamTrack.getSources(function (media_sources) {
					if (inputNum < media_sources.length){
						self.constraints.audio = {
							optional : [{ sourceId: media_sources[inputNum].id}]
						};
					}
				});		
			};

			Tone.extend(Tone.Microphone, Tone.Source);

			/**
			 *  start the stream. 
			 *  @private
			 */
			Tone.Microphone.prototype._start = function(){
				navigator.getUserMedia(this._constraints, 
					this._onStream.bind(this), this._onStreamError.bind(this));
			};

			/**
			 *  stop the stream. 
			 *  @private
			 */
			Tone.Microphone.prototype._stop = function(){
				this._stream.stop();
				return this;
			};

			/**
			 *  called when the stream is successfully setup
			 *  @param   {LocalMediaStream} stream 
			 *  @private
			 */
			Tone.Microphone.prototype._onStream = function(stream) {
				this._stream = stream;
				// Wrap a MediaStreamSourceNode around the live input stream.
				this._mediaStream = this.context.createMediaStreamSource(stream);
				this._mediaStream.connect(this.output);
			};

			/**
			 *  called on error
			 *  @param   {Error} e 
			 *  @private
			 */
			Tone.Microphone.prototype._onStreamError = function(e) {
				console.error(e);
			};

			/**
			 *  clean up
			 *  @return {Tone.Microphone} `this`
			 */
			Tone.Microphone.prototype.dispose = function() {
				Tone.Source.prototype.dispose.call(this);
				if (this._mediaStream){
					this._mediaStream.disconnect();
					this._mediaStream = null;
				}
				this._stream = null;
				this._constraints = null;
				return this;
			};

			//polyfill
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || 
				navigator.mozGetUserMedia || navigator.msGetUserMedia;

			return Tone.Microphone;
		});

		//requirejs compatibility
		if ( true ) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return Tone;
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else {
			root.Tone = Tone;
		}
	} (this));

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// shim for using process in browser

	var process = module.exports = {};

	process.nextTick = (function () {
	    var canSetImmediate = typeof window !== 'undefined'
	    && window.setImmediate;
	    var canMutationObserver = typeof window !== 'undefined'
	    && window.MutationObserver;
	    var canPost = typeof window !== 'undefined'
	    && window.postMessage && window.addEventListener
	    ;

	    if (canSetImmediate) {
	        return function (f) { return window.setImmediate(f) };
	    }

	    var queue = [];

	    if (canMutationObserver) {
	        var hiddenDiv = document.createElement("div");
	        var observer = new MutationObserver(function () {
	            var queueList = queue.slice();
	            queue.length = 0;
	            queueList.forEach(function (fn) {
	                fn();
	            });
	        });

	        observer.observe(hiddenDiv, { attributes: true });

	        return function nextTick(fn) {
	            if (!queue.length) {
	                hiddenDiv.setAttribute('yes', 'no');
	            }
	            queue.push(fn);
	        };
	    }

	    if (canPost) {
	        window.addEventListener('message', function (ev) {
	            var source = ev.source;
	            if ((source === window || source === null) && ev.data === 'process-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);

	        return function nextTick(fn) {
	            queue.push(fn);
	            window.postMessage('process-tick', '*');
	        };
	    }

	    return function nextTick(fn) {
	        setTimeout(fn, 0);
	    };
	})();

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};


/***/ }
/******/ ])