/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react";

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

const DataMapperForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);
    const [createOption, setCreateOption] = useState("new");
    const [configName, setConfigName] = useState("");

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
        } else {
            setFormValues({
                "inputType": "JSON",
                "outputType": "JSON"
            });
        }
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        deriveConfigName();
        formValues.configurationLocalPath = 'gov:/datamapper/' + configName + '.dmc';
        formValues.inputSchemaLocalPath = 'gov:/datamapper/' + configName + '_inputSchema.json';
        formValues.outputSchemaLocalPath = 'gov:/datamapper/' + configName + '_outputSchema.json';
        formValues.inputType = sidePanelContext.formValues.inputType;
        formValues.outputType = sidePanelContext.formValues.outputType;
        setFormValues({ ...formValues });
    }, [configName]);

    const dmConfigs: string[] = []
    rpcClient.getMiDataMapperRpcClient().loadDMConfigs({ filePath: props.documentUri }).then(response => {
        dmConfigs.push(...response.dmConfigs);
    });

    const onClick = async () => {
        const newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.DATAMAPPER, formValues);
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

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {
        "description": (e?: any) => validateField("description", e, false),
        "configurationLocalPath": (e?: any) => validateField("configurationLocalPath", e, false),
        "inputType": (e?: any) => validateField("inputType", e, false),
        "inputSchemaLocalPath": (e?: any) => validateField("inputSchemaLocalPath", e, false),
        "outputType": (e?: any) => validateField("outputType", e, false),
        "outputSchemaLocalPath": (e?: any) => validateField("outputSchemaLocalPath", e, false),

    };

    const validateField = (id: string, e: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
        const value = e ?? formValues[id];
        const newErrors = { ...errors };
        let error;
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9 ]*$/;
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

    const onOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateOption(e.target.value);
    };

    const deriveConfigName = () => {
        if (configName === "" && sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            const configLocalPath = sidePanelContext.formValues.configurationLocalPath;
            if (configLocalPath) {
                const configLocalPathParts = configLocalPath.split('/');
                const configNamePart = configLocalPathParts[configLocalPathParts.length - 1].slice(0, -4);
                setConfigName(configNamePart);
                setCreateOption("existing");
            }
        }
    }

    return (
        <div style={{ padding: "10px" }}>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Properties</h3>

                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder=""
                        value={formValues["description"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Configuration</h3>

                    <VSCodeRadioGroup>
                        <VSCodeRadio value="new" checked={createOption === "new"} onChange={onOptionChange}>Create new config</VSCodeRadio>
                        <VSCodeRadio value="existing" checked={createOption === "existing"} onChange={onOptionChange}>Use Existing</VSCodeRadio>
                    </VSCodeRadioGroup>

                    <Field>
                        {createOption === "new" && <TextField
                            label="Configuration"
                            size={50}
                            placeholder=""
                            value={configName}
                            onTextChange={(e: any) => {
                                setConfigName(e);
                            }}
                            required={false}
                        />}
                        {createOption === "existing" && <AutoComplete items={dmConfigs}
                            label="Configuration"
                            value={configName}
                            onValueChange={(e: any) => {
                                setConfigName(e);
                            }} />
                        }
                        {errors["configurationLocalPath"] && <Error>{errors["configurationLocalPath"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Configuration Local Path"
                            size={50}
                            placeholder=""
                            value={formValues["configurationLocalPath"]}
                            required={false}
                            disabled
                            hidden
                        />
                        {errors["configurationLocalPath"] && <Error>{errors["configurationLocalPath"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Configuration Local Path"
                            size={50}
                            placeholder=""
                            value={formValues["configurationLocalPath"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "configurationLocalPath": e });
                                formValidators["configurationLocalPath"](e);
                            }}
                            hidden
                            required={false}
                        />
                        {errors["configurationLocalPath"] && <Error>{errors["configurationLocalPath"]}</Error>}
                    </Field>

                    <Field>
                        <label>Input Type</label>
                        <AutoComplete identifier='input-type' items={["JSON", "XML", "CSV"]} value={formValues['inputType']} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "inputType": e });
                            formValidators["inputType"](e);
                        }} />
                        {errors["inputType"] && <Error>{errors["inputType"]}</Error>}
                    </Field>

                    <Field>
                        <div>
                            <TextField
                                label="InputSchema Local Path"
                                size={50}
                                placeholder=""
                                value={formValues["inputSchemaLocalPath"]}
                                required={false}
                                disabled
                                hidden
                            />
                        </div>
                        {errors["inputSchemaLocalPath"] && <Error>{errors["inputSchemaLocalPath"]}</Error>}
                    </Field>

                    <Field>
                        <label>Output Type</label>
                        <AutoComplete identifier='output-type' items={["JSON", "XML", "CSV"]} value={formValues['outputType']} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "outputType": e });
                            formValidators["outputType"](e);
                        }} />
                        {errors["outputType"] && <Error>{errors["outputType"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="OutputSchema Local Path"
                            size={50}
                            placeholder=""
                            value={formValues["outputSchemaLocalPath"]}
                            required={false}
                            disabled
                            hidden
                        />
                    </Field>
                </ComponentCard>
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

export default DataMapperForm; 
