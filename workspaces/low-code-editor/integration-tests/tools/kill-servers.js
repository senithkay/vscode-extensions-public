const find = require('find-process');
const kill = require('tree-kill');

find('name', 'npm', true)
  .then(function (list) {
    console.log('there are %s server process(es)', list.length);
    list.forEach(element => {
        if (element.cmd === "npm run start-servers") {
          kill(element.pid, "SIGKILL");
          console.log("Killing " + element.cmd)
        }
        console.log(JSON.stringify(element));
    });
  });
