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
import { STNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../utils/st-utils";

export class RecordTypeDescriptors {
   
    recordTypeDescriptors: Map<string, TypeDefinition>
    static instance : RecordTypeDescriptors;

    private constructor() {
        this.recordTypeDescriptors = new Map();
    }

    public static getClient() {
        if (!this.instance){
            this.instance = new RecordTypeDescriptors();
        }
        return this.instance;
    }

    public async retrieveTypeDescriptors( nodes: STNode[], context: IDataMapperContext){

        for (var i = 0 ; i < nodes.length; i++){
			const typeDef =  await getTypeDefinitionForTypeDesc(nodes[i], context)
			if (!(typeDef.typeName.value in this.recordTypeDescriptors)){
                this.recordTypeDescriptors.set(typeDef.typeName.value, typeDef)
            }
		}
    }

    public gettypeDescriptor(typeName : string) : TypeDefinition {
        return this.recordTypeDescriptors.get(typeName)
    }
}