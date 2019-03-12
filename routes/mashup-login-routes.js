const sessionLogin = require('../util/qlik-auth');
const mashupSessionCache = require('../util/mashup-session-cache');

module.exports = [
    // Route for login page.
    //
    // This route does not leverage the 'session' auth configuration, so it can be
    // served to a non-authenticated user.  The login page uses the 'empty_layout'
    // template.
    {
        method: 'GET',
        path: '/login',
        handler: function (request, h) {
            console.log('GET [/login]: Render login.html');
            return h.view('login.html',{PageTitle:'Login'},{layout: 'empty_layout'});
        }
    },

    // Route for the login page postback.
    //
    // This route takes the parameters from the login form and performs an 
    // authentication check.  This is currently stubbed out and always return
    // true.
    {
        method: 'POST',
        path: '/login',        
        handler: async function (request, h) {            
            var user = request.payload.username;
            var pwd = request.payload.password;            
            var directory = request.payload.directory;       
            console.log('POST [/login]: Authenticate login credentials [USER:'+user+', PASSWORD:'+pwd+', DIRECTORY:'+ directory+']');            
                        
            // Establish the hapi cookieAuth session
            request.cookieAuth.set({sessionId});    

            console.log('POST [/login]: Create session identifier');
            var sessionId = mashupSessionCache.createId();            
            var ticket = await sessionLogin.createSession(request, h, user, directory, sessionId);                                                              
            
            // Establish the session cookie for the Qlik Sense session proxy
            console.log('POST [/login]: Create Qlik session cookie');
            h.state('X-QlikSession-Token-HTTP', sessionId);

            mashupSessionCache.updateCache(sessionId, ticket);

            return h.redirect('/view/auth-overview.html');
            //return h.view('auth-overview.html',{PageTitle:'Page Title'},{layout: 'layout-session'});
        }
    },

    // Route for  logout
    //
    // This route clears the hapi-session-ath cookie, clears the Qlik Sense session cookie
    // and removes the Qlik Sense session ticket from the cache.  The user will then be routed
    // to the login page.
    {
        method: 'GET',
        path: '/logout',
        options: {
            auth: 'session', 
            handler: async function (request, h) {
                console.log('GET [/logout]: Log out of mashup application');                                        
                
                var sessionId =  request.cookieAuth.request.auth.credentials.sessionId;
                if (sessionId)
                {
                    mashupSessionCache.delete(request, h, sessionId,'MashupSession');
                }  

                return h.redirect('/login');
            }
        }                 
    }    
];