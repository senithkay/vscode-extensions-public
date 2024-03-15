/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseString } from 'xml2js';

enum Nature {
    MULTIMODULE,
    ESB,
    DS,
    DATASOURCE,
    CONNECTOR,
    REGISTRY,
}

export function getProjectDetails(filePath: string) {
    let projectName: string | undefined;
    let groupId: string | undefined;
    let artifactId: string | undefined;
    const pomContent = fs.readFileSync(path.join(filePath, "pom.xml"), 'utf8');
  
    parseString(pomContent, { explicitArray: false, ignoreAttrs: true }, (err, result) => {
        if (err) {
            console.error('Error parsing pom.xml:', err);
            return;
        }

        projectName = result?.project?.name;
        groupId = result?.project?.groupId;
        artifactId = result?.project?.artifactId;
    });

    return {projectName, groupId, artifactId};
}

export function migrateConfigs(source: string, target: string) {
    // determine the project type here
    const projectType = determineProjectType(source);
    if (projectType === Nature.MULTIMODULE) {
        const items = fs.readdirSync(source, { withFileTypes: true });
        items.forEach(item => {
            if (item.isDirectory()) {
                const sourceAbsolutePath = path.join(source, item.name)
                const moduleType = determineProjectType(path.join(source, item.name));
                if (moduleType === Nature.ESB || moduleType === Nature.DS || 
                    moduleType === Nature.DATASOURCE || moduleType === Nature.CONNECTOR || moduleType === Nature.REGISTRY) {
                    copyConfigsToNewProjectStructure(moduleType, sourceAbsolutePath, target)
                }
            }
        });
    }
}

function determineProjectType(source: string): Nature | undefined {
    const rootMetaDataFilePath = path.join(source, '.project');
    let configType;
    if (fs.existsSync(rootMetaDataFilePath)) {
       const projectFileContent = fs.readFileSync(rootMetaDataFilePath, 'utf-8');
       parseString(projectFileContent, { explicitArray: false, ignoreAttrs: true }, (err, result) => {
            if (err) {
                console.error('Error occured while reading ' + rootMetaDataFilePath, err);
                return; 
            }
            const projectDescription = result.projectDescription;
            if (projectDescription && projectDescription.natures && projectDescription.natures.nature) {
                let nature = projectDescription.natures.nature;
                if (Array.isArray(nature)) {
                    nature = nature.find(element => element.startsWith("org.wso2.developerstudio.eclipse"));
                }

                switch(nature) {
                    case 'org.wso2.developerstudio.eclipse.mavenmultimodule.project.nature':
                        configType = Nature.MULTIMODULE;
                        break;
                    case 'org.wso2.developerstudio.eclipse.esb.project.nature':
                        configType = Nature.ESB;
                        break;
                    case 'org.wso2.developerstudio.eclipse.ds.project.nature':
                        configType = Nature.DS;
                        break;
                    case 'org.wso2.developerstudio.eclipse.datasource.project.nature':
                        configType = Nature.DATASOURCE;
                        break;
                    case 'org.wso2.developerstudio.eclipse.artifact.connector.project.nature':
                        configType = Nature.CONNECTOR;
                        break;  
                    case 'org.wso2.developerstudio.eclipse.general.project.nature':
                        configType = Nature.REGISTRY;
                        break;
                }
            }
        });
    }
    return configType;
}

function copyConfigsToNewProjectStructure(nature: Nature, source: string, target: string) {
    switch(nature) {
        case Nature.ESB:
            processArtifactsFolder(source, target);
            processMetaDataFolder(source, target);
            processTestsFolder(source, target)
            break;
        case Nature.DATASOURCE:
            processDataSourcesFolder(source, target);
            break;
        case Nature.DS:
            processDataServicesFolder(source, target);
            break;
        case Nature.CONNECTOR:
            processConnectors(source, target);
            break;
        case Nature.REGISTRY: 
            processRegistryResources(source, target);
            break;
    }
}

