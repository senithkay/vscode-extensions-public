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
import { Member, Type, UndoRedoManager } from "@wso2-enterprise/ballerina-core";
import { RecordFromJson } from "../RecordFromJson";
import { RecordFromXml } from "../RecordFromXml";
import { RecordEditor } from "./RecordEditor";

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
        flex-direction: column;
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

    export const TitleContainer = styled.div<{}>`
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
        margin-bottom: 8px;
    `;

    export const Title = styled.div<{}>`
        font-size: 14px;
        font-family: GilmerBold;
        text-wrap: nowrap;
        &:first {
            margin-top: 0;
        }
    `;

    export const PrimaryButton = styled(Button)`
        appearance: "primary";
    `;

    export const BodyText = styled.div<{}>`
        font-size: 11px;
        opacity: 0.5;
    `;

    export const DrawerContainer = styled.div<{}>`
        width: 400px;
    `;

    export const ButtonContainer = styled.div<{}>`
        display: flex;
        flex-direction: row;
        flex-grow: 1;
        justify-content: flex-end;
    `;

    export const DataMapperRow = styled.div`
        display: flex;
        justify-content: center;
        width: 100%;
        margin: 10px 0;
    `;

    export type EditorContainerStyleProp = {
        color: string;
    };
    export const EditorContainer = styled.div<EditorContainerStyleProp>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 8px;
        border-radius: 4px;
        /* border: 1px solid ${(props: EditorContainerStyleProp) => props.color}; */
        position: relative;
        z-index: 1;

        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${(props: EditorContainerStyleProp) => props.color};
            opacity: 0.1;
            z-index: -1;
            border-radius: inherit;
        }
    `;

    export const UseDataMapperButton = styled(Button)`
        & > vscode-button {
            width: 250px;
            height: 30px;
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-welcomePage-tileBorder);
        }
        align-self: center;
    `;
}


interface TypeEditorProps {
    type: Type;
    rpcClient: BallerinaRpcClient;
    onTypeChange: (type: Type) => void;
    newType: boolean;
}

enum ConfigState {
    EDITOR_FORM,
    IMPORT_FROM_JSON,
    IMPORT_FROM_XML,
}

const undoRedoManager = new UndoRedoManager();

export function TypeEditor(props: TypeEditorProps) {
    const [type, setType] = useState<Type | undefined>(props.type ? { ...props.type } : undefined);
    const nameInputRefs = useRef<(HTMLElement | null)[]>([]);
    const [isNewType, setIsNewType] = useState<boolean>(props.newType);
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const [editorState, setEditorState] = useState<ConfigState>(ConfigState.EDITOR_FORM);

    useEffect(() => {
        if (isNewType && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isNewType]);



    const onTypeChange = (type: Type) => {
        // setTypeName(type.name);
        console.log(type);
        props.onTypeChange(type);
    }

    return (
        <S.Container>
            {!type ? (
                <ProgressRing />
            ) : (
                <div>
                    <TextField
                        label="Name"
                        value={type.name}
                        onChange={(e) => setType({ ...type, name: e.target.value })}
                        onFocus={(e) => e.target.select()}
                        ref={nameInputRef}
                    />

                    {editorState === ConfigState.EDITOR_FORM &&
                        <RecordEditor
                            type={type}
                            onChange={setType}
                            onImportJson={() => setEditorState(ConfigState.IMPORT_FROM_JSON)}
                            onImportXml={() => setEditorState(ConfigState.IMPORT_FROM_XML)}
                        />
                    }
                    <S.Footer>
                        <Button onClick={() => onTypeChange(type)}>Save</Button>
                    </S.Footer>
                </div>
            )}

        </S.Container>
    );
}
