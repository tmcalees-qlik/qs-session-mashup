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

function deleteValue(request, h, sessionId, cookie) {
    console.log('App-Cache: deleteSession('+sessionId+','+cookie+')');        
    h.unstate(cookie);               // Delete the cookie containing the session id shared with Qlik Sense
    appCache.del(sessionId);        // Delete the Qlik Sense session ticket from the cache
    request.cookieAuth.clear();         // Clear session from hapi-cookie-auth    
};

function getValue(key) {
    console.log('App-Cache: getSession('+key+')');
    return appCache.get(key);
};

module.exports.createId = createUUID;
module.exports.updateValue = updateValue;
module.exports.deleteValue = deleteValue;
module.exports.getValue = getValue;