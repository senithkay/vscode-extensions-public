# Overview

This is a mono repo containing several npm modules used for Ballerina Low Code Editor, Choreo Console and VSCode Plugin.

## Modules List

- **lang-service** : Contains utils to start/connect to Ballerina Lang Server with NodeJs
- **syntax-tree**  : Contains utils and typescript interfaces related to Ballerina Syntax Tree which can be used to process a syntax tree JSON in a javascript/typescript project.
- **low-code-editor-commons** : Contains type definitions and shared components between all modules related to Ballerina Low Code Editor
- **statement-editor** : Contains components related to Ballerina Statement Editor which is a part of Low Code Editor
- **configurable-editor** : Contains components related to Ballerina Configurable Editor which is a part of Low Code Editor in VSCode/Choreo Console
- **low-code-editor** : Contains components related to Ballerina Low Code Editor and bundles all the modules needed to run Low Code Editor in VSCode/Choreo Console

## Developer Guide

### Requirements

- NodeJs : 16.x
- Setup [VSCode Ext Development Enviornment](https://github.com/wso2-enterprise/ballerina-plugin-vscode) : (For testing Ballerina Low Code Editor with VSCode)


### Local Development

First, you need to build the all the modules using ```npm run build``` command at repo root.
This will download all the dependencies and wireup inter dependencies using symlinks.

Depending on the module you want to develop, you can choose to open any individual module folder in your IDE or open the whole repository if you are planning to make changes across multiple modules.

You can run any command inside a single module by passing the ```--workspace``` argument to ```npm run <cmd>```. Or to run a command for all the modules, you can use ```--workspaces``` argument

some examples 
- To build statement editor ```npm run build --workspace=statement-editor```
- To run tests in all modules ```npm run test --workspaces```

Please check <package.json> - we have added some common cmds as scripts there to help you.

#### Changing and testing dependant modules

For example, statement-editor module is being used by low-code-editor module. Lets say, you want to change statement-editor and test low-code-editor with those changes included. You can follow below steps in this case.

- Make necessary changes in statement-editor and run ```npm run build:se```
- Then build low-code-editor by running ```npm run build:lce```

If you want keep changing while doing the changes

- Run ```npm run watch --workspace=statement-editor```
- Run ```npm run watch --workspace=low-code-editor```

#### IMPORTANT! Installing dependencies to workspaces

Always run the ```npm i``` command from repo root with relavant workspace args added at the end to indicate to which these should be installed.

eg: ```  npm i -D source-map-loader --workspace low-code-editor ```

If you do a npm i from workspace directory, it will create a new package-lock there and can create inconsistencies. 

## Links

- [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

### Note
The VSCode icons used within the low-code-editor's statement-editor is by [react-icons](https://react-icons.github.io/react-icons/icons?name=vsc) which is licensed under CC By 4.0
