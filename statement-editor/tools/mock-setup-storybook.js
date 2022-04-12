function setupDevBalProject() {
    const storyDataDir = path.join(__dirname, "..", "src", "stories", "data");
    let devProjectFolder = path.join(storyDataDir, "project");
    if (process.env.LOW_CODE_DEV_PROJECT_PATH) {
        devProjectFolder = process.env.LOW_CODE_DEV_PROJECT_PATH;
        console.log("Dev Project Path is set via env var LOW_CODE_DEV_PROJECT_PATH. Path: " + devProjectFolder)
    } else {
        console.log("Using default dev project path. Override using LOW_CODE_DEV_PROJECT_PATH env var.")
    }
    if (existsSync(devProjectFolder)) {
        console.log("Development project alreay exists at " + devProjectFolder)
    } else {
        const projectName = path.parse(devProjectFolder).name;
        const cwd = path.resolve(path.parse(devProjectFolder).dir);
        console.log(cwd)
        const balNewOutput = execSync("bal new " + projectName, { cwd }).toString().trim();
        if (balNewOutput.startsWith("Created new")) {
            console.log("Initialized new Ballerina Project at " + devProjectFolder)
        } else {
            console.log("Unable to initialize new Ballerina project at " + devProjectFolder)
        }
    }


        writeFile(path.join(storyDataDir, "devproject.json"),
`
{
    "projectPath": "${devProjectFolder}/"
}
`    ,
    (err) => err ? console.log("dev project json make error: " + err ) : console.log("dev project json make successful")
    );    
    
}


function setUpSyntaxTreeJSON(){
    const syntaxTreeList = Object.create(null);
    const projectRoot = path.join(__dirname, "..");
    const sourceRoot = path.join(projectRoot, "src");
    const storyDataDir = path.join(sourceRoot, "stories", "data");
    let devProjectFolder = path.join(storyDataDir, "project");
    if (process.env.LOW_CODE_DEV_PROJECT_PATH) {
        devProjectFolder = process.env.LOW_CODE_DEV_PROJECT_PATH;
        console.log("Dev Project Path is set via env var LOW_CODE_DEV_PROJECT_PATH. Path: " + devProjectFolder)
    } else {
        console.log("Using default dev project path. Override using LOW_CODE_DEV_PROJECT_PATH env var.")
    }
    if (existsSync(devProjectFolder)) {
        console.log("Development project alreay exists at " + devProjectFolder)
    } else {
        const projectName = path.parse(devProjectFolder).name;
        const cwd = path.resolve(path.parse(devProjectFolder).dir);
        console.log(cwd)
        const balNewOutput = execSync("bal new " + projectName, { cwd }).toString().trim();
        if (balNewOutput.startsWith("Created new")) {
            console.log("Initialized new Ballerina Project at " + devProjectFolder)
        } else {
            console.log("Unable to initialize new Ballerina project at " + devProjectFolder)
        }
    }

    syntaxTreeList["sample.bal"] ={};

    writeFile(path.join(storyDataDir, "syntaxTreeList.json"), 
        `${JSON.stringify(syntaxTreeList)}`  ,
        (err) => err ? console.log("syntaxTreeList json make error: " + err) : console.log("syntaxTreeList json make successful"));

}

