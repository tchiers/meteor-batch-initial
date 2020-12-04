import {DDP} from 'meteor/ddp-client';
import { DDPCommon } from 'meteor/ddp-common';

//By the time we get here ddp-client has loaded and connected to the server
//need to hook existing Meteor.connection and any future connections

// modify connections to be able to process 'bulk' DDP messages
const hookConnection = function (connection) {
    //hook _processOneDataMessage
    const orig_processOneDataMessage = connection._processOneDataMessage;
    connection._processOneDataMessage = function (msg, updates) {
        if (msg.msg === 'bulk') {
            //recursively process, msg.msgs is Array
            msg.msgs.forEach((submsg) => {
                this._processOneDataMessage(submsg, updates);
            });
        } else orig_processOneDataMessage.apply(this, arguments);
    }


    //hook onMessage
    const origOnMessage = connection.onMessage;
    connection.onMessage = function (raw_msg) {
        let msg;
        try {
            msg = origParseDDP(raw_msg);
        } finally {
            if (msg && msg.msg === 'bulk') {
                this._livedata_data(msg)
            } else origOnMessage.call(this, msg || raw_msg);
        }
    }

    //original connect provides a _bound_ onMessage to StreamServer
    //must override that to use hooked version;
    //Stock DDP only has one onMessage callback, but let's use function.name to be a little more specific
    // should we encounter a situation where more than one callback has been registered
    const callbacks = connection._stream.eventCallbacks.message;
    const index = callbacks.findIndex(cb => cb.name === 'bound onMessage');
    if (index === -1) throw new Error("Couldn't find bound onMessage to replace");
    else callbacks[index] = connection.onMessage.bind(connection);

}

//hook parseDDP to pass through objects
//this lets us avoid the cost of calling parseDDP twice  - once in origOnMessage, and again in the hook
//the tradeoff is if parseDDP is accidentally or maliciously called with an object, DDP will no longer throw
const origParseDDP = DDPCommon.parseDDP;
DDPCommon.parseDDP = function (maybeStringMessage) {
    if (typeof maybeStringMessage === 'object') return maybeStringMessage;
    else return origParseDDP(...arguments);
}

//Apply hooks to Meteor.connection
hookConnection(Meteor.connection);

//Apply hooks to any new connections;
const origDDPconnect = DDP.connect;
DDP.connect = (url, options) => {
    return hookConnection(origDDPconnect(url, options));
};

