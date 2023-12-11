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

import { VisualizerLocation } from "../../extension-interfaces/state-machine-types";
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
import { EggplantModel } from "./types";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { Flow } from "./types";

export interface WebviewAPI {
    getState: () => Promise<string>;
    getVisualizerState: () => Promise<VisualizerLocation>;
    openVisualizerView: (params: VisualizerLocation) => void;
    getBallerinaProjectComponents: () => Promise<BallerinaProjectComponents>;
    getEggplantModel: () => Promise<Flow>;
    executeCommand: (params: string) => void;
    getSTNodeFromLocation: (params: VisualizerLocation) => Promise<STNode>;
    updateSource: (params: Flow) => void;
}