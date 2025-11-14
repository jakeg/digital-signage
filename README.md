# Digital signage

For use on eg a Raspberry Pi Zero 2 W

- start with the 'lite' 64bit image (64bit or can't use Bun)
- when using the imager, give it a user and WiFi details to save time later
- `sudo apt update` and `sudo apt upgrade`
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



- check it works by running `bun download.js` in the folder
- run `bun feh.js` to see the slideshow
  - or eg `bun feh.js 1` for 1s between slides

- install a crontab with `crontab -e`
```
# download new slides every few minutes
*/2 * * * * (cd ~/digital-signage && timeout 15s ~/.bun/bin/bun download.js > ~/download.log 2>&1)
```

- uses wayland by default and hard to get GUI to open in that on startup so...
- `sudo update-alternatives --config x-session-manager` and choose openbox


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

## feh

Can't get fbv to install, so just use feh and x11

- `sudo apt install xorg openbox`
- `startx /usr/bin/feh --fullscreen --auto-zoom --slideshow-delay 15 ~/digtial-signage/slides/*.png`

Then when confirmed to work, add this to `~/.profile`

```bash
# Only run on the first virtual console
if [ "$(tty)" = "/dev/tty1" ]; then
  startx /usr/bin/feh --fullscreen --auto-zoom --slideshow-delay 15 ~/digtial-signage/slides/*.png
fi
```

- exit with `q`
- get a CLI with ctrl+alt+f2
- rerun with `source ~/.profile`