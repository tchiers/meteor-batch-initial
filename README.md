# batch-initial
***
##Installation
`meteor add tchiers:batch-initial`

##Use
This package makes available

`this.batchInitial()`

inside publish functions. Invoking `this.batchInitial()` in your publish function will tell DDP to stop sending individual
'added', 'changed', and 'removed' messages for every collection touched in the publication. The messages will be queued
until `ready()` is invoked for the publication. The queued messages will be sent over the DDP connection in a single
bulk message, followed by the ready. DDP will then revert to sending individual messages.

Using batch-initial offers significant performance advantages when publishing large sets of small documents. Client latency
from `subscribe()` to `onReady` can be cut 50-75% (2-4x speedup). server load is also reduced by the more efficient bulk message.

Note that publishing large sets of small documents is somewhat of an anti-pattern in Meteor, and if you can structure your
app & data to avoid it, you should. 

## Example
```javascript
Meteor.publish("batched", function () {
  this.batchInitial();
  return someLargeCollection.find();
});
```