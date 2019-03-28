'use strict';

const {Sequence} = require('./lib/model');

let seq = new Sequence();

seq.addParticipant('A', 'Mr. A');
seq.listParticipants();
console.log('');
seq.addInteraction('A', 'B', 'do something');
seq.listParticipants();
console.log('');
seq.addParticipant('B', 'Ms. B');
seq.listParticipants();

let seq2 = new Sequence();
seq.addParticipant('A', 'Mr. A');
seq.addParticipant('B', 'Ms. B');
seq.addInteraction('A', 'B', 'do something');
