let timeout = Bun.argv[2] || 10
await Bun.$`feh --fullscreen --zoom fill --slideshow-delay ${timeout} ./slides/`