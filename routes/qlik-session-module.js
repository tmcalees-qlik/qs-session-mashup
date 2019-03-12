const sessionLogin = require('../util/qlik-auth');
const appCache = require('../util/app-cache');

module.exports = [
    // Route for adding a session
    //
    // This route is called to add a new session.  I'm not sure when this
    // method is called or by who.        
    {
        method: 'POST',
        path: '/session-auth/session',
        handler: async function (request, h) {
            console.log('POST [session-auth/session]: Add session');                                       

            return h.response('POST [/session-auth/session]: Not Implemented');
        }
    },    

    // Route for session id validation
    //
    // This route is called whenever Qlik Sense needs to validate a session identifier.  The session
    // id passed in the URI will be looked up in the global app cache.  If the session id is found,
    // the session ticket JSON is returned, otherwise ...
    //
    // TODO: Research the appropriate return for an invalid session id
    {
        method: 'GET',
        path: '/session-auth/session/{id}',
        handler: async function (request, h) {
            console.log('GET [session-auth/session/{id}]: Validate session id '+request.params.id);                           

            var ticket = appCache.getValue(request.params.id);    // appCache is a global cache containing all users' session tickets
            if (ticket == undefined) {
                console.log('GET [session-auth/session/{id}]: Session is INVALID');
            } else {
                console.log('GET [session-auth/session/{id}]: Session is VALID');
            }

            return h.response(ticket);
        }
    },    

    // Route for session id deletion
    //
    // This route is called whenever Qlik Sense needs to delete a session due to timeout.  The session
    // id passed in the URI will be looked up in the hapi server cache.  If the session id is found,
    // the session ticket JSON is deleted from the cache.
    {
        method: 'DELETE',
        path: '/session-auth/session/{id}',
        handler: async function (request, h) {
            console.log('DELETE [session-auth/session/{id}]: Delete session id '+request.params.id);     
            
            var qlikSession = request.state.QlikSession;
            if (qlikSession)
            {
                console('DELETE [/session-auth/session/{id}]: Clear Qlik Sense session cookie and cache');
                h.state('QlikSession',null);                            // Delete the cookie containing the session id shared with Qlik Sense
                appCache.deleteValue(qlikSession);          // Delete the Qlik Sense session ticket from the cache
            }

            return h.response('Session deleted');
        }
    }
];