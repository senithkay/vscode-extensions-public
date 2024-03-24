/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, ParamConfig, ParamManager, colors, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { TagRange } from '@wso2-enterprise/mi-syntax-tree/lib/src';

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

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const generateDisplayValue = (paramValues: any) => {
    const result: string = paramValues.parameters[1].value + " " + paramValues.parameters[3].value + " " +  paramValues.parameters[4].value;
    return result.trim();
};

const CloneForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                type: "Dropdown",
                label: "Sequence Type",
                defaultValue: "NONE",
                isRequired: true,
                values: ["NONE", "ANONYMOUS", "REGISTRY_REFERENCE"]
            },
            {
                type: "TextField",
                label: "Sequence Registry Key",
                defaultValue: "sequenceRegKey",
                isRequired: true
            },
            {
                type: "Dropdown",
                label: "Endpoint Type",
                defaultValue: "value",
                isRequired: true,
                values: ["NONE", "ANONYMOUS", "REGISTRY_REFERENCE"]
            },
            {
                type: "TextField",
                label: "Endpoint Registry Key",
                defaultValue: "endpointRegKey",
                isRequired: true
            },
            {
                type: "TextField",
                label: "Soap Action",
                defaultValue: "soapAction",
                isRequired: true
            },
            {
                type: "TextField",
                label: "To Address",
                defaultValue: "address",
                isRequired: true
            },]
    };

    const [params, setParams] = useState(paramConfigs);

    const handleOnChange = (params: any) => {
        const modifiedParams = { ...params, paramValues: params.paramValues.map((param: any) => {
            return {
                ...param,
                key: param.parameters[0].value ?? param.parameters[2].value,
                value: generateDisplayValue(param),
                icon: "query"
            }
        })};
        setParams(modifiedParams);
    };

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues, isCloneKeysChange: false, targetChanges: [] });
            if (sidePanelContext.formValues["targets"] && sidePanelContext.formValues["targets"].length > 0) {
                const paramValues = sidePanelContext.formValues["targets"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "sequenceType",
                                type: "TextField",
                                value: property[0],
                                isRequired: true
                            },
                            {
                                id: 1,
                                label: "sequenceRegistryKey",
                                type: "TextField",
                                value: property[1],
                                isRequired: true
                            },
                            {
                                id: 2,
                                label: "endpointType",
                                type: "Dropdown",
                                value: property[2],
                                isRequired: true
                            },
                            {
                                id: 3,
                                label: "endpointRegistryKey",
                                type: "TextField",
                                value: property[3],
                                isRequired: true
                            },
                            {
                                id: 4,
                                label: "soapAction",
                                type: "TextField",
                                value: property[4],
                                isRequired: true
                            },
                            {
                                id: 5,
                                label: "toAddress",
                                type: "TextField",
                                value: property[5],
                                isRequired: true
                            }
                        ],
                        key: property[0] ?? property[2],
                        value: property[1] + " " + property[3] + " " +  property[4],
                        icon: "query"
                    })
                )
                setParams({ ...params, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "sequentialMediation": false,
                "continueParent": false,
                "targets": [] as string[][],
                "sequenceType": "Default",
                "endpointType": "Default",
                "newMediator": true,});
        }
    }, [sidePanelContext.formValues]);

    const validateField = (id: string, e: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
        const value = e ?? formValues[id];
        const newErrors = { ...errors };
        let error;
        if (isRequired && !value) {
            error = "This field is required";
        } else if (validation === "e-mail" && !value.match(emailRegex)) {
            error = "Invalid e-mail address";
        } else if (validation === "nameWithoutSpecialCharactors" && !value.match(nameWithoutSpecialCharactorsRegex)) {
            error = "Invalid name";
        } else if (validation === "custom" && !value.match(regex)) {
            error = "Invalid input";
        } else {
            delete newErrors[id];
            setErrors(newErrors);
        }
        setErrors({ ...errors, [id]: error });
        return error;
    };

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {
        "cloneId": (e?: any) => validateField("cloneId", e, false),
        "sequentialMediation": (e?: any) => validateField("sequentialMediation", e, false),
        "continueParent": (e?: any) => validateField("continueParent", e, false),
        "description": (e?: any) => validateField("description", e, false),

    };

    const onClick = async () => {
        const newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });
        formValues["targets"] = params.paramValues.map(param => param.parameters.slice(0, 6).map(p => p.value));
        params.paramValues.forEach(param => {
            param.parameters.slice(0, 6).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            if (formValues["newMediator"] == false) {
                //TODO: Fix this after target edit option suport available.
                if (formValues["targetChanges"].length > 0) {
                    let targetChanges = formValues["targetChanges"];
                    const sortedPositions = targetChanges.sort((a: number, b: number) => a - b);
                    for (let i = sortedPositions.length - 1; i >= 0; i--) {
                        const data = { target: formValues["targets"][sortedPositions[i]], "editClone": false };
                        const xml = getXML(MEDIATORS.CLONE, data);
                        const range: TagRange = data.target[5];
                        rpcClient.getMiDiagramRpcClient().applyEdit({
                            documentUri: props.documentUri, range: range.startTagRange, text: xml
                        });
                    }
                }
                if (formValues["isCloneKeysChange"]) {
                    const data = { ...formValues, "editClone": true };
                    const xml = getXML(MEDIATORS.CLONE, data);
                    const range: TagRange = formValues.cloneTagRange;
                    rpcClient.getMiDiagramRpcClient().applyEdit({
                        documentUri: props.documentUri, range: range.startTagRange, text: xml
                    });
                }
            } else {
                const xml = getXML(MEDIATORS.CLONE, formValues);
                rpcClient.getMiDiagramRpcClient().applyEdit({
                    documentUri: props.documentUri, range: props.nodePosition, text: xml
                });
                sidePanelContext.setSidePanelState({
                    ...sidePanelContext,
                    isOpen: false,
                    isEditing: false,
                    formValues: undefined,
                    nodeRange: undefined,
                    operationName: undefined
                });
            }
        };
    }
    return (
        <div style={{ padding: "10px" }}>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Properties</h3>

                <Field>
                    <TextField
                        label="Clone ID"
                        size={50}
                        placeholder=""
                        value={formValues["cloneId"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "cloneId": e, "isCloneKeysChange": true });
                            formValidators["cloneId"](e);
                        }}
                        required={false}
                    />
                    {errors["cloneId"] && <Error>{errors["cloneId"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["sequentialMediation"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "sequentialMediation": e.target.checked, "isCloneKeysChange": true });
                        formValidators["sequentialMediation"](e);
                    }
                    }>Sequential Mediation </VSCodeCheckbox>
                    {errors["sequentialMediation"] && <Error>{errors["sequentialMediation"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["continueParent"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "continueParent": e.target.checked, "isCloneKeysChange": true });
                        formValidators["continueParent"](e);
                    }
                    }>Continue Parent </VSCodeCheckbox>
                    {errors["continueParent"] && <Error>{errors["continueParent"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Targets</h3>

                    {formValues["targets"] && (
                        <ParamManager
                            paramConfigs={params}
                            readonly={false}
                            onChange={handleOnChange} />
                    )}
                </ComponentCard>
                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder=""
                        value={formValues["description"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e, "isCloneKeysChange": true });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
                </Field>

            </ComponentCard>


            <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
                <Button
                    appearance="primary"
                    onClick={onClick}
                >
                    Submit
                </Button>
            </div>

        </div>
    );
};

export default CloneForm; 
