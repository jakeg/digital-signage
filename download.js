let presentationId = process.env.PRESENTATION_ID

let pageIds = await getPageIds()
let pageNums = [0, 1, 2] // which slides to get (zero-indexed)

for (let pageNum of pageNums) {
  let pageId = pageIds[pageNum]
  await downloadPageSvg(pageNum, pageId)
}

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
  console.log('Downloading SVG for page', pageNum, url)
  await Bun.write(`page-${pageNum}.svg`, await fetch(url))
  // feh needs svgs not pngs
  // TODO: rsvg-convert -w 1920 -h 1080 xxx.svg xxx.png
}

async function downloadPagePng (pageNum, pageId) {
  let url = `https://docs.google.com/presentation/d/${presentationId}/export/png?id=${presentationId}&pageid=${pageId}`
  await Bun.write(`page-${pageNum}.png`, await fetch(url))
}