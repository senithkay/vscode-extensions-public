/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { SimpleBBox, StatementViewState } from ".";

export class DoViewState extends StatementViewState {
    public isFirstInFunctionBody: boolean = false;
    public container: SimpleBBox = new SimpleBBox();
    constructor() {
        super();
    }
}
