import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import axios from 'axios';
import { downloadWithProgress, extractWithProgress, selectFolderDialog } from './fileOperations';
import { extension } from '../MIExtensionContext';
import { copyMavenWrapper } from '.';
import { SELECTED_JAVA_HOME, SELECTED_SERVER_PATH } from '../debugger/constants';
import { COMMANDS } from '../constants';
import { SetPathRequest, PathDetailsResponse, SetupDetails } from '@wso2-enterprise/mi-core';

// Add Latest MI version as the first element in the array
export const supportedJavaVersionsForMI: { [key: string]: string } = {
    '4.4.0': '21',
    '4.3.0': '17',
    '4.2.0': '17',
    '4.1.0': '11',
};
export const LATEST_MI_VERSION = "4.4.0";
const COMPATIBLE_JDK_VERSION = "11";
const miDownloadUrls: { [key: string]: string } = {
    '4.4.0': 'https://github.com/wso2/product-micro-integrator/releases/download/v4.4.0-alpha/wso2mi-4.4.0-alpha.zip',
    '4.3.0': 'https://github.com/wso2/micro-integrator/releases/download/v4.3.0/wso2mi-4.3.0.zip'
};

const CACHED_FOLDER = path.join(os.homedir(), '.wso2-mi');

export async function setupEnvironment(projectUri: string): Promise<boolean> {
    try {
        const wrapperFiles = await vscode.workspace.findFiles('{mvnw,mvnw.cmd}', '**/node_modules/**', 1);
        if (wrapperFiles.length === 0) {
            copyMavenWrapper(
                extension.context.asAbsolutePath(path.join('resources', 'maven-wrapper')),
                projectUri
            );
        }

        const { miDetails } = await getProjectSetupDetails();
        if (!(miDetails && miDetails.version)) {
            return false;
        }
        const isMISet = await isMISetup(miDetails.version);
        const isJavaSet = await isJavaSetup(miDetails.version);

        return isMISet && isJavaSet;
    } catch (error) {
        console.error('Error setting up environment:', error);
        vscode.window.showErrorMessage(`Error setting up environment: ${error instanceof Error ? error.message : error}`);
        return false;
    }
}
export async function getProjectSetupDetails(): Promise<SetupDetails> {
    const miVersion = await getMIVersionFromPom();
    if (!miVersion) {
        vscode.window.showErrorMessage('Failed to get Micro Integrator version from pom.xml.');
        return { isSupportedMIVersion: false, javaDetails: { status: 'not-valid' }, miDetails: { status: 'not-valid' } };
    }
    if (isSupportedMIVersion(miVersion)) {
        const recommendedVersions = { miVersion, javaVersion: supportedJavaVersionsForMI[miVersion] };
        const setupDetails = await getJavaAndMIPathsFromWorkspace(miVersion);
        return { ...setupDetails, isSupportedMIVersion: true, showDownloadButtons: isDownloadableMIVersion(miVersion), recommendedVersions };
    }

    return { isSupportedMIVersion: false, javaDetails: { status: 'not-valid' }, miDetails: { status: 'not-valid' } };
}
async function getMIVersionFromPom(): Promise<string | null> {
    const pomFiles = await vscode.workspace.findFiles('pom.xml', '**/node_modules/**', 1);
    if (pomFiles.length === 0) {
        vscode.window.showErrorMessage('pom.xml not found.');
        return null;
    }

    const pomContent = await vscode.workspace.openTextDocument(pomFiles[0]);
    const pomContentText = pomContent.getText();
    const miVersionMatch = pomContentText
        .match(/<project.runtime.version>(.*?)<\/project.runtime.version>/);
    return miVersionMatch ? miVersionMatch[1] : null;
}
async function isMISetup(miVersion: string): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        const config = vscode.workspace.getConfiguration('MI', workspaceFolder.uri);
        const currentMIPath = config.get<string>(SELECTED_SERVER_PATH);
        if (currentMIPath) {
            const availableMIVersion = getMIVersion(currentMIPath);
            if (availableMIVersion && isCompatibleMIVersion(availableMIVersion, miVersion)) {
                if (availableMIVersion !== miVersion) {
                    showMIPathChangePrompt();
                }
                return true;
            }
        }

        const miCachedPath = getMICachedPath(miVersion);

        const oldServerPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
        if (oldServerPath) {
            const availableMIVersion = getMIVersion(oldServerPath);
            if (availableMIVersion && compareVersions(availableMIVersion, miVersion) >= 0) {
                if (availableMIVersion !== miVersion) {
                    showMIPathChangePrompt();
                }
                await config.update(SELECTED_SERVER_PATH, oldServerPath, vscode.ConfigurationTarget.Workspace);
                return true;
            }
        }
        if (miCachedPath) {
            await config.update(SELECTED_SERVER_PATH, miCachedPath, vscode.ConfigurationTarget.Workspace);
            return true;
        }
    }
    return false;
    function getMICachedPath(miVersion: string): string | null {
        const miPath = path.join(CACHED_FOLDER, 'micro-integrator', `wso2mi-${miVersion}`);
        return fs.existsSync(miPath) ? miPath : null;
    }
    function showMIPathChangePrompt() {
        const DONT_SHOW_AGAIN_KEY = 'dontShowMIPathChangePrompt';
        const dontShowAgain = extension.context.globalState.get<boolean>(DONT_SHOW_AGAIN_KEY);

        if (dontShowAgain) {
            return;
        }

        const downloadOption = 'Download Micro Integrator';
        const changePathOption = 'Change Micro Integrator Path';
        const dontShowAgainOption = 'Don\'t Show Again';

        vscode.window
            .showWarningMessage(
                'The selected Micro Integrator version is different from the version in the workspace. Do you want to change the Micro Integrator path?',
                downloadOption,
                changePathOption,
                dontShowAgainOption
            )
            .then((selection) => {
                if (selection) {
                    if (selection === downloadOption) {
                        downloadMI(miVersion).then((miPath) => {
                            if (miPath) {
                                setPathsInWorkSpace({ type: 'MI', path: miPath });
                            }
                        });
                    } else if (selection === changePathOption) {
                        selectFolderDialog('Select Micro Integrator Path').then((miPath) => {
                            if (miPath) {
                                const validMIPath = verifyMIPath(miPath.fsPath);
                                if (validMIPath) {
                                    setPathsInWorkSpace({ type: 'MI', path: validMIPath });
                                } else {
                                    vscode.window.showErrorMessage('Invalid Micro Integrator path. Please set a valid Micro Integrator path and run the command again.');
                                }
                            }
                        });
                    } else if (selection === dontShowAgainOption) {
                        extension.context.globalState.update(DONT_SHOW_AGAIN_KEY, true);
                    }
                }
            });
    }
}
async function isJavaSetup(miVersion: string): Promise<boolean> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        const config = vscode.workspace.getConfiguration('MI', workspaceFolder.uri);
        const currentJavaHome = config.get<string>(SELECTED_JAVA_HOME);
        if (currentJavaHome) {
            const currentJavaVersion = getJavaVersion(path.join(currentJavaHome, 'bin')) ?? '';
            if (isCompatibleJavaVersionForMI(currentJavaVersion, miVersion)) {
                if (!isRecommendedJavaVersionForMI(currentJavaVersion, miVersion)) {
                    showJavaHomeChangePrompt();
                }
                return true;
            }
        }

        const globalJavaHome: string | undefined = extension.context.globalState.get(SELECTED_JAVA_HOME);
        if (globalJavaHome) {
            const javaVersion = getJavaVersion(path.join(globalJavaHome, 'bin')) ?? '';
            if (isCompatibleJavaVersionForMI(javaVersion, miVersion)) {
                if (!isRecommendedJavaVersionForMI(javaVersion, miVersion)) {
                    showJavaHomeChangePrompt();
                }
                await config.update(SELECTED_JAVA_HOME, globalJavaHome, vscode.ConfigurationTarget.Workspace);
                return true;
            }
        }

        const javaHome = getCachedJavaHomeForMIVersion(miVersion);

        if (javaHome) {
            await config.update(SELECTED_JAVA_HOME, path.normalize(javaHome), vscode.ConfigurationTarget.Workspace);
            return true;
        }
        if (process.env.JAVA_HOME) {
            const javaVersion = getJavaVersion(path.join(process.env.JAVA_HOME, 'bin')) ?? '';
            if (isCompatibleJavaVersionForMI(javaVersion, miVersion)) {
                if (!isRecommendedJavaVersionForMI(javaVersion, miVersion)) {
                    showJavaHomeChangePrompt();
                }
                await config.update(SELECTED_JAVA_HOME, process.env.JAVA_HOME, vscode.ConfigurationTarget.Workspace);
                return true;
            }
        }
    }
    return false;
    function getCachedJavaHomeForMIVersion(miVersion: string): string | null {

        const javaCachedPath = path.join(CACHED_FOLDER, 'java');
        if (fs.existsSync(javaCachedPath)) {
            const javaFolders = fs.readdirSync(javaCachedPath, { withFileTypes: true });
            for (const folder of javaFolders) {
                if (folder.isDirectory()) {
                    const javaHomePath = process.platform === 'darwin'
                        ? path.join(javaCachedPath, folder.name, 'Contents', 'Home')
                        : path.join(javaCachedPath, folder.name);
                    const javaVersion = getJavaVersion(path.join(javaHomePath, 'bin'));
                    if (javaVersion && isRecommendedJavaVersionForMI(javaVersion, miVersion)) {
                        return javaHomePath;
                    }
                }
            }
        }
        return null;
    }
    function showJavaHomeChangePrompt() {
        const DONT_SHOW_AGAIN_KEY = 'dontShowJavaHomeChangePrompt';
        const dontShowAgain = extension.context.globalState.get<boolean>(DONT_SHOW_AGAIN_KEY);

        if (dontShowAgain) {
            return;
        }

        const downloadOption = 'Download Java';
        const changePathOption = 'Change Java Home';
        const dontShowAgainOption = 'Don\'t Show Again';

        vscode.window
            .showWarningMessage(
                'The selected Java version is not recommended with the Micro Integrator version. Do you want to change the Java Home path?',
                downloadOption,
                changePathOption,
                dontShowAgainOption
            )
            .then((selection) => {
                if (selection) {
                    if (selection === downloadOption) {
                        downloadJavaFromMI(miVersion).then((javaPath) => {
                            if (javaPath) {
                                setPathsInWorkSpace({ type: 'JAVA', path: javaPath });
                            }
                        });
                    } else if (selection === changePathOption) {
                        selectFolderDialog('Select Java Home').then((javaHome) => {
                            if (javaHome) {
                                const validJavaHome = verifyJavaHomePath(javaHome.fsPath);
                                if (validJavaHome) {
                                    setPathsInWorkSpace({ type: 'JAVA', path: validJavaHome });
                                } else {
                                    vscode.window.showErrorMessage('Invalid Java Home path. Please set a valid Java Home path and run the command again.');
                                }
                            }
                        });
                    } else if (selection === dontShowAgainOption) {
                        extension.context.globalState.update(DONT_SHOW_AGAIN_KEY, true);
                    }
                }
            });
    }
}

