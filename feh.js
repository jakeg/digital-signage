let timeout = Bun.argv[2] || 1
await Bun.$`feh --fullscreen --zoom fill --slideshow-delay ${timeout} ./slides/`