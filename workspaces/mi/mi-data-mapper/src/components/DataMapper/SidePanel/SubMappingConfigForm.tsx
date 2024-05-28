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
import { TypeKind } from "@wso2-enterprise/mi-core";
import { Controller, useForm } from 'react-hook-form';

import { useDMSubMappingConfigPanelStore } from "../../../store/store";
import { Block, FunctionDeclaration } from "ts-morph";
import { View } from "../DataMapper";
import { getDefaultValue } from "../../../components/Diagram/utils/common-utils";

const Field = styled.div`
   margin-bottom: 12px;
`;

interface SMConfigFormData {
    mappingName: string;
    mappingType: string | undefined;
    isArray: boolean;
}

export type SubMappingConfigFormProps = {
    isOpen: boolean;
    functionST: FunctionDeclaration;
    addView: (view: View) => void;
    applyModifications: () => void;
    onCancel: () => void;
};

export function SubMappingConfigForm(props: SubMappingConfigFormProps) {
    const { functionST, addView, applyModifications } = props;

    const {
        subMappingConfig: { nextSubMappingIndex, suggestedNextSubMappingName },
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

    useEffect(() => {
        setValue('mappingName', suggestedNextSubMappingName);
    }, [suggestedNextSubMappingName, setValue]);

    const subMappingTypes = ['string', 'number', 'boolean', 'object'];

    const onSubmit = (data: SMConfigFormData) => {
        const { mappingName, mappingType, isArray } = data;

        const typeKind = isArray ? TypeKind.Array : mappingType ? mappingType as TypeKind : TypeKind.Object;
        const defaultValue = getDefaultValue(typeKind);
        const typeDesc = mappingType && (isArray ? `${mappingType}[]` : mappingType);
        const varStmt = `const ${mappingName}${typeDesc ? `: ${typeDesc}`: ''} = ${defaultValue};`;
        (functionST.getBody() as Block).insertStatements(nextSubMappingIndex, varStmt);

        addView({
            targetFieldFQN: "",
            sourceFieldFQN: "",
            label: mappingName,
            subMappingIndex: nextSubMappingIndex
        });

        applyModifications();
        resetSubMappingConfig();
        reset();
    }

    return (
        <SidePanel
            isOpen={props.isOpen}
            alignment="right"
            width={312}
            overlay={true}
        >
            <SidePanelTitleContainer>
                <span>Configure Sub Mapping</span>
                <Button
                    sx={{ marginLeft: "auto" }}
                    onClick={props.onCancel}
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
                                items={subMappingTypes}
                                nullable={true}
                                value={field.value}
                                onValueChange={(e) => {field.onChange(e);}}
                            />
                        )}
                    />
                </Field>
                {watch("mappingType") !== undefined &&
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
                }
                <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit(onSubmit)}
                        disabled={watch("mappingName") === ""}
                    >
                        Add
                    </Button>
                </div>
            </SidePanelBody>
        </SidePanel>
    );
}
