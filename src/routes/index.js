const express = require("express"),
  service = require(`${__controllers}/service`),
  esme = require(`${__controllers}/esme-configuration`),
  menuCreation = require(`${__controllers}/menu-creation`),
  dashboard = require(`${__controllers}/dashboard`),
  stringsBasedCharging = require(`${__controllers}/strings-based-charging`),
  router = express.Router();

require(`${__routes}/service`)(router, service);
require(`${__routes}/esme-configuration`)(router, esme);
require(`${__routes}/dashboard`)(router, dashboard);
require(`${__routes}/menu-creation`)(router, menuCreation);
require(`${__routes}/strings-based-charging`)(router, stringsBasedCharging);

// Default Routes, This line should be the last line of this module.
require(`${__routes}/default`)(router);

module.exports = router;
