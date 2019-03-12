const nodeCache = require('node-cache');
const uuid = require('uuid/v1');

// Create a new nodeCache object to store global app data
//
const appCache = new nodeCache();

function createUUID() {    
    // Generate a unique identifier (Guid)
    var sessionId = uuid();    

    console.log('App-Cache: Create unique id ['+sessionId+']');

    return sessionId;
};

function updateValue(key, val) {    
    console.log('App-Cache: updateCache('+key+','+JSON.stringify(val)+')');

    // Store a val into the global app cache
    appCache.set(key, val);
};

function deleteValue(key) {
    console.log('App-Cache: deleteSession ['+key+']');        
   
    return appCache.del(key);        // Delete key and value from cache
};

function getValue(key) {
    console.log('App-Cache: getSession('+key+')');
    return appCache.get(key);
};

module.exports.createId = createUUID;
module.exports.updateValue = updateValue;
module.exports.deleteValue = deleteValue;
module.exports.getValue = getValue;