#!/usr/bin/env node
import { execSync } from "child_process";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { ext } from "../extensionVariables";
import { workspace } from "vscode";

export const getCliVersion = ():string =>{
    const packageJson = JSON.parse(fs.readFileSync(path.join(ext.context.extensionPath, "package.json"), "utf8"));
    return packageJson?.cliVersion;
};

export const getChoreoExecPath = () => {
    const executablePath = workspace.getConfiguration().get<string>("Advanced.RpcPath");
    if (executablePath) {
        return executablePath;
    }
    
    return path.join(getChoreoBinPath(), "choreo");
};

const getChoreoBinPath = () => {
    return path.join(ext.context.globalStorageUri.path, "choreo-cli-rpc", getCliVersion(), "bin");
};

export const downloadCLI = async () => {
    const OS = os.platform();
    const ARCH = getArchitecture();
    const CHOREO_BIN_DIR = getChoreoBinPath();
    const CHOREO_CLI_EXEC = getChoreoExecPath();
    const CLI_VERSION = getCliVersion();
    const CHOREO_TMP_DIR = await fs.promises.mkdtemp(path.join(os.tmpdir(), `choreo-cli-rpc-${CLI_VERSION}`));

    await fs.promises.mkdir(CHOREO_BIN_DIR, { recursive: true });

    const FILE_NAME = `choreo-cli-${CLI_VERSION}-${OS}-${ARCH}`;
    let FILE_TYPE = "";

    if (OS === "linux") {
        FILE_TYPE = ".tar.gz";
    } else if (OS === "darwin") {
        FILE_TYPE = ".zip";
    } else {
        throw new Error(`Unsupported OS: ${OS}`);
    }
    const CHOREO_TMP_FILE_DEST = path.join(CHOREO_TMP_DIR, `${FILE_NAME}${FILE_TYPE}`);

    const INSTALLER_URL = `https://github.com/wso2/choreo-cli/releases/download/${CLI_VERSION}/${FILE_NAME}${FILE_TYPE}`;

    console.log(`Choreo RPC download URL: ${INSTALLER_URL}`);

    await downloadFile(INSTALLER_URL, CHOREO_TMP_FILE_DEST);

    console.log(`Extracting archive into temp dir: ${CHOREO_TMP_DIR}`);
    if (FILE_TYPE === ".tar.gz") {
        execSync(`tar -xzf ${CHOREO_TMP_FILE_DEST} -C ${CHOREO_TMP_DIR}`);
    } else if (FILE_TYPE === ".zip") {
        execSync(`unzip -q ${CHOREO_TMP_FILE_DEST} -d ${CHOREO_TMP_DIR}`);
    }

    console.log(`Moving executable to ${CHOREO_BIN_DIR}`);
    await fs.promises.rename(`${CHOREO_TMP_DIR}/choreo`, CHOREO_CLI_EXEC);

    console.log("Cleaning up...");
    await fs.promises.rm(CHOREO_TMP_DIR, { recursive: true });

    process.chdir(CHOREO_BIN_DIR);
    fs.promises.chmod(CHOREO_CLI_EXEC, 0o755);

    console.log("Choreo RPC server was installed successfully 🎉");
};

async function downloadFile(url: string, dest: string) {
    const response = await axios({ url, method: "GET", responseType: "stream" });
    const writer = fs.createWriteStream(dest);

    // const totalSize = parseInt(response.headers["content-length"], 10);
    // let downloadedSize = 0;
    // response.data.on("data", (chunk: string) => {
    //     downloadedSize += chunk.length;
    //     const progress = Math.round((downloadedSize / totalSize) * 100);
    //     console.log(`Download Choreo RPC progress: ${progress}%`);
    // });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

function getArchitecture() {
    const ARCH = os.arch();
    switch (ARCH) {
        case "x64":
            return "amd64";
        case "x32":
            return "386";
        case "arm64":
        case "aarch64":
            return "arm64";
        case "arm":
            return "arm";
        default:
            throw new Error(`Unsupported architecture: ${ARCH}`);
    }
}
