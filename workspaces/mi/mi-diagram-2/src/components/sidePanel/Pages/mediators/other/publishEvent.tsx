/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, ParamConfig, ParamManager, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';

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

const PublishEventForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const configs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Attribute Name",
                defaultValue: "",
                isRequired: false,
            },
            {
                id: 1,
                type: "Dropdown",
                label: "Attribute Value Type",
                defaultValue: "LITERAL",
                isRequired: false,
                values: ["LITERAL", "EXPRESSION"]
            },
            {
                id: 2,
                type: "Dropdown",
                label: "Attribute Type",
                defaultValue: "STRING",
                isRequired: false,
                values: ["STRING", "INTEGER", "BOOLEAN", "DOUBLE", "FLOAT", "LONG"]
            },
            {
                id: 3,
                type: "TextField",
                label: "Attribute Value",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 1: "LITERAL" }]
            },
            {
                id: 4,
                type: "TextField",
                label: "Attribute Value Expression",
                defaultValue: "",
                isRequired: false,
                enableCondition: [{ 1: "EXPRESSION" }]
            },
            {
                id: 5,
                type: "TextField",
                label: "Default Value",
                defaultValue: "",
                isRequired: false,
            },]
    };

    const [metaParams, setMetaParams] = useState(configs);
    const [correlationParams, setCorrelationParams] = useState(configs);
    const [payloadParams, setPayloadParams] = useState(configs);
    const [arbitaryParams, setArbitaryParams] = useState(configs);

    const handleOnChangeMetaAttributes = (params: any) => {
        setMetaParams(params);
    }

    const handleOnChangeCorrelationAttributes = (params: any) => {
        setCorrelationParams(params);
    }

    const handleOnChangePayloadAttributes = (params: any) => {
        setPayloadParams(params);
    }

    const handleOnChangeArbitaryAttributes = (params: any) => {
        setArbitaryParams(params);
    }

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
            update("metaAttributes", setMetaParams, metaParams);
            update("correlationAttributes", setCorrelationParams, correlationParams);
            update("payloadAttributes", setPayloadParams, payloadParams);
            update("arbitaryAttributes", setArbitaryParams, arbitaryParams);
        } else {
            setFormValues({
                "async": false,
                "metaAttributes": [] as string[][],
                "correlationAttributes": [] as string[][],
                "payloadAttributes": [] as string[][],
                "arbitaryAttributes": [] as string[][],
            })
        }
    }, [sidePanelContext.formValues]);

    const update = async (key: string, func: Function, params: ParamConfig) => {
        if (sidePanelContext.formValues[key] && sidePanelContext.formValues[key].length > 0) {
            const paramValues = sidePanelContext.formValues[key].map((property: string, index: string) => (
                {
                    id: index,
                    parameters: [
                        {
                            id: 0,
                            label: "attributeName",
                            type: "TextField",
                            value: property[0],
                            isRequired: false
                        },
                        {
                            id: 1,
                            label: "attributeValueType",
                            type: "Dropdown",
                            value: property[1],
                            isRequired: true
                        },
                        {
                            id: 2,
                            label: "attributeType",
                            type: "Dropdown",
                            value: property[2],
                            isRequired: false
                        },
                        {
                            id: 3,
                            label: "attributeValue",
                            type: "TextField",
                            value: property[3],
                            isRequired: false
                        },
                        {
                            id: 4,
                            label: "attributeValueExpression",
                            type: "TextField",
                            value: property[4],
                            isRequired: false
                        },
                        {
                            id: 5,
                            label: "defaultValue",
                            type: "TextField",
                            value: property[5],
                            isRequired: false
                        },
                    ]
                })
            )
            func({ ...params, paramValues: paramValues });
        }
    }
    const onClick = async () => {
        const newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });
        formValues["metaAttributes"] = metaParams.paramValues.map(param => param.parameters.slice(0, 6).map(p => p.value));
        metaParams.paramValues.forEach(param => {
            param.parameters.slice(0, 6).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
        formValues["correlationAttributes"] = correlationParams.paramValues.map(param => param.parameters.slice(0, 6).map(p => p.value));
        correlationParams.paramValues.forEach(param => {
            param.parameters.slice(0, 6).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
        formValues["payloadAttributes"] = payloadParams.paramValues.map(param => param.parameters.slice(0, 6).map(p => p.value));
        payloadParams.paramValues.forEach(param => {
            param.parameters.slice(0, 6).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
        formValues["arbitaryAttributes"] = arbitaryParams.paramValues.map(param => param.parameters.slice(0, 6).map(p => p.value));
        arbitaryParams.paramValues.forEach(param => {
            param.parameters.slice(0, 6).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.PUBLISHEVENT, formValues);
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
        "streamName": (e?: any) => validateField("streamName", e, false),
        "streamVersion": (e?: any) => validateField("streamVersion", e, false),
        "eventSink": (e?: any) => validateField("eventSink", e, false),
        "async": (e?: any) => validateField("async", e, false),
        "asyncTimeout": (e?: any) => validateField("asyncTimeout", e, false),
        //    "attributeName": (e?: any) => validateField("attributeName", e, false),
        //    "attributeValueType": (e?: any) => validateField("attributeValueType", e, false),
        //    "attributeType": (e?: any) => validateField("attributeType", e, false),
        //    "attributeValue": (e?: any) => validateField("attributeValue", e, false),
        //    "attributeExpression": (e?: any) => validateField("attributeExpression", e, false),
        //    "defaultValue": (e?: any) => validateField("defaultValue", e, false),
        "description": (e?: any) => validateField("description", e, false),

    };

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

    return (
        <div style={{ padding: "10px" }}>

            <Field>
                <TextField
                    label="Stream Name"
                    size={50}
                    placeholder=""
                    value={formValues["streamName"]}
                    onTextChange={(e: any) => {
                        setFormValues({ ...formValues, "streamName": e });
                        formValidators["streamName"](e);
                    }}
                    required={false}
                />
                {errors["streamName"] && <Error>{errors["streamName"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="Stream Version"
                    size={50}
                    placeholder=""
                    value={formValues["streamVersion"]}
                    onTextChange={(e: any) => {
                        setFormValues({ ...formValues, "streamVersion": e });
                        formValidators["streamVersion"](e);
                    }}
                    required={false}
                />
                {errors["streamVersion"] && <Error>{errors["streamVersion"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="Event Sink"
                    size={50}
                    placeholder=""
                    value={formValues["eventSink"]}
                    onTextChange={(e: any) => {
                        setFormValues({ ...formValues, "eventSink": e });
                        formValidators["eventSink"](e);
                    }}
                    required={false}
                />
                {errors["eventSink"] && <Error>{errors["eventSink"]}</Error>}
            </Field>

            <Field>
                <VSCodeCheckbox type="checkbox" checked={formValues["async"]} onChange={(e: any) => {
                    setFormValues({ ...formValues, "async": e.target.checked });
                    formValidators["async"](e);
                }
                }>Async </VSCodeCheckbox>
                {errors["async"] && <Error>{errors["async"]}</Error>}
            </Field>

            <Field>
                <TextField
                    label="Async Timeout"
                    size={50}
                    placeholder=""
                    value={formValues["asyncTimeout"]}
                    onTextChange={(e: any) => {
                        setFormValues({ ...formValues, "asyncTimeout": e });
                        formValidators["asyncTimeout"](e);
                    }}
                    required={false}
                />
                {errors["asyncTimeout"] && <Error>{errors["asyncTimeout"]}</Error>}
            </Field>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Meta Attributes</h3>

                {formValues["metaAttributes"] && (
                    <ParamManager
                        paramConfigs={metaParams}
                        readonly={false}
                        onChange={handleOnChangeMetaAttributes} />
                )}
            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Correlation Attributes</h3>

                {formValues["correlationAttributes"] && (
                    <ParamManager
                        paramConfigs={correlationParams}
                        readonly={false}
                        onChange={handleOnChangeCorrelationAttributes} />
                )}
            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Payload Attributes</h3>

                {formValues["payloadAttributes"] && (
                    <ParamManager
                        paramConfigs={payloadParams}
                        readonly={false}
                        onChange={handleOnChangePayloadAttributes} />
                )}

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Arbitrary Attributes</h3>

                {formValues["arbitaryAttributes"] && (
                    <ParamManager
                        paramConfigs={arbitaryParams}
                        readonly={false}
                        onChange={handleOnChangeArbitaryAttributes} />
                )}
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


            <div style={{ textAlign: "right", marginTop: "10px" }}>
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

export default PublishEventForm; 
