
var argv = require('yargs').demandCommand(2).argv;

var NodeRSA = require('node-rsa');

var key = argv._[0];
var password = argv._[1];

// console.log("key=" + key + " password=" + password);

var keyBuf = new Buffer(key, 'hex');

var rsa = new NodeRSA(keyBuf.slice(22), 'pkcs1-public-der', {
	encryptionScheme: 'pkcs1'
});

console.log("encrypted password: " + rsa.encrypt(password, 'hex'));




