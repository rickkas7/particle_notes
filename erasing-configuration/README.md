# How to erase the configuration data

## Back up data and private key

It's possible to use the keys doctor to create a new set of keys, but this technique will save and restore your device private key instead.

Photon:

```
dfu-util -d 2b04:d006 -a 0 -s 0x8004000:0x8000 -U config.bin
particle keys save devicekeys.der
```

Electron:

```
dfu-util -d 2b04:d00a -a 0 -s 0x8004000:0x8000 -U config.bin
particle keys save devicekeys.der
```

## Reprogram

Download the [empty.bin](https://raw.githubusercontent.com/rickkas7/particle_notes/master/erasing-configuration/empty.bin) file. Its a file 3618 0xff bytes in it, enough to overwrite the configuration.

Photon:

```
dfu-util -d 2b04:d006 -a 1 -s 1 -D empty.bin
```

Electron:

```
dfu-util -d 2b04:d00a -a 1 -s 1 -D empty.bin
```

Note that this only overwrites the device configuration, not the WICED configuration, so your Wi-Fi settings will still be intact.

## Restore keys

Photon:

```
particle keys server
dfu-util -d 2b04:d006 -a 1 -i 0 -s 34 -D devicekeys.der
```

Electron:

```
particle keys server
dfu-util -d 2b04:d00a -a 1 -i 0 -s 34 -D devicekeys.der
```

