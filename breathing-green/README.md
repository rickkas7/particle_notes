# Particle Breathing Green Tips

[Breathing green](https://docs.particle.io/guide/getting-started/modes/photon/#cloud-not-connected) mode can be confusing to new Particle programmers but fortunately it's usually easy to recover from.

## I can't flash my Photon anymore

Breathing green means that Wi-Fi is on, but you're not connected to the Particle cloud. Because of this, you cannot flash your Photon from the cloud. That includes Particle Build (Web IDE), Particle Dev (Atom IDE) and Particle CLI cloud-based flashing commands.
 
Fortunately, you can usually get around this by entering [safe mode](https://docs.particle.io/guide/getting-started/modes/photon/#safe-mode), breathing magenta.

Hold down RESET and SETUP (or MODE), release RESET and continue to hold down SETUP/MODE until the Photon/Electron blinks magenta, then release SETUP/MODE. The device will then go through the normal sequence of colors: blinking green, blinking cyan, fast blinking cyan, then breathing magenta. Once breathing magenta, you should be able to OTA flash again.

But to get rid of the breathing green, you'll probably need to make some changes to your code.

## Do not unclaim your device

This rarely if ever fixes anything, and it sometimes can make things much worse. Resist the urge to do this. It never fixes a blinking green problem.

## Cause 1: Blocking the loop

In this simple program, you'll breathe cyan, then about 10 seconds later, you'll go to blinking green. Why? You've blocked the loop from returning, and in the default threading and system mode, that stops the cloud from being processed, which causes breathing green.

Don't do this:

```
void setup() {
}

void loop() {

	// Don't do this: preventing loop from returning will cause breathing green
	while(true) {

	}
}
```

Of course your code probably has a more subtle bug than that. For example, if you have a function that's called from setup or loop that never returns, that can cause problems. 

Some libraries that deal with sensor hardware might behave strangely when the hardware is not available, which could cause a call to block forever as well.

## Solution 1: Add some Particle.process() calls

One way to solve this is to sprinkle Particle.process() calls in code that blocks. You might do something like this:

```
void waitForSwitch() {
	while(digitalRead(D7) == HIGH) {
		// Without the following line, you'd go into breathing green
		Particle.process();
	}
}
```

In general it's better to structure your code so it always returns from loop(), but if that's not a viable solution, you can sprinkle some Particle.process() calls in your code.

## Solution 2: Enable SYSTEM_THREAD

The other solution is to use [SYSTEM_THREAD](https://docs.particle.io/reference/firmware/#system-thread) mode.

```
SYSTEM_THREAD(ENABLED);
```

You insert this at the top of your source file. What it does is run the cloud processing in a separate system thread, so if you block your loop, the cloud will still be serviced and you will stay in breathing cyan instead of going to breathing green.

The only thing to be careful is that when you do this, your loop code will run before connected to the cloud. One solution is to add this in your setup() code, before you do any Particle.publish calls:

```
waitUntil(Particle.connected);
```

You might also do something like this in loop():

```
if (Particle.connected()) {
	Particle.publish("myEvent", PRIVATE);
}
```


## Side note: Wi-Fi only mode

While all of the causes above were unintentionally causing breathing green, you can also do it on purpose. Using the [SEMI_AUTOMATIC or MANUAL system mode](https://docs.particle.io/reference/firmware/#semi-automatic-mode) and only bringing up Wi-Fi and not the cloud will cause intentional breathing green. You would do this if you're sending data to a local server and not using the cloud at all, for example. 

