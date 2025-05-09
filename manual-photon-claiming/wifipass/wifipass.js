
var argv = require('yargs').demandCommand(2).argv;

var NodeRSA = require('node-rsa');

var key = argv._[0];
var password = argv._[1];

// console.log("key=" + key + " password=" + password);

var keyBuf = Buffer.from(key.substring(44), 'hex');

var rsa = new NodeRSA(keyBuf, 'pkcs1-public-der', {
	encryptionScheme: 'pkcs1'
});

console.log("encrypted password: " + rsa.encrypt(password, 'hex'));




