# Installing OpenSSL for Windows

OpenSSL is a set of encryption tools. It's used when you need to update or repair the encryption keys on your Particle Photon, Electron, etc.. It's generally already installed for Mac and Linux, so this note is specifically for Windows.

The easiest way to install OpenSSL is to use the [Particle CLI Installer for Windows](https://binaries.particle.io/cli/installer/windows/ParticleCLISetup.exe), which installs it for you. 

If you'd like to install it manually, or debug an existing installation, you can follow the instruction in the sections below that.

## Using the Windows Particle CLI installer

The easiest way to install OpenSSL is to use the [Particle CLI Installer for Windows](https://binaries.particle.io/cli/installer/windows/ParticleCLISetup.exe), which installs it for you. However it may not update the PATH, so you may need to do a few additional steps to use it.

The installation defaults to **C:\OpenSSL-Win32**.

If you want to use the CLI particle keys doctor command, for example, you will want to cd to that directory first:

```
cd c:\OpenSSL-Win32\bin
particle keys doctor 12345678901234567890abcd
```

Alternatively, you can add it your PATH environment variable. An explanation of how to do this can be found here:

[https://github.com/rickkas7/particle_notes/tree/master/modifying-path](https://github.com/rickkas7/particle_notes/tree/master/modifying-path)

Just make sure you substitute **C:\OpenSSL-Win32\bin** for **C:\Program Files\dfu-util** in the final step.


## Download binaries

The binaries are available for both Windows 32-bit and 64-bit. If you are unsure of whether you have 32-bit or 64-bit windows, this Microsoft knowledge base article on [how to tell whether you have a 32-bit or 64-bit Windows installation](https://support.microsoft.com/en-us/kb/827218) may be helpful.

The downloads are here:

[https://indy.fulgan.com/SSL/](https://indy.fulgan.com/SSL/)

You typically want the newest version; at the time of writing it is openssl-1.0.2k, so you'd download one of these two files:

- [openssl-1.0.2k-i386-win32.zip](https://indy.fulgan.com/SSL/openssl-1.0.2k-i386-win32.zip) 
- [openssl-1.0.2k-x64_86-win64.zip](https://indy.fulgan.com/SSL/openssl-1.0.2k-x64_86-win64.zip)

## Install binaries

- Go into your **Downloads** folder
- Select the zip file that you download
- Right click and select **Extract All**
- This should create an **openssl-1-2** folder.
- Drag this folder to where you want to store your OpenSSL installation. I like to put it in **C:\Program Files**.

## Update your PATH

The final step is to update your PATH environment variable to add the directory you just created, for example: **C:\Program Files\openssl-1-2**.

An explanation of how to do this can be found here:

[https://github.com/rickkas7/particle_notes/tree/master/modifying-path](https://github.com/rickkas7/particle_notes/tree/master/modifying-path)

Just make sure you substitute **C:\Program Files\openssl-1-2** for **C:\Program Files\dfu-util** in the final step.

## Verifying 

You may need to log out of your Windows session (or restart your computer), but then you should be able to open a command prompt and do:

```
openssl --version
```








