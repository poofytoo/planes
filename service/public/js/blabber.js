
var structureBank = ['Not your everyday {object}.',
					 'The most {adj} {object} on this side of the {place}.',
					 'The {object} of the skies.',
					 'A {adj} {object}.',
					 'The {object} that will put your {object} to shame.',
					 'My first {object}.',
					 'Hello {object}.',
					 'An upgraded {object}.',
					 'The {adj} {object} of the {place}.',
					 'The {object}... of death',
					 'The {object} destroyer',
					 'A combination of {object} and {object}']

var object = ['toaster',
				  'paper plane',
				  'AI',
				  'algorithm',
				  'bag of surprises',
				  'TI-83',
				  'pair of smarty pants',
				  'random number generator',
				  'RNG',
				  'random toaster generator',
				  'random plane generator',
				  'slice of code',
				  'piece of code',
				  'chunk of code']

var adj = ['delightful little',
		   'delicious',
		   'wondrous',
		   'mysterious',
		   'surprising',
		   'clever little',
		   'smooth',
		   'peculiar',
		   'randomized',
		   'orange',
		   'tantalizing'];

var place = ['Charles River',
			 'Earth',
			 'galaxy',
			 'toaster',
			 'internet',
			 'interwebs',
			 'intertubes',
			 'keyboard']

var replacers = {
	object: object,
	adj: adj,
	place: place,
}

var sRand = function(list) {
	return list[Math.floor(Math.random()*list.length)];
}

var blabber = function() {
	var sentenceStruct = sRand(structureBank);
	for (i in replacers) {
		re = new RegExp('{'+i+'}');
		var sentence = '';
		while (sentence !== sentenceStruct) {
			sentence = sentenceStruct;
			sentenceStruct = sentenceStruct.replace(re, sRand(replacers[i]));
		}
	}
	return sentence;
}