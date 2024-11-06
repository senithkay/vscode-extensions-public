import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import axios from 'axios';
import { downloadWithProgress, extractWithProgress } from './fileOperations';
import { extension } from '../MIExtensionContext';
import { copyMavenWrapper } from '.';
import { CONFIG_JAVA_HOME, CONFIG_SERVER_PATH } from '../debugger/constants';
import { COMMANDS } from '../constants';

// Add Latest MI version as the first element in the array
export const supportedJavaVersionsForMI: { [key: string]: string } = {
    '4.3.0': '17.0.11'
};
export const LATEST_MI_VERSION = "4.3.0";

const miDownloadUrls: { [key: string]: string } = {
    '4.3.0': 'https://github.com/wso2/micro-integrator/releases/download/v4.3.0/wso2mi-4.3.0.zip',
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

        const miVersion = await getMIVersionFromPom();
        const isMISetup = await ensureMISetup(projectUri, miVersion);
        const isJavaSetup = await ensureJavaSetup(miVersion);

        return isMISetup && isJavaSetup;
    } catch (error) {
        console.error('Error setting up environment:', error);
        vscode.window.showErrorMessage(`Error setting up environment: ${error instanceof Error ? error.message : error}`);
        return false;
    }
}

export function validateJavaHomeInFolder(folderPath: string, miVersion: string): string {
    const javaHomePath = findJavaHomeInFolder(folderPath);
    if (javaHomePath) {
        const javaVersion = getJavaVersion(path.join(javaHomePath, 'bin'));
        if (!javaVersion) {
            throw new Error('Java version could not be determined.');
        }

        if (isJavaVersionCompatibleWithMI(javaVersion, miVersion)) {
            return javaHomePath;
        } else {
            throw new Error(`Unsupported Java version: ${javaVersion}.`);
        }
    }

    throw new Error('Java binary not found.');
}

export function getSupportedMIVersions(): string[] {
    return Object.keys(supportedJavaVersionsForMI);
}

export async function getMIVersionFromPom(): Promise<string> {
    const pomFiles = await vscode.workspace.findFiles('pom.xml', '**/node_modules/**', 1);
    if (pomFiles.length === 0) {
        throw new Error('pom.xml not found.');
    }
    const pomContent = await vscode.workspace.openTextDocument(pomFiles[0]);
    const miVersionMatch = pomContent
        .getText()
        .match(/<project.runtime.version>(.*?)<\/project.runtime.version>/);

    if (miVersionMatch && miVersionMatch[1]) {
        if (isSupportedMIVersion(miVersionMatch[1])) {
            return miVersionMatch[1];
        }
        throw new Error('Unsupported Micro Integrator version.');
    } else {
        // throw new Error('Failed to retrieve Micro Integrator runtime version from pom.xml tag not found.');
        return setAndGetLatestMIVersionInPom(); //TODO: Remove this line after fixing the issue with samples not having the <project.runtime.version> tag
    }
}

export async function setAndGetLatestMIVersionInPom(): Promise<string> {
    const pomFiles = await vscode.workspace.findFiles('pom.xml', '**/node_modules/**', 1);
    if (pomFiles.length === 0) {
        throw new Error('pom.xml not found.');
    }
    const pomFilePath = pomFiles[0].fsPath;
    const pomDocument = await vscode.workspace.openTextDocument(pomFiles[0]);
    let xml = pomDocument.getText();

    const propertyTag = `   <project.runtime.version>${LATEST_MI_VERSION}</project.runtime.version>\n`;

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

    fs.writeFileSync(pomFilePath, xml);
    return LATEST_MI_VERSION;
}

export function getMIZipPath(miVersion: string): string | null {
    const miPath = path.join(CACHED_FOLDER, 'micro-integrator', `wso2mi-${miVersion}.zip`);
    return fs.existsSync(miPath) ? miPath : null;
}

