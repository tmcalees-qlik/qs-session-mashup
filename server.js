'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');
const MashupStaticRoutes = require('./routes/mashup-static-routes');
const MashupViewRoutes = require('./routes/mashup-view-routes');
const MashupAuthRoutes = require('./routes/mashup-login-routes');
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

         server.auth.strategy('session','cookie',{              // This is the mashup session cookie used by hapi-auth-cookie
            password: 'session!secret!123456789!987654321',
            cookie: 'Mashup-Session',
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

        server.state('X-QlikSession-Token-HTTP', {              // Create a cookie that contains the Qlik Sense 
            ttl: null,                                          // session id (must match the virtual proxy configuration)            
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
// wait for them all to complete before registering any routes.
//
start().then(result => {    
    
    server.route(MashupStaticRoutes);                         // Configure routes for static pages
    server.route(MashupViewRoutes);                           // Configure routes for dynamic view pages
    server.route(MashupAuthRoutes);                           // Configure routes for mashup authentication (login/logout)
    server.route(QlikSessionAuthenticationRoutes);            // Configure routes for Qlik Sense Session Authentication Module interface        
});
