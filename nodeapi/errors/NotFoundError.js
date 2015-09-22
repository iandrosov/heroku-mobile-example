/**
 * Copyright (c) 2015 All rights reserved.
 */
"use strict";

/**
 * This file defines NotFoundError.
 * This error should be used if entity or resource was not found.
 * @author
 * @version 1.0
 */

/**
 * Constructor of NotFoundError
 * @param {Object} message the error message
 */
var NotFoundError = function (message) {
    //captureStackTrace
    Error.call(this);
    Error.captureStackTrace(this);
    this.message = message || "Not found";
    this.code = 404;
};

//use Error as prototype
require('util').inherits(NotFoundError, Error);

module.exports = NotFoundError;
