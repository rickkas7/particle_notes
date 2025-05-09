# Particle CLI on Apple Silicon (M1, M2, ...)

Contrary to popular belief it is possible to use the Particle CLI on Apple silicon (M1, M2, ...) computers without using Rosetta (Intel emulation).

## Background

### Why do people think you need to use Rosetta

When M1 computers were first released there were required packages that did not work properly on Apple silicon, but that's mostly not a problem now.

If you try to install the Particle CLI using the Mac installer, it will warn you that you can't install it without Rosetta, but that's not entirely correct.

There were no binaries for dfu-util for Apple silicon, but the CLI no longer needs dfu-util to flash binaries in DFU mode.

### Why do I want to run the CLI natively?


### Do I still need Rosetta?

Yes. The 

Rosetta was a reasonable workaround, but running the tools in emulation is slower and now that essentially all new Macs are Apple silicon, it's time to bite the bullet and just make everything work natively.

If you are starting from a clean computer, installation is relatively painless, but there are still some caveats. The biggest problems will occur if you've imported your Mac files from an Intel Mac. There are a number of steps that are necessary to correctly clean up Homebrew, node, and Workbench to get your 



### Local build

- Tools like `make` don't work
