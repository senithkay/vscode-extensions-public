/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { RequiredParam} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperNodeModel } from "../commons/DataMapperNode";

export const ADD_INPUT_TYPE_NODE_TYPE = "datamapper-node-add-input-type";

export class AddInputTypeNode extends DataMapperNodeModel {
    constructor(
        public context: IDataMapperContext
    ) {
        super(
            context,
            ADD_INPUT_TYPE_NODE_TYPE
        );
    }

    async initPorts() {
        // this.addPorts("subField", "OUT", "addInputType");
    }

    initLinks() {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }
}
