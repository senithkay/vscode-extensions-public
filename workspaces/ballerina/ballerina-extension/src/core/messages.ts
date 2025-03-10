/**
 * Copyright (c) 2018, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BALLERINA_HOME } from "./preferences";

export const INVALID_HOME_MSG: string = "Ballerina Home is invalid, please check `" + BALLERINA_HOME + "` in settings";
export const INSTALL_BALLERINA: string = "Unable to detect Ballerina in your environment. If you just installed Ballerina, you may need to restart VSCode." +
    " If not, please install Ballerina.";
export const DOWNLOAD_BALLERINA: string = "https://ballerina.io/downloads/";
export const CONFIG_CHANGED: string = "Ballerina plugin configuration changed. Please restart vscode for changes to take effect.";
export const UPDATE_BALLERINA_VERSION: string = "Some features may not work properly for your Ballerina version. Please update Ballerina version to Update 12 or later.";
export const OLD_BALLERINA_VERSION: string = "Your Ballerina version does not match the Ballerina vscode plugin version. Please download the latest Ballerina distribution or download a compatible vscode plugin version via https://ballerina.io/downloads/.";
export const OLD_PLUGIN_VERSION: string = "Your Ballerina vscode plugin version does not match your Ballerina version. Some features may not work properly. Please update the Ballerina vscode plugin.";
export const MISSING_SERVER_CAPABILITY: string = "Your version of Ballerina platform distribution does not support this feature. Please update to the latest Ballerina platform";
export const INVALID_FILE: string = "The current file is not a valid Ballerina file. Please open a Ballerina file and try again.";
export const INVALID_PROJECT: string = "The current file does not belong to a Ballerina project. Please open a Ballerina file or a project, and try again.";
export const UNKNOWN_ERROR: string = "Unknown Error : Failed to start Ballerina Plugin.";
export const COMMAND_NOT_FOUND = "command not found";
export const NO_SUCH_FILE = "No such file or directory";
export const ERROR = "Error:";
export const OLD_PLUGIN_INSTALLED = "You have an older version of the Ballerina extension installed. Please uninstall the `ballerina.ballerina` extension and continue.";
export const RUN_PROJECT_TO_TRYIT = "Please make sure the project is already running to use the try out feature";
export const OLD_BALLERINA_VERSION_DEBUGGER_RUNINTERMINAL = "Debugger: Your Ballerina version does not support the run in terminal feature. Please update to 2201.3.0 or later version.";
export const UNSUPPORTED_DEBUGGER_RUNINTERMINAL_KIND = "Debugger: The run in external terminal capability is not supported. Launching program in integrated terminal.";
export const INVALID_DEBUGGER_RUNINTERMINAL_KIND = "Debugger: Invalid terminal kind provided. Failed to launch debugger.";
export const COOKIE_SETTINGS = "To change your current cookie setting, go back to the Choreo console, click \"Edit Code\", and relaunch for it to take effect.";
