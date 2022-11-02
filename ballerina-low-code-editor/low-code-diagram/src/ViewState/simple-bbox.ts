import { DefaultConfig } from "../Visitors/default";

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
export class SimpleBBox {
    public x: number = 0;
    public y: number = 0;
    public r: number = 0;
    public w: number = 0;
    public rw: number = 0;
    public lw: number = 0;
    public h: number = 0;
    public rx: number = 0;
    public ry: number = 0;
    public cx: number = 0;
    public cy: number = 0;
    public length: number = 0;
    public label: string = "";
    public labelWidth: number = 0;
    public offsetFromBottom: number = DefaultConfig.offSet;
    public offsetFromTop: number = DefaultConfig.offSet;
}
