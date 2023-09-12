/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import { Point } from "@projectstorm/geometry";
import { ResolvedTypeForExpression } from "@wso2-enterprise/ballerina-languageclient";
import {
    ComponentInfo,
    ExpressionRange,
    PrimitiveBalType,
    Type,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { Uri } from "monaco-editor";

import { useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { containsWithin, isPositionsEquals } from "../../../../utils/st-utils";
import { ENUM_TYPE_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { getDefinitionPosition, getTypesForExpressions } from "../../utils/ls-utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ModuleVariable, ModuleVarKind } from "../ModuleVariable";

export const ENUM_TYPE_SOURCE_NODE_TYPE = "datamapper-node-type-desc-enum-type";

export interface EnumType {
    enumName: string;
    value: ResolvedTypeForExpression;
}

export interface DMEnumTypeDecl {
    varName: string;
    type: Type;
    fields: DMEnumTypeMember[];
}

export interface DMEnumTypeMember {
    varName: string;
    kind: ModuleVarKind;
    type: Type;
    node: STNode
}

export class EnumTypeNode extends DataMapperNodeModel {
    public enumTypeDecls: DMEnumTypeDecl[];
    public hasNoMatchingFields: boolean;
    public x: number;
    public numberOfFields: number;
    private enums: ComponentInfo[];

    constructor(public context: IDataMapperContext, public value: Map<string, ModuleVariable>) {
        super(context, ENUM_TYPE_SOURCE_NODE_TYPE);
        this.numberOfFields = 1;
        this.enumTypeDecls = [];
        this.enums = [];
    }

    async initPorts() {
        const exprRanges: ExpressionRange[] = [...this.value].map(([, item]) => {
            const exprPosition: NodePosition = item.node.position as NodePosition;
            item.exprPosition = exprPosition;
            return {
                startLine: {
                    line: exprPosition.startLine,
                    offset: exprPosition.startColumn,
                },
                endLine: {
                    line: exprPosition.endLine,
                    offset: exprPosition.endColumn,
                },
            };
        });
        const types = await getTypesForExpressions(
            this.context.filePath,
            this.context.langClientPromise,
            exprRanges
        );

        const componentResponse = await (
            await this.context.langClientPromise
        ).getBallerinaProjectComponents({
            documentIdentifiers: [
                {
                    uri: Uri.file(this.context.filePath).toString(),
                },
            ],
        });
        for (const pkg of componentResponse.packages) {
            for (const mdl of pkg.modules) {
                for (const enumType of mdl.enums) {
                    this.enums.push(enumType);
                }
            }
        }

        const enumTypes: EnumType[] = [];
        for (const type of types) {
            const definitionPosition = await getDefinitionPosition(
                this.context.filePath,
                this.context.langClientPromise,
                {
                    line: type.requestedRange.startLine.line,
                    offset: type.requestedRange.startLine.offset,
                }
            );
            for (const enumType of this.enums) {
                const contains = containsWithin(definitionPosition.syntaxTree?.position, {
                    startLine: enumType.startLine,
                    startColumn: enumType.startColumn,
                    endLine: enumType.endLine,
                    endColumn: enumType.endColumn,
                });
                if (contains) {
                    enumTypes.push({
                        enumName: enumType.name,
                        value: type,
                    });
                    break;
                }
            }
        }

        const allEnumTypeDecls: DMEnumTypeDecl[] = [];
        for (const [varName, item] of this.value) {
            for (const type of enumTypes) {
                if (
                    isPositionsEquals(item.exprPosition, {
                        startLine: type.value.requestedRange.startLine.line,
                        startColumn: type.value.requestedRange.startLine.offset,
                        endLine: type.value.requestedRange.endLine.line,
                        endColumn: type.value.requestedRange.endLine.offset,
                    })
                ) {
                    let typeDeclared: boolean = false;
                    const typeDecl: Type = { name: varName, ...type.value.type };
                    for (const enumTypeDecl of allEnumTypeDecls) {
                        if (enumTypeDecl.varName === type.enumName) {
                            enumTypeDecl.fields.push({
                                varName,
                                kind: item.kind,
                                node: item.node,
                                type: typeDecl,
                            });
                            typeDeclared = true;
                            break;
                        }
                    }
                    if (!typeDeclared)
                        allEnumTypeDecls.push({
                            varName: type.enumName,
                            type: {
                                ...type.value.type,
                                typeName: PrimitiveBalType.Enum,
                            },
                            fields: [
                                {
                                    varName,
                                    kind: item.kind,
                                    node: item.node,
                                    type: typeDecl,
                                },
                            ],
                        });
                    break;
                }
            }
        }

        this.enumTypeDecls = this.getSearchFilteredVariables(allEnumTypeDecls);
        const searchValue = useDMSearchStore.getState().inputSearch;
        this.hasNoMatchingFields =
            searchValue && allEnumTypeDecls.length > 0 && this.enumTypeDecls.length === 0;

        this.enumTypeDecls.forEach((enumType) => {
            const { varName, type, fields } = enumType;

            const parentPort = this.addPortsForHeaderField(
                type,
                varName,
                "OUT",
                ENUM_TYPE_SOURCE_PORT_PREFIX,
                this.context.collapsedFields
            );

            fields.forEach((field) => {
                this.numberOfFields += this.addPortsForInputRecordField(
                    field.type,
                    "OUT",
                    varName,
                    ENUM_TYPE_SOURCE_PORT_PREFIX,
                    parentPort,
                    this.context.collapsedFields,
                    parentPort.collapsed
                );
            });
        });
    }

    async initLinks() {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }

    setPosition(point: Point): void;
    setPosition(x: number, y: number): void;
    setPosition(x: unknown, y?: unknown): void {
        if (typeof x === "number" && typeof y === "number") {
            if (!this.x) {
                this.x = x;
            }
            super.setPosition(this.x, y);
        }
    }

    private getSearchFilteredVariables(items: DMEnumTypeDecl[]) {
        const searchValue = useDMSearchStore.getState().inputSearch;
        if (!searchValue) {
            return items;
        }
        const filteredVariables: DMEnumTypeDecl[] = [];

        for (const item of items) {
            if (item.varName?.toLowerCase()?.includes(searchValue.toLowerCase())) {
                filteredVariables.push(item);
            } else {
                const fields: DMEnumTypeMember[] = [];
                for (const field of item.fields) {
                    if (field.varName?.toLowerCase()?.includes(searchValue.toLowerCase())) {
                        fields.push(field);
                    }
                }
                if (fields.length > 0) {
                    filteredVariables.push({
                        ...item,
                        fields,
                    });
                }
            }
        }

        return filteredVariables;
    }
}
