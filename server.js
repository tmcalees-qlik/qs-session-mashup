'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');
const GenericAuthenticationRoutes = require('./routes/app-session');
const QlikSessionAuthenticationRoutes = require('./routes/qlik-session-module');

var cfg = require('./util/qlik-config');

// Create a server with a host and port
const server=Hapi.server({    
    host: cfg.server.hostname,
    port: cfg.server.port
});

// Start the Hapi server
async function start() {

    try {
         await server.register(require('vision'));              // Hapi plugin used for page templating
         await server.register(require('inert'));               // Hapi plugin used for serving static files
         await server.register(require('hapi-auth-cookie'));    // Hapi plugin used for cookie based session authentication

         server.auth.strategy('session','cookie',{              // This is the session cookie used by hapi-auth-cookie
            password: 'session!secret!123456789!987654321',
            cookie: 'session',
            redirectTo: '/login',
            appendNext: true,                   
            isSecure: false    
        });

        server.views({                                          // Configures handlebars as the page templating tool for hapi vision
            engines: {
                html: require('handlebars')
            },
            layout: true,
            relativeTo: __dirname,
            path: './templates',
            layoutPath: './templates/layout',
            helpersPath: './templates/helpers',
            partialsPath: './templates/partials'
        });

        server.state('X-QlikSession-Token-HTTP', {                   // Create a hapi cookie that contains the users session id
            ttl: null,
            encoding: 'none',
            isSecure: false,
            isHttpOnly: true        
        });                


        await server.start();                                   // Start the hapi server
    }
    catch (err) {
        console.log(err);                                       // Log any errors to the console
        process.exit(1);                                        // and exit
    }

    console.log('Server running at:', server.info.uri);         // Log startup completion to the console
};

//
// Start the hapi server.  Since there are multiple asynchronous calls in the function, 
// wait for them all to complete (.then) before registering any routes.
//
start().then(result => {    
    
    server.route(QlikSessionAuthenticationRoutes);                            // Configure routes support the Qlik Sense Session Authentication Module interface    

    // Generic route for all html template pages
    //
    // Access to these pages is controlled by the 'session' authentication setting for the route.
    server.route({
        method: 'GET',
        path: '/view/{page}',
        options: {
            auth: 'session',   
            handler: function (request, h) {
                var filename = '/view/'+request.params.page;
                var pageTitle = request.query.pageTitle;
                
                var mashupSession = request.state.MashupSession;                
    
                console.log('Route GET [/view/{page}]: Render '+filename+' for session ['+mashupSession+']');                

                return h.view(request.params.page,
                    {PageTitle: pageTitle,
                        Username: request.cookieAuth.request.auth.credentials.UserId,
                        Ticket: request.cookieAuth.request.auth.credentials.Ticket},{layout: 'layout-session'});   
                
            }
        }
    });

    // Generic route for all static pages (ex. images, css, javascript, etc.)
    //
    // There is no access control on these resources.  
    server.route({
        method: 'GET',
        path: '/{file*}',
        handler: (request, h) => {

            var filename = request.params.file;
            console.log('Route GET [/{file}]: Returning static content '+ filename);
            return h.file(filename);
        }
    });
});
