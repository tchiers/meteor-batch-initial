import {extendPublish} from 'meteor/peerlibrary:extend-publish';

// mutate Subscription and Session by hooking publish via extend-publish
extendPublish(function (name, publishFunction, options) {
    const newPublishFunction = function (...args) {

        // this == Subscription, this._session == Session
        const subscription = this;
        const session = this._session;

        // Keeps track of which collectionNames are queueing messages for bulk transmission
        // undefined means queueing disabled
        // Map collectionName => [queued messages] when enabled
        let queues = null;

        // intercept sent messages and hold them in a queue if queueing is enabled for this collection
        const origSend = session.send;
        session.send = function (msg) {
            const queue = queues && queues.get(msg.collection);
            if (queue) queue.push(msg);
            else origSend.apply(this, arguments);
        }

        // stop queueing messages for a collection, sending any queued messages before we go ready
        const origSendReady = session.sendReady;
        session.sendReady = function () {
            if (queues) {
                const drainingQueues = queues;
                queues = null; // set this now so send doesn't just re-queue messages
                if (this._isSending) {
                    drainingQueues.forEach(msgs => {
                        session.send({msg: "bulk", msgs});
                    })
                }
            }
            origSendReady.apply(this, arguments);
        };

        /**
         * @summary Call inside the publish function.  Tells DDP to send the initial data set in one chunk per collection, rather than one message per doc. This greatly speeds up subscription to a large number of small documents
         * @locus Server
         * @memberOf Subscription
         * @instance
         */
        subscription.batchInitial = function () {
            //set keys keep track of which collections are being batched from this publish function.
            queues = new Map();
        };


        //hook added, changed, removed to record what collections are being batched
        (['added', 'changed', 'removed']).forEach(op => {
            const orig = subscription[op];
            subscription[op] = function (collectionName, ...args) {
                if (!this._isDeactivated() && !this._ready && queues && !queues.has(collectionName)) {
                    queues.set(collectionName, []);
                }
                orig.call(this, collectionName, ...args);
            }
        });

        return publishFunction.apply(this, args);
    };

    return [name, newPublishFunction, options];
});
