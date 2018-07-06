# Disabling DFU mode 

It is possible to disable DFU mode access by USB by modifying the bootloader. This may provide some additional security, though without also disabling JTAG data can still be read out of the device. 

Also it's hard to prevent future system firmware upgrades from removing your custom bootloader. 

And it will make it very difficult to recover from some situations like bad device keys.

However, here's what you have to do.

## You will need

- A working [gcc-arm local build chain](https://docs.particle.io/faq/particle-tools/local-build/). You can't use the cloud compilers.
- [Firmware source](https://github.com/particle-iot/firmware/) for the correct release.
- Optional: A JTAG/SWD programmer in case you flash a bad bootloader, as it's the only way to recover from that.

The bootloader must be the appropriate one for your system firmware version. The bootloader is not changed with every system firmware update, but you do need to make sure you have the right one. [This table](https://github.com/spark/firmware/blob/develop/system/system-versions.md) shows all of the versions.

If, for example, you're using system firmware 0.7.0 you'd check out the branch `release/v0.7.0`.

## Building the bootloader

To build the bootloader, you typically do something like:

```
cd firmware/bootloader
make all PLATFORM=photon
```

Other common platforms are electron and p1.

To test it out, put the device in listening mode (blinking dark blue) and:

```
particle flash --serial ../build/target/bootloader/platform-6-lto/bootloader.bin
```

The platform directory will be different for other platforms (Electron = 10, P1 = 8).

## Disabling DFU mode

To actually disable DFU mode, edit src/main.c. Comment out this line:

```
HAL_DFU_USB_Init();
```

In 0.7.0, it's line 458.

Then build as you did above. You'll still go into blinking yellow, but the DFU device won't exist. For example, if you do:

```
dfu-util -l 
```

the device won't show up now.

## Listening mode

Of course this will also point out that you'll need to disable listening mode as well, otherwise the bootloader can be reprogrammed that way. You can do that from your user firmware by detecting that you're going into listening mode, then exit listening mode. 

However, that wouldn't prevent going into listening mode from safe mode. 

Anyway, you can see that this starts down a horrible rabbit hole of mitigations, so maybe this isn't a great idea, after all.