export async function downloadJava(miVersion: string): Promise<string> {
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

        const majorVersion = javaVersion.split('.')[0];
        const apiUrl = `https://api.adoptium.net/v3/assets/feature_releases/${majorVersion}/ga?architecture=${archName}&heap_size=normal&image_type=jdk&jvm_impl=hotspot&os=${osName}&project=jdk&vendor=eclipse`;

        const response = await axios.get<AdoptiumApiResponse[]>(apiUrl);
        if (response.data.length === 0) {
            throw new Error(`Failed to find Java binaries for version ${javaVersion}.`);
        }

        const targetRelease = response.data.find(
            (release) => release.version_data.openjdk_version.startsWith(javaVersion)
        );

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
            `Failed to download Java. ${
                error instanceof Error ? error.message : error
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

        const miDownloadPath = path.join(miPath, `wso2mi-${miVersion}.zip`);
        await downloadWithProgress(miDownloadUrls[miVersion], miDownloadPath, 'Downloading Micro Integrator');
        return miDownloadPath;
    } catch (error) {
        throw new Error('Failed to download Micro Integrator.');
    }
}

export function isJavaHomePathValid(javaHome: string): boolean {
    const javaExecutable = path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
    return fs.existsSync(javaExecutable);
}

function isSupportedMIVersion(version: string): boolean {
    return getSupportedMIVersions().includes(version);
}

function getJavaVersion(javaBinPath: string): string | null {
    const javaExecutableName = process.platform === 'win32' ? 'java.exe' : 'java';
    const javaExecutable = path.join(javaBinPath, javaExecutableName);
    const result = spawnSync(javaExecutable, ['-version'], { encoding: 'utf8' });

    if (result.error || result.status !== 0) {
        return null;
    }
    const versionMatch = result.stderr.match(/version "(\d+)(\.\d+)?(\.\d+)?/);
    return versionMatch ? versionMatch[1] : null;
}

function isJavaVersionCompatibleWithMI(javaVersion: string, miVersion: string): boolean {
    const majorJavaVersion = javaVersion.split('.')[0];
    return supportedJavaVersionsForMI[miVersion]?.startsWith(majorJavaVersion) ?? false;
}

function isMIInstalledInProjectPath(projectPath: string): boolean {
    return isMIInstalledAtPath(path.join(projectPath, '.wso2mi', 'runtime'));
}

export function isMIInstalledAtPath(miPath: string): boolean {
    const miExecutable = process.platform === 'win32' ? 'micro-integrator.bat' : 'micro-integrator.sh';
    return fs.existsSync(path.join(miPath, 'bin', miExecutable));
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

function findJavaHomeInFolder(folderPath: string): string | null {
    const javaExecutableName = process.platform === 'win32' ? 'java.exe' : 'java';
    const javaPath = path.join(folderPath, 'bin', javaExecutableName);

    if (fs.existsSync(javaPath)) {
        return path.normalize(folderPath);
    }

    return null;
}

export function getInstalledJavaPathForMIVersion(miVersion: string): string | null {
    const javaInstallations = getJavaInstallations();

    for (const javaInstallation of javaInstallations) {
        if (isJavaVersionCompatibleWithMI(javaInstallation.version, miVersion)) {
            return javaInstallation.path;
        }
    }
    return null;
}

function getJavaInstallations(): { version: string; path: string }[] {
    const javaPaths: string[] = [];

    const javaCachedPath = path.join(CACHED_FOLDER, 'java');
    if (fs.existsSync(javaCachedPath)) {
        const javaFolders = fs.readdirSync(javaCachedPath, { withFileTypes: true });
        for (const folder of javaFolders) {
            if (folder.isDirectory()) {
                const javaHomePath = process.platform === 'darwin'
                    ? path.join(javaCachedPath, folder.name, 'Contents', 'Home')
                    : path.join(javaCachedPath, folder.name);
                javaPaths.push(javaHomePath);
            }
        }
    }

    return javaPaths
        .map((javaPath) => {
            const version = getJavaVersion(path.join(javaPath, 'bin'));
            return { version, path: javaPath };
        })
        .filter((javaInstallation): javaInstallation is { version: string; path: string } => javaInstallation.version !== null);
}

export async function ensureMISetup(projectUri: string, miVersion: string): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('MI');
    const currentMIPath = config.get<string>(CONFIG_SERVER_PATH);

    if (currentMIPath) {
        const availableMIVersion = getMIVersion(currentMIPath);
        if (availableMIVersion === miVersion) {
            return true;
        }
    }

    const miPath = path.join(projectUri, '.wso2mi', 'runtime', `wso2mi-${miVersion}`);

    if (!isMIInstalledInProjectPath(projectUri)) {
        const availableMIVersion = getMIVersion(miPath);

        if (availableMIVersion !== miVersion) {
            const miZipPath = getMIZipPath(miVersion);

            if (miZipPath) {
                const extractPath = path.join(projectUri, '.wso2mi', 'runtime');
                fs.mkdirSync(extractPath, { recursive: true });
                try {
                    await extractWithProgress(miZipPath, extractPath, 'Extracting Micro Integrator');
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to extract Micro Integrator: ${(error as Error).message}`);
                    return false;
                }
                await config.update(CONFIG_SERVER_PATH, miPath, vscode.ConfigurationTarget.Workspace);
                return true;
            } else {
                return false;
            }
        }
    }
    await config.update(CONFIG_SERVER_PATH, miPath, vscode.ConfigurationTarget.Workspace);
    return true;
}

export async function ensureJavaSetup(miVersion: string): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('MI');
    const currentJavaHome = config.get<string>(CONFIG_JAVA_HOME);

    if (currentJavaHome && isJavaHomePathValid(currentJavaHome)) {
        return true;
    }

    const javaPath = getInstalledJavaPathForMIVersion(miVersion);

    if (javaPath) {
        const javaHome = path.normalize(javaPath);
        await config.update(CONFIG_JAVA_HOME, javaHome, vscode.ConfigurationTarget.Workspace);
        return true;
    }
    return false;
}

export function getJavaHomeFromConfig(): string | undefined {
    const config = vscode.workspace.getConfiguration('MI');
    const currentJavaHome = config.get<string>(CONFIG_JAVA_HOME);

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

export function getServerPathFromConfig(): string | undefined {
    const config = vscode.workspace.getConfiguration('MI');
    const currentServerPath = config.get<string>(CONFIG_SERVER_PATH);

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

export function getDefaultProjectPath(): string {
    return path.join(os.homedir(), 'wso2mi', 'Projects');
}
