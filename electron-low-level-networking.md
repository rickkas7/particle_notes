# Electron low-level IP networking tips

Your mobile data provider generally uses shared IP addresses for mobile devices, including both Electrons and phones. The devices sit behind NAT (Network Address Translation) with port forwarding, similar to how your home devices share a single IP address from your cable or DSL provider.

The short answer is: the network is more secure than you might guess, but this also makes peer-to-peer transmission nearly impossible. You pretty much have to transit data through a well-known server on the Internet.

I ran these tests using the Particle SIM on the AT&T network in the United States. 


## UDP outbound: Beware of the port

The most common situation is when you're using UDP to communicate with a server you control on the Internet. When you do this, make sure your server responds to the port the request came from, not the port the Electron is listening on!

Also, the return channel will only stay active for a period of time. For the Particle SIM, this could be as long as 23 minutes. For some other mobile providers, it could be as short as 30 seconds before the port forwarding is disabled.

Incidentally, this is what the [Particle keep-alive](https://docs.particle.io/reference/firmware/electron/#particle-keepalive-) is for; it's to keep the port forwarding for the cloud DTLS connection alive. Note that it only keeps the cloud DTLS ports alive; if you are doing your own private UDP port forwarding you need to keep your own port forwarding alive by sending packets to or from the port.


Here's a sample program for the Electron to send some data to a server on the Internet:

```
#include "Particle.h"

const size_t UDP_BUFFER_SIZE = 513;
const int REMOTE_UDP_PORT = 7123;
const IPAddress REMOTE_UDP_ADDR = IPAddress(65, 19, 178, 42);
const int LOCAL_UDP_PORT = 7000;
const unsigned long SEND_INTERVAL_MS = 15000;

UDP udp;
char udpBuffer[UDP_BUFFER_SIZE];
unsigned long lastSend = 0;
int sendSeq = 0;

void setup() {
	Serial.begin(9600);

	udp.begin(LOCAL_UDP_PORT);

	Serial.printlnf("server=%s:%d", Cellular.localIP().toString().c_str(), LOCAL_UDP_PORT);
}

void loop() {
	if (millis() - lastSend >= SEND_INTERVAL_MS) {
		lastSend = millis();
		snprintf(udpBuffer, sizeof(udpBuffer), "seq=%d localIP=%s localPort=%d",
				sendSeq++, Cellular.localIP().toString().c_str(), LOCAL_UDP_PORT);
		Serial.printlnf("<<< %s", udpBuffer);

		udp.sendPacket((uint8_t *)udpBuffer, strlen(udpBuffer), REMOTE_UDP_ADDR, REMOTE_UDP_PORT);
	}

	// receivePacket() is preferable to parsePacket()/read() because it saves a buffering step but more importantly
	// it return an error code if an error occurs! This is important to reinitialize the listener on error.
	int count = udp.receivePacket((uint8_t *)udpBuffer, UDP_BUFFER_SIZE - 1);
	if (count > 0) {
		udpBuffer[count] = 0;

		Serial.printlnf(">>> %s:%d %s", udp.remoteIP().toString().c_str(), udp.remotePort(), udpBuffer);
	}
	else
	if (count == 0) {
		// No packet
	}
	else {
		Serial.printlnf("** receivePacket error %d", count);
		udp.begin(LOCAL_UDP_PORT);
	}
}
```

And here's the server, written in node.js:

```
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

const SEND_TIME_MS = 5000;
const RECEIVE_TIMEOUT_MS = 35000;

var seq = 0;
var lastAddr;
var lastPort;
var lastTime;
var timer;

server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

server.on('message', (msg, rinfo) => {
	console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
	
	var resp = "response to " + msg;
	server.send(resp, 0, resp.length, rinfo.port, rinfo.address);
	
	lastAddr = rinfo.address;
	lastPort = rinfo.port;
	lastTime = new Date().getTime();
		
	if (timer == undefined) {
		console.log("starting timer");
		timer = setInterval(timerCallback, SEND_TIME_MS);
	}
});

server.on('listening', () => {
	var address = server.address();
	console.log(`server listening ${address.address}:${address.port}`);
});

function timerCallback() {
	var now = new Date().getTime();
	if ((now - lastTime) > RECEIVE_TIMEOUT_MS) {
		console.log("deactivating timer");
		clearInterval(timer);
	}
	var data = "sending seq=" + (seq++);
	server.send(data, 0, data.length, lastPort, lastAddr);
	
	console.log("sending timed response " + data + " to " + lastAddr + ":" + lastPort);
}

server.bind(7123);
```

The debug serial output from the Electron:

```
$ particle serial monitor
Opening serial monitor for com port: "/dev/cu.usbmodemFD3331"
server=10.41.110.59:7000
<<< seq=0 localIP=10.41.110.59 localPort=7000
>>> 65.19.178.42:7123 response to seq=0 localIP=10.41.110.59 localPort=7000
>>> 65.19.178.42:7123 sending seq=0
>>> 65.19.178.42:7123 sending seq=1
<<< seq=1 localIP=10.41.110.59 localPort=7000
>>> 65.19.178.42:7123 response to seq=1 localIP=10.41.110.59 localPort=7000
>>> 65.19.178.42:7123 sending seq=2
>>> 65.19.178.42:7123 sending seq=3
>>> 65.19.178.42:7123 sending seq=4
<<< seq=2 localIP=10.41.110.59 localPort=7000
>>> 65.19.178.42:7123 response to seq=2 localIP=10.41.110.59 localPort=7000
>>> 65.19.178.42:7123 sending seq=5
>>> 65.19.178.42:7123 sending seq=6
>>> 65.19.178.42:7123 sending seq=7
<<< seq=3 localIP=10.41.110.59 localPort=7000
>>> 65.19.178.42:7123 response to seq=3 localIP=10.41.110.59 localPort=7000
>>> 65.19.178.42:7123 sending seq=8
```

The debug output from node:

```
$ node udplistentest.js 
server listening 0.0.0.0:7123
server got: seq=0 localIP=10.41.110.59 localPort=7000 from 176.83.209.110:15986
starting timer
sending timed response sending seq=0 to 176.83.209.110:15986
sending timed response sending seq=1 to 176.83.209.110:15986
server got: seq=1 localIP=10.41.110.59 localPort=7000 from 176.83.209.110:15986
sending timed response sending seq=2 to 176.83.209.110:15986
sending timed response sending seq=3 to 176.83.209.110:15986
sending timed response sending seq=4 to 176.83.209.110:15986
server got: seq=2 localIP=10.41.110.59 localPort=7000 from 176.83.209.110:15986
sending timed response sending seq=5 to 176.83.209.110:15986
sending timed response sending seq=6 to 176.83.209.110:15986
sending timed response sending seq=7 to 176.83.209.110:15986
server got: seq=3 localIP=10.41.110.59 localPort=7000 from 176.83.209.110:15986
sending timed response sending seq=8 to 176.83.209.110:15986
sending timed response sending seq=9 to 176.83.209.110:15986
sending timed response sending seq=10 to 176.83.209.110:15986
sending timed response sending seq=11 to 176.83.209.110:15986
sending timed response sending seq=12 to 176.83.209.110:15986
sending timed response sending seq=13 to 176.83.209.110:15986
sending timed response sending seq=14 to 176.83.209.110:15986
deactivating timer
```

## UDP peer-to-peer using public addresses

At first this would seem to be possible from the results above. It does not work, because the UDP back-channel created above is restricted both by IP address and port.

I opened up the channel above, then updated the send.js program below with the public IP address and mapped port above. None of the packets I sent, either from the same host, or from a different host, made it to the Electron.

Thus you can't use [UDP hole punching](https://en.wikipedia.org/wiki/Hole_punching_(networking)) to do peer-to-peer to an Electron. This is actually good from a security standpoint, bad for peer-to-peer.

```
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const SEND_TIME_MS = 5000;

var seq = 0;
var serverAddr = "176.83.209.244";
var serverPort = 38967;
var timer;

function timerCallback() {
	var data = "sending seq=" + (seq++);
	socket.send(data, 0, data.length, serverPort, serverAddr);
	
	console.log("sending timed response " + data + " to " + serverAddr + ":" + serverPort);
}

console.log("starting timer");
timer = setInterval(timerCallback, SEND_TIME_MS);
```

## UDP peer-to-peer using private addresses

I ran this program on two Electrons to see if they can communicate peer-to-peer using their private (10.x.x.x) IP addresses. The answer is: no.

It appears that the network will not route packets between devices on the private network. 

This is good from a security standpoint; it means that other devices on the network can't attack you directly, but it is also bad in that peer-to-peer is impossible.

```
#include "Particle.h"

const size_t UDP_BUFFER_SIZE = 513;
const int LOCAL_UDP_PORT = 7000;
const unsigned long SEND_INTERVAL_MS = 15000;
const unsigned long PUBLISH_INTERVAL_MS = 30000;
const char *EVENT_NAME = "udpPeer";

void subHandler(const char *event, const char *data);

UDP udp;
char udpBuffer[UDP_BUFFER_SIZE];
unsigned long lastSend = 0;
int sendSeq = 0;
unsigned long lastPublish = 0;
IPAddress peerAddr;
int peerPort;

#if Wiring_WiFi
#define localIP WiFi.localIP
#else
#define localIP Cellular.localIP
#endif


void setup() {
	Serial.begin(9600);
	Particle.subscribe(EVENT_NAME, subHandler, MY_DEVICES);

	udp.begin(LOCAL_UDP_PORT);

	Serial.printlnf("server=%s:%d", localIP().toString().c_str(), LOCAL_UDP_PORT);
}

void loop() {
	if (millis() - lastSend >= SEND_INTERVAL_MS && peerAddr) {
		lastSend = millis();
		snprintf(udpBuffer, sizeof(udpBuffer), "seq=%d %s:%d -> %s:%d",
				sendSeq++, localIP().toString().c_str(), LOCAL_UDP_PORT, peerAddr.toString().c_str(), peerPort);
		Serial.printlnf("<<< %s", udpBuffer);

		udp.sendPacket((uint8_t *)udpBuffer, strlen(udpBuffer), peerAddr, peerPort);
	}

	// receivePacket() is preferable to parsePacket()/read() because it saves a buffering step but more importantly
	// it return an error code if an error occurs! This is important to reinitialize the listener on error.
	int count = udp.receivePacket((uint8_t *)udpBuffer, UDP_BUFFER_SIZE - 1);
	if (count > 0) {
		udpBuffer[count] = 0;

		lastPublish = millis();
		Serial.printlnf(">>> %s:%d %s", udp.remoteIP().toString().c_str(), udp.remotePort(), udpBuffer);
	}
	else
	if (count == 0) {
		// No packet
	}
	else {
		Serial.printlnf("** receivePacket error %d", count);
		udp.begin(LOCAL_UDP_PORT);
	}

	if (millis() - lastPublish >= PUBLISH_INTERVAL_MS) {
		lastPublish = millis();

		char data[64];
		snprintf(data, sizeof(data), "%s:%d", localIP().toString().c_str(), LOCAL_UDP_PORT);
		Particle.publish(EVENT_NAME, data, PRIVATE);
		Serial.printlnf("published %s", data);
	}
}

void subHandler(const char *event, const char *data) {
	int addr[4], tempPort;

	if (sscanf(data, "%d.%d.%d.%d:%d", &addr[0], &addr[1], &addr[2], &addr[3], &tempPort) == 5) {
		IPAddress tempAddr = IPAddress(addr[0], addr[1], addr[2], addr[3]);
		if (tempAddr == localIP()) {
			// Received our own publish, this is normal
			Serial.printlnf("got own publish %s", data);
		}
		else {
			peerAddr = tempAddr;
			peerPort = tempPort;
			Serial.printlnf("got peer %s:%d", peerAddr.toString().c_str(), peerPort);
		}
	}
}
```

Here's the output from one Electron, it's sending, but not receiving.

```
$ particle serial monitor
Opening serial monitor for com port: "/dev/cu.usbmodemFD3331"
server=10.41.110.59:7000
published 10.41.110.59:7000
got own publish 10.41.110.59:7000
published 10.41.110.59:7000
got peer 10.43.2.184:7000
<<< seq=0 10.41.110.59:7000 -> 10.43.2.184:7000
got own publish 10.41.110.59:7000
<<< seq=1 10.41.110.59:7000 -> 10.43.2.184:7000
published 10.41.110.59:7000
got peer 10.43.2.184:7000
got own publish 10.41.110.59:7000
<<< seq=2 10.41.110.59:7000 -> 10.43.2.184:7000
<<< seq=3 10.41.110.59:7000 -> 10.43.2.184:7000
published 10.41.110.59:7000
got peer 10.43.2.184:7000
got own publish 10.41.110.59:7000
<<< seq=4 10.41.110.59:7000 -> 10.43.2.184:7000
<<< seq=5 10.41.110.59:7000 -> 10.43.2.184:7000
published 10.41.110.59:7000
got peer 10.43.2.184:7000
got own publish 10.41.110.59:7000
<<< seq=6 10.41.110.59:7000 -> 10.43.2.184:7000
```

Here's the output from the other Electron. Same thing, sending but not receiving.

```
$ particle serial monitor
? Which device did you mean? /dev/cu.usbmodemFD1161 - Electron
Opening serial monitor for com port: "/dev/cu.usbmodemFD1161"
got peer 10.41.110.59:7000
<<< seq=0 10.43.2.184:7000 -> 10.41.110.59:7000
<<< seq=1 10.43.2.184:7000 -> 10.41.110.59:7000
published 10.43.2.184:7000
got own publish 10.43.2.184:7000
got peer 10.41.110.59:7000
<<< seq=2 10.43.2.184:7000 -> 10.41.110.59:7000
<<< seq=3 10.43.2.184:7000 -> 10.41.110.59:7000
published 10.43.2.184:7000
got own publish 10.43.2.184:7000
got peer 10.41.110.59:7000
<<< seq=4 10.43.2.184:7000 -> 10.41.110.59:7000
<<< seq=5 10.43.2.184:7000 -> 10.41.110.59:7000
published 10.43.2.184:7000
got own publish 10.43.2.184:7000
got peer 10.41.110.59:7000
```

In the test above, I used a 2G and a 3G Electron. In the test below, both were 3G Electrons and their IP addresses were closer (both in the 10.41.x.x) IP address range, but they still could not communicate directly.

```
published 10.41.244.150:7000
got own publish 10.41.244.150:7000
got peer 10.41.110.59:7000
<<< seq=0 10.41.244.150:7000 -> 10.41.110.59:7000
published 10.41.244.150:7000
got own publish 10.41.244.150:7000
<<< seq=1 10.41.244.150:7000 -> 10.41.110.59:7000
got peer 10.41.110.59:7000
```

And I did run the test over Wi-Fi using two Photons. That worked fine.

```
>>> 192.168.2.198:7000 seq=0 192.168.2.198:7000 -> 192.168.2.180:7000
>>> 192.168.2.198:7000 seq=1 192.168.2.198:7000 -> 192.168.2.180:7000
got peer 192.168.2.198:7000
<<< seq=0 192.168.2.180:7000 -> 192.168.2.198:7000
>>> 192.168.2.198:7000 seq=2 192.168.2.198:7000 -> 192.168.2.180:7000
<<< seq=1 192.168.2.180:7000 -> 192.168.2.198:7000
>>> 192.168.2.198:7000 seq=3 192.168.2.198:7000 -> 192.168.2.180:7000
<<< seq=2 192.168.2.180:7000 -> 192.168.2.198:7000
```

## TCP using private IP addresses

I was almost certain this would not work after the tests above, but just to be sure:

Server code:

```
#include "Particle.h"

const int LOCAL_TCP_PORT = 7000;
const unsigned long PUBLISH_INTERVAL_MS = 30000;
const char *EVENT_NAME = "tcpServer";

TCPServer server(LOCAL_TCP_PORT);
unsigned long lastPublish = 0;

#if Wiring_WiFi
#define localIP WiFi.localIP
#else
#define localIP Cellular.localIP
#endif

void setup() {
	Serial.begin(9600);

	server.begin();

	Serial.printlnf("server=%s:%d", localIP().toString().c_str(), LOCAL_TCP_PORT);
}

void loop() {
	TCPClient client = server.available();
	if (client) {
		// I didn't expect this to work, so I didn't write the code to handle incoming connections,
		// other than to just close the connection.
		Serial.printlnf("connection attempted from %s", client.remoteIP().toString().c_str());
		client.stop();
	}

	if (millis() - lastPublish >= PUBLISH_INTERVAL_MS) {
		lastPublish = millis();

		char data[64];
		snprintf(data, sizeof(data), "%s:%d", localIP().toString().c_str(), LOCAL_TCP_PORT);
		Particle.publish(EVENT_NAME, data, PRIVATE);
		Serial.printlnf("published %s", data);
	}
}
```


Client code:

```
#include "Particle.h"

const unsigned long CONNECT_INTERVAL_MS = 15000;
const char *EVENT_NAME = "tcpServer";

void subHandler(const char *event, const char *data);

TCPClient client;
unsigned long lastConnect = 0;
IPAddress serverAddr;
int serverPort;
int seq = 0;

#if Wiring_WiFi
#define localIP WiFi.localIP
#else
#define localIP Cellular.localIP
#endif

void setup() {
	Serial.begin(9600);
	Particle.subscribe(EVENT_NAME, subHandler, MY_DEVICES);

}

void loop() {
	if (serverAddr && (millis() - lastConnect) >= CONNECT_INTERVAL_MS) {
		lastConnect = millis();

		Serial.printlnf("attempting connection to %s:%d", serverAddr.toString().c_str(), serverPort);

		if (client.connect(serverAddr, serverPort)) {
			Serial.println("connected!");
			client.printlnf("hello %d", seq++);
			client.stop();
		}
		else {
			Serial.println("failed to connect");
		}
	}

}

void subHandler(const char *event, const char *data) {
	int addr[4];
	if (sscanf(data, "%d.%d.%d.%d:%d", &addr[0], &addr[1], &addr[2], &addr[3], &serverPort) == 5) {
		serverAddr = IPAddress(addr[0], addr[1], addr[2], addr[3]);
		lastConnect = 0 - CONNECT_INTERVAL_MS;
		Serial.printlnf("got server %s:%d", serverAddr.toString().c_str(), serverPort);
	}
}

```

Output:

```
got server 10.41.110.59:7000
attempting connection to 10.41.110.59:7000
failed to connect
attempting connection to 10.41.110.59:7000
failed to connect
```


## TCP peer-to-peer using hole punching

This was also unlikely to succeed given the situation above, but there's another reason it won't work:

As far as I can tell, the [technique for doing peer-to-peer TCP](http://www.brynosaurus.com/pub/net/p2pnat/) between two devices both behind NAT won't work with the Electron. In order to make it work, you need to be able to specify the port the packet comes from for TCP. This does not appear to be possible using the u-blox hardware:

From the u-blox documentation for create socket (+USOCR):

> Creates a socket and associates it with the specified protocol (TCP or UDP), returns a number identifying the socket. Such command corresponds to the BSD socket routine. Up to 7 sockets can be created. It is possible to specify the local port to bind within the socket in order to send data from a specific port. The bind functionality is supported only for UDP sockets.






