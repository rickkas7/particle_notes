# Setting up an out-of-area Electron

The Particle Electron comes in three varieties, global 2G (G350), and two varieties of 3G: U260 (Americas/Australia) and U270 (Europe/Asia/Africa).

This note explains how to set up a Electron that you want to ship to another location, such as for a demo. For example, you want to set up a U270 in the United States for a demo in Europe.

This technique also applies in areas where 2G is no longer supported, for example if you wanted to set up a 2G Electron in Japan for shipment to Europe.

## Particle SIM card

The Particle SIM card is global. You can set up the SIM in one location and use it in another location, at least for a short demo.

If you register a SIM in, say, the United States (US$0.99/megabyte) and then use it for months in India (US$2.99/megabyte) that would be considered cheating the system. But using it for a week or two for a demo or while traveling is fine.

If you want to set up the SIM card ahead of time you can use the right-side option at [https://setup.particle.io] (https://setup.particle.io) to activate only the Particle SIM card.

You can also set up the SIM from the setup web site when you get there, of course.

## Electron

Here's where things get a little trickier. You need to be online (breathing cyan) in order to complete the claiming process. This is impossible when you have an out-of-area Electron.

Fortunately, you can still load code by USB before the Electron has been claimed. So, for example, you could use the [Particle CLI] (https://particle.io/cli) command:

```
particle flash --usb firmware.bin
```

Using this technique you can preload your code. You can also update the system firmware, if desired.

This is also a good time to note the device ID and ICCID, since you may need them later.
		
Connect the device to your computer using USB and put the device in [listening mode] (https://docs.particle.io/guide/getting-started/modes/electron/#listening-mode) (blinking dark blue) by holding down the SETUP (or MODE) button until the main status LED blinks dark blue, about 3 seconds.

Then issue the command:

```
particle identify
```

This will print out your device ID and ICCID.


## The final step

Once the device reaches its actual location it will now have your code, and a SIM that should allow it to get online, breathing cyan. So power it up in the demo location, wait for it to reach breathing cyan, and then claim it.

This can be using the command line:

```
particle device add YOUR_DEVICE_ID
```

You can even do it remotely, issuing the command from the United States for the device in Europe.

You can also claim a device by its device ID from [https://build.particle.io] (https://build.particle.io), or you can use Particle phone apps, if desired.

If you're in a remote location and you've forgotten your device ID and don't have access to a laptop with the Particle CLI, here are some [other ways you can get the device ID] (https://community.particle.io/t/finding-your-device-id/26531).
