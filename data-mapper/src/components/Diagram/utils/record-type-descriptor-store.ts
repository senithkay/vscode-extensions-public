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
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    ExpressionRange,
    LinePosition,
    Type
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../utils/st-utils";
import { RecordTypeFindingVisitor } from "../visitors/RecordTypeFindingVisitor";

export class RecordTypeDescriptorStore {

    recordTypeDescriptors: Map<NodePosition, Type>
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

    public async storeTypeDescriptors(stNode: STNode, context: IDataMapperContext){
        this.recordTypeDescriptors.clear();
        const langClient = await context.langClientPromise;
        const fileUri = `file://${context.currentFile.path}`;
        const visitor = new RecordTypeFindingVisitor();
        traversNode(stNode, visitor);

        const expressionNodesRanges = visitor.getExpressionNodesRanges();
        const symbolNodesPositions = visitor.getSymbolNodesPositions();

        await this.setTypesForSymbol(langClient, fileUri, symbolNodesPositions);
        await this.setTypesForExpressions(langClient, fileUri, expressionNodesRanges);
    }

    async setTypesForExpressions(langClient: IBallerinaLangClient,
                                 fileUri: string, expressionNodesRanges: ExpressionRange[]) {

        const typesFromExpression = await langClient.getTypeFromExpression({
            documentIdentifier: {
                uri: fileUri
            },
            expressionRanges: expressionNodesRanges
        });

        for (const {type, requestedRange} of typesFromExpression.types) {
            await this.setTypeDescriptors(type, requestedRange.startLine, requestedRange.endLine);
        }
    }

    async setTypesForSymbol(langClient: IBallerinaLangClient,
                            fileUri: string, symbolNodesPositions: LinePosition[]) {

        const typesFromSymbol = await langClient.getTypeFromSymbol({
            documentIdentifier: {
                uri: fileUri
            },
            positions: symbolNodesPositions
        });

        for (const {type, requestedPosition} of typesFromSymbol.types) {
            await this.setTypeDescriptors(type, requestedPosition);
        }
    }

    async setTypeDescriptors(type: Type, startPosition: LinePosition, endPosition?: LinePosition) {
        if (type) {
            const position: NodePosition = {
                startLine: startPosition.line,
                startColumn: startPosition.offset,
                endLine: endPosition ? endPosition.line : startPosition.line,
                endColumn: endPosition ? endPosition.offset : startPosition.offset,
            };
            this.recordTypeDescriptors.set(position, type);
        }
    }

    public getTypeDescriptor(position : NodePosition) : Type {
        for (const [key, value] of this.recordTypeDescriptors) {
            if (isPositionsEquals(key, position)) {
                return value;
            }
        }
    }
}