export function verifyJavaHomePath(folderPath: string): string | null {
    const javaExecutableName = process.platform === 'win32' ? 'java.exe' : 'java';
    let javaPath = path.join(folderPath, 'bin', javaExecutableName);
    let javaHomePath: string | null = null;

    if (fs.existsSync(javaPath)) {
        javaHomePath = path.normalize(folderPath);
    }

    javaPath = path.join(folderPath, javaExecutableName);
    if (fs.existsSync(javaPath)) {
        javaHomePath = path.normalize(path.join(folderPath, '..'));
    }

    if (javaHomePath) {
        const javaVersion = getJavaVersion(path.join(javaHomePath, 'bin'));
        if (javaVersion && isSupportedJavaVersionForLS(javaVersion)) {
            return javaHomePath;
        }
    }
    return null;
}
export function verifyMIPath(folderPath: string): string | null {
    const miExecutable = process.platform === 'win32' ? 'micro-integrator.bat' : 'micro-integrator.sh';
    let miPath = path.join(folderPath, 'bin', miExecutable);
    let miHomePath: string | null = null;

    if (fs.existsSync(miPath)) {
        miHomePath = path.normalize(folderPath);
    }

    miPath = path.join(folderPath, miExecutable);
    if (fs.existsSync(miPath)) {
        miHomePath = path.normalize(path.join(folderPath, '..'));
    }

    if (miHomePath) {
        const miVersion = getMIVersion(miHomePath);
        if (miVersion && isSupportedMIVersion(miVersion)) {
            return miHomePath;
        }
    }

    return null;
}

