/*globals Global:true */

module('.smartProperty() ');

test('it should detect dependencies', function() {

  var Person = Ember.Object.extend({
    fullname: function() {
      return [this.get('firstname'), this.get('lastname')].join(' ');
    }.smartProperty()
  });

  var ada = Person.create({
    firstname: 'Augusta',
    lastname: 'Byron'
  });

  equal(ada.get('fullname'), 'Augusta Byron');
  ada.set('firstname', 'Ada');
  equal(ada.get('fullname'), 'Ada Byron');
  ada.set('lastname', 'Lovelace');
  equal(ada.get('fullname'), 'Ada Lovelace');
});

test('it should detect computed properties on subsequent evals', function() {

  var Hero = Ember.Object.extend({
    fullname: function() {
      if (this.get('superMode')) {
        return [this.get('superFirstName'), this.get('superLastName')].join(' ');
      }
      return [this.get('firstname'), this.get('lastname')].join(' ');
    }.smartProperty()
  });

  var spiderman = Hero.create({
    firstname: 'Peter',
    lastname: 'Parker',
    superMode: false,
    superFirstName: 'Spider',
    superLastName: 'Man'
  });

  equal(spiderman.get('fullname'), 'Peter Parker');
  spiderman.set('superMode', true);
  equal(spiderman.get('fullname'), 'Spider Man');
  spiderman.set('superLastName', 'Woman');
  equal(spiderman.get('fullname'), 'Spider Woman');
});



test('it should detect new dependencies', function() {

  var Hero = Ember.Object.extend({
    fullname: function() {
      if (this.get('superMode')) {
        return [this.get('superFirstName'), this.get('superLastName')].join(' ');
      }
      return [this.get('firstname'), this.get('lastname')].join(' ');
    }.smartProperty()
  });

  var spiderman = Hero.create({
    firstname: 'Peter',
    lastname: 'Parker',
    superMode: false,
    superFirstName: 'Spider',
    superLastName: 'Man'
  });

  equal(spiderman.get('fullname'), 'Peter Parker');
  spiderman.set('superMode', true);
  equal(spiderman.get('fullname'), 'Spider Man');
});


test('it should detect nested dependencies', function() {

  var TestObject = Ember.Object.extend({
    nested: function() {
      var obj = this.get('someObject');
      return obj.get('foo');
    }.smartProperty()
  });

  var obj = TestObject.create({
    someObject: Ember.Object.create({
      foo: 0
    })
  });

  equal(obj.get('nested'), 0);
  obj.set('someObject.foo', 1);
  equal(obj.get('nested'), 1);
  var someObject = obj.get('someObject');
  someObject.set('foo', 2);

  equal(obj.get('nested'), 2);
});


test('it should detect nested dependencies', function() {

  var TestObject = Ember.Object.extend({
    nested: function() {
      var obj = this.get('someObject');
      return Ember.get(obj, 'foo');
    }.smartProperty()
  });

  var obj = TestObject.create({
    someObject: {
      foo: 0
    }
  });

  equal(obj.get('nested'), 0);
  obj.set('someObject.foo', 1);
  equal(obj.get('nested'), 1);
  var someObject = obj.get('someObject');
  Ember.set(someObject, 'foo', 2);

  equal(obj.get('nested'), 2);
});


test('it should detect understand paths', function() {

  var TestObject = Ember.Object.extend({
    nested: function() {
      return this.get('someObject.foo');
    }.smartProperty()
  });

  var obj = TestObject.create({
    someObject: {
      foo: 0
    }
  });

  equal(obj.get('nested'), 0);
  obj.set('someObject.foo', 1);
  equal(obj.get('nested'), 1);
  var someObject = obj.get('someObject');
  Ember.set(someObject, 'foo', 2);
  equal(obj.get('nested'), 2);
});


test('it should work with arrays', function() {

  var TestObject = Ember.Object.extend({
    arrayLast: function() {
      return this.get('someArray').get('lastObject');
    }.smartProperty()
  });

  var obj = TestObject.create({
    someArray: [1]
  });

  equal(obj.get('arrayLast'), 1);
  obj.get('someArray').pushObject(2);
  equal(obj.get('arrayLast'), 2);
});


test('it should work with arrays properties', function() {

  var TestObject = Ember.Object.extend({
    lastFoo: function() {
      return Ember.get(this.get('someArray'), 'lastObject.foo');
    }.smartProperty()
  });

  var obj = TestObject.create({
    someArray: [{foo: 'asdf'}]
  });

  equal(obj.get('lastFoo'), 'asdf');
  obj.set('someArray.lastObject.foo', 'rawr');
  equal(obj.get('lastFoo'), 'rawr');
});


