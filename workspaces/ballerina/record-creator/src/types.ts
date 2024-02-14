/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STModification, SyntaxTreeResponse } from "@wso2-enterprise/ballerina-core";
import {
    LangServerRpcClient,
    LibraryBrowserRpcClient,
    RecordCreatorRpcClient
} from "@wso2-enterprise/ballerina-rpc-client";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

export interface SimpleField {
    name: string;
    type: string;
    isFieldOptional: boolean;
    isFieldTypeOptional?: boolean;
    value?: string;
    isArray?: boolean;
    isActive?: boolean;
    isEditInProgress?: boolean;
    isNameInvalid?: boolean;
    isValueInvalid?: boolean;
    isTypeInvalid?: boolean;
}

export interface RecordModel {
    name: string;
    type?: string;
    fields: Field[];
    isInline?: boolean;
    isOptional?: boolean;
    isArray?: boolean;
    isClosed?: boolean;
    isActive?: boolean;
    isTypeDefinition?: boolean;
    isPublic?: boolean;
}
export interface RecordItemModel {
    name: string;
    checked: boolean;
}

export declare type Field = SimpleField | RecordModel;

export interface ExpressionInfo {
    value: string;
    valuePosition: NodePosition;
    label?: string;
}

interface IStatementEditorComponentProps {
    expressionInfo: ExpressionInfo;
    langServerRpcClient: LangServerRpcClient;
    libraryBrowserRpcClient: LibraryBrowserRpcClient;
    currentFile?: {
        content: string;
        path: string;
        size: number;
    };
    importStatements: string[];
    currentReferences?: string[];
}

interface IStatementEditorComponentApi {
    applyModifications: (modifications: STModification[]) => void;
    onCancelStatementEditor: () => void;
    onClose: () => void;
}

export interface StatementEditorComponentProps extends IStatementEditorComponentProps, IStatementEditorComponentApi {}

export interface RecordCreatorContext {
    props: IStatementEditorComponentProps & {
        recordCreatorRpcClient: RecordCreatorRpcClient;
        ballerinaVersion: string;
        fullST: SyntaxTreeResponse;
    };
    api: IStatementEditorComponentApi & {};
}

export enum VERSION {
    BETA = "beta",
    ALPHA = "alpha",
    PREVIEW = "preview",
}
