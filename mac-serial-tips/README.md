# Mac Serial Tips

In general, the Particle Photon/Electron/Core just work with the Mac when you plug it in. However, if things don't work, here are some tips that may help debug the problem.

## There are two modes

The Photon/Electron/Core have two different operating modes:

- In listening mode (blinking blue) and normal operating mode with serial enabled, the device appears as a USB serial port
- In DFU mode (blinking yellow), the device is only visible to dfu-util

This is important, because it's possible for the device to work in one mode or the other, and the fixes are sometimes different.

When in normal operating mode (breathing cyan, green, white, etc.), the Photon/Electron/Core will also appear as a serial device, as long as you call:

```
Serial.begin(9600);
```

This is typically during setup(). The baud rate (9600) is ignored. In newer system firmware versions it can be omitted. You might see other values like 19200 or 115200, but the USB serial port runs at a fast speed regardless of what you set.

## Particle CLI Installation

In order to install the Particle CLI on the Mac, you typically need to do two things:

- Install [node.js](https://nodejs.org). I recommend the LTS version (currently v6.10.0).
- Install the Particle CLI:

```
sudo npm install -g particle-cli
```

If you have upgraded node, you may get an error installing serial port, having something to do with pre-gyp. This can usually be solved by manually removing the old version first:

```
sudo npm uninstall -g particle-cli
```

If you have recently upgraded your operating system, you may want to reinstall [Homebrew](https://brew.sh). It's not so much that Homebrew needs reinstallation, but upgrading Mac OS X will uninstall the command line build tools, which may affect the ability to build the serial port driver for node. Reinstalling Homebrew is usually easier than installing Xcode and the command line tools.

Sometimes this command helps, as well:

```
sudo npm install -g node-pre-gyp npm serialport particle-cli
```


## USB-3 Ports

In the past, a few people have had trouble using Mac laptops with USB-3 USB ports. This hasn't happened recently, but putting a USB hub in between the laptop and the Photon has solved the problem.

## Cables

It's not a bad idea to try a different USB cable as well. In addition to defective cables, beware of some charging cables, which only provide power and do not allow access to the port for data.


## In Listening Mode (blinking blue)

To put a Photon in [listening mode](https://docs.particle.io/guide/getting-started/modes/photon/#listening-mode), hold down the SETUP button until the status LED blinks dark blue.

To put an Electron in [listening mode](https://docs.particle.io/guide/getting-started/modes/electron/#listening-mode), hold down the MODE button until the status button blinks dark blue.

When the Photon or Electron is in listening mode, a serial port device should be created. The ls command can be used to show the available ports:

```
Ricks-Mac:~ rickk$ ls /dev/cu.usb*/dev/cu.usbmodem1D11
```

This means the port has been created, and is /dev/cu.usbmodem1D11 in this case. The part after usbmodem will vary, for example it might be cu.usbmodemFD3141 or cu.usbmodemFD1161 or pretty much anything.

If you have the [Particle CLI](https://docs.particle.io/guide/tools-and-features/cli/) installed, you should be able to get information about your device like this:

```
Ricks-Mac:~ rickk$ particle identifyYour device id is 3b0021001747353236343033Your system firmware version is 0.6.1```

If not, you can use the screen command:

```
screen /dev/cu.usbmodem1D11
```

The terminal window will clear, and then type **i** (lowercase i, as in identify). It should display something like this (your device ID will be different, of course).

```
Your device id is 3b0021001747353236343033
```

To get out of screen, press Ctrl-A, then d. If that doesn't work, just close the Terminal window.

If that doesn't work, you should check the device entry using the ioreg command. It should return something like this for the Photon: 

```
Ricks-Mac:~ rickk$ ioreg -p IOUSB -n Photon+-o Root  <class IORegistryEntry, id 0x100000100, retain 9>  +-o Root Hub Simulation Simulation@fd000000  <class AppleUSBRootHubDevice, id$  | +-o Virtual Mouse@fd100000  <class AppleUSBDevice, id 0x100000262, register$  | +-o Virtual Keyboard@fd200000  <class AppleUSBDevice, id 0x10000026f, regis$  +-o Root Hub Simulation Simulation@1d000000  <class AppleUSBRootHubDevice, id$    +-o Photon@1d100000  <class AppleUSBDevice, id 0x1000003f8, registered, mat$        {          "sessionID" = 1510974924950          "iManufacturer" = 1          "bNumConfigurations" = 1          "idProduct" = 49158          "bcdDevice" = 592          "Bus Power Available" = 250          "USB Address" = 1          "bMaxPacketSize0" = 64          "iProduct" = 2          "iSerialNumber" = 3          "bDeviceClass" = 239          "Built-In" = No          "locationID" = 487587840          "bDeviceSubClass" = 2          "bcdUSB" = 512          "USB Product Name" = "Photon"          "PortNum" = 1          "non-removable" = "no"          "IOCFPlugInTypes" = {"9dc7b780-9ec0-11d4-a54f-000a27052861"="IOUSBFam$          "bDeviceProtocol" = 1          "IOUserClientClass" = "IOUSBDeviceUserClientV2"          "IOPowerManagement" = {"DevicePowerState"=0,"CurrentPowerState"=3,"Ca$          "Device Speed" = 1          "USB Vendor Name" = "Particle"          "idVendor" = 11012          "IOGeneralInterest" = "IOCommand is not serializable"          "USB Serial Number" = "3B0021001747353236343033"          "IOClassNameOverride" = "IOUSBDevice"        }        
```

For the Electron, use the command:

```
ioreg -p IOUSB -n Electron```

## In DFU (blinking yellow) mode

To put a Photon in [DFU mode](https://docs.particle.io/guide/getting-started/modes/photon/#dfu-mode-device-firmware-upgrade-), hold down RESET and SETUP at the same time, release RESET and continue to hold down SETUP while the status LED blinks magenta until it blinks yellow, then release SETUP.

To put an Electron in [DFU mode](https://docs.particle.io/guide/getting-started/modes/electron/#dfu-mode-device-firmware-upgrade-), hold down RESET and MODE at the same time, release RESET and continue to hold down MODE while the status LED blinks magenta until it blinks yellow, then release MODE.

In DFU mode (blinking yellow), the serial port device is not created, so you won't see a /dev/cu.usb* item! 

In order to use DFU you'll need to install dfu-util. The easiest way is to install [homebrew](https://brew.sh) and then:

```
brew install dfu-util
```

There is additional information in the [Particle FAQ on dfu-util](https://docs.particle.io/faq/particle-tools/installing-dfu-util/).

Once you have it installed, you can use the -l option to list all DFU devices. The output should look something like this:

```
Ricks-Mac:~ rickk$ dfu-util -ldfu-util 0.9Copyright 2005-2009 Weston Schmidt, Harald Welte and OpenMoko Inc.Copyright 2010-2016 Tormod Volden and Stefan SchmidtThis program is Free Software and has ABSOLUTELY NO WARRANTYPlease report bugs to http://sourceforge.net/p/dfu-util/tickets/Found DFU: [2b04:d006] ver=0250, devnum=1, cfg=1, intf=0, path="29-1", alt=1, name="@DCT Flash   /0x00000000/01*016Kg", serial="3B0021001747353236343033"Found DFU: [2b04:d006] ver=0250, devnum=1, cfg=1, intf=0, path="29-1", alt=0, name="@Internal Flash   /0x08000000/03*016Ka,01*016Kg,01*064Kg,07*128Kg", serial="3B0021001747353236343033"
```

If that doesn't work, you can also use ioreg to check the USB device. Note that "Photon DFU Mode" is used for both the Photon and Electron; this is normal.

```
Ricks-Mac:~ rickk$ ioreg -p IOUSB -n "Photon DFU Mode"+-o Root  <class IORegistryEntry, id 0x100000100, retain 9>  +-o Root Hub Simulation Simulation@fd000000  <class AppleUSBRootHubDevice, id$  | +-o Virtual Mouse@fd100000  <class AppleUSBDevice, id 0x100000262, register$  | +-o Virtual Keyboard@fd200000  <class AppleUSBDevice, id 0x10000026f, regis$  +-o Root Hub Simulation Simulation@1d000000  <class AppleUSBRootHubDevice, id$    +-o Photon DFU Mode@1d100000  <class AppleUSBDevice, id 0x10000041e, regist$        {          "sessionID" = 2123721177513          "iManufacturer" = 1          "bNumConfigurations" = 1          "idProduct" = 53254          "bcdDevice" = 592          "Bus Power Available" = 250          "USB Address" = 1          "bMaxPacketSize0" = 64          "iProduct" = 2          "iSerialNumber" = 3          "bDeviceClass" = 0          "Built-In" = No          "locationID" = 487587840          "bDeviceSubClass" = 0          "bcdUSB" = 512          "USB Product Name" = "Photon DFU Mode"          "PortNum" = 1          "non-removable" = "no"          "IOCFPlugInTypes" = {"9dc7b780-9ec0-11d4-a54f-000a27052861"="IOUSBFam$          "bDeviceProtocol" = 0          "IOUserClientClass" = "IOUSBDeviceUserClientV2"          "IOPowerManagement" = {"DevicePowerState"=0,"CurrentPowerState"=3,"Ca$          "Device Speed" = 1          "USB Vendor Name" = "Particle"          "idVendor" = 11012          "IOGeneralInterest" = "IOCommand is not serializable"          "USB Serial Number" = "3B0021001747353236343033"          "IOClassNameOverride" = "IOUSBDevice"        }```
