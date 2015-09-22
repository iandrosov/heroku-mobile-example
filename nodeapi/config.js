/**
 * Copyright (C) 2015 , All Rights Reserved.
 */
"use strict";

/**
 * Represents configuration file for express app
 * @version 1.0
 * @author AI
 */

var express = require('express');
var cors = require('cors');
var handleError = require("./helpers/logging").handleError;
var NotFoundError = require("./errors/NotFoundError");

/**
 * Configure express app
 * @param {Object} app the express app to configure
 */
module.exports = function (app) {

    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(function (req, res, next) {
        //we force set the content-type to json because of some bug in apiary.io
        //in apiary.io the request is sent without headers (we must set it manually, but we can't predefine it)
        //this is workaround for this issue
        req.headers['content-type'] = "application/json";
        express.json()(req, res, next);
    });
    app.use(cors());
    // Handle unhandled errors.
    // The logging wrapper should handle all errors, but if request contains invalid json then
    // express framework is returning an error. This is the only error that should be caught here.
    app.use(function (err, req, res, next) {
        if (!err) {
            next();
            return;
        }
        err.code = 400;
        handleError(err, res);
    });

    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);

    //handle not found
    app.use(function (req, res) {
        handleError(new NotFoundError("URI " + req.method + " " + req.url + " does not exist."), res);
    });

};