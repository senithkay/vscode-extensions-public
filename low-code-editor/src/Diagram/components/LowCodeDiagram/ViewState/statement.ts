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
import { ActionViewState } from "./action";
import { EndpointViewState } from "./endpoint";
import { SimpleBBox } from "./simple-bbox";
import { ViewState } from "./view-state";

export class StatementViewState extends ViewState {
    public isCallerAction: boolean = false;
    public isAction: boolean = false;
    public isEndpoint: boolean = false;
    public endpoint: EndpointViewState = new EndpointViewState();
    public dataProcess: SimpleBBox = new SimpleBBox();
    public variableName: SimpleBBox = new SimpleBBox();
    public variableAssignment: SimpleBBox = new SimpleBBox();
    public conditionAssignment: SimpleBBox = new SimpleBBox();
    public action: ActionViewState = new ActionViewState();
    public isReached: boolean;
    public sendLine: SimpleBBox = new SimpleBBox();
    hasSendLine: boolean;

    constructor() {
        super();
        this.isAction = false;
        this.isEndpoint = false;
    }

}
