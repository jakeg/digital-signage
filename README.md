# Digital signage

For use on eg a Raspberry Pi Zero 2 W

- start with the 'lite' 64bit image (64bit or can't use Bun)
- when using the imager, give it a user and WiFi details to save time later
- `sudo apt update` and `sudo apt upgrade`
- `sudo apt install git`
- `git clone https://github.com/jakeg/digital-signage`

- install Bun
  `curl -fsSL https://bun.sh/install | bash`
- install `feh` (for image slideshows) and `librsvg` (to convert SVGs from Google slides to PNGs):
  `sudo apt install feh librsvg2-bin`
- `git clone https://github.com/jakeg/digital-signage
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

# show the slideshow on boot
@reboot sleep 45 ()
```

- uses wayland by default and hard to get GUI to open in that on startup so...
- `sudo update-alternatives --config x-session-manager` and choose openbox