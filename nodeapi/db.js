/**
 * Copyright (C) 2015., All Rights Reserved.
 */
"use strict";

/**
 * Represents database configuration file
 * @version 1.0
 * @author AI
 */

require('pg');
var winston = require('winston');
var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var orm = require('orm');
var config = require('./config/configuration');
var modelNames = ["Job"];
var models;
var db;
orm.settings.set('instance.cache', false);

//must be always set to true, non-native postgres can't connect to heroku database
process.env.NODE_PG_FORCE_NATIVE = true;

/**
 * Setup database. Returns database instance in callback parameter.
 * @param {Function<db>} callback the callback function
 * @param {Boolean} [recreate] flag if drop and create all tables
 */
module.exports = function (callback, recreate) {
    if (db && !recreate) {
        callback(null, db);
        return;
    }
    db = orm.connect(config.database.url);
    async.series([
        function (cb) {
            db.on('connect', cb);
        },
        function (cb) {
            models = _.map(modelNames, function (name) {
                var model = require('./models/' + name);
                model._name =  name;
                return model;
            });
            //load the schema models
            async.forEachSeries(models, function (modelFun, cbx) {
                modelFun.init(db, function (err, model) {
                    modelFun.model = model;
                    cbx(err);
                });
            }, cb);
        },
        function (cb) {
            if (!recreate) {
                callback(null, db);
                return;
            }
            //drop all tables
            async.forEachSeries(models, function (modelFun, cbx) {
                winston.info("drop model " + modelFun._name);
                modelFun.model.drop(cbx);
            }, cb);
        }, function (cb) {
            //sync all tables
            async.forEachSeries(models, function (modelFun, cbx) {
                winston.info("sync model " + modelFun._name);
                modelFun.model.sync(cbx);
            }, cb);
        }, function (cb) {
            //setup indexes for all tables
            var sql = fs.readFileSync(__dirname + "/sql/indexes.sql", 'utf8')
                .replace('$SCHEMA$', config.database.schema);
            db.driver.execQuery(sql, cb);
        }
    ], function (err) {
        callback(err, db);
    });
};