test('it should work with arrays of objects', function() {

  var TestObject = Ember.Object.extend({
    lastFoo: function() {
      return Ember.get(this.get('someArray').get('lastObject'), 'foo');
    }.smartProperty()
  });

  var obj = TestObject.create({
    someArray: [{foo: 'asdf'}]
  });

  equal(obj.get('lastFoo'), 'asdf');
  obj.set('someArray.lastObject.foo', 'rawr');
  equal(obj.get('lastFoo'), 'rawr');
});


test('it should setup dependencies when Array#sortBy is called', function() {

  var TestObject = Ember.Object.extend({
    sortedArray: function() {
      return this.get('someArray').sortBy('foo');
    }.smartProperty()
  });

  var obj = TestObject.create({
    someArray: Ember.A([{foo: 'zyx'}, {foo: 'asdf'}, {foo: 'rawr'}])
  });

  equal(obj.get('sortedArray.firstObject.foo'), 'asdf');
  obj.get('someArray').pushObject({foo: 'abba'});
  equal(obj.get('sortedArray.firstObject.foo'), 'abba');
  obj.set('sortedArray.firstObject.foo', 'zyx');
  equal(obj.get('sortedArray.firstObject.foo'), 'asdf');
});

module('Array helper dependency detection');

test('Array#any', function() {
  var Astronomer = Ember.Object.extend({
    seenVariableStar: function() {
      return this.get('starData').any(function(star) {
        return Ember.get(star, 'variable');
      });
    }.smartProperty()
  });
  var henriettaSwanLeavitt = Astronomer.create({
    starData: Ember.A([
      {name: 'Acamar', variable: false}
    ])
  });

  equal(henriettaSwanLeavitt.get('seenVariableStar'), false);
  henriettaSwanLeavitt.get('starData').pushObject({name: 'V335', variable: true});
  equal(henriettaSwanLeavitt.get('seenVariableStar'), true);
});


test('Array#compact', function() {
  var Astronomer = Ember.Object.extend({
    compactedStarData: function() {
      return this.get('starData').compact();
    }.smartProperty()
  });
  var henriettaSwanLeavitt = Astronomer.create({
    starData: Ember.A([
      null,
      {name: 'Acamar', variable: false}
    ])
  });

  equal(henriettaSwanLeavitt.get('compactedStarData.length'), 1);
  henriettaSwanLeavitt.get('starData').pushObject({name: 'V335', variable: true});
  henriettaSwanLeavitt.get('starData').pushObject(undefined);
  equal(henriettaSwanLeavitt.get('compactedStarData.length'), 2);
});

test('Array#contains', function() {
  var Astronomer = Ember.Object.extend({
    hasSeenDeneb: function() {
      return this.get('starData').contains('Deneb');
    }.smartProperty()
  });
  var henriettaSwanLeavitt = Astronomer.create({
    starData: Ember.A([
      'R And',
      'Acamar',
      'Enif',
      'Maia',
      'Regulus',
      'Vega'
    ])
  });

  equal(henriettaSwanLeavitt.get('hasSeenDeneb'), false);
  henriettaSwanLeavitt.get('starData').pushObjects(['Deneb', 'Haedus']);
  equal(henriettaSwanLeavitt.get('hasSeenDeneb'), true);
});

test('Array#every', function() {
  var Astronomer = Ember.Object.extend({
    allVariableStar: function() {
      return this.get('starData').every(function(star) {
        return Ember.get(star, 'variable');
      });
    }.smartProperty()
  });
  var henriettaSwanLeavitt = Astronomer.create({
    starData: Ember.A([
      {name: 'V335', variable: true}
    ])
  });

  equal(henriettaSwanLeavitt.get('allVariableStar'), true);
  henriettaSwanLeavitt.get('starData').pushObject({name: 'Acamar', variable: false});
  equal(henriettaSwanLeavitt.get('allVariableStar'), false);
});

test('Array#filter', function() {

  var Hamster = Ember.Object.extend({
    remainingChores: function() {
      return this.get('chores').filter(function(chore) {
        return Ember.get(chore, 'done') === false;
      });
    }.smartProperty()
  });

  var hamster = Hamster.create({chores: [
    {name: 'cook', done: true},
    {name: 'clean', done: true},
    {name: 'write more unit tests', done: false}
  ]});
  equal(hamster.get('remainingChores.length'), 1);
  hamster.set('remainingChores.firstObject.done', true);
  equal(hamster.get('remainingChores.length'), 0);
});

