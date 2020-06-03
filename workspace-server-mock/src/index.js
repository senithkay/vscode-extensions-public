const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json());

const port = 3000;

const defaultContent = `
    function myFunction() {

    }
`;

const repoPath = path.resolve(__dirname, "..", "repo");
const fileAPIPath = "/orgs/:orgId/apps/:appId/workspace/files/*";

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

app.get(fileAPIPath, (req, res) => {

    const filePath =  path.resolve(repoPath, req.params.orgId,  req.params.appId, req.params[0]);
    let contentRaw;
    if(!fs.existsSync(filePath)) {
        ensureDirectoryExistence(filePath);
        fs.writeFileSync(filePath, defaultContent);
        contentRaw = defaultContent;
    } else {
        contentRaw = fs.readFileSync(filePath).toString();
    }
    res.send({
        content: Buffer.from(contentRaw).toString('base64'),
        path: "/" + req.params[0],
        size: contentRaw.length,
        type: "file"
    });
});

app.post(fileAPIPath, (req, res) => {
    const filePath =  path.resolve(repoPath, req.params.orgId,  req.params.appId, req.params[0]);
    const contentEncoded = req.body.content;
    fs.writeFileSync(filePath, Buffer.from(contentEncoded, 'base64').toString());
    res.send({
        content: contentEncoded,
        path: "/" + req.params[0],
        size: 71,
        type: "file"
    });
});

app.listen(port, () => console.log(`File Server listening at http://localhost:${port}`));
