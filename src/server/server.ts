'use strict';
/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
import { delimiter, join, sep } from 'path';
import { debug } from '../utils/logger';
import { ServerOptions, ExecutableOptions } from 'vscode-languageclient';

export function getServerOptions(ballerinaCmd: string): ServerOptions {
    debug(`Using Ballerina CLI command '${ballerinaCmd}' for Language server.`);
    let cmd = process.platform === 'win32' ? getConvertedPath(ballerinaCmd) : ballerinaCmd;
    let args = ["start-language-server"];
    let opt: ExecutableOptions = {};
    opt.env = Object.assign({}, process.env);

    if (process.env.LS_EXTENSIONS_PATH !== "") {
        if (opt.env.BALLERINA_CLASSPATH_EXT) {
            opt.env.BALLERINA_CLASSPATH_EXT += delimiter + process.env.LS_EXTENSIONS_PATH;
        } else {
            opt.env.BALLERINA_CLASSPATH_EXT = process.env.LS_EXTENSIONS_PATH;
        }
    }
    if (process.env.LSDEBUG === "true") {
        debug('Language Server is starting in debug mode.');
        let debugPort = 5005;
        opt.env.BAL_JAVA_DEBUG = debugPort;
        opt.env.BAL_DEBUG_OPTS = "-Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=" + debugPort + ",quiet=y";
    }

    if (process.env.LS_CUSTOM_CLASSPATH) {
        args.push('--classpath', process.env.LS_CUSTOM_CLASSPATH);
    }

    return {
        command: cmd,
        args,
        options: opt
    };
}

function getConvertedPath(ballerinaCmd: string): string {
    let paths = ballerinaCmd.split(sep);
    paths = paths.map(path => path.startsWith("\"") && path.endsWith("\"") ? path.substring(1, path.length - 1) : path);
    return join.apply(null, paths);
}
