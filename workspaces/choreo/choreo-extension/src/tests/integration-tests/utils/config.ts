/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { workspace } from "vscode";

import { CHOREO_ENV_CONFIG_DEV, CHOREO_ENV_CONFIG_STAGE, DEFAULT_CHOREO_ENV_CONFIG, IChoreoEnvConfig } from "../../../auth/config";

export function getChoreoEnvConfig(): IChoreoEnvConfig {
    const choreoEnv = workspace.getConfiguration().get("Advanced.ChoreoEnvironment");

    let pickedEnvConfig: IChoreoEnvConfig;

    switch (choreoEnv) {
        case 'prod':
            pickedEnvConfig = DEFAULT_CHOREO_ENV_CONFIG;
            break;
        case 'stage':
            pickedEnvConfig = CHOREO_ENV_CONFIG_STAGE;
            break;
        case 'dev':
            pickedEnvConfig = CHOREO_ENV_CONFIG_DEV;
            break;
        default:
            pickedEnvConfig = DEFAULT_CHOREO_ENV_CONFIG;
    }

    return pickedEnvConfig;
}
