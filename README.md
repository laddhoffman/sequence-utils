[![NPM](https://nodei.co/npm/sequence-utils.png?compact=true)](https://npmjs.org/package/sequence-utils)
[![CircleCI](https://circleci.com/gh/laddhoffman/sequence-utils.svg?style=svg)](https://circleci.com/gh/laddhoffman/sequence-utils)

This module provides a `Sequence` class, with methods `addParticipant`,
`addInteraction`, and `compareWith`.

    addParticipant(name, [title])
      name: The reference by which this participant will be known.
      title: Optional display name for the participant

      returns: Nothing

    addInteraction(from, to, description)
      from: The name of the originating participant
      to: The name of the target participant
      description: Text describing the interaction

      returns: Nothing

    compareWith(seq, opts)
      seq: A Sequence instance to which this Sequence instance will be compared.
      opts: Object
      opts.maxOffset: Integer (default 1). This is the farthest we will scan
        to find possible groups of insertions, deletions, or transpositions.

      returns: Array of objects.

The objects in the array returned by compareWith follow certain conventions.

When you see properties 'A' and 'B', these refer to the present `Sequence` 
instance, and the one provided as an argument, respectively.

Each object has an 'indexes' property. This indicates the position in each
Sequence.

Each object has _one_ of the following properties: `modified`, `appended`,
`inserted`, `deleted`, or `transposed`.
