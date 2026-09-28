export async function downloadNodePng(node: HTMLElement, filename: string) {
  const { toPng } = await import('html-to-image')        // solo al exportar: fuera del bundle inicial
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#eef5fc',
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
