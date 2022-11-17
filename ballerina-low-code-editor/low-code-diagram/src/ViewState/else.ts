/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { BlockViewState } from "./block";
import { SimpleBBox } from "./simple-bbox";

export class ElseViewState extends BlockViewState {

    public ifHeadWidthOffset: number = 0;
    public ifHeadHeightOffset: number = 0;
    public widthDiffOfIfBody: number = 0;
    public elseTopHorizontalLine: SimpleBBox = undefined;
    public elseBottomHorizontalLine: SimpleBBox = undefined;
    public elseBody: SimpleBBox = undefined;
    constructor() {
        super();
        this.elseBody = new SimpleBBox();
        this.elseBottomHorizontalLine = new SimpleBBox();
        this.elseTopHorizontalLine = new SimpleBBox();
    }
}
