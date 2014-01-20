Ember.ComputedSmartProperty v0.1
=================

Removes the need to declare what property keys your Computed Property depends on.

**Note: This is still very experimental. I have not yet tested and accounted for situations where you get or alter a property without using `this.get('key')`. Arrays in particular are probably not handled correctly yet. You've been warned.**

##Usage
Usage is the same as a regular Ember.ComputedProperty except you don't provide the dependent keys as arguments.

```javascript
App.PersonController = Ember.ObjectController.extend({
    firstName: 'Bilbo',
    lastName: 'Baggins',

    fullName: function () {
    	var firstName = this.get('firstName'),
    		lastName = this.get('lastName');
    		
    	return firstName + ' ' + lastName;
    }.smartProperty()
});
```
Since the property is "smart", it will figure out what properties you use, when you use them, then watch and update things as normal.

##EXTEND_PROTOTYPES = false
If you've told Ember not to extend the native prototypes, this library will honor that as well.

In that case, you can use it similiar to normal computed properties:

```javascript
App.PersonController = Ember.ObjectController.extend({
    firstName: 'Bilbo',
    lastName: 'Baggins',

    fullName: Ember.computed.smartProperty(function () {
    	var firstName = this.get('firstName'),
    		lastName = this.get('lastName');
    		
    	return firstName + ' ' + lastName;
    })
});
```

## Ember.OVERRIDE_PROPERTY = true
If you want to exclusively use SmartProperties, you can tell it to override the Function.prototype.property method.

```javascript
// Load ember.js first

Ember.OVERRIDE_PROPERTY = true;

// Now load ember.computedsmartproperty.js
```

Now you can just use it as `.property()`:

```javascript
App.PersonController = Ember.ObjectController.extend({
    firstName: 'Bilbo',
    lastName: 'Baggins',

    fullName: function () {
    	var firstName = this.get('firstName'),
    		lastName = this.get('lastName');
    		
    	return firstName + ' ' + lastName;
    }.property()
});
```

##Contributing/Issues
Forks, pull requests and issue tickets are encouraged.

##License
MIT Licensed
