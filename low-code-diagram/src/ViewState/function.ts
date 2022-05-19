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
import { OnFailClause } from "@wso2-enterprise/syntax-tree";

import { STOP_SVG_HEIGHT } from "../Components/RenderingComponents/End/StopSVG";
import { START_SVG_HEIGHT } from "../Components/RenderingComponents/Start/StartSVG";
import { DefaultConfig } from "../Visitors/default";

import { BlockViewState } from "./block";
import { EndViewState } from "./end";
import { PlusViewState } from "./plus";
import { SimpleBBox } from "./simple-bbox";
import { TriggerParamsViewState } from "./triggerParams";
import { ViewState } from "./view-state";

export class FunctionViewState extends ViewState {
    public topOffset: number = START_SVG_HEIGHT / 2 ;
    public bottomOffset: number = STOP_SVG_HEIGHT + (2 * DefaultConfig.dotGap);
    public lifeLine: SimpleBBox = new SimpleBBox();
    public wrapper: SimpleBBox = new SimpleBBox();
    public trigger: SimpleBBox = new SimpleBBox();
    public workerLine: SimpleBBox = new SimpleBBox();
    public workerBody: BlockViewState = new BlockViewState();
    public end: EndViewState = new EndViewState();
    public initPlus: PlusViewState = undefined;
    public onFail: OnFailClause = undefined;
    public precedingPlus: PlusViewState = undefined;
    public triggerParams: TriggerParamsViewState = new TriggerParamsViewState();
    public isResource: boolean = false;
    public functionNodeFilePath?: string = undefined;
    public functionNodeSource?: string = undefined
    constructor() {
        super();
    }
}
