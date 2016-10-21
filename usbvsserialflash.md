# USB vs. Serial flash

The --serial flash can fail because your code runs at the same time as the update, and it’s easy to accidentally interfere with it. I prefer to use the --usb (DFU) flash mode:

Hold down the RESET and MODE button, release RESET and continue to hold down MODE while the main status LED blinks magenta, until it blinks yellow and then release MODE. This is DFU mode.

Then issue a command such as:

```
particle flash --usb firmware.bin
```

If you get an error that dfu-util is not found, then you'll need to install it. For Windows, the easiest way is to run the Particle CLI installer; a link is at the bottom of the [Particle CLI page] (https://particle.io/cli). That page also has instructions for Mac and Linux.

Don't worry about this message; it's not really an error and will always occur:

```
dfu-util: Invalid DFU suffix signature
dfu-util: A valid DFU suffix will be required in a future dfu-util release!!!
```



