/**
 * Copyright (C) 2015 , All Rights Reserved.
 */
"use strict";

/**
 * Represents application entry
 * @version 1.0
 * @author
 */

var config = require('./config/configuration');
var express = require('express');
var http = require('http');
var winston = require('winston');
var initDb = require('./db');

var app = express();

require('./config')(app);

initDb(function (err) {
    if (err) {
        throw err;
    }
    //load all routes
    var route, value, version;
    for (version in config.routes) {
        for (route in config.routes[version]) {
            value = config.routes[version][route];
            var method = route.split(' ').shift().toLowerCase(),
                url = route.split(' ').pop(),
                controllerName = value.split('#').shift(),
                action = value.split('#').pop(),
                controller = require('./controllers/' + controllerName);
            app[method]("/" + version + url, controller[action]);
        }
    }

    http.createServer(app).listen(app.get('port'), function () {
        winston.info('Express server listening on port ' + app.get('port'));
    });
});
