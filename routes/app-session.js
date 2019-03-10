const nodeCache = require('node-cache');
const uuid = require('uuid/v1');

// Create a new nodeCache object to store data associated with the session
//
// In the context of this application, the data associated with the session
// is a Qlik Sense ticket.
const sessionCache = new nodeCache();

function createSession(request, h, key) {
    console.log('Session Cache: createSession');

    // Generate a unique session identifier (Guid)
    var sessionId = uuid();

    // Establish the hapi cookieAuth session
    request.cookieAuth.set({sessionId});    

    // Establish the session cookie for the Mashup Application
    //h.state(key, sessionId);

    return sessionId;
};

function updateCache(key, val) {    
    console.log('Session Cache: updateCache('+key+','+JSON.stringify(val)+')');

    // Store the session id and Qlik Sense token in a global session cache
    sessionCache.set(key, val);
};

function deleteSession(request, h, sessionId, cookie) {
    console.log('Session Cache: deleteSession('+sessionId+','+cookie+')');        
    h.unstate(cookie);               // Delete the cookie containing the session id shared with Qlik Sense
    sessionCache.del(sessionId);        // Delete the Qlik Sense session ticket from the cache
    request.cookieAuth.clear();         // Clear session from hapi-cookie-auth    
};

function getSession(key) {
    console.log('Session Cache: getSession('+key+')');
    return sessionCache.get(key);
};

module.exports.create = createSession;
module.exports.updateCache = updateCache;
module.exports.delete = deleteSession;
module.exports.get = getSession;