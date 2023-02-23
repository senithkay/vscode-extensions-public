/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { LinePosition } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";
import { URI } from "vscode-uri";

import { IDataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import {
    getFnDefsForFnCalls, isPositionsEquals,
} from "../../../utils/st-utils";
import { FunctionCallFindingVisitor } from "../visitors/FunctionCallFindingVisitor";

export interface FnDefInfo {
    fnCallPosition: LinePosition;
    fnDefPosition: NodePosition;
    fileUri: string,
    isExprBodiedFn?: boolean;
}

export class FunctionDefinitionStore {

    fnDefinitions: Map<LinePosition, FnDefInfo>
    static instance : FunctionDefinitionStore;

    private constructor() {
        this.fnDefinitions = new Map();
    }

    public static getInstance() {
        if (!this.instance){
            this.instance = new FunctionDefinitionStore();
        }
        return this.instance;
    }

    public async storeFunctionDefinitions(stNode: STNode, context: IDataMapperContext){
        this.fnDefinitions.clear();
        const langClient = await context.langClientPromise;
        const fileUri = URI.file(context.currentFile.path).toString();
        const visitor = new FunctionCallFindingVisitor();
        traversNode(stNode, visitor);

        const fnCallPositions = visitor.getFunctionCallPositions();

        await this.setFnDefinitions(langClient, fileUri, fnCallPositions, context.langClientPromise);
    }

    async setFnDefinitions(langClient: IBallerinaLangClient,
                           fileUri: string,
                           fnCallPositions: LinePosition[],
                           langClientPromise: Promise<IBallerinaLangClient>) {

        const fnDefs = await getFnDefsForFnCalls(fnCallPositions, fileUri, langClientPromise)

        for (const fnDef of fnDefs) {
            this.fnDefinitions.set(fnDef.fnCallPosition, fnDef)
        }
    }

    public getFnDefinitions(position : LinePosition) : FnDefInfo {
        for (const [key, value] of this.fnDefinitions) {
            if (key.line === position.line && key.offset === position.offset) {
                return value;
            }
        }
    }
}
