/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { CallExpression, Node, SyntaxKind, ts } from "ts-morph";
import { ItemType, ItemTypeKind } from "@wso2-enterprise/ui-toolkit";
import { INPUT_FIELD_FILTER_LABEL, OUTPUT_FIELD_FILTER_LABEL, SearchTerm, SearchType } from "./HeaderSearchBox";
import { View } from "../Views/DataMapperView";

export function getInputOutputSearchTerms(searchTerm: string): [SearchTerm, SearchTerm] {
    const inputFilter = INPUT_FIELD_FILTER_LABEL;
    const outputFilter = OUTPUT_FIELD_FILTER_LABEL;
    const searchSegments = searchTerm.split(" ");

    const inputSearchTerm = searchSegments.find(segment => segment.startsWith(inputFilter));
    const outputSearchTerm = searchSegments.find(segment => segment.startsWith(outputFilter));

    const searchTerms = searchSegments.filter(segment =>
        !segment.startsWith(inputFilter) && !segment.startsWith(outputFilter));
    const searchTermItem: SearchTerm = {
        searchText: searchTerms.join(" "),
        searchType: undefined,
        isLabelAvailable: false
    };

    return [
        inputSearchTerm ? {
            searchText: inputSearchTerm.substring(inputFilter.length),
            searchType: SearchType.INPUT,
            isLabelAvailable: true
        } : {...searchTermItem, searchType: SearchType.INPUT},
        outputSearchTerm ? {
            searchText: outputSearchTerm.substring(outputFilter.length),
            searchType: SearchType.OUTPUT,
            isLabelAvailable: true
        } : {...searchTermItem, searchType: SearchType.OUTPUT}
    ];
}

export function isFocusedOnMapFunction(views: View[]): boolean {
    const noOfViews = views.length;
    const focusedView = views[noOfViews - 1];

    return noOfViews > 1
        && (!focusedView.subMappingInfo || !focusedView.subMappingInfo.focusedOnSubMappingRoot);
}

export function getFilterExpression(callExpr: CallExpression): Node | undefined {
    const firstArg = callExpr.getArguments()[0];
    let filterExpr: Node;

    if (firstArg && Node.isArrowFunction(firstArg)) {
        const arrowFnBody = firstArg.getBody();
        filterExpr = arrowFnBody;

        if (Node.isBlock(arrowFnBody)) {
            const returnStmt = arrowFnBody.getStatementByKind(SyntaxKind.ReturnStatement);
            filterExpr = returnStmt ? returnStmt.getExpression() : filterExpr;
        }
    }

    return filterExpr;
}

export function filterOperators(
    entry: ts.CompletionEntry,
    details: ts.CompletionEntryDetails,
    localFunctionNames: string[]
): ItemType {
    if (
        details.kind === ts.ScriptElementKind.parameterElement ||
        details.kind === ts.ScriptElementKind.memberVariableElement
    ) {
        return {
            label: entry.name,
            description: details.displayParts?.reduce((acc, part) => acc + part.text, ''),
            value: entry.name,
            kind: details.kind as ItemTypeKind,
        }
    } else if (
        details.kind === ts.ScriptElementKind.functionElement ||
        details.kind === ts.ScriptElementKind.memberFunctionElement
    ) {
        if (details.sourceDisplay) {
            const params: string[] = [];
            let param: string = '';
    
            details.displayParts.forEach((part) => {
                if (part.kind === 'parameterName' || part.text === '...') {
                    param += part.text;
                } else if (param && part.text === ':') {
                    params.push(param);
                    param = '';
                }
            });
    
            const action = details.codeActions?.[0].changes[0].textChanges[0].newText;
            const itemTag = action.substring(0, action.length - 1);
    
            return {
                tag: itemTag,
                label: entry.name,
                description: details.documentation?.[0]?.text,
                value: action + entry.name,
                kind: details.kind as ItemTypeKind,
                args: params
            }
        } else if (localFunctionNames.includes(entry.name)) {
            return  {
                label: entry.name,
                description: details.displayParts?.reduce((acc, part) => acc + part.text, ''),
                value: entry.name,
                kind: details.kind as ItemTypeKind,
            }
        }
    }

    return undefined;
}

