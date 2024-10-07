/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect } from "react";
import {
    AutoComplete,
    Button,
    Codicon,
    SidePanel,
    SidePanelBody,
    SidePanelTitleContainer,
    TextField
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import { TypeKind } from "@wso2-enterprise/ballerina-core";
import { Controller, useForm } from 'react-hook-form';

import { useDMSubMappingConfigPanelStore } from "../../../../store/store";
import { Block, FunctionDeclaration, Node, VariableStatement } from "ts-morph";
import { SourceNodeType, View } from "../../Views/DataMapperView";
import { getDefaultValue } from "../../../Diagram/utils/common-utils";
import { DataMapperNodeModel } from "../../../Diagram/Node/commons/DataMapperNode";

const Field = styled.div`
   margin-bottom: 12px;
`;

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
    addView: (view: View) => void;
    updateView: (updatedView: View) => void;
    applyModifications: (fileContent: string) => Promise<void>;
};

export function SubMappingConfigForm(props: SubMappingConfigFormProps) {
    const { functionST, inputNode, addView, updateView, applyModifications } = props;
    const { focusedST, views } = inputNode?.context ?? {};
    const lastView = views && views[views.length - 1];

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

        const typeKind = isArray ? TypeKind.Array : mappingType ? mappingType as TypeKind : TypeKind.Record;
        const defaultValue = getDefaultValue(typeKind);
        const typeDesc = mappingType && (isArray ? `${mappingType}[]` : mappingType !== "object" && mappingType);
        const varStmt = `const ${mappingName}${typeDesc ? `: ${typeDesc}`: ''} = ${defaultValue};`;
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
            const typeKind = isArray ? TypeKind.Array : mappingType ? mappingType as TypeKind : TypeKind.Record;
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
                            <AutoComplete
                                label="Type (Optional)"
                                name="mappingType"
                                items={ALLOWED_TYPES}
                                nullable={true}
                                value={field.value}
                                onValueChange={(e) => {field.onChange(e);}}
                            />
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
            </SidePanelBody>
        </SidePanel>
    );
}
