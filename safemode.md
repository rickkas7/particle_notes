# Safe mode explained

The Particle Photon, P1, and Electron support safe mode, breathing magenta. 

Safe mode allows network connectivity but does not run your user firmware. This is most useful when you want to OTA (over-the-air) cloud flash code to your device but:

- You have a program that runs with the cloud connection turned off
- Your program uses sleep mode to save power
- You have a bug in your code that prevents cloud access (breathing green)

## Entering Safe Mode (Photon)

You enter safe mode by holding down RESET and SETUP, releasing RESET and continuing to hold down SETUP until the main status LED blinks magenta, then release.

Because Safe Mode requires Wi-Fi, the Photon will then go through the normal states: blinking white, blinking green, fast blinking green, blinking cyan, fast blinking cyan, except the last state will be breathing magenta, instead of breathing cyan.

If you have something that's preventing Wi-Fi access, such a Wi-Fi access point problem or a configuration problem, safe mode won't help. It's not designed for that; it's designed to allow OTA flashing.

## Entering Safe Mode (Electron)

You enter safe mode by holding down RESET and MODE, releasing RESET and continuing to hold down MODE until the main status LED blinks magenta, then release.

Because Safe Mode requires a cellular connection, the Electron will then go through the normal states: blinking white, blinking green, fast blinking green, blinking cyan, fast blinking cyan, except the last state will be breathing magenta, instead of breathing cyan.

If you have something that's preventing cellular access, such a bad cellular signal, antenna problems, or an SIM activation problem, safe mode won't help. It's not designed for that; it's designed to allow OTA flashing.

## Safe mode (blinking magenta)

On the Electron, sometimes when you flash user firmware over USB, the Electron will enter safe mode (blinking magenta). This is typically caused by a user firmware and system firmware mismatch. A slightly different thing happens with the Photon, see the Safe mode healer section, below.

When you build user firmware, it contains not only the code you have written, but also some parts that communicate with the system firmware. It also lists the minimum system firmware that your firmware will run on. For example, the Particle.keepAlive() call was added in 0.5.0. If you use that call from your code, you can't run your code on 0.4.8 because the system side of that code does not exist.

### Particle Build (Web IDE)
Click on the Devices icon on the left-hand side (the circle with 4 lines, the target icon). Make sure your device has a gold star to the left of its name. When you click on the arrow, it will expand with an area including the device ID and a popup menu for the system firmware version to build with. 

You can also use Particle Build to make binary files that you can flash using USB to an Electron. Click on the Code icon (the <> icon). The cloud icon to the right and slightly above your project name allows you to download a firmware binary file.

### Particle Dev (Atom IDE)
Particle Dev can only build for the most recent release version of the Particle Firmware. The easiest solution is to upgrade the system firmware on your Electron. Or you can use Particle Dev as the editor, and use the Particle CLI to compile.

Note that the release version is one without a "rc" in the version. For example, if there is an 0.5.2 and an 0.5.3-rc1, then Particle Dev will use 0.5.2. The releases are documented on the [Particle Firmware Update Thread] (https://community.particle.io/t/particle-firmware-update-thread/14378/33).


### Particle CLI
The Particle CLI defaults to compiling with the most recent release version of the Particle Firmware. You, can, however, change the setting using the command line.

```
particle compile electron myprogram.ino --target 0.4.8 --saveTo firmware.bin
particle flash --usb firmware.bin
```

There's more information in the [CLI documentation] (https://docs.particle.io/reference/cli/#particle-flash).


## Safe mode healer

The process in the previous section was kind of a pain, so on the Photon/P1 the safe mode healer is used. If the Photon detects a newer system firmware version is required, it will automatically download and install the newer system firmware. Fast blinking magenta indicates that this is occurring, and typically two bouts of fast blinking magenta occur, one for each system part.

On regular Electrons this is not done, because it could use a lot of data accidentally downloading system firmware. Also, it could take a while over 2G.

On Electrons that are part of a product creator product, safe mode healer is enabled. The logic there is that if you release firmware from the product dashboard, you presumably would know it's about to kick off a possibly expensive operation. This also provides an easy way to upgrade the system firmware many remote Electrons at once, with a single click.


## About breathing green

If your program is breathing cyan normally, then switches to breathing green, you are probably blocking cloud processing. When in breathing green state, you won't be able to OTA cloud flash, but you can use safe mode (breathing magenta) to cloud flash new code.

For example, this program will breathe cyan for about 10 seconds then breathe green and stop responding to the cloud. **Don't do this:**

```
void setup() {
}

void loop() {
    // Don't do this! It causes blinking green because you've blocked 
    // loop from returning.
    while(true) {
    }
}
```

The correct solution is to remove that inner while loop. Or you can add [Particle.process()] (https://docs.particle.io/reference/firmware/electron/#particle-process-) calls in any inner loops that block loop().

### Using system thread

Another way to solve this problem is to use [SYSTEM_THREAD(ENABLED)] (https://docs.particle.io/reference/firmware/electron/#system-thread). This separates the cloud processing code from your user code, so you're less likely to interfere with it.

```
SYSTEM_THREAD(ENABLED);

void setup() {
    // OK to do things like Particle.function and Particle.variable here
    
    // If you do any Particle.publish  in setup(), do this too:
    waitUntil(Particle.connected);
    Particle.publish("testEvent", "testing", PRIVATE);
}

void loop() {
}
```

