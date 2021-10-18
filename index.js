const express = require('express')
const app = express()
const port = process.env.PORT || 3131
const screenshot = require('./screenshot')

app.get('/', (req, res) => res.status(200).json({ status: 'ok' }))

app.get('/screenshot', (req, res) => {
  let lat = req.query.lat || "55.753215"
  let lon = req.query.lon || "37.622504"
  let zoom = req.query.z || "10"
  const url = "https://yandex.ru/pogoda/maps/nowcast?via=mmapw&le_Lightning=1&lat=" + lat + "&lon=" + lon + "&z=" + zoom
  ;(async () => {
    const buffer = await screenshot(url)
    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
  })()
})

app.listen(port, () => console.log(`app listening on port ${port}!`))