export function getSupportedMIVersionsHigherThan(version: string): string[] {
    if (version) {
        return Object.keys(supportedJavaVersionsForMI).filter((v) => compareVersions(v, version) >= 0);
    }
    return Object.keys(supportedJavaVersionsForMI);
}

export async function downloadJavaFromMI(miVersion: string): Promise<string> {
    interface AdoptiumApiResponse {
        binaries: {
            package: {
                link: string;
            };
        }[];
        release_name: string;
        version_data: {
            openjdk_version: string;
        };
    }

    const javaVersion = supportedJavaVersionsForMI[miVersion];
    const javaPath = path.join(CACHED_FOLDER, 'java');
    const osType = os.type();

    const osMap: { [key: string]: string } = {
        Darwin: 'mac',
        Linux: 'linux',
        Windows_NT: 'windows',
    };

    const archMap: { [key: string]: string } = {
        x64: 'x64',
        x32: 'x86',
        arm64: 'aarch64',
    };

    try {
        const osName = osMap[osType];
        if (!osName) {
            throw new Error(`Unsupported OS type: ${osType}`);
        }

        const archName = archMap[os.arch()];
        if (!archName) {
            throw new Error(`Unsupported architecture: ${os.arch()}`);
        }

        if (!javaVersion) {
            throw new Error('Unsupported Java version.');
        }

        if (!fs.existsSync(javaPath)) {
            fs.mkdirSync(javaPath, { recursive: true });
        }

        const apiUrl = `https://api.adoptium.net/v3/assets/feature_releases/${javaVersion}/ga?architecture=${archName}&heap_size=normal&image_type=jdk&jvm_impl=hotspot&os=${osName}&project=jdk&vendor=eclipse`;

        const response = await axios.get<AdoptiumApiResponse[]>(apiUrl);
        if (response.data.length === 0) {
            throw new Error(`Failed to find Java binaries for version ${javaVersion}.`);
        }

        const targetRelease = response.data[0];

        if (!targetRelease) {
            throw new Error(
                `Java version ${javaVersion} not found for the specified OS and architecture.`
            );
        }

        const downloadUrl = targetRelease.binaries[0].package.link;
        const releaseName = targetRelease.release_name;

        const javaDownloadPath = path.join(
            javaPath,
            osType === 'Windows_NT' ? `${releaseName}.zip` : `${releaseName}.tar.gz`
        );

        await downloadWithProgress(downloadUrl, javaDownloadPath, 'Downloading Java');
        await extractWithProgress(javaDownloadPath, javaPath, 'Extracting Java');

        if (osType === 'Darwin') {
            return path.join(javaPath, releaseName, 'Contents', 'Home');
        } else {
            return path.join(javaPath, releaseName);
        }
    } catch (error) {
        throw new Error(
            `Failed to download Java. ${error instanceof Error ? error.message : error
            }.
            If issue persists, please download and install Java ${javaVersion} manually.`
        );
    }
}

