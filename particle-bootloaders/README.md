# Particle device boot loaders

All of the Particle devices use a boot loader. This small bit of code is the first thing that runs when the processor boots, and is responsible for initial processor setup, DFU mode, and loading system firmware.

## Automatic updating of the boot loader

In general you do not need to manage the boot loader directly. System firmware will update the boot loader itself when needed, and as you upgrade the system firmware.

## What version of the boot loader do I have?

Put the device in listening mode (blinking dark blue) by holding down the SETUP/MODE button and use the Particle CLI particle serial inspect command to find out what version of the boot loader is installed:

```
$ particle serial inspect
Platform: 6 - Photon
Modules
  Bootloader module #0 - version 11, main location, 16384 bytes max size
    Integrity: PASS
    Address Range: PASS
    Platform: PASS
    Dependencies: PASS
  System module #1 - version 108, main location, 262144 bytes max size
    Integrity: PASS
    Address Range: PASS
    Platform: PASS
    Dependencies: PASS
```

This shows that the Photon is running with system firmware 0.6.2 (version 108) and the boot loader from 0.6.2 (version 11). The mapping of these versions can be found on the [version mapping table page](https://github.com/spark/firmware/blob/develop/system/system-versions.md).

At the time of writing, the most common boot loader versions are:

- 7 (system firmware 0.4.9 - 0.6.0)
- 9 (0.6.1rc, 0.6.1 final, 0.6.2rc)
- 11 (0.6.2)
- 100 (0.7.0)

## Boot loader downloads 

You can download the v7 (0.4.9) bootloaders for the Photon, P1, and Electron on the [JTAG instructions page](https://docs.particle.io/faq/particle-tools/jtag/electron/#programming-the-boot-loader).

The boot loaders v11 (0.6.2) and v100 (0.7.0) can be found on the [0.7.0 release page](https://github.com/spark/firmware/releases/tag/v0.7.0-rc.2).

## Dim D7 (corrupted boot loader)

One of the things that can happen is that the boot loader sector (sector 0) becomes corrupted to erased. When this happens, when the processor starts the only thing that happens is the D7 LED will be on dimly. This is a side effect of being in JTAG/SWD mode. 

The only thing you can do when this happens is reprogram the boot loader using JTAG/SWD. Since there is no code running at all, you can't use other modes like DFU mode and USB.

## Updating the bootloader in listening mode

Though somewhat counter-intuitive, you can update the boot loader when in listening mode (blinking blue), but not in DFU mode (blinking yellow).

The reason is that DFU mode runs from the boot loader flash memory sector. The STM32 processors used in the Particle devices run code directly from flash memory, not copied into RAM, so you can't reprogram the boot loader while running the boot loader.

Put the device in listening mode (blinking dark blue) by holding down the SETUP/MODE button.

Then you can use the CLI to flash in USB serial mode, for example:

```
$ particle flash --serial bootloader-photon.bin 
```

Note that there are different boot loader binaries for each platform (Photon, P1, Electron, etc.).

This technique can be handy for manually downgrading the boot loader, but make sure you install the older version of system firmware first. The reason is that the device will reboot after flashing the boot loader by serial, and if you still have a newer version of system firmware, it will upgrade the boot loader again.

This can also be done OTA by specifying the device name or device ID instead of --serial, if the device is still able to get to breathing cyan or breathing magenta.


## Updating the boot loader by JTAG/SWD

If you have a corrupted or erased boot loader (Dim D7) or another problem that prevents getting into listening mode (blinking blue) and requires manually updating the boot loader, you'll need to use JTAG/SWD.

The [instructions for using JTAG/SWD mode are here](https://docs.particle.io/faq/particle-tools/jtag/electron/).


## Special considerations for downgrading from 0.7.0

System version 0.7.0 is a special case when it comes to the boot loader. While the 0.6.2 boot loader can safely run system firmware back to 0.4.9, this is not the case with the 0.7.0 boot loader (version 100).

When you downgrade from 0.7.0 to an earlier version like 0.6.2, you need to downgrade in a specific order, as described in the [release notes for 0.7.0](https://community.particle.io/t/particle-firmware-updates-thread/14378/49).


### If you have upgraded to 0.7.0 and subsequently downgraded to 0.6.x or earlier

If you previously upgraded to 0.7.0 and then downgraded, by particle update, or by the particle device doctor, to 0.6.2 without manually downgrading the boot loader, you'll have to upgrade to 0.7.0 again before downgrading again (sorry).

#### Photon

From the [release site](https://github.com/spark/firmware/releases/tag/v0.7.0-rc.3), download:

- [system-part1-0.7.0-rc.3-photon.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/system-part1-0.7.0-rc.3-photon.bin)
- [system-part2-0.7.0-rc.3-photon.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/system-part2-0.7.0-rc.3-photon.bin)

Then the Photon in DFU mode (blinking yellow) and apply the update:

```
particle flash --usb system-part1-0.7.0-rc.3-photon.bin
particle flash --usb system-part2-0.7.0-rc.3-photon.bin
```

#### P1

From the [release site](https://github.com/spark/firmware/releases/tag/v0.7.0-rc.3), download:

- [system-part1-0.7.0-rc.3-p1.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/system-part1-0.7.0-rc.3-p1.bin)
- [system-part2-0.7.0-rc.3-p1.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/system-part2-0.7.0-rc.3-p1.bin)

Then the P1 in DFU mode (blinking yellow) and apply the update:

```
particle flash --usb system-part1-0.7.0-rc.3-p1.bin
particle flash --usb system-part2-0.7.0-rc.3-p1.bin
```

#### Electron

From the [release site](https://github.com/spark/firmware/releases/tag/v0.7.0-rc.3), download:

- [system-part1-0.7.0-rc.3-electron.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/system-part1-0.7.0-rc.3-electron.bin)
- [system-part2-0.7.0-rc.3-electron.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/system-part2-0.7.0-rc.3-electron.bin)
- [system-part3-0.7.0-rc.3-electron.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/system-part3-0.7.0-rc.3-electron.bin)

Then the Electron in DFU mode (blinking yellow) and apply the update:

```
particle flash --usb system-part1-0.7.0-rc.3-electron.bin
particle flash --usb system-part2-0.7.0-rc.3-electron.bin
particle flash --usb system-part3-0.7.0-rc.3-electron.bin
```


### Downgrading from 0.7.0 to 0.6.2

#### Photon

From the [release site](https://github.com/spark/firmware/releases/tag/v0.6.2), download:

- [system-part1-0.6.2-photon.bin](https://github.com/spark/firmware/releases/download/v0.6.2/system-part1-0.6.2-photon.bin)
- [system-part2-0.6.2-photon.bin](https://github.com/spark/firmware/releases/download/v0.6.2/system-part2-0.6.2-photon.bin)
- [bootloader-0.6.2-photon.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/bootloader-0.6.2-photon.bin)

Put the device in listening mode (blinking blue) and apply the updates in this order:

```
particle flash --serial system-part2-0.6.2-photon.bin
particle flash --serial bootloader-0.6.2-photon.bin
particle flash --serial system-part1-0.6.2-photon.bin
```

Note: It must be done in this order (2, bootloader, 1). This update can also be done OTA. The bootloader can only be flashed serial or OTA, you cannot flash the bootloader in DFU mode (blinking yellow).


#### P1

From the [release site](https://github.com/spark/firmware/releases/tag/v0.6.2), download:


- [system-part1-0.6.2-p1.bin](https://github.com/spark/firmware/releases/download/v0.6.2/system-part1-0.6.2-p1.bin)
- [system-part2-0.6.2-p1.bin](https://github.com/spark/firmware/releases/download/v0.6.2/system-part2-0.6.2-p1.bin)
- [bootloader-0.6.2-p1.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/bootloader-0.6.2-p1.bin)

Put the device in listening mode (blinking blue) and apply the updates in this order:

```
particle flash --serial system-part2-0.6.2-p1.bin
particle flash --serial bootloader-0.6.2-p1.bin
particle flash --serial system-part1-0.6.2-p1.bin
```

Note: It must be done in this order (2, bootloader, 1). This update can also be done OTA. The bootloader can only be flashed serial or OTA, you cannot flash the bootloader in DFU mode (blinking yellow).

#### Electron

From the [release site](https://github.com/spark/firmware/releases/tag/v0.6.2), download:

- [system-part1-0.6.2-electron.bin](https://github.com/spark/firmware/releases/download/v0.6.2/system-part1-0.6.2-electron.bin)
- [system-part2-0.6.2-electron.bin](https://github.com/spark/firmware/releases/download/v0.6.2/system-part2-0.6.2-electron.bin)
- [system-part3-0.6.2-electron.bin](https://github.com/spark/firmware/releases/download/v0.6.2/system-part3-0.6.2-electron.bin)
- [bootloader-0.6.2-electron.bin](https://github.com/spark/firmware/releases/download/v0.7.0-rc.3/bootloader-0.6.2-electron.bin)
 
Put the device in listening mode (blinking blue) and apply the updates in this order:

```
particle flash --serial system-part3-0.6.2-electron.bin
particle flash --serial system-part2-0.6.2-electron.bin
particle flash --serial system-part1-0.6.2-electron.bin
particle flash --serial bootloader-0.6.2-electron.bin
```

This update can also be done OTA. The bootloader can only be flashed serial or OTA, you cannot flash the bootloader in DFU mode (blinking yellow).