function processArtifactsFolder(source: string, target:string) {
    const synapseConfigsPath = path.join(source, 'src', 'main', 'synapse-config');
    const artifactsPath = path.join(target, 'src' , 'main', 'wso2mi', 'artifacts');
    const sourceFolders = [
        'api',
        'endpoints',
        'inbound-endpoints',
        'local-entries',
        'message-processors',
        'message-stores',
        'proxy-services',
        'sequences',
        'tasks',
        'templates',
    ];
    const targetFolders = [
        'apis',
        'endpoints',
        'inbound-endpoints',
        'local-entries',
        'message-processors',
        'message-stores',
        'proxy-services',
        'sequences',
        'tasks',
        'templates',
    ];

    sourceFolders.forEach((sourceFolder, index) => {
        const sourcePath = path.join(synapseConfigsPath, sourceFolder);
        const targetPath = path.join(artifactsPath, targetFolders[index])

        copy(sourcePath, targetPath)
    });

}

function processMetaDataFolder(source: string, target:string) {
    const oldMetaDataPath = path.join(source, 'src', 'main', 'resources', 'metadata');
    const newMetaDataPath = path.join(target, 'src' , 'main', 'wso2mi', 'resources', 'metadata');

    copy(oldMetaDataPath, newMetaDataPath)
}

function processDataSourcesFolder(source: string, target:string) {
    const oldDataSourcePath = path.join(source, 'datasource');
    const newDataSourcePath = path.join(target, 'src' , 'main', 'wso2mi', 'artifacts', 'data-sources');

    copy(oldDataSourcePath, newDataSourcePath)
}

function processDataServicesFolder(source: string, target:string) {
    const oldDataServicePath = path.join(source, 'dataservice');
    const newDataServicePath = path.join(target, 'src' , 'main', 'wso2mi', 'artifacts', 'data-services');

    copy(oldDataServicePath, newDataServicePath)
}

function processConnectors(source: string, target:string) {
    const newConnectorPath = path.join(target, 'src' , 'main', 'wso2mi', 'resources', 'connectors');

    fs.readdir(source, {withFileTypes: true}, (err, files) => {
        if (err) {
            console.error(`Failed to list contents of the folder: ${source}`, err);
            return;
        }

        files.forEach(file => {
            if (file.isFile()) {
                if (path.extname(file.name).toLowerCase() === '.zip') {
                    copyFile(path.join(source, file.name), path.join(newConnectorPath, file.name))
                }
            }
        });
    });
}

function processRegistryResources(source: string, target:string) {
    const artifactXMLPath = path.join(source, 'artifact.xml');
    const newRegistryPath = path.join(target, 'src' , 'main', 'wso2mi', 'resources', 'registry');
    copyFile(artifactXMLPath, path.join(newRegistryPath, 'artifact.xml'));

    //read artifact.xml
    const xmlContent = fs.readFileSync(artifactXMLPath, 'utf-8');

    parseString(xmlContent, { explicitArray: false, ignoreAttrs: true }, (err, result) => {
        if (err) {
          console.error('Error parsing pom.xml:', err);
          return;
        }
        
        const artifacts = result.artifacts.artifact;

        artifacts.forEach(artifact => {
            const fileName = artifact.item.file;
            const relativePath = artifact.item.path;
            let targetAbsolutePath;

            if (relativePath.startsWith('/_system/governance')) {
                targetAbsolutePath = path.join(newRegistryPath, path.normalize(relativePath.replace(/^\/_system\/governance/, 'gov')));
            } else if (relativePath.startsWith('/_system/config')) {
                targetAbsolutePath = path.join(newRegistryPath, path.normalize(relativePath.replace(/^\/_system\/config/, 'conf')));
            }
            const sourceFile = path.join(source, fileName);
            const targetFile = path.join(targetAbsolutePath, fileName);
            fs.mkdir(targetAbsolutePath, { recursive: true }, err => {
                if (err) {
                    console.error(`Failed to create folder structure ${targetAbsolutePath}`, err);
                } else {
                    copyFile(sourceFile, targetFile);
                }
            });
        });

      });
}

function processTestsFolder(source: string, target:string) {
    const oldTestPath = path.join(source, 'test');
    const newTestPath = path.join(target, 'src', 'main', 'test', 'wso2mi');

    copy(oldTestPath, newTestPath)
}

function copy(source: string, target: string) {
    fs.readdir(source, (err, files) => {
        if (err) {
            console.error(`Failed to list contents of the folder: ${source}`, err);
            return;
        }
        
        files.forEach(file => {
            copyFile(path.join(source, file), path.join(target, file))
        });
    });
}

function copyFile (sourcePath: string, targetPath: string) {
    fs.copyFile(sourcePath, targetPath, err => {
        if (err) {
            console.error(`Failed to copy file from ${sourcePath} to ${targetPath}`, err);
        }
    });
}
