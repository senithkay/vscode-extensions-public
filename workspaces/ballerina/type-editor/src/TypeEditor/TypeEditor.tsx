/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState, useRef } from "react";
import { TextField, View, ViewContent, Dropdown, Button, SidePanelBody, ProgressRing, Divider, Icon, Codicon } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { Member, Type, UndoRedoManager, VisualizerLocation, TypeNodeKind } from "@wso2-enterprise/ballerina-core";
import { RecordFromJson } from "../RecordFromJson";
import { RecordFromXml } from "../RecordFromXml";
import { RecordEditor } from "./RecordEditor";
import { EnumEditor } from "./EnumEditor";
import { UnionEditor } from "./UnionEditor";
import { ClassEditor } from "./ClassEditor";


namespace S {
    export const Container = styled(SidePanelBody)`
        display: flex;
        flex-direction: column;
        gap: 20px;
    `;

    export const Row = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    `;

    export const CategoryRow = styled.div<{ showBorder?: boolean }>`
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        width: 100%;
        margin-top: 8px;
        padding-bottom: 14px;
        border-bottom: ${({ showBorder }) => (showBorder ? `1px solid var(--vscode-welcomePage-tileBorder)` : "none")};
    `;

    export const CheckboxRow = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        width: 100%;
    `;

    export const Footer = styled.div<{}>`
        display: flex;
        gap: 8px;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;
        margin-top: 8px;
        width: 100%;
    `;
}


interface TypeEditorProps {
    type?: Type;
    rpcClient: BallerinaRpcClient;
    onTypeChange: (type: Type) => void;
    newType: boolean;
    isGraphql?: boolean;
}

enum ConfigState {
    EDITOR_FORM,
    IMPORT_FROM_JSON,
    IMPORT_FROM_XML,
}

enum TypeKind {
    RECORD = "Record",
    ENUM = "Enum",
    CLASS = "Service Class",
    UNION = "Union"
}

const undoRedoManager = new UndoRedoManager();

// Add validation function
const isValidBallerinaIdentifier = (name: string): boolean => {
    // Ballerina identifiers must start with a letter or underscore
    // and can contain letters, digits, and underscores
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return name.length > 0 && regex.test(name);
};

