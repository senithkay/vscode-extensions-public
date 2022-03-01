const express = require('express')
const cors = require('cors')
const bodyParser = require("body-parser")
const { writeFileSync } = require("fs")
const path = require('path');
const { getAllResources, getLibrariesList, getLibraryData } = require('../../ballerina-languageclient/lib/library-browser/client');

const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, "..", "..", "distribution", "build-app")));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());

app.get('/file/*', (req, res) => {
  const filePathEncoded = req.params[0];
  const filePath = decodeURIComponent(filePathEncoded);
  res.sendFile(filePath);
});

app.post('/file/*', (request,response) => {
  const body = request.body;
  const filePathEncoded = request.params[0];
  const filePath = decodeURIComponent(filePathEncoded);
  if (!filePath.includes("no-save")) {
    const text = body.text;
    writeFileSync(filePath, text);
  } else {
    console.log("Ignoring save to " + filePath)
  }
  
  response.send({
      success: true
  })
});


app.get('/libs/data', (req, res) => {
  getAllResources().then((resp) => res.send(resp))
    .catch((e) => { res.status(500).send({
        message: e.message
    })});
});


app.get('/libs/list', (req, res) => {
  getLibrariesList(req.params[0]).then((resp) => res.send(resp))
      .catch((e) => { res.status(500).send({
        message: e.message
      })});
});

app.post('/lib/data', (req, res) => {
  const {orgName, moduleName, version } = req.body;
  getLibraryData(orgName, moduleName, version).then((resp) => res.send(resp))
      .catch((e) => { res.status(500).send({
        message: e.message
      })});
});


app.listen(port, () => {
  console.log(`VSCode mocker server listening at http://localhost:${port}`)
});
