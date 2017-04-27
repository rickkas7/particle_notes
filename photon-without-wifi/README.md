# Using a Photon without Wi-Fi

In its default configuration (system mode AUTOMATIC without system threading), the Photon requires a Wi-Fi connection to operate, and won't even run your user firmware. 

This is just the default configuration, however, and there are numerous ways to use the Photon without Wi-Fi or the cloud.

## Running with or without cloud

The easiest way to make your code run whether you have Wi-Fi or a cloud connection is to use [SYSTEM\_THREAD](https://docs.particle.io/reference/firmware/#system-thread) mode.

```
SYSTEM_THREAD(ENABLED);
```

You insert this at the top of your source file. What it does is run the cloud processing in a separate system thread and your code will run regardless of whether you have a connection or not.

The only thing to be careful is that when you do this, your loop code will run before connected to the cloud. Because of this, it's useful to check for a connection before publishing events:

You might also do something like this in loop() when using [Particle.publish](https://docs.particle.io/reference/firmware/photon/#particle-publish-):

```
if (Particle.connected()) {
	Particle.publish("myEvent", PRIVATE);
}
```

The same should be done for [Particle.subscribe](https://docs.particle.io/reference/firmware/photon/#particle-subscribe-).

It's not necessary to check before [Particle.variable](https://docs.particle.io/reference/firmware/photon/#particle-variable-) or [Particle.function](https://docs.particle.io/reference/firmware/photon/#particle-function-). These should always be made early in setup() and should not wait for a cloud connection.

## Running with Wi-Fi off

If you don't intend to use Wi-Fi at all, you can turn it off using the [MANUAL system mode](https://docs.particle.io/reference/firmware/photon/#manual-mode).

```
SYSTEM_MODE(MANUAL);
```

When you do this, the Photon will breathe white instead of cyan (light blue) and will not attempt to connect to the cloud.

If you want to over-the-air (OTA) flash your Photon with new code, you can use [Safe Mode](https://docs.particle.io/guide/getting-started/modes/photon/#safe-mode). 

Press RESET and SETUP at the same time. Release RESET and continue to hold down SETUP until the status LED blinks magenta (red and blue at the same time). Release SETUP.

Safe mode connects to the cloud but does not run your user firmware, so Wi-Fi and the cloud connection will stay on so you can do an OTA flash.

## Running with Wi-Fi but no cloud

It's also possible to run the Photon with Wi-Fi enabled but no cloud connection. You might do this if you are using the Photon on an isolated network, not connected to the Internet, but you still have a Wi-Fi access point to connect to.

This mode allows communication between devices on the local Wi-Fi network using [TCP](https://docs.particle.io/reference/firmware/photon/#tcpclient) or [UDP](https://docs.particle.io/reference/firmware/photon/#udp). You can't use things like [Particle.publish](https://docs.particle.io/reference/firmware/photon/#particle-publish-) without cloud access.

To do this you'll probably use [SEMI\_AUTOMATIC system mode](https://docs.particle.io/reference/firmware/photon/#semi-automatic-mode), though sometimes you may prefer MANUAL.

```
SYSTEM_MODE(SEMI_AUTOMATIC);
```

In your setup() function, you'll probably use [WiFi.connect](https://docs.particle.io/reference/firmware/photon/#connect-).

```
WiFi.on();
WiFi.connect();
```

This will connect Wi-Fi only, not the cloud, and you'll get breathing green instead of breathing cyan (light blue).

## Running with SoftAP

In SoftAP mode, the Photon itself acts as a Wi-Fi access point. In this mode, another computer or phone can connect to the Photon Wi-Fi ("Photon-XXXX") and communicate data directly by using [TCP](https://docs.particle.io/reference/firmware/photon/#tcpclient) or [UDP](https://docs.particle.io/reference/firmware/photon/#udp). You can't use things like [Particle.publish](https://docs.particle.io/reference/firmware/photon/#particle-publish-) without cloud access.

To do this, you'll need to use [SYSTEM\_THREAD](https://docs.particle.io/reference/firmware/#system-thread) mode.

```
SYSTEM_THREAD(ENABLED);
```

You'll also need to probably use [SEMI\_AUTOMATIC system mode](https://docs.particle.io/reference/firmware/photon/#semi-automatic-mode), though sometimes you may prefer MANUAL.

```
SYSTEM_MODE(SEMI_AUTOMATIC);
```

In your setup() function, you'll probably use [WiFi.listen](https://docs.particle.io/reference/firmware/photon/#listen-).

```
WiFi.on();
WiFi.listen();
```

In listening mode, the Photon will blink dark blue.

