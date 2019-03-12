const nodeCache = require('node-cache');
const uuid = require('uuid/v1');

// Create a new nodeCache object to store data associated with the session
//
// In the context of this application, the data associated with the session
// is a Qlik Sense ticket.
const sessionCache = new nodeCache();

function createUUID() {    
    // Generate a unique session identifier (Guid)
    var sessionId = uuid();    

    console.log('Mashup-Session-Cache: Create unique id ['+sessionId+']');

    return sessionId;
};

function updateCache(key, val) {    
    console.log('Mashup-Session-Cache: updateCache('+key+','+JSON.stringify(val)+')');

    // Store the session id and Qlik Sense token in a global session cache
    sessionCache.set(key, val);
};

function deleteSession(request, h, sessionId, cookie) {
    console.log('Mashup-Session-Cache: deleteSession('+sessionId+','+cookie+')');        
    h.unstate(cookie);               // Delete the cookie containing the session id shared with Qlik Sense
    sessionCache.del(sessionId);        // Delete the Qlik Sense session ticket from the cache
    request.cookieAuth.clear();         // Clear session from hapi-cookie-auth    
};

function getSession(key) {
    console.log('Mashup-Session-Cache: getSession('+key+')');
    return sessionCache.get(key);
};

module.exports.createId = createUUID;
module.exports.updateCache = updateCache;
module.exports.delete = deleteSession;
module.exports.get = getSession;