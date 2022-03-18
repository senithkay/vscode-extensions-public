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
import { CollapseViewState } from "./collapse";
import { ControlFlowState } from './controlflow';
import { DraftStatementViewState } from "./draft";
import { PlusViewState } from "./plus";
import { SimpleBBox } from "./simple-bbox";
import { ViewState } from "./view-state";
export class BlockViewState extends ViewState {
    public plusButtons: PlusViewState[] = [];
    public connectors = new Map();
    public collapseView: CollapseViewState = undefined;
    public isEndComponentAvailable = false;
    public isEndComponentInMain = false;
    public collapsedFrom: number = 0;
    public draft: [number, DraftStatementViewState] = undefined;
    public isElseBlock: boolean = false;
    public isDoBlock: boolean = false;
    public isOnErrorBlock: boolean = false;
    public controlFlow = new ControlFlowState();
    public isResource: boolean = false;
    public isCallerAvailable: boolean = false;
    public hasWorkerDecl: boolean = false;
    public workerArrows: SimpleBBox[] = [];
    public workerIndicatorLine: SimpleBBox = new SimpleBBox();

    constructor() {
        super();
    }
}
