'use strict';

const debug = require('debug')('seq:model');

// model

// model generator(s)

// model manipulators?
// transformations?

// evaluators?
// cost functions / fitness functions?

// model solvers?
// optimizers?

// model comparators?

class Participant {
  constructor(name, title) {
    this.name = name;
    this.title = title || name;
  }
}

class Interaction {
  constructor(from, to, description, opts) {
    this.from = from;
    this.to = to;
    this.description = description;
    this.opts = opts;
  }
  compareWith(y) {
    let x = this;
    let isDifferent = false;
    let modified = {};
    ['from', 'to', 'description'].forEach(key => {
      if (x[key] !== y[key]) {
        isDifferent = true;
        modified[key] = {A: x[key], B: y[key]};
      }
    });
    return isDifferent ? modified : null;
  }
}

class Sequence {
  constructor() {
    this.participants = [];
    this.interactions = [];
  }
  addParticipant(name, title) {
    let participant = this.participants.find(x => x.name === name);
    if (!participant) {
      participant = new Participant(name);
      this.participants.push(participant);
    }
    participant.title = title;
  }
  addInteraction(from, to, description, opts) {
    this.interactions.push(new Interaction(from, to, description, opts));
    if (!this.participants.find(x => x.name === from)) {
      this.participants.push(new Participant(from));
    }
    if (!this.participants.find(x => x.name === to)) {
      this.participants.push(new Participant(to));
    }
  }
  listParticipants() {
    this.participants.map((participant, idx) => {
      console.log('participants[' + idx + ']: ' + JSON.stringify(participant));
    });
  }
  compareWith(B, opts = {}) {
    let maxOffset = opts.maxOffset || 1;
    // We want to know which parts of this sequence are the same, and which are
    // different.
    // What kind of differences might we be interested in?
    // - Events that are inserted
    // - Events that are omitted
    // - Events that are substituted
    // - Events that are transposed
    // Let's see what we can do.
    // Looking for insertions/deletions, we need to keep track of these as we
    // continue to traverse, so that we only report each shift once.
    let A = this;
    let differences = [];
    let i = 0, j = 0;
    Traversal: // Label so we can continue out of inner loops
    do {
      let x = A.interactions[i];
      let y = B.interactions[j];
      let modified = x.compareWith(y);
      if (!modified) {
        continue;
      }
      // Before we report this as substitution, we need to check other
      // possibilities: insertion, deletion, transposition.
      
      // Let's check for transposition first; otherwise we may mistake it it
      // for another condition.
      // Let's start by supporting directly adjacent transposition.
      // If this element is a direct transposition, A[i] will match B[j+1] and
      // A[i+1] will match B[j].
      {
        let x1 = A.interactions[i + 1];
        let y1 = B.interactions[j + 1];
        if (x1 && y1) {
          let modified = x.compareWith(y1);
          if (!modified) {
            // A[i] matches B[j+1]
            let modified = x1.compareWith(y);
            if (!modified) {
              // A[i+1] matches B[j]
              // So this is a transposition
              let indexes = {
                A: i,
                B: j + 1,
              };
              let transposed = {
                A: i + 1,
                B: j,
              };
              differences.push({indexes, transposed});
              i++;
              j++;
              continue Traversal;
            }
          }
        }
      }

      // If this is an insertion in B, then one of the next elements in B should
      // match this element in A. We will check up to maxOffset elements ahead.
      for (let k = 1; k <= maxOffset; k++) {
        let y = B.interactions[j + k];
        if (!y) {
          break;
        }
        let modified = x.compareWith(y);
        if (!modified) {
          // A match! This indicates we have an insertion in B.
          // We interpret this to also mean that any intervening elements in B
          // were inserted as well.
          for (let l = 0; l < k; l++) {
            let indexes = {
              A: i,
              B: j++,
            };
            differences.push({indexes, inserted: true});
          }
          continue Traversal;
        }
      }

      // A removal would be just the opposite-- one of the next elements in A
      // should match this element in B.
      for (let k = 1; k <= maxOffset; k++) {
        let x = A.interactions[i + k];
        if (!x) {
          break;
        }
        let modified = x.compareWith(y);
        if (!modified) {
          // A match! This indicates we have a deletion in B.
          // We interpret this to also mean that any intervening elements in A
          // were deleted as well.
          for (let l = 0; l < k; l++) {
            let indexes = {
              A: i++,
              B: j,
            };
            differences.push({indexes, deleted: true});
          }
          continue Traversal;
        }
      }

      // We interpret this as a substitution
      let indexes = {
        A: i,
        B: j,
      };
      differences.push({indexes, modified});
    } while (i++, j++, i < A.interactions.length && j < B.interactions.length);

    if (i < A.interactions.length) {
      for (; i < A.interactions.length; i++) {
        let indexes = {
          A: i,
          B: null,
        };
        differences.push({indexes, appended: true});
      }
    }
    if (j < B.interactions.length) {
      for (; j < B.interactions.length; j++) {
        let indexes = {
          A: null,
          B: j,
        };
        differences.push({indexes, appended: true});
      }
    }
    debug('differences:', differences);
    return differences;
  }
}

module.exports = {
  Sequence,
  Interaction,
};

