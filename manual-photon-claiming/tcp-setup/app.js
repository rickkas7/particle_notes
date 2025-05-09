#!/usr/bin/env node
const net = require('net');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv))
    .demandCommand(1)
    .argv

const options = {
    command: argv._[0],
};

if (argv._.length >= 2) {
    options.data = argv._[1];
}


/*
- Open, unsecured AP
- SSID is "photon-xxxxx" where xxxxx is part of the unique device ID
- IP 192.168.0.1

## Endpoints
- TCP/5609 : simple protocol 
 - request is:
  - command name [a-zA-z0-9-_]+ LF 
  - number of bytes in body in ascii, e.g. '5' '7' for 57 bytes. LF 
  - LF (empty line delimiter), followed by the JSON representation of the request data (if the command request requires one) 
 - response:
 	- line delimited header data (if any) followed by an empty line (\n\n)
 	- command result as JSON
 - one request/response pair per socket connection
*/

async function run() {
    options.request = '';

    options.request += options.command + '\n';
    
    if (options.data) {
        options.request += options.data.length.toString() + '\n';
        options.request += '\n';
        options.request += options.data;
    }
    else {
        // No data
        options.request += '0\n\n';
    }
    
    
    console.log('options', options);
    
    const client = new net.Socket();

    client.connect(5609, '192.168.0.1', function() {
        console.log('client connected');
        client.write(options.request);
        // client.end();
    });

    client.on('data', function(data) {
        console.log('data', data.toString());
    });

    client.on('close', function() {
        console.log('closed');
    });
}

run();
