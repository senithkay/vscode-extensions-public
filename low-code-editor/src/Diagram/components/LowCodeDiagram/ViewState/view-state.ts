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

export class ViewState {
    public bBox: SimpleBBox = new SimpleBBox();
    public hidden: boolean = false;
    public hiddenBlock: boolean = false;
    public synced: boolean = false;
    public collapsed: boolean = false;
    public folded: boolean = false;


    public getHeight(): number {
        return (this.bBox.h + this.bBox.offsetFromBottom + this.bBox.offsetFromTop);
    }
}
