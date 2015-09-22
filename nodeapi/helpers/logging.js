/**
 * Copyright (C) 2015 All Rights Reserved.
 */
"use strict";

/**
 * Represents wrapper for express methods
 * @version 1.0
 * @author
 */

var _ = require('underscore');
var async = require('async');
var winston = require('winston');
var initDb = require("../db");
var ValidationError = require("../errors/ValidationError");

/**
 * Handle error and return it as JSON to the response.
 * @param {Error} error the error to handle
 * @param {Object} res the express response object
 * @returns {Object} the returned response
 */
function handleError(error, res) {
    var result;
    if (error instanceof  ValidationError) {
        res.statusCode = 400;
        result = {
            errors: error.errors
        };
    } else {
        var code = error.code || 500;
        res.statusCode = code;
        result = {
            errors: [{
                code: code,
                message: error.message
            }]
        };
    }
    res.json(result);
    return result;
}


/**
 * This function create a delegate for the express action.
 * Input and output logging is performed.
 * Errors are handled and proper http status code is set.
 * Wrapped method must always call the callback function, first param is error, second param is object to return, third
 * parameter http code to set (optional, default is 200).
 * @param {String} signature the signature of the method caller
 * @param {Function} fn the express method to call. It must have signature (req, res, db, callback)
 * or (req, db, callback) or (db, callback).
 * @param {String} wrapPropertyName the name of object that will wrap the response. Response is wrapped always as array.
 * Response will have format: { 'wrapPropertyName': responseObject }
 * @returns {Function} the wrapped function
 */
function wrapExpress(signature, fn, wrapPropertyName) {
    if (!_.isString(signature)) {
        throw new Error("signature should be a string");
    }
    if (!_.isFunction(fn)) {
        throw new Error("fn should be a function");
    }
    return function (req, res) {
        var paramsToLog, apiResult, paramsCloned = {}, prop, clone;
        //clone properties, because wrapped method can modify them
        clone = function (obj) { return JSON.parse(JSON.stringify(obj)); };
        //req.params is custom object and must be cloned only in this way
        for (prop in req.params) {
            if (req.params.hasOwnProperty(prop)) {
                paramsCloned[prop] = req.params[prop];
            }
        }
        paramsToLog =  {
            body: clone(req.body),
            params: paramsCloned,
            query : clone(req.query),
            url: req.url
        };
        winston.info("ENTER %s %j", signature, paramsToLog, {});
        async.waterfall([
            function (cb) {
                initDb(cb);
            }, function (db, cb) {
                try {
                    if (fn.length === 4) {
                        fn(req, res, db, cb);
                    } else if (fn.length === 3) {
                        fn(req, db, cb);
                    } else {
                        fn(db, cb);
                    }
                } catch (e) {
                    cb(e);
                }
            }, function (result, httpCode) {
                if (_.isFunction(httpCode)) {
                    //http code is optional
                    //if not provided then it is callback function
                    httpCode = 200;
                }
                if (wrapPropertyName) {
                    apiResult = {};
                    if (!_.isArray(result)) {
                        result = [result];
                    }
                    apiResult[wrapPropertyName] = result;
                } else {
                    apiResult = result;
                }
                paramsToLog.response = apiResult;
                paramsToLog.statusCode = httpCode;
                res.statusCode = httpCode;
                winston.info("EXIT %s %j", signature, paramsToLog, {});
                res.json(apiResult);
            }
        ], function (error) {
            var response = handleError(error, res);
            paramsToLog.response = response;
            paramsToLog.statusCode = res.statusCode;
            winston.error("EXIT %s %j\n", signature, paramsToLog, error.stack);
        });
    };
}


module.exports = {
    wrapExpress: wrapExpress,
    handleError: handleError
};