test('Array#filterBy', function() {

  var Hamster = Ember.Object.extend({
    remainingChores: function() {
      return this.get('chores').filterBy('done', false);
    }.smartProperty()
  });

  var hamster = Hamster.create({chores: [
    {name: 'cook', done: true},
    {name: 'clean', done: true},
    {name: 'write more unit tests', done: false}
  ]});
  equal(hamster.get('remainingChores.length'), 1);
  hamster.set('remainingChores.firstObject.done', true);
  equal(hamster.get('remainingChores.length'), 0);
});

test('Array#find', function() {

  var Hamster = Ember.Object.extend({
    nextChore: function() {
      return this.get('chores').find(function(chore) {
        return Ember.get(chore, 'done') === false;
      });
    }.smartProperty()
  });

  var hamster = Hamster.create({chores: [
    {name: 'cook', done: true},
    {name: 'clean', done: true},
    {name: 'write more unit tests', done: false}
  ]});
  equal(hamster.get('nextChore.name'), 'write more unit tests');
  hamster.set('chores.lastObject.done', true);
  equal(hamster.get('nextChore'), null);
});

test('Array#findBy', function() {

  var Hamster = Ember.Object.extend({
    nextChore: function() {
      return this.get('chores').findBy('done', false);
    }.smartProperty()
  });

  var hamster = Hamster.create({chores: [
    {name: 'cook', done: true},
    {name: 'clean', done: true},
    {name: 'write more unit tests', done: false}
  ]});
  equal(hamster.get('nextChore.name'), 'write more unit tests');
  hamster.set('chores.lastObject.done', true);
  equal(hamster.get('nextChore'), null);
});

test('Array#isAny', function() {
  var Hamster = Ember.Object.extend({
    hasStartedChores: function() {
      return this.get('chores').isAny('done');
    }.smartProperty()
  });

  var hamster = Hamster.create({chores: [
    {name: 'cook', done: false},
    {name: 'clean', done: false},
    {name: 'write more unit tests', done: false}
  ]});

  equal(hamster.get('hasStartedChores'), false);
  hamster.set('chores.lastObject.done', true);
  equal(hamster.get('hasStartedChores'), true);
});


test('Array#isEvery', function() {
  var Hamster = Ember.Object.extend({
    choresComplete: function() {
      return this.get('chores').isEvery('done');
    }.smartProperty()
  });

  var hamster = Hamster.create({chores: [
    {name: 'cook', done: true},
    {name: 'clean', done: true},
    {name: 'write more unit tests', done: false}
  ]});

  equal(hamster.get('choresComplete'), false);
  hamster.set('chores.lastObject.done', true);
  equal(hamster.get('choresComplete'), true);
});


test('Array#map', function() {
  var Person = Ember.Object.extend({
    childAges: function() {
      return this.get('children').map(function(child) {
        return Ember.get(child, 'age');
      });
    }.smartProperty()
  });

  var lordByron = Person.create({children: Ember.A([])});
  deepEqual(lordByron.get('childAges'), []);
  lordByron.get('children').pushObject({name: 'Augusta Ada Byron', age: 7});
  deepEqual(lordByron.get('childAges'), [7]);
  lordByron.get('children').pushObjects([{
    name: 'Allegra Byron',
    age: 5
  }, {
    name: 'Elizabeth Medora Leigh',
    age: 8
  }]);
  deepEqual(lordByron.get('childAges'), [7, 5, 8]);
});

test('Array#mapBy', function() {
  var Person = Ember.Object.extend({
    childAges: function() {
      return this.get('children').mapBy('age');
    }.smartProperty()
  });

  var lordByron = Person.create({children: Ember.A([])});
  deepEqual(lordByron.get('childAges').toArray(), []);
  lordByron.get('children').pushObject({name: 'Augusta Ada Byron', age: 7});
  deepEqual(lordByron.get('childAges').toArray(), [7]);
  lordByron.get('children').pushObjects([{
    name: 'Allegra Byron',
    age: 5
  }, {
    name: 'Elizabeth Medora Leigh',
    age: 8
  }]);
  deepEqual(lordByron.get('childAges').toArray(), [7, 5, 8]);
});

test('Array#objectAt', function() {
  var Person = Ember.Object.extend({
    secondEmployeer: function() {
      return this.get('employeers').objectAt(1);
    }.smartProperty()
  });

  var graceHopper = Person.create({
    employeers: Ember.A([
      'Vassar'
    ])
  });

  equal(graceHopper.get('secondEmployeer'), undefined);
  graceHopper.get('employeers').pushObject('United States Navy');
  equal(graceHopper.get('secondEmployeer'), 'United States Navy');
});

