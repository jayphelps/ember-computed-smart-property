Ember.ComputedSmartProperty v0.2.1
=================

Removes the need to declare what property keys your Computed Property depends on.

**Note: This is still very experimental. I have not yet tested and accounted for every situation where you get or alter a property. You've been warned.**

##Usage
**Unlike most libraries, you must include `ember.computed-smart-property.js` BEFORE you include `ember.js`**!

Usage is the same as a regular Ember.ComputedProperty except you don't provide the dependent keys as arguments.

```javascript
var Person = Ember.Object.extend({
    firstName: null,
    lastName: null,
    friends: null,

    fullName: function () {
        var firstName = this.get('firstName'),
            lastName = this.get('lastName');

        return firstName + ' ' + lastName;
    }.smartProperty(),

    femaleFriendsWhoLikeChinese: function () {
        return this.get('friends').filter(function (friend) {
            var isFemale = (friend.get('gender') === 'female'),
                likesChinese = (friend.get('likes') === 'chinese');
                
            return isFemale && likesChinese;
        });
    }.smartProperty()
});

var bilbo = Person.create({
    firstName: 'Bilbo',
    lastName: 'Baggins',
    friends: [
        Ember.Object.create({ gender: 'female', likes: 'chinese' })
    ]
});

bilbo.get('fullName');
// "Bilbo Baggins"

bilbo.get('femaleFriendsWhoLikeChinese.length');
// 1

bilbo.get('friends').pushObject(Ember.Object.create({ gender: 'female', likes: 'chinese' }));

bilbo.get('femaleFriendsWhoLikeChinese.length');
// 2
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
