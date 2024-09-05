/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/
// AUTO-GENERATED FILE. DO NOT MODIFY.

import React, { useEffect, useRef } from 'react';
import { Button, ComponentCard, ProgressIndicator, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ParamManager, ParamValue } from '../../../../Form/ParamManager/ParamManager';
import { sidepanelGoBack } from '../../..';

const cardStyle = { 
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

const Error = styled.span`
   color: var(--vscode-errorForeground);
   font-size: 12px;
`;

const Field = styled.div`
   margin-bottom: 12px;
`;

const CloneForm = (props: AddMediatorProps) => {
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            cloneId: sidePanelContext?.formValues?.cloneId || "",
            sequentialMediation: sidePanelContext?.formValues?.sequentialMediation || false,
            continueParent: sidePanelContext?.formValues?.continueParent || false,
            targets: {
                paramValues: sidePanelContext?.formValues?.targets ? getParamManagerFromValues(sidePanelContext?.formValues?.targets, 0, 2) : [],
                paramFields: [
                    {
                        "type": "Dropdown",
                        "label": "Sequence Type",
                        "defaultValue": "ANONYMOUS",
                        "isRequired": false,
                        "values": [
                            "NONE",
                            "ANONYMOUS",
                            "REGISTRY_REFERENCE"
                        ]
                    },
                    {
                        "type": "KeyLookup",
                        "label": "Sequence Registry Key",
                        "defaultValue": "",
                        "isRequired": false,
                        "filterType": "sequence",
                        "enableCondition": [
                            {
                                "0": "REGISTRY_REFERENCE"
                            }
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Endpoint Type",
                        "defaultValue": "ANONYMOUS",
                        "isRequired": false,
                        "values": [
                            "NONE",
                            "ANONYMOUS",
                            "REGISTRY_REFERENCE"
                        ]
                    },
                    {
                        "type": "KeyLookup",
                        "label": "Endpoint Registry Key",
                        "defaultValue": "",
                        "isRequired": false,
                        "filterType": "endpoint",
                        "enableCondition": [
                            {
                                "2": "REGISTRY_REFERENCE"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "SOAP Action",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "TextField",
                        "label": "To Address",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "TextField",
                        "label": "Index",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "-1": true
                            }
                        ]
                    },
                ]
            },
            description: sidePanelContext?.formValues?.description || "",
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        setDiagramLoading(true);
        
        values["targets"] = getParamManagerValues(values.targets);
        const xml = getXML(MEDIATORS.CLONE, values, dirtyFields, sidePanelContext.formValues);
        const trailingSpaces = props.trailingSpace;
        if (Array.isArray(xml)) {
            for (let i = 0; i < xml.length; i++) {
                await rpcClient.getMiDiagramRpcClient().applyEdit({
                    documentUri: props.documentUri, range: xml[i].range, text: `${xml[i].text}${trailingSpaces}`
                });
            }
        } else {
            rpcClient.getMiDiagramRpcClient().applyEdit({
                documentUri: props.documentUri, range: props.nodePosition, text: `${xml}${trailingSpaces}`
            });
        }
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            isOpen: false,
            isEditing: false,
            formValues: undefined,
            nodeRange: undefined,
            operationName: undefined
        });
    };

    if (isLoading) {
        return <ProgressIndicator/>;
    }
    return (
        <>
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Clones a message into several messages.</Typography>
            <div style={{ padding: "20px" }}>

                <Field>
                    <Controller
                        name="cloneId"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Clone ID" size={50} placeholder="" required={false} errorMsg={errors?.cloneId?.message?.toString()} />
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="sequentialMediation"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Sequential Mediation</VSCodeCheckbox>
                        )}
                    />
                </Field>

                <Field>
                    <Controller
                        name="continueParent"
                        control={control}
                        render={({ field }) => (
                            <VSCodeCheckbox {...field} type="checkbox" checked={field.value} onChange={(e: any) => {field.onChange(e.target.checked)}}>Continue Parent</VSCodeCheckbox>
                        )}
                    />
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Targets</Typography>
                    <Typography variant="body3">Editing of the properties of an object CloneTarget</Typography>

                    <Controller
                        name="targets"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange= {(values) => {
                                    values.paramValues = values.paramValues.map((param: any, index: number) => {
                                        const property: ParamValue[] = param.paramValues;
                                        param.key = property[0].value;
                                        param.value = property[2].value;
                                        param.icon = 'query';
                                        return param;
                                    });
                                    onChange(values);
                                }}
                            />
                        )}
                    />
                </ComponentCard>

                <Field>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField {...field} label="Description" size={50} placeholder="" required={false} errorMsg={errors?.description?.message?.toString()} />
                        )}
                    />
                </Field>


                <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit(onClick)}
                    >
                    Submit
                    </Button>
                </div>

            </div>
        </>
    );
};

export default CloneForm; 
