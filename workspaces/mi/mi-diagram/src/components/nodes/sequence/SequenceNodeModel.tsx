/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DefaultPortModel, PortModelAlignment } from "@projectstorm/react-diagrams";
import { BaseNodeModel } from "../../base/base-node/base-node";

export const SEQUENCE_NODE = "SequenceNode";

export class SequenceNodeModel extends BaseNodeModel {
    constructor(id: string, isInOutSequence: boolean) {
        const range = {
            start: {
                line: 0,
                character: 0
            },
            end: {
                line: 0,
                character: 0
            }
        }
        super(SEQUENCE_NODE, id, range, null, isInOutSequence);
        this.addPort(new DefaultPortModel(false, PortModelAlignment.RIGHT));
    }
}
