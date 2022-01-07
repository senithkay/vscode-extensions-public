const express = require('express')
var cors = require('cors')

const app = express()
const port = 3000

app.use(cors())

app.use(express.json()) 

app.get('/file/*', (req, res) => {
  const filePathEncoded = req.params[0];
  const filePath = decodeURIComponent(filePathEncoded);
  res.sendFile(filePath);
})

app.listen(port, () => {
  console.log(`VSCode mocker server listening at http://localhost:${port}`)
})
