/**
 *  Library with useful methods applied to DOM elements (host objects) or built-in JavaScript objects.
 *  Methods naming may look slightly strange but it be better than unexpected name collisions.
 *  Main goal of library at the current stage is not to implement it in a real project, but testing approaches, browser features, generate new ideas.
 *
 *  @author zhibirc
 *  @license
 */
(function () {
    'use strict';

    var domElemProto = Element.prototype,
		objProto = Object.prototype,
		arrProto = Array.prototype,
		strProto = String.prototype,
		fnProto = Function.prototype,
        errors = {
            hide: 'Argument incorrect! Allowed 0 and 1 only.',
            remove: 'Argument incorrect! Allowed "chain" and "save" (without flag is equivalent) only.'
        };
		
	function isUndef(n) {
		return typeof n === 'undefined';
	}

    /**
     * Method <_remove_> for DOM elements. Remove particular element and additionally accepts two various behaviours.
     * Flag "save" (or without flag at all) means that removed element returns.
     * Flag "chain" means that the parent element returns to build methods chains.
     *
     * @author zhibirc
     * @param {String} aim - Must be "save", "chain".
     * @returns {Object}
     */
    domElemProto._remove_ = function (aim) {
        var parent;
		
        if (aim === 'save') {
            return this.parentNode.removeChild(this);
        } else if (aim === 'chain') {
            parent = this.parentNode;
            parent.removeChild(this);
            return parent;
        } else {
            throw new SyntaxError(errors.remove);
        }
    };

    /**
     * Method <_hide_> for DOM elements. Accepts two various behaviours depend on flag. All flags must be numbers.
     * Flag 0 instructs to hide element by change its opacity.
     * Flag 1 instructs to hide element by change its display to "none".
     *
     * @author zhibirc
     * @param {Number} level - Must be 0 or 1.
     * @returns {Object}
     */
    domElemProto._hide_ = function (level) {
        switch (level)  {
            case 0:
                this.style.visibility = 'hidden';
                break;
            case 1:
                this.style.display = 'none';
                break;
            default:
                throw new SyntaxError(errors.hide);
        }
        return this;
    };

    /**
     * Implement <last> method for collections of DOM elements.
     *
     * @author zhibirc
     * @returns {Object}
     */
    NodeList.prototype._last_ = HTMLCollection.prototype._last_ = function () {
        return this[this.length - 1];
    };

    /** Function that fixes a case when TextNode returns instead of HTML element (in FF at least). */
    function getFirstChild(elem) {
        var firstChild = elem.firstChild;

        while (firstChild && firstChild.nodeType !== 1) {
            firstChild = firstChild.nextSibling;
        }

        return firstChild;
    }

    /** Useful for loops. Finally invoke 'console.store.s;'. */
    if (typeof console !== 'undefined' && Object.isExtensible(console)) {
        console.store = console.store || {};
        console.store.basket = console.store.basket || '';
        console.store.__defineSetter__('s', function (msg) {
            return this.basket +=
                /* optionally: (new Date).getTime() + */ msg + ';\n';
        });
        console.store.__defineGetter__('s', function () {
            console.log(this.basket);
        });
    }

    /**
     * Adding outline borders to each element on the page.
     *
     * @author Addi Osmani
     */
    (function (a) {
        [].forEach.call(
            document.querySelectorAll(a),
            function (b) {
                b.style.outline = '1px solid #' + (~~(Math.random() * (1 << 24))).toString(16)
            }
        )
    })('*');

    /**
     * Multiply string N-times - first edition.
     *
     * @author zhibirc
     */
    strProto['*'] = function (multiplier) {
        for (var i = multiplier, str = ''; i--; str += this);
		
        return str;
    };

    /**
     * Multiply string N-times - second edition.
     *
     * @author zhibirc
     */
    strProto['*'] = function (multiplier) {
        return Array(++multiplier).join(this);
    };

    /**
     * Implement well known and standard behaviour of constants in ES5.
     *
     * @author zhibirc
     */
    var CONST = (function () {
        var constStore = Object.create(null);

        return function (name, value) {
            if (typeof value === 'undefined') {
                return constStore[name];
            } else {
                Object.defineProperty(constStore, name, {
                    value: value
                });
                return 0;
            }
        }
    }());

    /**
     * Complex event installer on DOM elements.
     *
     * @author zhibirc
     */
    function addHandler(elem, actions) {
        var errors = ['Wrong invocation! Properly syntax: addHandler(element, { event_0: callback_0, ..., event_N: callback_N})'],
			evt;
			
		function isValid(n) {
			// TODO: implement validation.
		}
		
        if (arguments.length !== 2 || ![1, 9, window].some(function (_) { return _ === elem.nodeType || _ === window; }) || !isValid(actions)) {
            if (typeof console !== 'undefined' && typeof console.warn === 'function') {
                console.warn(errors[0]);
            }
            return 0;
        }
		
		for (evt in actions) {
			if (objProto.hasOwnProperty.call(actions, evt)) {
				if (elem.addEventListener) {
					elem.addEventListener(evt, actions[evt], false);
				} else if (elem.attachEvent) {
					elem.attachEvent('on' + evt, function () { actions[evt].call(elem); });
				} else {
					elem['on' + evt] = actions[evt];
				}
			}
		}
        
    }

    /**
     * PHP function number_format in JS.
     *
     * @author zhibirc
     */
    function numberFormat(value, decimal, delim, thousands_sep) {
        'use strict';
        if (typeof value !== 'number' || !isFinite(value)) {
            throw new TypeError('Parameter "value" must be a real Number!');
        }
        var resultValue = value,
            delimiter = delim || '.',
            digitParts = [],
            intPart = '';

        decimal && (resultValue = resultValue.toFixed(decimal));
        resultValue = parseInt(resultValue, 10) + delimiter + String(resultValue).split(/\W+/)[1];
        if (thousands_sep) {
            digitParts = resultValue.split(delimiter);
            intPart = digitParts[0].replace(new RegExp("^(\\d{1,intPart.length - 3})(?=\\d{3})", 'g'), "$1" + thousands_sep);
            resultValue = intPart + delimiter + digitParts[1];
        }
        return resultValue;
    }

    /**
     * Extend jQuery-prototype ($.fn) with method serializeToJSON().
     *
     * @author zhibirc
     */
    $.fn.extend({
        serializeToJSON: function () {
            return '"{' + $(this).serialize()
                    .split('&')
                    .map(function (elem) {
                        return elem.split('=');
                    })
                    .map(function (elem) {
                        return elem.map(function (elem, idx, array) {
                            var __elem;
                            elem = elem.replace(/(%[\da-f]+)/ig, function (group_0) {
                                return decodeURIComponent(group_0);
                            });
                            idx && (__elem = +elem);
                            return isFinite(__elem) ? elem : '"' + elem + '"';
                        });
                    })
                    .map(function (elem) {
                        return elem.join(':')
                    })
                    .join(',') + '}"';
        }
    });

    /**
     * Extend DOM Element prototype to implement functionality of eventListenerList (proposal function which has been removed from the spec draft).
     */
    (function () {
        Element.prototype.eventListenerList = {};
        Element.prototype._addEventListener = Element.prototype.addEventListener;
        Element.prototype.addEventListener = function (a, b, c) {
            this._addEventListener(a, b, c);
            if (!this.eventListenerList[a]) this.eventListenerList[a] = [];
            this.eventListenerList[a].push(b);
        };
    })();

    /**
     * Returns an array of longest words.
     *
     * @author zhibirc
     * @todo Add the functionality to determine the level of 'longest'.
     */
    function getLongestWord(str) {
        'use strict';
        var normalize = str.split(/[^-a-zа-я\d]/i),
            max_len = Math.max.apply(Math, normalize.map(function (elem) {
                return elem.length;
            }));
        return str.match(RegExp('[а-я]{' + max_len + '}', 'ig'));
    }
	
	/**
	 * Add arbitrary amount of elements (or elements from an array) to the end of current array.
	 */
	arrProto['<<'] = function () {
		var args, elems, i, l;
		
		if (!arguments.length) {
			return this;
		}
		
		args = arrProto.slice.call(arguments);
		
		elems = args.length === 1 && Array.isArray(args[0]) ? args[0] : args; 
		
		for (i = 0, l = elems.length; i < l; i += 1) {
			this.push(elems[i]);
		}
		
		return this; // Suitable for chaining purposes.
	};
}());