export function TypeEditor(props: TypeEditorProps) {
    console.log("===TypeEditorProps===", props);
    const [selectedTypeKind, setSelectedTypeKind] = useState<TypeKind>(() => {
        if (props.type) {
            // Map the type's node kind to TypeKind enum
            const nodeKind = props.type.codedata.node;
            switch (nodeKind) {
                case "RECORD":
                    return TypeKind.RECORD;
                case "ENUM":
                    return TypeKind.ENUM;
                case "CLASS":
                    return TypeKind.CLASS;
                case "UNION":
                    return TypeKind.UNION;
                default:
                    return TypeKind.RECORD;
            }
        }
        return TypeKind.RECORD;
    });
    const [type, setType] = useState<Type>(() => {
        if (props.type) {
            return props.type;
        }
        // Initialize with default type for new types
        const defaultType = {
            name: "",
            members: [] as Member[],
            editable: true,
            metadata: {
                description: "",
                deprecated: false,
                readonly: false,
                label: ""
            },
            properties: {},
            codedata: {
                node: "RECORD" as TypeNodeKind
            }
        };
        return defaultType as unknown as Type;
    });
    const [visualizerLocation, setVisualizerLocation] = React.useState<VisualizerLocation>();
    const nameInputRefs = useRef<(HTMLElement | null)[]>([]);
    const [isNewType, setIsNewType] = useState<boolean>(props.newType);
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const [editorState, setEditorState] = useState<ConfigState>(ConfigState.EDITOR_FORM);
    const [nameError, setNameError] = useState<string>("");

    useEffect(() => {
        if (type && isNewType) {
            // Add a small delay to ensure the input is mounted
            setTimeout(() => {
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                    nameInputRef.current.select();
                }
            }, 100);
        }
    }, []);

    const handleTypeKindChange = (value: string) => {
        // if the value is Service Class, the type kind should be CLASS
        const typeValue = value === "Service Class" ? "CLASS" : value;
        setSelectedTypeKind(value as TypeKind);
        // Always create a new type with the selected kind
        setType((currentType) => ({
            ...currentType!,
            kind: typeValue,
            members: [] as Member[],
            codedata: {
                ...currentType!.codedata, // Check the location of the type
                node: typeValue.toUpperCase() as TypeNodeKind
            }
        }));
    };

    const onTypeChange = async (type: Type) => {
        if (!isValidBallerinaIdentifier(type.name)) {
            setNameError("Invalid name.");
            return;
        }
        const name = type.name;
        // IF type nodeKind is CLASS then we call graphqlEndpoint
        // TODO: for TypeDiagram we need to give a generic class creation
        if (type.codedata.node === "CLASS") {
            const response = await props.rpcClient
                .getBIDiagramRpcClient()
                .createGraphqlClassType({ filePath: type.codedata?.lineRange?.fileName || 'types.bal', type, description: "" });

        } else {
            const response = await props.rpcClient
                .getBIDiagramRpcClient()
                .updateType({ filePath: type.codedata?.lineRange?.fileName || 'types.bal', type, description: "" });
        }
        props.onTypeChange(type);
    }

    console.log("===Type Model===", type);

    const renderEditor = () => {
        if (editorState === ConfigState.IMPORT_FROM_JSON) {
            return null; // Handle JSON import
        }
        if (editorState === ConfigState.IMPORT_FROM_XML) {
            return null; // Handle XML import
        }

        switch (selectedTypeKind) {
            case TypeKind.RECORD:
                return (
                    <RecordEditor
                        type={type}
                        isAnonymous={false}
                        onChange={setType}
                        isGraphql={props.isGraphql}
                        onImportJson={() => setEditorState(ConfigState.IMPORT_FROM_JSON)}
                        onImportXml={() => setEditorState(ConfigState.IMPORT_FROM_XML)}
                    />
                );
            case TypeKind.ENUM:
                return (
                    <EnumEditor
                        type={type}
                        onChange={setType}
                    />
                );
            case TypeKind.UNION:
                return (
                    <UnionEditor
                        type={type}
                        onChange={setType}
                        rpcClient={props.rpcClient}
                    />
                );
            case TypeKind.CLASS:
                return (
                    <ClassEditor
                        type={type}
                        onChange={setType}
                    />
                );
            default:
                return <div>Editor for {selectedTypeKind} type is not implemented yet</div>;
        }
    };

    return (
        <S.Container>
            {!type ? (
                <ProgressRing />
            ) : (
                <div>
                    <S.CategoryRow>
                        <Dropdown
                            id="type-selector"
                            label="Type"
                            value={selectedTypeKind}
                            items={Object.values(TypeKind).map((kind) => ({ label: kind, value: kind }))}
                            onChange={(e) => handleTypeKindChange(e.target.value)}
                        />
                        <div style={{ flex: '1' }}>
                            <TextField
                                label="Name"
                                value={type.name}
                                onChange={(e) => {
                                    setType({ ...type, name: e.target.value });
                                    setNameError("");  // Clear error when user types
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onTypeChange(type);
                                    }
                                }}
                                onFocus={(e) => e.target.select()}
                                ref={nameInputRef}
                            />
                        </div>
                    </S.CategoryRow>

                    {editorState === ConfigState.EDITOR_FORM &&
                        <>
                            {renderEditor()}
                            <S.Footer>
                                <Button onClick={() => onTypeChange(type)}>Save</Button>
                            </S.Footer>
                        </>
                    }
                    {editorState === ConfigState.IMPORT_FROM_JSON &&
                        <RecordFromJson
                            rpcClient={props.rpcClient}
                            name={type.name}
                            onCancel={() => setEditorState(ConfigState.EDITOR_FORM)}
                            onImport={() => setEditorState(ConfigState.EDITOR_FORM)}
                        />
                    }
                    {editorState === ConfigState.IMPORT_FROM_XML &&
                        <RecordFromXml
                            rpcClient={props.rpcClient}
                            name={type.name}
                            onCancel={() => setEditorState(ConfigState.EDITOR_FORM)}
                            onImport={() => setEditorState(ConfigState.EDITOR_FORM)}
                        />
                    }
                </div>
            )}
        </S.Container>
    );
}
