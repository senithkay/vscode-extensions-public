/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";
import {
    AutoComplete,
    Button,
    Codicon,
    Drawer,
    SidePanel,
    SidePanelBody,
    SidePanelTitleContainer,
    TextField
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import { TypeKind } from "@wso2-enterprise/mi-core";
import { Controller, useForm } from 'react-hook-form';

import { useDMSubMappingConfigPanelStore } from "../../../../store/store";
import { Block, FunctionDeclaration, Node, VariableStatement } from "ts-morph";
import { SourceNodeType, View } from "../../Views/DataMapperView";
import { getDefaultValue } from "../../../Diagram/utils/common-utils";
import { DataMapperNodeModel } from "../../../Diagram/Node/commons/DataMapperNode";
import { ImportCustomTypeForm } from "../ImportData/ImportCustomTypeForm";

const Field = styled.div`
   margin-bottom: 12px;
`;

import { css } from "@emotion/css";
const overlayClasses={
    localVarFormWrapper: css({
        width: '100%',
        maxHeight: 800,
        overflowY: 'scroll',
        flexDirection: "row",
    }),
    addNewButtonWrapper: css({
        display: "flex",
        marginTop: 20,
        marginLeft: 10,
        flexDirection: "column",
        "& button": {
            marginBottom: 16
        }
    }),
    doneButtonWrapper: css({
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '16px'
    }),
    contentSection: css({
        display: "flex",
        width: "75%",
        justifyContent: "flex-start"
    }),
    varMgtToolbar: css({
        padding: '10px',
        marginTop: '10px',
        display: "inline-flex",
        alignItems: "center",
        "& a": {
            cursor: "pointer",
            color: "var(--vscode-editorInfo-foreground)"
        },
        "& a:hover": {
            textDecoration: "none",
        }
    }),
    localVarControlButton: css({
        padding: '5px',
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
    }),
    deleteLetVarDecl: css({
        color: "var(--vscode-charts-red)"
    }),
    deleteLetVarDeclEnabled: css({
        color: "var(--vscode-terminal-ansiRed)",
        fontWeight: 500
    }),
    declWrap: css({
        alignItems: 'center',
        display: 'inline-block',
        maxWidth: '500px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        padding: '5px',
        verticalAlign: 'middle'
    }),
    declExpression: css({
        background: "var(--vscode-editorHoverWidget-background)",
        marginLeft: "5px",
        marginRight: "5px",
        borderRadius: "4px",
        border: "1px solid transparent",
        cursor: 'pointer',
        padding: 4,
        transition: 'border 0.2s',
        '&:hover': {
            border: "1px solid var(--vscode-pickerGroup-border)"
        }
    }),
    exprPlaceholder: css({
        background: 'var(--vscode-inputValidation-warningBackground)'
    }),
    input: css({
        maxWidth: '120px',
        padding: "4px",
        '&:focus': { outline: 0, border: "1px solid var(--vscode-inputOption-activeBorder)" },
        background: "var(--vscode-editorHoverWidget-background)",
        marginLeft: "5px",
        marginRight: "5px",
        color: 'var(--vscode-editor-foreground)',
        borderRadius: "4px",
        border: "1px solid transparent",
    }),
    plusButton: css({
        margin: '5px 0 5px 10px',
    }),
    linePrimaryButton: css({
        "& > vscode-button": {
            color: "var(--button-primary-foreground)",
            backgroundColor: "var(--button-primary-background)",
            display: "flex",
            justifyContent: "center",
            width: "100%",
            borderRadius: "3px",
            padding: "5px",
            "&:hover": {
                backgroundColor: "var(--vscode-button-hoverBackground)"
            }
        }
    }),
    doneButton: css({
        color: "var(--button-primary-foreground)",
        padding: "3px",
    }),
}

const ALLOWED_TYPES = ['string', 'number', 'boolean', 'object'];
const ADD_NEW_SUB_MAPPING_HEADER = "Add New Sub Mapping";
const EDIT_SUB_MAPPING_HEADER = "Edit Sub Mapping";

interface SMConfigFormData {
    mappingName: string;
    mappingType: string | undefined;
    isArray: boolean;
}

export type SubMappingConfigFormProps = {
    functionST: FunctionDeclaration;
    inputNode: DataMapperNodeModel;
    configName: string;
    documentUri: string;
    addView: (view: View) => void;
    updateView: (updatedView: View) => void;
    applyModifications: (fileContent: string) => Promise<void>;
};

export function SubMappingConfigForm(props: SubMappingConfigFormProps) {
    const { functionST, inputNode, configName, documentUri, addView, updateView, applyModifications } = props;
    const { focusedST, views } = inputNode?.context ?? {};
    const lastView = views && views[views.length - 1];

    const [openedIndex, setOpenedIndex] = useState<number>();
    const [isImportCustomTypeFormOpen, setIsImportCustomTypeFormOpen] = useState<boolean>(false);

    const {
        subMappingConfig: { isSMConfigPanelOpen, nextSubMappingIndex, suggestedNextSubMappingName },
        resetSubMappingConfig
    } = useDMSubMappingConfigPanelStore(state => ({
        subMappingConfig: state.subMappingConfig,
        resetSubMappingConfig: state.resetSubMappingConfig,
    })
    );

    const { control, handleSubmit, setValue, watch, reset } = useForm<SMConfigFormData>({
        defaultValues: {
            mappingName: `${suggestedNextSubMappingName}`
        }
    });

    const isEdit = isSMConfigPanelOpen && nextSubMappingIndex === -1 && !suggestedNextSubMappingName;

    useEffect(() => {
        if (isEdit) {
            const { mappingName, mappingType } = lastView.subMappingInfo;

            setValue('mappingName', mappingName);
            setValue('mappingType', mappingType);
        } else {
            setValue('mappingName', suggestedNextSubMappingName);
        }
    }, [isEdit, suggestedNextSubMappingName, setValue]);

    const onAdd = async (data: SMConfigFormData) => {
        const { mappingName, mappingType, isArray } = data;

        const typeKind = isArray ? TypeKind.Array : mappingType ? mappingType as TypeKind : TypeKind.Object;
        const defaultValue = getDefaultValue(typeKind);
        const typeDesc = mappingType && (isArray ? `${mappingType}[]` : mappingType !== "object" && mappingType);
        const varStmt = `const ${mappingName}${typeDesc ? `: ${typeDesc}` : ''} = ${defaultValue};`;
        (functionST.getBody() as Block).insertStatements(nextSubMappingIndex, varStmt);

        resetSubMappingConfig();
        reset();

        await applyModifications(functionST.getSourceFile().getFullText());
    };

    const onEdit = async (data: SMConfigFormData) => {
        const { mappingName, mappingType, isArray } = data;
        const { mappingName: prevMappingName, mappingType: prevMappingType } = lastView.subMappingInfo;
        let updatedName: string;
        let updatedType: string;

        const varDecl = focusedST && (focusedST as VariableStatement).getDeclarations()[0];
        const typeNode = varDecl.getTypeNode();

        if (mappingName !== prevMappingName && varDecl) {
            varDecl.rename(mappingName);
            updatedName = mappingName;
        }

        let updatedNode: Node;
        if (mappingType !== prevMappingType && mappingType !== "object" && varDecl) {
            const typeKind = isArray ? TypeKind.Array : mappingType ? mappingType as TypeKind : TypeKind.Object;
            const typeDesc = mappingType && (isArray ? `${mappingType}[]` : mappingType);
            const defaultValue = getDefaultValue(typeKind);
            if (typeNode) {
                updatedNode = typeNode.replaceWithText(typeDesc);
                await applyModifications(updatedNode.getSourceFile().getFullText());
            } else {
                varDecl.setType(typeDesc);
            }
            updatedNode = varDecl.getInitializer().replaceWithText(defaultValue);
            await applyModifications(updatedNode.getSourceFile().getFullText());
            updatedType = typeDesc;
        }

        updateView({
            ...lastView,
            label: updatedName ? updatedName : prevMappingName,
            subMappingInfo: {
                ...lastView.subMappingInfo,
                mappingName: updatedName ? updatedName : prevMappingName,
                mappingType: updatedType ? updatedType : prevMappingType
            }
        });

        await applyModifications(updatedNode.getSourceFile().getFullText());
        resetSubMappingConfig();
        reset();
    };

    const onClose = () => {
        resetSubMappingConfig();
    };

    const openDrawer = (index: number) => {
        setOpenedIndex(index);
    }

    const closeDrawer = (index: number) => {
        if (index === 0) {
            setOpenedIndex(undefined);
        } else {
            setOpenedIndex(index - 1);
        }
    }

    return (
        <SidePanel
            isOpen={isSMConfigPanelOpen}
            alignment="right"
            width={312}
            overlay={true}
        >
            <SidePanelTitleContainer>
                <span>{isEdit ? EDIT_SUB_MAPPING_HEADER : ADD_NEW_SUB_MAPPING_HEADER}</span>
                <Button
                    sx={{ marginLeft: "auto" }}
                    onClick={onClose}
                    appearance="icon"
                >
                    <Codicon name="close" />
                </Button>
            </SidePanelTitleContainer>
            <SidePanelBody>
                <Field>
                    <Controller
                        name="mappingName"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Sub Mapping Name"
                                size={50}
                                placeholder={suggestedNextSubMappingName}
                            />
                        )}
                    />
                </Field>
                <Field>
                    <Controller
                        name="mappingType"
                        control={control}
                        render={({ field }) => (
                            <>
                                <AutoComplete
                                    label="Type (Optional)"
                                    name="mappingType"
                                    items={ALLOWED_TYPES}
                                    nullable={true}
                                    value={field.value}
                                    onValueChange={(e) => { field.onChange(e); }}
                                />
                               
                                <div className={overlayClasses.addNewButtonWrapper}>
                                <Button
                                    appearance="icon"
                                    onClick={() => setIsImportCustomTypeFormOpen(true)}
                                    className={overlayClasses.linePrimaryButton} 
                                >
                                    <Codicon sx={{marginTop: 2, marginRight: 5}} name="add"/>
                                    <div>Add New</div>
                                </Button>
                            </div>
                            </>
                        )}
                    />
                </Field>
                <Field>
                    <Controller
                        name="isArray"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox
                                checked={field.value}
                                onClick={(e: any) => field.onChange(e.target.checked)}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                            >
                                Is Array
                            </VSCodeCheckbox>
                        )}
                    />
                </Field>
                {!isEdit && (
                    <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit(onAdd)}
                            disabled={watch("mappingName") === ""}
                        >
                            Add
                        </Button>
                    </div>
                )}
                {isEdit && (
                    <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit(onEdit)}
                            disabled={watch("mappingName") === ""}
                        >
                            Save
                        </Button>
                    </div>
                )}

                <Drawer
                    isOpen={isImportCustomTypeFormOpen}
                    id="drawerImportCustomTypeForm"
                    isSelected={true}
                    sx={{width:312}}
                >

                    <ImportCustomTypeForm configName={configName} documentUri={documentUri} setIsImportCustomTypeFormOpen={setIsImportCustomTypeFormOpen}/>
                    

                </Drawer>
            </SidePanelBody>
        </SidePanel>
    );
}
