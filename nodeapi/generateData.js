/**
 * Copyright (C) 2015 ., All Rights Reserved.
 */
"use strict";

/**
 * Recreate database and seed sample data
 * @version 1.0
 * @author AI
 */

var async = require('async');
var initDb = require('./db');

initDb(function (err, db) {
    if (err) {
        console.log(err);
        throw err;
    }
    async.series([
        function (cb) {
            db.models.Job.create(require('./sql/data/job.json'), cb);
        }
    ], function (err) {
        if (err) {
            throw err;
        }
        process.exit(0);
    });
}, true);
