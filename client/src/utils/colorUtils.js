// Extract dominant colors from an image 
export async function extractColors(imageUrl, count = 5) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const SIZE = 100 // downscale for performance
        canvas.width = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, SIZE, SIZE)
        const data = ctx.getImageData(0, 0, SIZE, SIZE).data
        const pixels = []
        for (let i = 0; i < data.length; i += 4 * 10) { // sample every 10th pixel
          pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
        }
        const colors = kMeans(pixels, count)
        resolve(colors)
      } catch {
        resolve([])
      }
    }
    img.onerror = () => resolve([])
    img.src = imageUrl
  })
}

export function colorDistance(c1, c2) {
  return Math.sqrt(
    (c1.r - c2.r) ** 2 +
    (c1.g - c2.g) ** 2 +
    (c1.b - c2.b) ** 2
  )
}
// Convert hex string to {r,g,b}
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null
}
// Convert {r,g,b} to hex
export function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}
function kMeans(pixels, k, iterations = 8) {
  if (!pixels.length) return []
  k = Math.min(k, pixels.length)
  // Init centroids randomly
  let centroids = pixels
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, k)
  for (let iter = 0; iter < iterations; iter++) {
    // Assign pixels to nearest centroid
    const clusters = Array.from({ length: k }, () => [])
    for (const p of pixels) {
      let minDist = Infinity
      let nearest = 0
      for (let j = 0; j < centroids.length; j++) {
        const d = colorDistance(p, centroids[j])
        if (d < minDist) { minDist = d; nearest = j }
      }
      clusters[nearest].push(p)
    }
    // Update centroids
    centroids = clusters.map((cluster, j) => {
      if (!cluster.length) return centroids[j]
      const avg = cluster.reduce(
        (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
        { r: 0, g: 0, b: 0 }
      )
      return {
        r: Math.round(avg.r / cluster.length),
        g: Math.round(avg.g / cluster.length),
        b: Math.round(avg.b / cluster.length),
      }
    })
  }

  return centroids
}