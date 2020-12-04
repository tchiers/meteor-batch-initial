Package.describe({
    name: "tchiers:batch-initial",
    summary: "Allow initial document adds from publish functions to be sent as a batch instead of one-at-a-time. Greatly improves client load times for large sets of small documents.",
    version: '1.0.0',
    documentation: 'https://github.com/tchiers/meteor-batch-initial/blob/master/README.md'
});

Package.onUse(function (api) {
    api.use('ddp'); // must load after DDP has init'ed
    api.use('ddp-common'); // must load after DDP has init'ed
    api.use('peerlibrary:extend-publish@0.6.0');
    api.use('ecmascript');

    api.addFiles('server.js', 'server');
    api.addFiles('client.js', 'client');
});

Package.onTest(function (api) {
    api.use('ddp'); // must load after DDP has init'ed
    api.use('ddp-common'); // must load after DDP has init'ed
    api.use('peerlibrary:extend-publish@0.6.0');
    api.use('ecmascript');

    api.addFiles('server.js', 'server');
    api.addFiles('client.js', 'client');

    api.use('underscore');
    api.use('tinytest');
    api.addFiles('server_tests.js', 'server');
    api.addFiles('client_tests.js', 'client');
});
