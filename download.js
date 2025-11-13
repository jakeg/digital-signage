let presentationId = process.env.PRESENTATION_ID

console.log('Cleaning up')
await Bun.$`rm -rf ./tmp/* || true`

let pageIds = await getPageIds()
console.log(`Got page ids for ${pageIds.length} pages`)
let pageNums = JSON.parse(process.env.PRESENTATION_PAGES) // which slides to get (zero-indexed)

for (let pageNum of pageNums) {
  let pageId = pageIds[pageNum]
  await downloadPageSvg(pageNum, pageId)
}
console.log('Copying to slideshow folder')
await Bun.$`rm -rf ./tmp/*.svg || true`
await Bun.$`rm -rf ./slides || true && mv ./tmp ./slides`

// page ids are in some random script in the <html> returned from .../present
// this function gets the HTML, then finds "var viewerData = { ... }"
// then extracts the page ids from there
async function getPageIds () {
  let url = `https://docs.google.com/presentation/d/${presentationId}/present`
  let html = await (await fetch(url)).text()
  let match = html.match(/var viewerData\s*=\s*({.*?});/s)
  console.log
  let fn = new Function(`return ${match[1]}`)
  let pageIds = fn().docData[1].map(v => v[0])
  return pageIds
}

async function downloadPageSvg (pageNum, pageId) {
  let url = `https://docs.google.com/presentation/d/${presentationId}/export/svg?id=${presentationId}&pageid=${pageId}`
  console.log('Downloading SVG for page', pageNum)
  await Bun.write(`tmp/page-${pageNum}.svg`, await fetch(url))
  // feh needs svgs not pngs
  console.log('Converting SVG to PNG')
  await Bun.$`rsvg-convert -w 1920 -h 1080 tmp/page-${pageNum}.svg -o tmp/${pageNum}.png`
}