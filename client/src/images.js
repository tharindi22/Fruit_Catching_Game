const ICON_API = 'https://api.iconify.design/twemoji/'

const NAMES = ['banana', 'red-apple', 'watermelon', 'grapes', 'tangerine', 'bomb', 'basket']

const images = {} 

export function loadImages() {
  for (const name of NAMES) {
    if (images[name]) continue
    const img = new Image()
    img.src = ICON_API + name + '.svg?width=64&height=64'
    images[name] = img
  }
}

export function drawIcon(ctx, name, fallback, x, y, size) {
  const img = images[name]
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size)
  } else {
    ctx.font = size + 'px serif'
    ctx.fillText(fallback, x, y)
  }
}