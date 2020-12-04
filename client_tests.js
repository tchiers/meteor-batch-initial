import {Mongo} from "meteor/mongo";

export const batched = new Mongo.Collection('batch_initial_batched');
export const unbatched = new Mongo.Collection('batch_initial_unbatched');

const timeSubscribe = async function (name) {
    return new Promise((resolve, reject) => {
        const start = new Date();
        const handle = Meteor.subscribe(name, () => {
            const et = new Date() - start;
            const count = (name === 'batched' ? batched : unbatched).find().count();
            handle.stop();
            console.log({name, et, count});
            resolve({et, count});
        });
    });

}
const raceSubscriptions = async function () {
    return [
        await timeSubscribe('batched'),
        await timeSubscribe('unbatched')
    ];
}

const result = raceSubscriptions();

Tinytest.addAsync("batch-initial - subscribe base tests", async (test, onComplete) => {
    const times = await result;
    const ratio = times[1].et / times[0].et;
    test.equal(times[0].count, times[1].count, `Batched resulted in different number of docs than unbatched.`);
    test.isTrue(ratio > 1, `Batched ${times[0].et} took longer than unbatched ${times[1].et}`);
});

Tinytest.addAsync("batch-initial - subscribe performance expectation", async (test, onComplete) => {
    const times = await result;
    const ratio = times[1].et / times[0].et;
    test.isTrue(ratio > 2, `Unbatched/batched performance sub-par: ratio ${ratio} is less than 2`);
});