/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { SourcePointViewState, TargetPointViewState } from ".";

export class ConnectionViewState {
    public x1: number;
    public x2: number;
    public y1: number;
    public y2: number;
    public targetPosition: NodePosition;
    public targetType: string;
    public targetUnionType: string;

    constructor(sourcePointVS: SourcePointViewState, targetPointVS: TargetPointViewState, targetPosition: NodePosition) {
        this.x1 = sourcePointVS.bBox.x;
        this.x2 = targetPointVS.bBox.x;
        this.y1 = sourcePointVS.bBox.y;
        this.y2 = targetPointVS.bBox.y;
        this.targetPosition = targetPosition;
        this.targetType = targetPointVS.type;
        this.targetUnionType = targetPointVS.unionType;
    }
}
