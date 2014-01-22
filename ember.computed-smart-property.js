/**
 * Ember.ComputedSmartProperty 0.2.1
 * (c) 2014 Jay Phelps
 * MIT Licensed
 * https://github.com/jayphelps/ember.computedsmartproperty
 * @license
 */

(function () {
    window.Ember = window.Ember || {};
    Ember.config = Ember.config || {};
    Ember.ENV = Ember.ENV || {};
    var globalGet, nativeGet, objectAtHook;

    function getHook(obj, keyName) {
        return globalGet(obj, keyName);
    }

    Ember.config.overrideAccessors = function () {
        if (Ember.get === getHook) return;
        globalGet = nativeGet = Ember.get;
        Ember.get = getHook;
    };

    Ember.ENV.EMBER_LOAD_HOOKS = {
        'Ember.Application': [function () {
            setup();
        }]
    };

    function setup() {
        var originalNativeArray = Ember.NativeArray,
            ArrayPrototype = Array.prototype,
            hookedArrayMethods = {};

        function hookIterator(callback, thisArg) {
            return this._super(function (value, idx, arr) {
                if (objectAtHook) {
                    objectAtHook(arr, idx, value);
                }
                return callback.apply(this, arguments);
            }, thisArg);
        }

        'forEach every some filter find findIndex map reduce reduceRight'.split(' ').forEach(function (key) {
            if (ArrayPrototype.hasOwnProperty(key)) {
                hookedArrayMethods[key] = hookIterator;
            }
        });

        Ember.NativeArray = Ember.Mixin.create(originalNativeArray, hookedArrayMethods, {
            objectAt: function (idx) {
                var ret =  this._super(idx);

                if (objectAtHook) {
                    objectAtHook(this, idx, ret);
                }

                return ret;
            }
        });

        Ember.NativeArray.activate = function () {
            Ember.NativeArray.apply(Array.prototype);
            Ember.A = function (arr) { return arr || []; };
        };

        if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Array) {
            Ember.NativeArray.activate();
        }

        var ComputedProperty = Ember.ComputedProperty,
            ComputedSmartPropertyPrototype;

        function ComputedSmartProperty(func, opts) {
            var cp = this,
                dependentKeys = Ember.A([]),
                originalGet, rootContext;

            var stack = [];

            function wrappedFunc() {
                var ret;
                originalGet = globalGet;
                rootContext = this;
                
                // Hook .get so we can know what keys the
                // function depends on
                globalGet = getAndAddAsDependentKey;
                objectAtHook = addArrayEachDependentKey;

                ret = func.apply(this, arguments);

                // Call the method Ember uses to actually watch the
                // dependentKeys keys so we don't have to
                cp.property.apply(cp, dependentKeys);

                // Since we've computed once, subsequent
                // calls can use func directly
                cp.func = func;
                // Put .get back to where it was
                globalGet = originalGet;

                // Release memory references
                dependentKeys = null;
                cp = null;
                getAndAddAsDependentKey = null;
                objectAtHook = null;

                stack.length = 0;
                return ret;
            }

            function addArrayEachDependentKey(arr, idx, value) {
                stackIndex = stack.indexOf(arr);
                if (stackIndex !== -1) {
                    stack.push(value, stack[stackIndex + 1] + '.@each');
                }
            }

            function getAndAddAsDependentKey(context, key) {
                var fullPath = key, stackIndex;

                if (context !== rootContext) {
                    stackIndex = stack.indexOf(context);
                    if (stackIndex !== -1) {
                        // Since there's no built in mapping ability for 
                        // object => string relationships, we're using
                        // the convention that the key will always
                        // be offset by +1
                        fullPath = stack[stackIndex + 1] + '.' + key;
                    }
                }

                if (dependentKeys.indexOf(fullPath) === -1) {
                    dependentKeys.push(fullPath);
                }

                // Put get back to original so if this
                // property also calls get, we don't add it
                // as a dependent of this property
                globalGet = originalGet;

                // Get the actual value
                var ret = nativeGet(context, key);

                // Back to the way it was
                globalGet = getAndAddAsDependentKey;

                stack.push(ret, fullPath);

                return ret;
            }

            ComputedProperty.call(this, wrappedFunc, opts);
        }

        ComputedSmartPropertyPrototype = ComputedSmartProperty.prototype = new ComputedProperty();
        ComputedSmartPropertyPrototype.constructor = ComputedSmartProperty;
        
        Ember.ComputedSmartProperty = ComputedSmartProperty;

        if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Function) {
            Function.prototype[(Ember.OVERRIDE_PROPERTY === true) ? 'property' : 'smartProperty'] = function () {
                return new ComputedSmartProperty(this);
            };
        }

        Ember.computed.smartProperty = function (func) {
            if (typeof func !== 'function') {
                throw new Ember.Error('Computed Smart Property declared without a property function');
            }

            return new ComputedSmartProperty(func);
        };
    }

})();