test('Array#objectsAt', function() {
  var Person = Ember.Object.extend({
    secondAndThirdEmployeer: function() {
      return this.get('employeers').objectsAt([1, 2]);
    }.smartProperty()
  });

  var graceHopper = Person.create({
    employeers: Ember.A([
      'Vassar'
    ])
  });

  deepEqual(graceHopper.get('secondAndThirdEmployeer'), [undefined, undefined]);
  graceHopper.get('employeers').pushObjects([
    'United States Navy',
    'Eckert–Mauchly Computer Corporation',
    'Remington Rand Corporation',
    'Digital Equipment Corporation'
  ]);
  deepEqual(graceHopper.get('secondAndThirdEmployeer'), ['United States Navy', 'Eckert–Mauchly Computer Corporation']);
});

test('Array#reduce', function() {
  var Teacher = Ember.Object.extend({
    largestLecture: function() {
      return this.get('lectureAttendance').reduce(function(memo, attendance) {
        return Math.max(memo, attendance);
      }, 0);
    }.smartProperty()
  });

  var graceHopper = Teacher.create({
    lectureAttendance: Ember.A([
      30,
      40,
      20,
      40,
      50
    ])
  });

  equal(graceHopper.get('largestLecture'), 50);
  graceHopper.get('lectureAttendance').pushObjects([
    22,
    24,
    54,
    117,
    63
  ]);
  equal(graceHopper.get('largestLecture'), 117);
});

test('Array#reject', function() {
  var Hamster = Ember.Object.extend({
    remainingChores: function() {
      return this.get('chores').reject(function(chore) {
        return Ember.get(chore, 'done');
      });
    }.smartProperty()
  });

  var hamster = Hamster.create({chores: [
    {name: 'cook', done: true},
    {name: 'clean', done: true},
    {name: 'write more unit tests', done: false}
  ]});
  equal(hamster.get('remainingChores.length'), 1);
  hamster.set('remainingChores.firstObject.done', true);
  equal(hamster.get('remainingChores.length'), 0);
});


test('Array#rejectBy', function() {
  var Hamster = Ember.Object.extend({
    remainingChores: function() {
      return this.get('chores').rejectBy('done');
    }.smartProperty()
  });

  var hamster = Hamster.create({chores: [
    {name: 'cook', done: true},
    {name: 'clean', done: true},
    {name: 'write more unit tests', done: false}
  ]});
  equal(hamster.get('remainingChores.length'), 1);
  hamster.set('remainingChores.firstObject.done', true);
  equal(hamster.get('remainingChores.length'), 0);
});

test('Array#sortBy', function() {

  var ToDoList = Ember.Object.extend({
    sortedTodos: function() {
      return this.get('todos').sortBy('priority');
    }.smartProperty()
  });
  var todoList = ToDoList.create({todos: [
    {name: 'Unit Test', priority: 2},
    {name: 'Documentation', priority: 3}
  ]});

  equal(todoList.get('sortedTodos.firstObject.name'), 'Unit Test');
  todoList.get('todos').pushObject({name: 'Release', priority: 1});
  equal(todoList.get('sortedTodos.firstObject.name'), 'Release');
});


test('Array#uniq', function() {
  var Hamster = Ember.Object.extend({
    uniqueFruits: function() {
      return this.get('fruits').uniq();
    }.smartProperty()
  });

  var hamster = Hamster.create({fruits: [
    'banana',
    'grape',
    'kale',
    'banana'
  ]});

  deepEqual(hamster.get('uniqueFruits'), ['banana', 'grape', 'kale']);
  hamster.get('fruits').pushObjects(['kale', 'celery']);
  deepEqual(hamster.get('uniqueFruits'), ['banana', 'grape', 'kale', 'celery']);
});

test('Array#without', function() {
  var Hamster = Ember.Object.extend({
    noBananas: function() {
      return this.get('fruits').without('banana');
    }.smartProperty()
  });

  var hamster = Hamster.create({fruits: [
    'banana',
    'grape',
    'kale',
    'banana'
  ]});

  deepEqual(hamster.get('noBananas'), ['grape', 'kale']);
  hamster.get('fruits').pushObjects(['banana', 'celery']);
  deepEqual(hamster.get('noBananas'), ['grape', 'kale', 'celery']);
});

