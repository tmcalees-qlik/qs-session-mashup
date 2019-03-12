module.exports = [
// Generic route for all html template pages
    //
    // Access to these pages is controlled by the 'session' authentication setting for the route.
    {
        method: 'GET',
        path: '/view/{page}',
        options: {
            auth: 'session',   
            handler: function (request, h) {
                var filename = '/view/'+request.params.page;
                var pageTitle = request.query.pageTitle;                                
    
                console.log('GET [/view/{page}]: Render '+filename);                

                return h.view(request.params.page,
                    {PageTitle: pageTitle,
                        Username: request.cookieAuth.request.auth.credentials.UserId,
                        Ticket: request.cookieAuth.request.auth.credentials.Ticket},{layout: 'layout-session'});   
                
            }
        }
    }
];