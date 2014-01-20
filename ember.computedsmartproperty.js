/**
 * Ember.ComputedSmartProperty 0.1
 * (c) 2014 Jay Phelps
 * MIT Licensed
 * https://github.com/jayphelps/ember.computedsmartproperty
 * @license
 */
(function (Ember) {
    var get = Ember.get,
        set = Ember.set,
        addObserver = Ember.addObserver,
        removeObserver = Ember.removeObserver,
        ComputedProperty = Ember.ComputedProperty,
        ComputedSmartPropertyPrototype;

    function ComputedSmartProperty(func, opts) {
        var cp = this,
            dependentKeys = Ember.A([]),
            originalGet;

        function wrappedFunc() {
            var ret, originalGet = this.get;
            
            // Hook .get so we can know what keys the
            // function depends on
            this.get = getAndAddAsDependentKey;
            ret = func.apply(this, arguments);

            cp.property.apply(cp, dependentKeys);

            // Since we've computed once, subsequent
            // calls can use func directly
            cp.func = func;
            // Put .get back to where it was
            this.get = originalGet;

            // Release memory references
            dependentKeys = null;
            cp = null;
            getAndAddAsDependentKey = null;

            return ret;
        };

        function getAndAddAsDependentKey(key) {
            if (dependentKeys.indexOf(key) === -1) {
                dependentKeys.push(key);
            }

            // Put get back to original so if this
            // property also calls get, we don't add it
            // as a dependent of this property
            this.get = originalGet;

            // Get the actual value
            var ret = get(this, key);

            // Back to the way it was
            this.get = getAndAddAsDependentKey;

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

})(window.Ember);