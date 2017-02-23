# Particle Photon tips for classrooms

**Some useful tips for using the Particle Photon in classrooms, hackathons, etc.**

## Option 1: Self-configuration

With the self-configuration option, students:

- Create their own Particle accounts, either with school or personal email.
- Set up Wi-Fi and claim the Photon to their account with their personal phones.

This method is allows factory-fresh Photons to be unboxed and used immediately, however there are some caveats:

- Some phones have difficulties setting up a Photon (currently many Samsung Galaxy Note devices and some other Android phones).
- This process is hard to debug since there isn't much feedback if something goes wrong.
- Wi-Fi based configuration always uses Wi-Fi channel 1 when in listening mode (blinking blue). With a large number of Photons simultaneously using the same Wi-Fi channel interference can result. It may be helpful to stagger turning on the Photons.

### Setting up an instructor station

It's a good idea to set up an instructor station that has the [Particle CLI](https://docs.particle.io/guide/tools-and-features/cli/photon/) installed. This can be used to help out students who don't have a phone or whose phone does not work, and also troubleshoot some more difficult issues.


If the student is unable to claim the device, these commands usually solve the problem:

```
particle identify
particle serial wifi
```

The `particle identify` command prints out the device ID of the Photon. This is important because it will be necessary to for the student to enter this to claim the device. 

The `particle serial wifi` command sets up the Wi-Fi network but does not claim the device, allowing the student to claim the device on their own account.

If the Photon gets all the way to breathing cyan, then the student can log into https://build.particle.io and uses the Devices icon (circle with 4 lines) and uses the **Add Device** option, entering the device ID for the Photon.


## Option 2: Preconfiguring Wi-Fi

Another option is to set up the Photon Wi-Fi on each Photon ahead of time. This simplifies setup for the student:

- Create their own Particle accounts, either with school or personal email, typically from a web browser.
- Claim the device to their Particle account using Particle Build (Web IDE) or Particle Dev (Atom IDE), whatever you are using for programming.
- No phone is needed for setup.

### Student process

The student:

- Receives a Photon with the Wi-Fi configured, so plugging it in should go through the normal sequence of white, blinking green, blinking cyan (light blue), fast blinking cyan, and breathing cyan.

- Also receives the device ID for the Photon, a 24-character combination of numbers and the letters a-f. Note that the letters should always be entered in lower case.

- Goes to https://build.particle.io and logs in or creates an Particle account.

- Uses the Devices icon (circle with 4 lines) and uses the **Add Device** option, entering the device ID for the Photon.

### Pre-configuration process

The easiest way to pre-configure Wi-Fi is using the Particle CLI. With the Photon in listening mode (blinking blue), use the commands:

```
particle identify
particle serial wifi
```

The `particle identify` command prints out the device ID of the Photon. This is important because it will be necessary to for the student to enter this to claim the device. 

The `particle serial wifi` command sets up the Wi-Fi network but does not claim the device, which is perfect for this application.


## Debugging tips

The normal sequence of the status LED is:

- White
- Blinking green
- Blinking cyan
- Fast blinking cyan
- Breathing cyan

The point where it stops can be helpful in determining what went wrong.

### Stops at blinking green

If some Photons cannot get past this state:

- If your network has run out of available IP addresses in the DHCP address pool, the Photon will stop at blinking green. The network administrator can usually check this.

- If your network restricts access to certain devices by Ethernet MAC address, you will need to make sure the affected Photon is allowed. Your network administrator will tell if you if this is necessary. You can find your MAC address using the instructions [here](https://github.com/rickkas7/particle_notes/tree/master/blinking-green). This is not common.

If no Photons can get past this state:

- If you are using a corporate or school network that uses WPA2 Enterprise, the Photon cannot be used at this time. If you require both a username and a password, or see a mention of 802.1(x), or RADIUS you're using WPA2 Enterprise.

- If you are using a network that takes you to a web page where you need to either sign in or agree to terms and service when you first connect, using the Photon directly will be difficult or impossible. This is the case in some hotels and public Wi-Fi networks and is often referred to as Captive Portal.

- If your Wi-Fi network uses 5 GHz only, instead of the more common 2.4 GHz, the Photon cannot be used. The Wi-Fi radio is only compatible with 2.4 GHz networks.

### Blinking cyan or fast blinking cyan

- This can sometimes indicate a problem with DNS or a Firewall. Using the diagnostic program in the following section will show when this is occurring.

- Photons running system firmware 0.6.0 and later require working DNS (domain name service) to connect to the cloud. If your DHCP server is returning an invalid DNS server, or the DNS server is not functioning correctly, the Photon may not be able to connect to the cloud.

- The firewall must allow outbound TCP access to port 5683 (CoAP) on device.spark.io (currently 54.173.1.44 but the address may change) to allow Photons to connect to the cloud. 

- It should also allow outbound https (port 443) to build.particle.io, console.particle.io and api.particle.io for building and using the API.

### Fast blinking cyan with red or orange blinks

This sometimes indicates a problem with the server or device keys.

Put the Photon into Listening mode (blinking blue) by holding down SETUP until it blinks blue. Then issue the CLI command:

```
particle identify
```

Save the Device ID; you’ll need it later.

Then put the Photon in DFU mode by holding down both the RESET and SETUP buttons, releasing RESET and continuing to hold down SETUP until it blinks yellow and issue the commands below, in order.

```
particle keys server
particle keys doctor YOUR_DEVICE_ID
```

## Running the cloud debug program

Sometimes it's not possible to tell what's going wrong just by monitoring the lights. Flashing this firmware to the device will print out additional debugging information. The log file can be sent to [Particle support](http://support.particle.io) for further investigation.

[https://github.com/rickkas7/photon-clouddebug](https://github.com/rickkas7/photon-clouddebug)


## Recycling Photons

If you reuse the Photons with another class, it will be necessary to do some work to clean them up. You can save a great deal of effort by requesting that the departing students unclaim the devices from their accounts. It's possible to recover if they don't, but it adds several steps to the process.

Complete instructions are here: [https://github.com/rickkas7/photonreset](https://github.com/rickkas7/photonreset).