export async function downloadMI(miVersion: string): Promise<string> {
    const miPath = path.join(CACHED_FOLDER, 'micro-integrator');

    try {
        if (!fs.existsSync(miPath)) {
            fs.mkdirSync(miPath, { recursive: true });
        }
        const zipName = miDownloadUrls[miVersion].split('/').pop();
        const extractFolderName = zipName?.replace('.zip', '');

        const miDownloadPath = path.join(miPath, zipName!);
        const extractedMIPath = path.join(miPath, extractFolderName!);

        if (!fs.existsSync(miDownloadPath)) {
            await downloadWithProgress(miDownloadUrls[miVersion], miDownloadPath, 'Downloading Micro Integrator');
        } else {
            vscode.window.showInformationMessage('Micro Integrator already downloaded.');
        }
        if (!fs.existsSync(extractedMIPath)) {
            await extractWithProgress(miDownloadPath, miPath, 'Extracting Micro Integrator');
        } else {
            vscode.window.showInformationMessage('Micro Integrator already extracted.');
        }
        return extractedMIPath;
    } catch (error) {
        throw new Error('Failed to download Micro Integrator.');
    }
}

function isSupportedJavaVersionForLS(version: string): boolean {
    if (!version) {
        return false;
    }
    return compareVersions(version, COMPATIBLE_JDK_VERSION) >= 0;
}
function isSupportedMIVersion(version: string): boolean {
    return Object.keys(supportedJavaVersionsForMI).includes(version);
}
function isDownloadableMIVersion(version: string): boolean {
    return miDownloadUrls[version] !== undefined;
}

