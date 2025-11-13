# Digital signage

For use on eg a Raspberry Pi Zero 2 W

- install Bun
  `curl -fsSL https://bun.sh/install | bash`
- install `feh` (for image slideshows) and `librsvg` (to convert SVGs from Google slides to PNGs):
  `sudo apt install feh librsvg2-bin`
- add a `.env` with your presentation id and zero-indexed page indexes
```bash
PRESENTATION_ID="___your_google_slide_presentation_id___"
PRESENTATION_PAGES="[0, 1, 2]"
```