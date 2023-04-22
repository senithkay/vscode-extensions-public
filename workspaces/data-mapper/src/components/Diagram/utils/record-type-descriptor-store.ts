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
import { Uri } from "monaco-editor";

import { IDataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../utils/st-utils";
import { FnDefPositions, RecordTypeFindingVisitor } from "../visitors/RecordTypeFindingVisitor";

export class RecordTypeDescriptorStore {

    recordTypeDescriptors: Map<NodePosition, Type>;
    stNode: STNode;
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

    public async storeTypeDescriptors(stNode: STNode, context: IDataMapperContext, isArraysSupported: boolean) {
        if (this.stNode
            && isPositionsEquals(this.stNode.position, stNode.position)
            && this.stNode.source === stNode.source) {
            return;
        }
        this.stNode = stNode;
        this.recordTypeDescriptors.clear();
        const langClient = await context.langClientPromise;
        const fileUri = Uri.file(context.currentFile.path).toString();
        const visitor = new RecordTypeFindingVisitor(isArraysSupported);
        traversNode(stNode, visitor);

        const fnDefPositions = visitor.getFnDefPositions();
        const expressionNodesRanges = visitor.getExpressionNodesRanges();
        const symbolNodesPositions = visitor.getSymbolNodesPositions();

        await this.setTypesForFnParamsAndReturnType(langClient, fileUri, fnDefPositions);
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
            this.setTypeDescriptors(type, requestedRange.startLine, requestedRange.endLine);
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
            this.setTypeDescriptors(type, requestedPosition);
        }
    }

    async setTypesForFnParamsAndReturnType(langClient: IBallerinaLangClient,
                                           fileUri: string,
                                           fnDefPositions: FnDefPositions) {

        if (fnDefPositions.fnNamePosition === undefined || fnDefPositions.returnTypeDescPosition === undefined) {
            return;
        }
        const FnParamsAndReturnType = await langClient.getTypesFromFnDefinition({
            documentIdentifier: {
                uri: fileUri
            },
            fnPosition: fnDefPositions.fnNamePosition,
            returnTypeDescPosition: fnDefPositions.returnTypeDescPosition
        });

        for (const {type, requestedPosition} of FnParamsAndReturnType.types) {
            this.setTypeDescriptors(type, requestedPosition);
        }
    }

    setTypeDescriptors(type: Type, startPosition: LinePosition, endPosition?: LinePosition) {
        if (type && startPosition) {
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
