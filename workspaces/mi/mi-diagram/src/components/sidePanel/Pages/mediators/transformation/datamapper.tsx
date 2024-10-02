/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, TextField, Typography, FormGroup } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";

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
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
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
                "inputType": "",
                "outputType": ""
            });
        }
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        deriveConfigName();
        formValues.configurationLocalPath = 'gov:/datamapper/' + configName + '/' + configName + '.dmc';
        formValues.inputSchemaLocalPath = 'gov:/datamapper/' + configName + '/' + configName + '_inputSchema.json';
        formValues.outputSchemaLocalPath = 'gov:/datamapper/' + configName + '/' + configName + '_outputSchema.json';
        formValues.inputType = sidePanelContext.formValues.inputType;
        formValues.outputType = sidePanelContext.formValues.outputType;
        setFormValues({ ...formValues });
    }, [configName]);

    const dmConfigs: string[] = []
    rpcClient.getMiDataMapperRpcClient().loadDMConfigs({ filePath: props.documentUri }).then(response => {
        dmConfigs.push(...response.dmConfigs);
    });

    if (formValues.inputType === undefined && formValues.outputType === undefined && createOption === 'new') {
        formValues.inputType = '';
        formValues.outputType = '';
    }

    const submitFormValues = async () => {
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
            setDiagramLoading(true);
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

    const openDataMapperView = () => {

        const request = {
            sourcePath: props.documentUri,
            regPath: formValues.configurationLocalPath
        }
        if (configName === "") {
            return;
        }
        const dmCreateRequest = {
            dmLocation: "",
            filePath: props.documentUri,
            dmName: configName
        };
        rpcClient.getMiDataMapperRpcClient().createDMFiles(dmCreateRequest).then(response => {
            rpcClient.getMiDataMapperRpcClient().convertRegPathToAbsPath(request).then(response => {
                // open data mapper view
                rpcClient.getVisualizerState().then((state) => {
                    rpcClient.getMiVisualizerRpcClient().openView({
                        type: EVENT_TYPE.OPEN_VIEW,
                        location: {
                            ...state,
                            documentUri: response.absPath,
                            view: MACHINE_VIEW.DataMapperView,
                            dataMapperProps: {
                                filePath: response.absPath,
                                configName: configName
                            }
                        }
                    });
                });
            });
        });
    }

    const createMapping = () => {
        submitFormValues();
        openDataMapperView();
    }

    return (
        <>
            <Typography sx={{ padding: "10px 15px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3">Transforms one data format to another, or changes the data structure in the message.</Typography>
            <div style={{ padding: "10px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Mapping</h3>

                        <VSCodeRadioGroup>
                            <VSCodeRadio value="new" checked={createOption === "new"} onChange={onOptionChange}>New Mapping</VSCodeRadio>
                            <VSCodeRadio value="existing" checked={createOption === "existing"} onChange={onOptionChange}>Existing Mapping</VSCodeRadio>
                        </VSCodeRadioGroup>

                        <Field>
                            {createOption === "new" && <TextField
                                label="Name"
                                size={50}
                                placeholder=""
                                value={configName}
                                onTextChange={(e: any) => {
                                    setConfigName(e);
                                }}
                                required={true}
                            />}
                            {createOption === "existing" && <AutoComplete items={dmConfigs}
                                label="Name"
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

                        <FormGroup title="Advanced" isCollapsed={true}>
                            <Field>
                                <label>Input Type</label>
                                <AutoComplete identifier='input-type' items={["", "JSON", "XML", "CSV"]} value={formValues['inputType']} onValueChange={(e: any) => {
                                    setFormValues({ ...formValues, "inputType": e });
                                    formValidators["inputType"](e);
                                }} />
                                {errors["inputType"] && <Error>{errors["inputType"]}</Error>}
                            </Field>
                            <Field>
                                <label>Output Type</label>
                                <AutoComplete identifier='output-type' items={["", "JSON", "XML", "CSV"]} value={formValues['outputType']} onValueChange={(e: any) => {
                                    setFormValues({ ...formValues, "outputType": e });
                                    formValidators["outputType"](e);
                                }} />
                                {errors["outputType"] && <Error>{errors["outputType"]}</Error>}
                            </Field>
                        </FormGroup>

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

                </ComponentCard>

                <div style={{ display: "flex", textAlign: "right", justifyContent: "flex-end", marginTop: "10px" }}>
                    {createOption === "new" && <Button
                        appearance="primary"
                        onClick={createMapping}
                    >
                        Create Mapping
                    </Button>}
                    {createOption === "existing" && <Button
                        appearance="primary"
                        onClick={submitFormValues}
                    >
                        Submit
                    </Button>}
                </div>

            </div>
        </>
    );
};

export default DataMapperForm; 
