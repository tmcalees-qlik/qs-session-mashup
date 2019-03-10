const sessionLogin = require('../util/qlik-session-login');
const appSession = require('./app-session');

module.exports = [
    // Route for login page.
    //
    // This route does not leverage the 'session' auth configuration, so it can be
    // served to a non-authenticated user.  The login page uses the 'empty_layout'
    // template.
    {
        method: 'GET',
        path: '/login-session',
        handler: function (request, h) {
            console.log('Route GET [/login-session]: Render login-session.html');
            return h.view('login-session.html',{PageTitle:'Login'},{layout: 'empty_layout'});
        }
    },

    // Route for the login page postback.
    //
    // This route takes the parameters from the login form and performs an 
    // authentication check.  This is currently stubbed out and always return
    // true.
    {
        method: 'POST',
        path: '/login-session',        
        handler: async function (request, h) {
            console.log('Route POST [/login-session]: Authenticate login credentials');
            var user = request.payload.username;
            var pwd = request.payload.password;            
            var directory = request.payload.directory;                        

            var sessionId = appSession.create(request, h, 'MashupSession');

            console.log('Route POST [/login-session]: USER: '+user+' PASSWORD: '+pwd+' DIRECTORY: '+ directory);            
            var ticket = await sessionLogin.createSession(request, h, user, directory, sessionId);                                                              
            
            // Establish the session cookie for the Qlik Sense session proxy
            console.log('Route POST [/login-session]: Create Qlik session cookie');
            h.state('X-QlikSession-Token-HTTP', sessionId);

            appSession.updateCache(sessionId, ticket);

            return h.redirect('http://localhost/session/content/Default/redirect-session.html');            
        }
    },

    // Route for  logout
    //
    // This route clears the hapi-session-ath cookie, clears the Qlik Sense session cookie
    // and removes the Qlik Sense session ticket from the cache.  The user will then be routed
    // to the login page.
    {
        method: 'GET',
        path: '/logout-session',
        options: {
            auth: 'session', 
            handler: async function (request, h) {
                console.log('Route GET [/logout-session]: Log out of mashup application');                                        
                
                var sessionId =  request.cookieAuth.request.auth.credentials.sessionId;
                if (sessionId)
                {
                    appSession.delete(request, h, sessionId,'MashupSession');
                }  

                return h.redirect('/login-session');
            }
        }                 
    },

    // Route for adding a session
    //
    // This route is called to add a new session.  I'm not sure when this
    // method is called or by who.        
    {
        method: 'POST',
        path: '/session-auth/session',
        handler: async function (request, h) {
            console.log('Route POST [session-auth/session]: Add session');                                       

            return h.response('Route POST [/session-auth/session]: Not Implemented');
        }
    },    

    // Route for session id validation
    //
    // This route is called whenever Qlik Sense needs to validate a session identifier.  The session
    // id passed in the URI will be looked up in the hapi server cache.  If the session id is found,
    // the session ticket JSON is returned, otherwise ...
    //
    // TODO: Research the appropriate return for an invalid session id
    {
        method: 'GET',
        path: '/session-auth/session/{id}',
        handler: async function (request, h) {
            console.log('Route GET [session-auth/session/{id}]: Validate session id '+request.params.id);                           

            var ticket = appSession.get(request.params.id);    // appSession is a global cache containing all users' session tickets
            if (ticket == undefined) {
                console.log('Route GET [session-auth/session/{id}]: Session INVALID');
            } else {
                console.log('Route GET [session-auth/session/{id}]: Session VALIDATED');
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
            console.log('Route DELETE [session-auth/session/{id}]: Delete session id '+request.params.id);     
            
            var qlikSession = request.state.QlikSession;
            if (qlikSession)
            {
                console('Route DELETE [/session-auth/session/{id}]: Clear Qlik Sense session cookie and cache');
                h.state('QlikSession',null);        // Delete the cookie containing the session id shared with Qlik Sense
                appSession.deleteSession(qlikSession);           // Delete the Qlik Sense session ticket from the cache
            }

            return h.response('Session deleted');
        }
    }
];