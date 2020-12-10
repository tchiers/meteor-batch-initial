Package.describe({
    name: "tchiers:batch-initial",
    summary: "Allow initial document adds from publish functions to be sent as a batch instead of one-at-a-time",
    version: '1.0.1',
    git: 'https://github.com/tchiers/meteor-batch-initial.git'
});

Package.onUse(function (api) {
    api.versionsFrom("1.8");
    api.use('ddp'); // must load after DDP has init'ed
    api.use('ddp-common'); // must load after DDP has init'ed
    api.use('peerlibrary:extend-publish@0.5.0');
    api.use('ecmascript');

    api.addFiles('server.js', 'server');
    api.addFiles('client.js', 'client');
});

Package.onTest(function (api) {
    api.versionsFrom("1.8");
    api.use('ddp'); // must load after DDP has init'ed
    api.use('ddp-common'); // must load after DDP has init'ed
    api.use('peerlibrary:extend-publish@0.5.0');
    api.use('ecmascript');

    api.addFiles('server.js', 'server');
    api.addFiles('client.js', 'client');

    api.use('underscore');
    api.use('tinytest');
    api.addFiles('server_tests.js', 'server');
    api.addFiles('client_tests.js', 'client');
});
