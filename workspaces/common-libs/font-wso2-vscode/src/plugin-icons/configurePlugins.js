/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
const fs = require("fs");
const path = require("path");

// Define the source folder for fonts and related files
const fontDir = path.join(__dirname, '..', '..', 'fw-vscode');

// Read the CSS and JSON files
const cssPath = path.join(fontDir, 'wso2-vscode.css');
const jsonPath = path.join(fontDir, 'wso2-vscode.json');
const css = fs.readFileSync(cssPath, 'utf-8');
const fontJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Read the configuration from config.json
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Define a function to copy files and folders
function copyFontToPlugins(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourceFilePath = path.join(source, file);
    const targetFilePath = path.join(target, file);

    if (fs.lstatSync(sourceFilePath).isDirectory()) {
      copyFontToPlugins(sourceFilePath, targetFilePath);
    } else {
      fs.copyFileSync(sourceFilePath, targetFilePath);
    }
  });
}

// Define a function to extract content value from CSS
function extractContentValue(iconName) {
  const classRegex = new RegExp(`\\.fw-${iconName}:before\\s*{\\s*content:\\s*"\\\\([a-fA-F0-9]+)";\\s*}`, 'g');
  const match = classRegex.exec(css);

  if (match && match[1]) {
    return `\\${match[1]}`;
  } else {
    return null;
  }
}

// Define a function to generate icons contribution
function generateIconsContribution(selectedIconJson) {
  const iconsContribution = {};
  for (const selectedIconName of selectedIconJson) {
    for (const fontName in fontJson) {
      console.log("Compare",selectedIconName, ":",  `${fontName}.svg` );
      if (selectedIconName === `${fontName}.svg`) {
        const contentValue = extractContentValue(fontName);
  
        if (contentValue) {
          const iconDescription = fontName;
          const iconCharacter = contentValue;
    
          iconsContribution[`distro-${fontName}`] = {
            description: iconDescription,
            default: {
              fontPath: "./resources/fw-vscode/wso2-vscode.woff",
              fontCharacter: iconCharacter
            }
          };
          break;
        }
      }
    }
  }
  return iconsContribution;
}

// Copy fonts to plugins
const choreoExtFontPath = path.join(__dirname, '..', '..', '..', '..', 'choreo', 'choreo-extension', 'resources', 'fw-vscode');
const ballerinaExtFontPath = path.join(__dirname, '..', '..', '..', '..', 'ballerina', 'ballerina-extension', 'resources', 'fw-vscode');

copyFontToPlugins(fontDir, choreoExtFontPath);
copyFontToPlugins(fontDir, ballerinaExtFontPath);

// Generate icons contribution for Ballerina and Choreo extensions
const ballerinaIcons = config.ballerinaExtIcons || [];
const choreoIcons = config.choreoExtIcons || [];

const ballerinaIconsContribution = generateIconsContribution(ballerinaIcons);
const choreoIconsContribution = generateIconsContribution(choreoIcons);

// Merge the generated icons contribution into the existing package.json contributes
const choreoExtPackageJsonPath = path.join(__dirname, '..', '..', '..', '..', 'choreo', 'choreo-extension', 'package.json');
const ballerinaExtPackageJsonPath = path.join(__dirname, '..', '..', '..', '..', 'ballerina', 'ballerina-extension', 'package.json');

const choreoExtPackageJson = require(choreoExtPackageJsonPath);
const ballerinaExtPackageJson = require(ballerinaExtPackageJsonPath);

choreoExtPackageJson.contributes.icons = { ...choreoExtPackageJson.contributes.icons, ...choreoIconsContribution };
ballerinaExtPackageJson.contributes.icons = { ...ballerinaExtPackageJson.contributes.icons, ...ballerinaIconsContribution };

// Write the modified package.json files back to the file system
fs.writeFileSync(choreoExtPackageJsonPath, JSON.stringify(choreoExtPackageJson, null, 2), 'utf-8');
fs.writeFileSync(ballerinaExtPackageJsonPath, JSON.stringify(ballerinaExtPackageJson, null, 2), 'utf-8');
