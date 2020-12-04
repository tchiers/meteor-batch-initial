//provide unbatched collections and unbatched publishes for testing

import {Mongo} from "meteor/mongo";
import {Meteor} from "meteor/meteor";

export const batched = new Mongo.Collection('batch_initial_batched');
export const unbatched = new Mongo.Collection('batch_initial_unbatched');

for (let i = batched.find({}).count(); i < 10000; i++) {
    batched.insert({i});
}

for (let i = unbatched.find({}).count(); i < 10000; i++) {
    unbatched.insert({i});
}

Tinytest.addAsync('batch-initial - publish() modification for this.batchInitial()', (test, onComplete) => {
    //Only report once per test, ignore on re-subscribe;
    const report = _.memoize(function (id, batchInitial) {
        test.isNotUndefined(batchInitial, "No batchInitial() available in publish()");
        onComplete();
    });

    Meteor.publish(null, function () {
        const batchInitial = this.batchInitial;
        report(test.id, batchInitial)
        this.ready();
    });
})

Meteor.publish("batched", function () {
    this.batchInitial();
    return batched.find();
});

Meteor.publish("unbatched", function () {
    return unbatched.find();
});