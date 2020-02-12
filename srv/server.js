/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";

var cds = require("@sap/cds");
var express = require("express");

var app = express();

var options = {kind: "hana", logLevel: "error"};
var odataURL = "/odata/v4/CatalogService";

cds.connect(options);
cds.serve("gen/csn.json", {
		crashOnError: false
	})
	.at(odataURL)
	.in(app)
	.catch((err) => {
		process.exit(1);
	});

//Setup Additonal Node.js Routes
//require("./router")(app, server);

var server = require("http").createServer();
var port = process.env.PORT || 3000;

server.on("request", app);

server.listen(port, function () {
	console.info("srv: " + server.address().port);
});