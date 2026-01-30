# Digital signage

For use on eg a Raspberry Pi Zero 2 W. Shows the chosen slides on repeat from a public Google Slides slideshow, using `feh` on a minimal `x11`. Uses ~130MB of memory, so well within the 512MB the Zero 2 has.

Machine names:
- atrium1 in the atrium
- signage2 in room 5 (want to rename to room-5 but doesn't work)

## Installing

Use the official Raspberry Pi imager:
- start with the 'lite' 64bit image (64bit or can't use Bun)
- when using the imager, give it a user (`student`) and WiFi details to save time later

Consider doing all this over ssh rather than directly on the device (see the ssh section below).

When installed and booted up:
- log in as `student`
- `sudo apt update` and `sudo apt upgrade`
  - see section 'School firewall issue' below if a forbidden issue
- `sudo apt install git`
- install Bun
  `curl -fsSL https://bun.sh/install | bash`
- install `feh` (for image slideshows) and `librsvg` (to convert SVGs from Google slides to PNGs):
  `sudo apt install feh librsvg2-bin`
- `git clone https://github.com/jakeg/digital-signage`
- add a `.env` inside the `digital-signage` folder, with your presentation id and zero-indexed page numbers
```bash
PRESENTATION_ID="___your_google_slide_presentation_id___"
PRESENTATION_PAGES="[0, 1]"
```
- in `digital-signage` check it can download the images with `bun download.js`
  - should end up with a `slides` subfolder with `.png`s in
  - check the `.png`s aren't zero file size
- install a crontab with `crontab -e`
```bash
# download new slides every minute
*/1 * * * * (cd ~/digital-signage && timeout 20s ~/.bun/bin/bun download.js > ~/download.log 2>&1)
```
- ... the `timeout 20s` will kill it after 20s in case eg fetch() fails

- I don't think this step is needed any more
  - uses wayland by default and hard to get GUI to open in that on startup so...
  - `sudo update-alternatives --config x-session-manager` and choose openbox

- `sudo raspi-config` then 'System options' and set 'Auto login' to enabled

Now we need to set up a minimal openbox x11 which `feh` needs to run
- `sudo apt install xorg openbox`
- `startx /usr/bin/feh --fullscreen --auto-zoom --slideshow-delay 15 ~/digtial-signage/slides/*.png`
- exit with `q` or change to a new terminal with `CTRL+ALT+F[x]` etc
- when confirmed to work, add this to `~/.xinitrc` (create the file if it doesn't exist)
```bash
#!/bin/sh
xset -dpms
xset s off
xset s noblank

exec /usr/bin/feh --fullscreen --auto-zoom --slideshow-delay 15 ~/digital-signage/slides
```
- add this to `~/.profile`:
```bash
# only run on the first virtual console and not over eg ssh
if [ "$(tty)" = "/dev/tty1" ]; then
  startx
  #startx /usr/bin/feh --fullscreen --auto-zoom --slideshow-delay 15 ~/digtial-signage/slides/*.png
fi
```
- rerun and check it works with `startx` (was: `source ~/.profile`)

Should now be able to restart the machine and it will boot straight into the signage.

If another terminal/tty is needed, ctrl+alt+F3 (ctrl+alt+f1 to get back to main one).

## SSH logins

- run `sudo raspi-config`
  - under 'system options' change 'hostname' to something like 'atrium1'
  - save the changes and maybe reboot
  ... if it doesn't work, manually edit `/etc/hostname` and `/etc/hosts`
  ... still doesn't work, and currently no working solution :/
- create an ssh key on laptop
- add the ssh key to the machine
```bash
mkdir -p ~/.ssh
echo "[your-public-key]" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```
- edit `/etc/ssh/sshd_config` with `sudo`, adding these 3 lines
  ```
  Port 22 # ... consider choosing a different port instead here
  PermitRootLogin no
  PasswordAuthentication no
  ```
- `sudo systemctl restart ssh`
- try ssh'ing in with eg `ssh student@atrium1.local` (with `-p xxx` if a different port) and it should work without a password

## WiFi

- Run `sudo nmtui` to open the NetworkManager settings
- Select 'Edit a connection' then 'Add' to add a network
- Input the parameters for the school network:
  - SSID: Trust-YourOwn
  - Security: WPA & WPA2 Enterprise
  - Authentication: PEAP
  - Inner Authentication: MSCHAPv2
  - Username & Password (search my email for `cmsscreen` for email/pw for this)
  - Other fields can be left at default
Press ok, back, then ok to save the network settings

Note that we can't use the usual `raspi-config` as it's an enterprise PEAP network

Type `nmcli device status` and it will probably say `wlan0` is 'unavailable' rather than connected. If so, try:
- `nmcli radio wifi on`
- if status it now says 'connected' all is good
- otherwise, try `nmcli device set wlan0 managed yes` and the other command again
- if still doesn't work, try `sudo nano /etc/NetworkManager/NetworkManager.conf` and set `managed=true` for ifupdown
- then might have to do the other commands above after as well
- know its working when we can `ping google.com`

## Screen blanking

Disable the screen going blank/to sleep

- `sudo raspi-config`
- 'Display options' then 'Screen blanking' and disable it
- Save and maybe reboot

## Customising slides and time per slide and pulling in updates

- each slide will show for 15s - customise this in `--slideshow-delay=15` in `~/.xinitrc` (was: `~.profile`)
- edit `~/digital-signage/.env` then `PRESENTATION_PAGES` to choose different slide numbers to show
- change the first bit of the crontab from `*/1` to eg `*/3` to only check for updates every 3mins instead
- if the code changes `git pull` in `~/digital-signage`

## Quieter boot

- `sudo nano /boot/firmware/cmdline.txt`
  - add `quiet disable_splash loglevel=3` to end of the one line

## School firewall issue

School firewall seems to block debian repos. Edit the 2 URLs in `/etc/apt/sources.list.d/debian.sources` to include `http://cdn-fastly.deb.debian.org/` instead to fix it.

---

NOTE: these attempts didn't work

## fbi instead of feh - **no, will flicker**

For the most lightweight of setups

- `sudo apt install fbi`
- `sudo usermod -aG video $USER`... no, not needed
- `sudo fbi -T 2 -d /dev/fb0 -a -t 5 -noverbose ~/digital-signage/*.png`
  `q` to exit, or `reset` if can't see typed text if exited another way
- still want the crontab
- `sudo raspi-config` under system options, set auto login

## fbv instead of fbi - **no, can't get it installed**

So it doesn't flicker

- `sudo apt install build-essential autoconf automake libpng-dev libjpeg-dev libgif-dev zlib1g-dev`
- `git clone https://github.com/smokku/fbv.git`
- `cd fbv`
- `./configure`
- `make`
- `sudo make install`
