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
import { RecordTypeDesc, STNode, traversNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../utils/st-utils";
import { RecordTypeFindingVisitor } from "../visitors/RecordTypeFindingVisitor";

export class RecordTypeDescriptorStore {
   
    recordTypeDescriptors: Map<string, TypeDefinition>
    static instance : RecordTypeDescriptorStore;

    private constructor() {
        this.recordTypeDescriptors = new Map();
    }

    public static getInstance() {
        if (!this.instance){
            this.instance = new RecordTypeDescriptorStore();
        }
        return this.instance;
    }

    public async retrieveTypeDescriptors( recordTypeDesc: RecordTypeDesc, context: IDataMapperContext){
        const visitor = new RecordTypeFindingVisitor(context);
        traversNode(recordTypeDesc, visitor)

	    const simpleNameReferneceNodes = visitor.getSimpleNameReferenceNodes()

        for (var i = 0 ; i < simpleNameReferneceNodes.length; i++){
			const typeDef =  await getTypeDefinitionForTypeDesc(simpleNameReferneceNodes[i], context)
			if (!(typeDef.typeName.value in this.recordTypeDescriptors)){
                this.recordTypeDescriptors.set(typeDef.typeName.value, typeDef)
            }
		}
    }

    public gettypeDescriptor(typeName : string) : TypeDefinition {
        return this.recordTypeDescriptors.get(typeName)
    }
}