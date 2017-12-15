# Retained Memory Tips

Retained memory is a feature of the Particle Photon and Electron that allows data to be preserved across reboots. As a quick refresher:

| Technique | Fast Read/Write | Unlimited Writes | Survives Reset |  Survives No Power | 
| --- | --- | --- | --- | --- |
| Regular RAM | Yes | Yes | No | No |
| EEPROM | No | No | Yes | Yes |
| Retained RAM | Yes | Yes | Yes | No<sup>1</sup> |

<sup>1</sup>In some cases you can add a coin cell battery or other power supply to VBAT to preserve retained memory and the real-time clock even when the Photon/P1 is not powered, see below.

Retained memory, or the special static RAM (SRAM) or backup RAM section in the processor, is a special block of 3068 bytes that is preserved when the processor is in deep sleep mode and across resets. On the Photon, it's also possible to add a coin cell battery to preserve the contents when the power is removed.

Unlike the EEPROM emulation, the SRAM block can be written to at full processor speed, and does not wear out when written to.

Retained memory does not affect the flash size or the RAM used size - it's allocated out of the separate SRAM block.


## Code Examples

### Simple Example

```
STARTUP(System.enableFeature(FEATURE_RETAINED_MEMORY));

retained int savedValue = 0;

void setup() {
    Serial.begin(9600);
}

void loop() {

    Serial.printlnf("savedValue=%d", savedValue++);
    delay(1000);
}
```

Running that code and monitoring the USB serial port:

```
savedValue=0  <== power on
savedValue=1
savedValue=2
savedValue=3
Serial connection closed.  Attempting to reconnect... <== reset
Serial monitor opened successfully:
savedValue=4
savedValue=5
savedValue=6
savedValue=7
savedValue=8
Serial connection closed.  Attempting to reconnect... <== flashed code
Serial monitor opened successfully:
savedValue=9
savedValue=10
savedValue=11
```

### Structs are OK

In addition to primitives like int, bool, etc. you can retain a struct:

```
#include "Particle.h"

STARTUP(System.enableFeature(FEATURE_RETAINED_MEMORY));

struct TestStruct {
	int valueA;
	int valueB;
};

retained TestStruct testStruct;

void setup() {
    Serial.begin(9600);
}

void loop() {

    Serial.printlnf("valueA=%d valueB=%d", testStruct.valueA, testStruct.valueB);

    testStruct.valueA++;

    testStruct.valueB += rand() % 10;

    delay(1000);
}
```

```
valueA=0 valueB=0 <== power on
valueA=1 valueB=3
valueA=2 valueB=6
valueA=3 valueB=8
valueA=4 valueB=17
valueA=5 valueB=17
valueA=6 valueB=25
valueA=7 valueB=27
valueA=8 valueB=33
valueA=9 valueB=39
Serial connection closed.  Attempting to reconnect... <== reset
Serial monitor opened successfully:
valueA=10 valueB=48
valueA=11 valueB=51
valueA=12 valueB=54
valueA=13 valueB=56
valueA=14 valueB=65
valueA=15 valueB=65
valueA=16 valueB=73
```

### But not an initialized struct

```
#include "Particle.h"

STARTUP(System.enableFeature(FEATURE_RETAINED_MEMORY));

struct TestStruct {
	int value;

	TestStruct() : value(10) {}
};

retained TestStruct testStruct;

void setup() {
    Serial.begin(9600);
}

void loop() {

    Serial.printlnf("value=%d", testStruct.value++);

    delay(1000);
}
```

In this code, the constructor for TestStruct initializes the value to 10. This overrides the retained value, so it behaves as if not retained.

```
value=10  <== powered on
value=11
value=12
value=13
Serial connection closed.  Attempting to reconnect...  <= reset here
Serial monitor opened successfully:
value=10
value=11
value=12
```

### Same for actual classes, too

```
#include "Particle.h"

STARTUP(System.enableFeature(FEATURE_RETAINED_MEMORY));

class TestClass {
public:
	TestClass() : value(10) {}

	int value;
};

retained TestClass testClass;

void setup() {
    Serial.begin(9600);
}

void loop() {

    Serial.printlnf("value=%d", testClass.value++);

    delay(1000);
}
```

In this code, the constructor for TestStruct initializes the value to 10. This overrides the retained value, so it behaves as if not retained.

```
value=10 <== powered on
value=11
value=12
value=13
Serial connection closed.  Attempting to reconnect... <== reset here
Serial monitor opened successfully:
value=10
value=11
value=12
```

### Uninitialized values in classes work though

```
#include "Particle.h"

STARTUP(System.enableFeature(FEATURE_RETAINED_MEMORY));

class TestClass {
public:
	TestClass() {}

	int value;
};

retained TestClass testClass;

void setup() {
    Serial.begin(9600);
}

void loop() {

    Serial.printlnf("value=%d", testClass.value++);

    delay(1000);
}
```

In this example, the constructor doesn't set the values, so retaining works:

```
value=0 <== power on
value=1
value=2
value=3
Serial connection closed.  Attempting to reconnect... <== reset
Serial monitor opened successfully:
value=4
value=5
value=6
```


