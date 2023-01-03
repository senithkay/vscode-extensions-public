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
import { STOP_SVG_HEIGHT } from "../Components/RenderingComponents/End/StopSVG";
import { START_SVG_HEIGHT } from "../Components/RenderingComponents/Start/StartSVG";
import { DefaultConfig } from "../Visitors/default";

import { BlockViewState } from "./block";
import { PlusViewState } from "./plus";
import { SimpleBBox } from "./simple-bbox";
import { StatementViewState } from "./statement";

export class ServiceViewState extends StatementViewState {
    public plusButtons: PlusViewState[] = [];
    public topOffset: number = START_SVG_HEIGHT / 2 + (2 * DefaultConfig.dotGap) ;
    public bottomOffset: number = STOP_SVG_HEIGHT + (2 * DefaultConfig.dotGap);
    public wrapper: SimpleBBox = new SimpleBBox();
    public serviceBody: BlockViewState = new BlockViewState();
    public serviceBodyRect: SimpleBBox = new SimpleBBox();

    constructor() {
        super();
        this.bBox.w = 300; // todo: make constant
    }
}
