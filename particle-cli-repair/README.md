# Particle CLI Repair

If you get an error during Particle CLI installation or upgrade, or if you upgrade and the version remains unchanged at a lower version number, you may need to follow these steps to fix your Particle Command Line Interface install.

## Windows

- Open a Command Prompt window and run the command:

```
npm uninstall -g particle-cli
```

If you get an error about npm not found, just continue onto the next step. This removes a previous manual install.

- Download and run the [Particle CLI for Windows](https://binaries.particle.io/cli/installer/windows/ParticleCLISetup.exe) installer.

There are additional tips [here](https://docs.particle.io/guide/tools-and-features/cli/). 

To upgrade the CLI, use the command:

```
particle upgrade-cli
```

## Mac or Linux

- Open a Terminal window and run the command:

```
sudo npm uninstall -g particle-cli
```

If you get an error about npm not found, just continue onto the next step. This removes a previous manual install.

- Reinstall the CLI using the Particle CLI installer for Mac or Linux:

```
bash <( curl -sL https://particle.io/install-cli )
```

- Check the version of the installed CLI. At the time of writing (April 10, 2018) it was 1.29.0.

```
particle --version
```

Make sure you do not use the `npm install -g particle-cli` or `npm update -g particle-cli` command as this will break your installation again. Instead, use:

```
particle upgrade-cli
```

The main difference between the Particle CLI installer and the old way is that the new way runs a separate copy of node.js just for the CLI, and also installs as the current user, instead of root. 

### If you get an older version or particle command not found

Check and see which particle you're finding:

```
which particle
```

If you get one in `/usr/local/bin/particle`, remove it:

```
sudo rm /usr/local/bin/particle
```

### If you still get particle command not found

Try reloading your .profile:

```
source ~/.profile
```

If that still does not solve the problem, double check that this is near the end of your ~/.profile file:

```
# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi
```