### Static class members are OK too

```
#include "Particle.h"

STARTUP(System.enableFeature(FEATURE_RETAINED_MEMORY));

class TestClass {
public:
	TestClass() {}

	static int value;
};

TestClass testClass;
retained int TestClass::value;


void setup() {
    Serial.begin(9600);
}

void loop() {

    Serial.printlnf("value=%d", testClass.value++);

    delay(1000);
}
```

```
value=0 <== power on
value=1
value=2
value=3
Serial connection closed.  Attempting to reconnect... <== reset
Serial monitor opened successfully:
value=4
value=5
value=6
value=7
```

### And, the you can initialize those!

```
#include "Particle.h"

STARTUP(System.enableFeature(FEATURE_RETAINED_MEMORY));

class TestClass {
public:
	TestClass() {}

	static int value;
};

TestClass testClass;
retained int TestClass::value = 8;

void setup() {
    Serial.begin(9600);
}

void loop() {

    Serial.printlnf("value=%d", testClass.value++);

    delay(1000);
}
```

A static class member initializer does work! Note that on power on it's initialized to 8, but retain still works. 

This is different than initializing in a constructor, which does not work.

```
value=8   <== powered on
value=9
value=10
value=11
Serial connection closed.  Attempting to reconnect... <== reset
Serial monitor opened successfully:
value=12
value=13
value=14
value=15
```

### You can't retain a String

```
#include "Particle.h"

STARTUP(System.enableFeature(FEATURE_RETAINED_MEMORY));

retained String str;


void setup() {
    Serial.begin(9600);
}

void loop() {

    Serial.printlnf("str=%s", str.c_str());

    str.concat("a");

    delay(1000);
}
```

This doesn't work, because the string contents are not retained. Also, the String constructor initializes it to an empty string.


```
str=   <== power on
str=a
str=aa
str=aaa
str=aaaa
Serial connection closed.  Attempting to reconnect... <== reset
Serial monitor opened successfully:
str=
str=a
str=aa
str=aaa
```

### But you can retain a character array

```
#include "Particle.h"

STARTUP(System.enableFeature(FEATURE_RETAINED_MEMORY));

retained char str[4] = "abc";

void setup() {
    Serial.begin(9600);
}

void loop() {

    Serial.printlnf("str=%s", str);

    str[0]++;
    if (str[0] >= 127) {
    	str[0] = ' ';
    }

    delay(1000);
}
```

This works because the primitive character array is retained.

Initialization is also allowed, if you declare it like that. Note that you need to choose in advance how many characters to reserve. In this case it's 3 characters, plus a trailing null byte string terminator, which is what the [4] is.

```
str=abc <== power on
str=bbc
str=cbc
Serial connection closed.  Attempting to reconnect... <== reset
Serial monitor opened successfully:
str=ebc
str=fbc
str=gbc
str=hbc
str=ibc
```



## About VBAT

In certain circumstances, the VBAT pin can be used to keep the contents of the retained SRAM (and the real-time clock) when there is no power. The behavior depends a bit on the device.

### Photon/P1

Connecting a coin cell battery to VBAT will preserve the retained SRAM when the main power is removed. 

Somewhat counter-intuitively if you don't use a battery, you may want to connect VBAT on the Photon/P1 to GND. This will cause the retained memory to be initialized on first power-up, but retain the values across reset and all sleep modes. If you leave VBAT floating, sometimes the contents will not be initialized after removing power. Sometimes they will, you never know. (Do not connect VBAT to GND on an Electron, for the reasons explained below.)

### Electron 

The Electron, as it is normally powered by a the LiPo battery, connects VBAT to 3V3 internally. This allows the retained memory to be preserved as long as you have the LiPo battery connected.

As VBAT is connected to 3V3 you must never connect VBAT to GND on the Electron!

There's actually a zero-ohm resistor that connects the two, so with a hot air rework station you can remove the link and use VBAT like the Photon/P1.

### E Series

The E series cellular module does not connect VBAT to 3V3 internally, so you can choose whether you want it to behave like the Electron or Photon/P1 based on how you set up your base board.

## Backup Power

If you are using backup power to VBAT, the most common methods are a coin cell battery or a supercap. 

When not powered, the Photon uses a maximum of 19 uA from VBAT.

### Coil Cell

A CR2032 Lithium coin cell battery is one option for powering VBAT. It's only used when the Photon isn't otherwise powered by VIN or USB. You might use a holder like [this one](https://www.adafruit.com/product/1870) from Adafruit.

A CR2032 Lithium battery is 3.0V and is rated at 240 mAh to 2.0V. Since the Photon uses at most 1.9 uA on VBAT, the battery should last over a decade. You could probably use a smaller CR2024 battery and be fine.

### Supercap

In some cases, users have successfully used a super capacitor. The advantage is if you need to preserve data for a relatively short amount of time, it can be less expensive. Also, there may be additional restrictions on shipping products with Lithium batteries, so the supercap can solve this dilemma.

[This post in the community forum](https://community.particle.io/t/photon-vbat-supercap-circuit/12390/) has a great deal of information.

