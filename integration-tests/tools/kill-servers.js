const find = require('find-process');
const kill = require('tree-kill');

find('name', 'node', true)
  .then(function (list) {
    console.log('there are %s server process(es)', list.length);
    list.forEach(element => {
        console.log(JSON.stringify(element));
        if (element.cmd.endsWith("npm-run-all --parallel start-ls start-vscode-mock")) {
          kill(element.pid);
          console.log("Killing " + element.cmd)
        }
    });
  });
