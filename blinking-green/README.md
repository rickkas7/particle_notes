# Blinking Green (Wi-Fi Connection) Issues

If you configure your Photon (or P1) and only get to blinking green, here are some tips that may help:

First, a few known working situations that the Photon is not compatible with:

- If you are using a corporate or school network that uses WPA2 Enterprise, the Photon cannot be used at this time. If you require both a username and a password, or see a mention of 802.1(x), or RADIUS you're using WPA2 Enterprise.

- If you are using a network that takes you to a web page where you need to either sign in or agree to terms and service when you first connect, using the Photon directly will be difficult or impossible. This is the case in some hotels and public Wi-Fi networks and is often referred to as Captive Portal.

- If your Wi-Fi network uses 5 GHz only, instead of the more common 2.4 GHz, the Photon cannot be used. The Wi-Fi radio is only compatible with 2.4 GHz networks.

For home users:

- If your router uses WEP encryption, you should upgrade your router to something more secure. However it may be possible to connect your Photon with some difficulty by following the [WEP configuration instructions](http://rickkas7.github.io/wep/).

And the less common situations:

- If your Wi-Fi network does not support DHCP, and only uses static IP addresses, it is possible, though somewhat difficult, to set up a Photon. You will need to flash a program like this by USB to set the IP address:

```
#include "Particle.h"

SYSTEM_THREAD(ENABLED);

void setup() {
	Serial.begin(9600);

    IPAddress myAddress(192,168,1,33);
    IPAddress netmask(255,255,255,0);
    IPAddress gateway(192,168,1,1);
    IPAddress dns(192,168,1,1);
    WiFi.setStaticIP(myAddress, netmask, gateway, dns);

    // now let's use the configured IP
    WiFi.useStaticIP();

    // To switch back to dynamic IP, use:
    // WiFi.useDynamicIP();

    // Turn on the D7 LED so we know the operation completed
    pinMode(D7, OUTPUT);
    digitalWrite(D7, HIGH);
}

void loop() {
}
```

- If the Wi-Fi network restricts access to known device Ethernet MAC addresses, you'll need to determine the MAC address and give it to the network administrator. Flash this program by USB, then connect a serial monitor and view the output to find the MAC address.

```
#include "Particle.h"

SYSTEM_THREAD(ENABLED);

void setup() {
	Serial.begin(9600);

	// To allow more time to connect by serial
	delay(10000);

	byte mac[6];
	WiFi.macAddress(mac);

	char buf[256];
	snprintf(buf, sizeof(buf), "%02x:%02x:%02x:%02x:%02x:%02x",
			mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
	Serial.println(buf);
}

void loop() {
}
```
