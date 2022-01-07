const cp = require("child_process");
const fs = require("fs");
const path = require("path");

const balHome = cp.execSync("bal home").toString().trim();

fs.cpSync(
    path.join(balHome, "examples", "index.json"),
    path.join(__dirname, "..", "src", "stories", "data", "bbes.json"),
    { force: true }
);
