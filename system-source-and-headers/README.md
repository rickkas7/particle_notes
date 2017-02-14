# System Source and Header Files

While the [official system firmware documentation](https://docs.particle.io/reference/firmware) has a lot of information, sometimes you want to see more details, like the header files and source.

## System Firmware

The system firmware is open source and is available here: [https://github.com/spark/firmware](https://github.com/spark/firmware).

I recommend downloading a specific release, rather than develop. For example you could select the branch "release/v0.6.0" to get the released version of the 0.6.0 firmware. Then just download the zip or clone from Github.

The header files and implementation for most of the APIs, things like String, TCPClient, System, and Particle classes are in the wiring directory.

There are some other things scattered about in other directories as well, so if you can't find something, you can try searching the entire firmware directory.

## C/C++ Standard Includes

One thing that's not included above are the standard C/C++ includes, things like string.h and stdlib.h. These are provided by the compiler toolset and are not part of the firmware repository.

They are pretty standard gcc 4.9 includes running in C++11 mode so you probably use resources like [cplusplus.com](http://www.cplusplus.com), however if you download and install the gcc-arm build chain, you'll then be able to search the include in the location you downloaded it to.

The instructions for installing the local gcc-arm build chain are here:
[https://docs.particle.io/faq/particle-tools/local-build](https://docs.particle.io/faq/particle-tools/local-build).