function getJavaVersion(javaBinPath: string): string | null {
    const javaExecutableName = process.platform === 'win32' ? 'java.exe' : 'java';
    const javaExecutable = path.join(javaBinPath, javaExecutableName);
    const result = spawnSync(javaExecutable, ['-version'], { encoding: 'utf8' });

    if (result.error || result.status !== 0) {
        return null;
    }
    const versionMatch = result.stderr.match(/(\d+)(\.\d+)*(\.\d+)*/);
    return versionMatch ? versionMatch[0].split('.')[0] : null;
}
function getMIVersion(miPath: string): string | null {
    const miVersionFile = path.join(miPath, 'bin', 'version.txt');
    if (!isMIInstalledAtPath(miPath) || !fs.existsSync(miVersionFile)) {
        return null;
    }
    const miVersionContent = fs.readFileSync(miVersionFile, 'utf8');
    const versionMatch = miVersionContent.match(/v(\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : null;
}
function isRecommendedJavaVersionForMI(javaVersion: string, miVersion: string): boolean {
    if (!javaVersion || !miVersion) {
        return false;
    }
    const supportedVersion = supportedJavaVersionsForMI[miVersion];
    return supportedVersion ? javaVersion === supportedVersion : false;
}
function isCompatibleJavaVersionForMI(javaVersion: string, miVersion: string): boolean {
    if (!javaVersion || !miVersion) {
        return false;
    }
    return isSupportedJavaVersionForLS(javaVersion) &&
        compareVersions(javaVersion, supportedJavaVersionsForMI[miVersion]) <= 0; // higher java version not compatible
}

function isCompatibleMIVersion(runtimeVersion: string, projectVersion: string): boolean {
    if (!projectVersion || !runtimeVersion) {
        return false;
    }
    return compareVersions(runtimeVersion, projectVersion) >= 0; // lower mi version not compatible
}

function isMIInstalledAtPath(miPath: string): boolean {
    const miExecutable = process.platform === 'win32' ? 'micro-integrator.bat' : 'micro-integrator.sh';
    return fs.existsSync(path.join(miPath, 'bin', miExecutable));
}
export async function setPathsInWorkSpace(request: SetPathRequest): Promise<PathDetailsResponse> {
    const projectMIVersion = await getMIVersionFromPom();

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    let response: PathDetailsResponse = { status: 'not-valid' };
    if (workspaceFolder && projectMIVersion) {
        const config = vscode.workspace.getConfiguration('MI', workspaceFolder.uri);
        if (request.type === 'JAVA') {
            const validJavaHome = verifyJavaHomePath(request.path);
            if (validJavaHome) {
                const javaVersion = getJavaVersion(path.join(validJavaHome, 'bin'));
                if (supportedJavaVersionsForMI[projectMIVersion] === javaVersion) {
                    response = { status: "valid", path: validJavaHome, version: javaVersion };
                } else if (javaVersion && isCompatibleJavaVersionForMI(javaVersion, projectMIVersion)) {
                    response = { status: "mismatch", path: validJavaHome, version: javaVersion! };
                }
            }
            if (response.status !== 'not-valid') {
                config.update(SELECTED_JAVA_HOME, validJavaHome, vscode.ConfigurationTarget.Workspace);
                extension.context.globalState.update(SELECTED_JAVA_HOME, validJavaHome);

            } else {
                vscode.window.showErrorMessage('Invalid Java Home path or Unsupported version. Please set a valid Java Home path. ');
            }
        }
        else if (request.type === 'MI') {
            const validServerPath = verifyMIPath(request.path);
            if (validServerPath) {
                const runtimeVersion = getMIVersion(validServerPath);
                if (projectMIVersion === runtimeVersion) {
                    response = { status: "valid", path: validServerPath, version: runtimeVersion };
                } else if (runtimeVersion && compareVersions(runtimeVersion, projectMIVersion) >= 0) {
                    response = { status: "mismatch", path: validServerPath, version: runtimeVersion! };
                }
            }
            if (response.status !== 'not-valid') {
                config.update(SELECTED_SERVER_PATH, validServerPath, vscode.ConfigurationTarget.Workspace);
                extension.context.globalState.update(SELECTED_SERVER_PATH, validServerPath);
            } else {
                vscode.window.showErrorMessage('Invalid Micro Integrator path or Unsupported version. Please set a valid Micro Integrator path');
            }

        }
    }
    return response;
}

async function getJavaAndMIPathsFromWorkspace(projectMiVersion: string): Promise<SetupDetails> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    const response: SetupDetails = {
        javaDetails: { status: 'not-valid', version: supportedJavaVersionsForMI[projectMiVersion] },
        miDetails: { status: 'not-valid', version: projectMiVersion }
    };
    if (workspaceFolder && projectMiVersion) {
        const config = vscode.workspace.getConfiguration('MI', workspaceFolder.uri);

        const javaHome = config.get<string>(SELECTED_JAVA_HOME);
        const validJavaHome = javaHome && verifyJavaHomePath(javaHome) && getJavaFromCacheOrEnv(projectMiVersion);
        if (validJavaHome) {
            const javaVersion = getJavaVersion(path.join(validJavaHome, 'bin'));
            if (supportedJavaVersionsForMI[projectMiVersion] === javaVersion) {
                response.javaDetails = { status: "valid", path: validJavaHome, version: javaVersion };
            } else if (javaVersion && isCompatibleJavaVersionForMI(javaVersion, projectMiVersion)) {
                response.javaDetails = { status: "mismatch", path: validJavaHome, version: javaVersion! };
            }
        }

        const serverPath = config.get<string>(SELECTED_SERVER_PATH);
        const validServerPath = serverPath && verifyMIPath(serverPath) && getMIFromCache(projectMiVersion);
        if (validServerPath) {
            const miVersion = getMIVersion(validServerPath);
            if (projectMiVersion === miVersion) {
                response.miDetails = { status: "valid", path: validServerPath, version: miVersion };
            } else if (miVersion && isCompatibleMIVersion(miVersion, projectMiVersion)) {
                response.miDetails = { status: "mismatch", path: validServerPath, version: miVersion! };
            }
        }

        if (response.javaDetails.status === 'not-valid') {
            config.update(SELECTED_JAVA_HOME, undefined, vscode.ConfigurationTarget.Workspace);
        }
        if (response.miDetails.status === 'not-valid') {
            config.update(SELECTED_SERVER_PATH, undefined, vscode.ConfigurationTarget.Workspace);
        }
    }

    return response;
}

export async function updateRuntimeVersionsInPom(version: string): Promise<void> {
    const pomFiles = await vscode.workspace.findFiles('pom.xml', '**/node_modules/**', 1);
    if (pomFiles.length === 0) {
        throw new Error('pom.xml not found.');
    }
    const pomContent = await vscode.workspace.openTextDocument(pomFiles[0]);
    let xml = pomContent.getText();

    const propertyTag = `   <project.runtime.version>${version}</project.runtime.version>\n`;

    if (xml.includes('<properties>')) {
        // Check if the property already exists
        const propertyRegex = /<project\.runtime\.version>.*?<\/project\.runtime\.version>/s;
        if (propertyRegex.test(xml)) {
            // Replace the existing property value
            xml = xml.replace(propertyRegex, propertyTag.trim());
        } else {
            // Insert the new property before the closing </properties> tag
            xml = xml.replace(/(<\/properties>)/, `${propertyTag}$1`);
        }
    } else {
        // Insert a new <properties> section after the <project> tag
        const propertiesSection = `  <properties>\n${propertyTag}  \n</properties>\n`;
        xml = xml.replace(/(<project[^>]*>)/, `$1\n${propertiesSection}`);
    }

    fs.writeFileSync(pomFiles[0].fsPath, xml);
}

function getJavaFromCacheOrEnv(miVersion: string): string | undefined {
    const defaultJavaHome = extension.context.globalState.get<string>(SELECTED_JAVA_HOME);
    if (defaultJavaHome) {
        const defaultJavaVersion = getJavaVersion(path.join(defaultJavaHome, 'bin')) ?? '';
        if (isCompatibleJavaVersionForMI(defaultJavaVersion, miVersion)) {
            return defaultJavaHome;
        }
    }
    const environmentJavaHome = process.env.JAVA_HOME;
    if (environmentJavaHome) {
        const environmentJavaVersion = getJavaVersion(path.join(environmentJavaHome, 'bin')) ?? '';
        if (isCompatibleJavaVersionForMI(environmentJavaVersion, miVersion)) {
            return environmentJavaHome;
        }
    }
}

function getMIFromCache(miVersion: string): string | undefined {
    const defaultServerPath: string | undefined = extension.context.globalState.get(SELECTED_SERVER_PATH);
    if (defaultServerPath && isMIInstalledAtPath(defaultServerPath)) {
        const defaultServerMIVersion = getMIVersion(defaultServerPath);
        if (defaultServerMIVersion && compareVersions(defaultServerMIVersion, miVersion) >= 0) {
            return defaultServerPath;
        }
    }
}
export function compareVersions(v1: string, v2: string): number {
    // Extract only the numeric parts of the version string
    const getVersionNumbers = (str: string): string => {
        const match = str.match(/(\d+\.\d+\.\d+)/);
        return match ? match[0] : '0';
    };

    const version1 = getVersionNumbers(v1);
    const version2 = getVersionNumbers(v2);

    const parts1 = version1.split('.').map(part => parseInt(part, 10));
    const parts2 = version2.split('.').map(part => parseInt(part, 10));

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;

        if (part1 > part2) { return 1; }
        if (part1 < part2) { return -1; }
    }
    return 0;
}
export function getJavaHomeFromConfig(): string | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        const config = vscode.workspace.getConfiguration('MI', workspaceFolder.uri);
        const currentJavaHome = config.get<string>(SELECTED_JAVA_HOME);

        if (currentJavaHome) {
            if (!isJavaHomePathValid(currentJavaHome)) {
                vscode.window
                    .showErrorMessage(
                        'Invalid Java Home path. Please set a valid Java Home path and run the command again.',
                        'Change Java Home'
                    )
                    .then((selection) => {
                        if (selection) {
                            vscode.commands.executeCommand(COMMANDS.CHANGE_JAVA_HOME);
                        }
                    });
            }
        } else {
            vscode.window
                .showErrorMessage(
                    'Java Home path is not set. Please set a valid Java Home path and run the command again.',
                    'Set Java Home'
                )
                .then((selection) => {
                    if (selection) {
                        vscode.commands.executeCommand(COMMANDS.CHANGE_JAVA_HOME);
                    }
                });
        }
        return currentJavaHome;
    }
    function isJavaHomePathValid(javaHome: string): boolean {
        const javaExecutable = path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
        return fs.existsSync(javaExecutable);
    }
}

export function getServerPathFromConfig(): string | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
        const config = vscode.workspace.getConfiguration('MI', workspaceFolder.uri);
        const currentServerPath = config.get<string>(SELECTED_SERVER_PATH);

        if (currentServerPath) {
            if (!isMIInstalledAtPath(currentServerPath)) {
                vscode.window
                    .showErrorMessage(
                        'Invalid Micro Integrator path. Please set a valid Micro Integrator path and run the command again.',
                        'Change Micro Integrator Path'
                    )
                    .then((selection) => {
                        if (selection) {
                            vscode.commands.executeCommand(COMMANDS.CHANGE_SERVER_PATH);
                        }
                    });
            }
        } else {
            vscode.window
                .showErrorMessage(
                    'Micro Integrator path is not set. Please set a valid Micro Integrator path and run the command again.',
                    'Set Micro Integrator Path'
                )
                .then((selection) => {
                    if (selection) {
                        vscode.commands.executeCommand(COMMANDS.CHANGE_SERVER_PATH);
                    }
                });
        }
        return currentServerPath;
    }
}

export function getDefaultProjectPath(): string {
    return path.join(os.homedir(), 'wso2mi', 'Projects');
}
