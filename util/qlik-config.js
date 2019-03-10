var path = require('path');
var extend = require('extend');

var certPath = path.join(process.env.programdata, '/Qlik/Sense/Repository/Exported Certificates/.Local Certificates');

var config = extend(true, {        
    server: {
        hostname: 'localhost',
        port: 1235
    },
    qlik: {
        qpsPort: 4243,
        qrsPort: 4242,    
        hostname: 'localhost',        
        sessionSecret: 'session-secret',
        certificates: {
            client: path.resolve(certPath, 'client.pem'),
            client_key: path.resolve(certPath, 'client_key.pem'),
            server: path.resolve(certPath, 'server.pem'),
            server_key: path.resolve(certPath, 'server_key.pem'),
            root: path.resolve(certPath, 'root.pem')
        }
    },    
});

module.exports = config;

function dateTimeString() {
    var now = new Date();
    var strDate = now.toISOString();

    return strDate.split(':').join('.');

}