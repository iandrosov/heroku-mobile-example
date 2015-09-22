/**
 * Copyright (C) 2015., All Rights Reserved.
 */
"use strict";

/**
 * Represents configuration settings
 * @version 1.0
 * @author 
 */

module.exports = {
    database: {
        url: process.env.DATABASE_URL,
        schema: process.env.DATABASE_SCHEMA || "public"
    },
    routes: require("./routes")
};