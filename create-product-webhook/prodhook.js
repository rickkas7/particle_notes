// Run this like:
// node prodhook.js
//
// Requires the following additional packages. From the directory containing prodhook.js, run:
// npm install yargs request

// You can paste your access token here for convenience, or use the --accessToken=xxxxx option 
var accessToken = '';

// And your productSlug, or use the --productSlug=xxx option
var productSlug = '';


// https://github.com/request/request
var request = require('request');

// yargs argument parser (successor to optimist)
// https://www.npmjs.com/package/yargs
var argv = require('yargs')
	.usage('Usage: $0 <command> [options]')
	.demandCommand(1)
	.command('list', 'list product webhooks')
	.command('create', 'create a product webhook')
	.command('delete', 'delete a product webhook')
	.help('h')
	.alias('h', 'help')
	.argv;

// Built-in node class
var fs = require('fs');

if (argv.accessToken) {
	accessToken = argv.accessToken;
}
if (accessToken == '') {
	console.error("error: no accessToken specified");		
	process.exit(1);	
}
if (argv.productSlug) {
	productSlug = argv.productSlug;
}
if (productSlug == '') {
	console.error("error: no productSlug specified");		
	process.exit(1);	
}

var options = {
	url: 'https://api.particle.io/v1/products/' + productSlug + '/webhooks',
	headers: { 
		'Authorization' : 'Authorization: Bearer ' + accessToken
	}
};


if (argv._[0] == 'list') {
	request(options, function (error, response, body) {
		console.log(body);
	})
}
else
if (argv._[0] == 'create') {
	if (argv._.length == 1) {
		console.error("error: hook json file required");		
		process.exit(1);
	}
	
	var hookStr = fs.readFileSync(argv._[1], 'utf8');
			
	options.method = 'POST';
	options.form = JSON.parse(hookStr);
	
	request(options, function (error, response, body) {
		console.log(body);
	})
}
else
if (argv._[0] == 'delete') {
	if (argv._.length == 1) {
		console.error("error: webhook id required");		
		process.exit(1);
	}
	
	options.method = 'DELETE';
	options.url = options.url + '/' + argv._[1];
	
	request(options, function (error, response, body) {
		console.log(body);
	})
}
else {
	console.error("error: unknown command");
	process.exit(1);
}

