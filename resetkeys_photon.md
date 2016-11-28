# Resetting keys - Photon

For analysis purposes, it is helpful save a copy of the keys that are on the device before resetting them, so Particle can analyze them.

Put the Photon in DFU mode (blinking yellow) by holding down the RESET and SETUP buttons, then release RESET and continue to hold down SETUP while it blinks magenta, then yellow, then release.

Then enter each of these commands, one-by-one:

```
dfu-util -d 2b04:d006 -a 1 -s 2082:768 -U serverkey.bin
particle keys server
```

Then reset it and see if it can connect to the cloud. If it works, please reply with the serverkey.bin and you can skip the remaining steps.

Put the Photon in listening mode (blinking dark blue) by holding down the SETUP button until the main status LED blinks blue, then release. Then issue the command:

```
particle identify
```

Save the device ID that is returned; you'll need that next.

Put the Photon back in DFU mode (blinking yellow) as above. And enter these commands, one-by-one:

```
dfu-util -d 2b04:d006 -a 1 -s 34:1216 -U devicepriv.bin
dfu-util -d 2b04:d006 -a 1 -s 1250:384 -U devicepub.bin
particle keys doctor YOUR_DEVICE_ID
```

replacing YOUR_DEVICE_ID with the 24-character hexadecimal identifier you got from Particle identify. Note that this is case-sensitive, all letters should be lowercase.

Then reset your Photon and it should connect to the cloud. Normally you should not send your private key through an insecure channel like email, but since it was previously not valid, it should be okay in this case.

If it does not connect to the cloud, you'll need to do a cloud debug; the instructions are here:

[https://github.com/rickkas7/photon-clouddebug](https://github.com/rickkas7/photon-clouddebug)


