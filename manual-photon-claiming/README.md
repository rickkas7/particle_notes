# Manual Photon claiming

This is simple example of how to claim a Photon device using the SoftAP APIs, instead of the phone device APIs or CLI. You might do this if you are making a computer-based setup tool instead of a phone-based one.

Currently this only shows how to do developer (non-product) devices, but will be expanded later with product support.

## Claiming a developer (non-product) device

### Get an access token

When you use normal, non-product APIs, you use a user token. One way to get your user token is to use [https://build.particle.io](https://build.particle.io). Click on the Settings icon (1) then copy and paste the Access Token (2).

![User Access Token](images/user_token.png)

You can do this using the [oauth/token API](https://docs.particle.io/reference/api/#generate-an-access-token).

Remember to keep your access token secret; they allow access to your account to anyone who has the token! 

(All of the tokens in this document are fake, by the way.)


### Create a claim code

Use the [device_claims API](https://docs.particle.io/reference/api/#create-a-claim-code) to create a new claim code for the Photon:

```
$ curl -X POST https://api.particle.io/v1/device_claims?access_token=ab142050967cff79dc6586c82193978b3a62cab9
```

You should get back something like this containing the claim code (and also all of the devices belonging to your account:

```
{
  "claim_code":"4i8pwFwPkImsnLmIj54BYJA4Z94j0OLyl7vwKecELzYGKjS9mBbM5Vra6H9T0DI",
  "device_ids":[...]
}
```

### Connect to the Photon Wi-Fi

Presumably at this point the Photon is blinking blue (listening mode) because it has not yet been configured.

Connect your computer (or whatever you're connecting from) to the Photon Wi-Fi network (Photon-XXXX) and test it out by getting the device id:

```
$ curl http://192.168.0.1/device-id
{"id":"3B0021001747353236343033","c":"1"}
```

Beware of the device ID that is returned by this call. It uses uppercase letters for the a-f, but many of the APIs expect the letters to be lowercase. 

### Set the claim code

Set the claim code you received above using a command like:

```
$ curl -X POST -d '{"k":"cc","v":"4i8pwFwPkImsnLmIj54BYJA4Z94j0OLyl7vwKecELzYGKjS9mBbM5Vra6H9T0DI"}' http://192.168.0.1/set
```

If you did it correctly, this should be the result:

```
{"r":0}
```

If you didn't do it correctly, you'll get back something like this, or possibly no response at all.

```
{"r":-1}
```


### Get the public key

You'll need the device public key in order to encrypt the Wi-Fi password. 

```
$ curl http://192.168.0.1/public-key
{"b":"30819F300D06092A864886F70D010101050003818D0030818902818100BF084F0854C8860541285B100606F6CEB467E652726606614482106E2B7521888EB8B7894C526E6D715D8E4AC13618047F5777E6A91EE37E9C12887854D7279920CFD0FC01CCB425156ACA3977B766F922483770B4D35FF9D56404D967E9176F3BE8CD5AC949FC84E4DB77378E85B444F7D58747CF9F1A59A9FAC3E1D573B56F0203010001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","r":0}
```

### Set up Wi-Fi

Setting up Wi-Fi by hand is a super huge pain. For experimenting with claiming, you'll be much better off just configuring the Wi-Fi using the CLI, using:

```
$ particle serial wifi
```

However, if you want to know how that works internally, here we go:

You'll need a bunch of parameters in order to configure Wi-Fi, not just the SSID and password. You also need the security type and channel. The easiest way is to use scan-ap:

```
$ curl http://192.168.0.1/scan-ap
```

For reference, however, the security type values are:

- open: 0
- wep_psk: 1
- wep_shared: 32769 (0x8001)
- wpa_tkip: 2097154 (0x00200002)
- wpa_aes: 2097165 (0x00200004)
- wpa2_tkip: 4194306(0x00400002)
- wpa2_aes: 4194308 (0x00400004)
- wpa2_mixed: 4194310 (0x00400006)
- wpa2: 4194310 (0x00400006)

The other thing you need is the secure password. This is an encrypted version of the Wi-Fi password. I had trouble doing this using just openssl, so I've included a simple node program to calculate the encrypted password.

If you're in the directory with package.json and wifipass.js you'll need to install the dependencies the first time you use it:

```
$ npm install
```

The first argument is the contents of the "b" key when getting your public key, above. The second is your actual Wi-Fi password. The tool prints out the encrypted version.

```
$ node wifipass.js 30819F300D06092A864886F70D010101050003818D0030818902818100BF084F0854C8860541285B100606F6CEB467E652726606614482106E2B7521888EB8B7894C526E6D715D8E4AC13618047F5777E6A91EE37E9C12887854D7279920CFD0FC01CCB425156ACA3977B766F922483770B4D35FF9D56404D967E9176F3BE8CD5AC949FC84E4DB77378E85B444F7D58747CF9F1A59A9FAC3E1D573B56F0203010001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 mywifipassword
encrypted password: ad8965e3ddd9dc9544176adda3e35d70e8fb215e7de92da753fdde5829bba0f96d2f02162f1facd2ec08f93286010cd6c41569a9cf2190b5d6c869083bd11933201492ba9ea0a1a1265298691e23e68ce09f54f7bd50fe2d6f7308d4a412e0f95a5f14efff311314af71f4516e04af120b8619196a6c9a4876b69964ad06e608
```

Now you have everything you need to configure Wi-Fi:

```
$ curl -X POST http://192.168.0.1/configure-ap -d '{"idx":0,"ssid":"TestRouter","sec":4194308,"ch":6,"pwd":"ad8965e3ddd9dc9544176adda3e35d70e8fb215e7de92da753fdde5829bba0f96d2f02162f1facd2ec08f93286010cd6c41569a9cf2190b5d6c869083bd11933201492ba9ea0a1a1265298691e23e68ce09f54f7bd50fe2d6f7308d4a412e0f95a5f14efff311314af71f4516e04af120b8619196a6c9a4876b69964ad06e608"}'
```

- idx is the index to save to, 0 is the first.
- ssid is the SSID of the network 
- sec is the security type of the network
- ch is the channel number
- pwd is the encrypted password

If the parameters look valid, you should get back:

```
{"r":0}
```

You'll still get back 0 if you have an invalid Wi-Fi configuration; you'll just go back to blinking blue if the data isn't quite valid, such as an invalid password in correctly formatted JSON data.

### Connect to Wi-Fi

If you manually configured the Wi-Fi you need to tell the Photon to reboot:

```
$ curl -X POST http://192.168.0.1/connect-ap -d '{"idx":0}'
```
	
At this point, with any luck it will go through the normal steps of blinking green, blinking cyan, fast blinking cyan, and breathing cyan. And the device will be claimed to your account, since you used a claim code.
	