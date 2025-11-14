let timeout = Bun.argv[2] || 10
// not uses - directly in ~/.profile instead
await Bun.$`feh --fullscreen --zoom fill --slideshow-delay ${timeout} ./slides/`