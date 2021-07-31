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
import { SimpleBBox } from "./simple-bbox";
import { ViewState } from "./view-state";

export class EndpointViewState extends ViewState {
    public visible: boolean = false;
    public isUsed: boolean = false;
    public isExternal: boolean = false;
    public epName?: string;
    public start: SimpleBBox = new SimpleBBox();
    public lifeLine: SimpleBBox = new SimpleBBox();
    public actionExecution: SimpleBBox = new SimpleBBox();
    public client: SimpleBBox = new SimpleBBox();
    public iconId: string = "default";
    public typeName: string;

    constructor() {
        super();
        this.visible = true;
        this.isUsed = false;
    }
}
