'use strict';

const {expect} = require('chai');
const {Sequence, Interaction} = require('../lib/model');
const debug = require('debug')('seq:test');

describe('Interaction', () => {
  describe('Compare', () => {
    it('compare two interactions that are equal', () => {
      let int1 = new Interaction('entity1', 'entity2', 'some action');
      let int2 = new Interaction('entity1', 'entity2', 'some action');
      let modified = int1.compareWith(int2);
      expect(modified).to.be.null;
    });

    it('compare two interactions with different targets', () => {
      let int1 = new Interaction('entity1', 'entity2', 'some action');
      let int2 = new Interaction('entity1', 'entity3', 'some action');
      let modified = int1.compareWith(int2);
      expect(modified).to.be.an('object');
      expect(modified).to.eql({
        to: {
          A: 'entity2',
          B: 'entity3',
        }
      });
    });
  });
});

describe('Sequence', () => {
  describe('Basics', () => {
    it.skip('add participants explicitly', () => {});
    it.skip('add interactions', () => {});
    it.skip('add participants automatically', () => {});
    it.skip('update participants', () => {});
  });

  describe('Comparisons', () => {
    describe('Equality', () => {
      it('compare sequences that are equal', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity2', 'some action');
        let result = seq1.compareWith(seq2);
        expect(result).to.be.an('array');
        expect(result.length).to.equal(0);
      });
    });

    describe('Modified', () => {
      it('compare sequences where one event is modified', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity3', 'some action');
        let result = seq1.compareWith(seq2);
        expect(result).to.be.an('array');
        expect(result.length).to.equal(1);
        expect(result[0]).to.eql({
          indexes: {
            A: 0,
            B: 0,
          },
          modified: {
            to: {
              A: 'entity2',
              B: 'entity3',
            }
          }
        });
      });
    });

    describe('Appended', () => {
      it('compare sequences where second seq has one event appended', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity2', 'some action');
        seq2.addInteraction('entity1', 'entity3', 'some other action');
        let result = seq1.compareWith(seq2);
        expect(result).to.be.an('array');
        expect(result.length).to.equal(1);
        expect(result[0]).to.eql({
          indexes: {
            A: null,
            B: 1,
          },
          appended: true
        });
      });

      it('compare sequences where first seq has one event appended', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        seq1.addInteraction('entity1', 'entity3', 'some other action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity2', 'some action');
        let result = seq1.compareWith(seq2);
        expect(result).to.be.an('array');
        expect(result.length).to.equal(1);
        expect(result[0]).to.eql({
          indexes: {
            A: 1,
            B: null,
          },
          appended: true
        });
      });

      it('compare sequences where two events are appended', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity2', 'some action');
        seq2.addInteraction('entity1', 'entity3', 'some other action');
        seq2.addInteraction('entity1', 'entity3', 'some additional action');
        let result = seq1.compareWith(seq2);
        expect(result).to.be.an('array');
        expect(result.length).to.equal(2);
        expect(result[0]).to.eql({
          indexes: {
            A: null,
            B: 1,
          },
          appended: true
        });
        expect(result[1]).to.eql({
          indexes: {
            A: null,
            B: 2,
          },
          appended: true
        });
      });
    });

    describe('Inserted', () => {
      it('compare sequences where one event is inserted', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        seq1.addInteraction('entity1', 'entity3', 'some additional action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity2', 'some action');
        seq2.addInteraction('entity1', 'entity3', 'some other action');
        seq2.addInteraction('entity1', 'entity3', 'some additional action');
        let result = seq1.compareWith(seq2);
        expect(result).to.be.an('array');
        expect(result.length).to.equal(1);
        expect(result[0]).to.eql({
          indexes: {
            A: 1,
            B: 1,
          },
          inserted: true
        });
      });

      it('compare sequences where two events are inserted', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        seq1.addInteraction('entity1', 'entity3', 'some additional action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity2', 'some action');
        seq2.addInteraction('entity1', 'entity3', 'some other action');
        seq2.addInteraction('entity1', 'entity3', 'another action');
        seq2.addInteraction('entity1', 'entity3', 'some additional action');
        let result = seq1.compareWith(seq2, {
          maxOffset: 2
        });
        expect(result).to.be.an('array');
        expect(result.length).to.equal(2);
        expect(result[0]).to.eql({
          indexes: {
            A: 1,
            B: 1,
          },
          inserted: true
        });
        expect(result[1]).to.eql({
          indexes: {
            A: 1,
            B: 2,
          },
          inserted: true
        });
      });
    });

    describe('Removed', () => {
      it('compare sequences where one event is omitted', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        seq1.addInteraction('entity1', 'entity3', 'some other action');
        seq1.addInteraction('entity1', 'entity3', 'some additional action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity2', 'some action');
        seq2.addInteraction('entity1', 'entity3', 'some additional action');
        let result = seq1.compareWith(seq2);
        expect(result).to.be.an('array');
        expect(result.length).to.equal(1);
        expect(result[0]).to.eql({
          indexes: {
            A: 1,
            B: 1,
          },
          deleted: true
        });
      });

      it('compare sequences where two events are omitted', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        seq1.addInteraction('entity1', 'entity3', 'some other action');
        seq1.addInteraction('entity1', 'entity3', 'another action');
        seq1.addInteraction('entity1', 'entity3', 'some additional action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity2', 'some action');
        seq2.addInteraction('entity1', 'entity3', 'some additional action');
        let result = seq1.compareWith(seq2, {
          maxOffset: 2
        });
        expect(result).to.be.an('array');
        expect(result.length).to.equal(2);
        expect(result[0]).to.eql({
          indexes: {
            A: 1,
            B: 1,
          },
          deleted: true
        });
        expect(result[1]).to.eql({
          indexes: {
            A: 2,
            B: 1,
          },
          deleted: true
        });
      });
    });

    describe('Transposed', () => {
      it('compare sequences where two events are transposed', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        seq1.addInteraction('entity1', 'entity3', 'some other action');
        seq1.addInteraction('entity1', 'entity3', 'another action');
        seq1.addInteraction('entity1', 'entity3', 'some additional action');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity2', 'some action');
        seq2.addInteraction('entity1', 'entity3', 'another action');
        seq2.addInteraction('entity1', 'entity3', 'some other action');
        seq2.addInteraction('entity1', 'entity3', 'some additional action');
        let result = seq1.compareWith(seq2);
        expect(result).to.be.an('array');
        expect(result.length).to.equal(1);
        expect(result[0]).to.eql({
          indexes: {
            A: 1,
            B: 1,
          },
          transposed: {
            length: 1,
          }
        });
      });

      it('compare sequences where two subsequences are transposed', () => {
        let seq1 = new Sequence();
        seq1.addInteraction('entity1', 'entity2', 'some action');
        seq1.addInteraction('entity1', 'entity3', 'some other action');
        seq1.addInteraction('entity1', 'entity3', 'another action');
        seq1.addInteraction('entity1', 'entity3', 'some additional action');
        seq1.addInteraction('entity1', 'entity3', 'who would have thought');
        let seq2 = new Sequence();
        seq2.addInteraction('entity1', 'entity3', 'another action');
        seq2.addInteraction('entity1', 'entity3', 'some additional action');
        seq2.addInteraction('entity1', 'entity2', 'some action');
        seq2.addInteraction('entity1', 'entity3', 'some other action');
        seq2.addInteraction('entity1', 'entity3', 'who would have thought');
        let result = seq1.compareWith(seq2, {maxOffset: 2});
        expect(result).to.be.an('array');
        expect(result.length).to.equal(1);
        expect(result[0]).to.eql({
          indexes: {
            A: 0,
            B: 0,
          },
          transposed: {
            length: 2,
          }
        });
      });
    });
  });
});
