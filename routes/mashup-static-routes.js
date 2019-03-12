module.exports = [
    // Generic route for all static pages (ex. images, css, javascript, etc.)
    //
    // There is no access control on these resources.  
    {
        method: 'GET',
        path: '/{file*}',
        handler: (request, h) => {

            var filename = request.params.file;
            console.log('GET [/{file}]: Returning static file '+ filename);
            return h.file(filename);
        }
    }
];