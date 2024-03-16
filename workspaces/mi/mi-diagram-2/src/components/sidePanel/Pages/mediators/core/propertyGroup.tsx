/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { Button, ComponentCard, ParamConfig, ParamManager, TextField } from '@wso2-enterprise/ui-toolkit';
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
const propertyNames = ["New Property...", "Action", "COPY_CONTENT_LENGTH_FROM_INCOMING", "CacheLevel", "ClientApiNonBlocking",
    "ConcurrentConsumers", "ContentType", "disableAddressingForOutMessages", "DISABLE_CHUNKING", "DISABLE_SMOOKS_RESULT_PAYLOAD",
    "ERROR_CODE", "ERROR_DETAIL", "ERROR_EXCEPTION", "ERROR_MESSAGE", "FAULTS_AS_HTTP_200", "FORCE_ERROR_ON_SOAP_FAULT",
    "FORCE_HTTP_1_0", "FORCE_HTTP_CONTENT_LENGTH", "FORCE_POST_PUT_NOBODY", "FORCE_SC_ACCEPTED", "FaultTo", "From",
    "HTTP_ETAG", "HTTP_SC", "JMS_COORELATION_ID", "messageType", "MESSAGE_FORMAT", "MaxConcurrentConsumers", "MercuryLastMessage",
    "MercurySequenceKey", "MessageID", "NO_ENTITY_BODY", "NO_KEEPALIVE", "OUT_ONLY", "OperationName", "POST_TO_URI",
    "preserveProcessedHeaders", "PRESERVE_WS_ADDRESSING", "REQUEST_HOST_HEADER", "RESPONSE", "REST_URL_POSTFIX", "RelatesTo",
    "ReplyTo", "SERVER_IP", "SYSTEM_DATE", "SYSTEM_TIME", "TRANSPORT_HEADERS", "TRANSPORT_IN_NAME", "To", "transportNonBlocking"];

const PropertyGroupForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [{
            id: 0,
            type: "Dropdown",
            label: "Property Name",
            defaultValue: "Action",
            isRequired: true,
            values: propertyNames
        },
        {
            id: 1,
            type: "TextField",
            label: "New Property Name",
            defaultValue: "",
            isRequired: false
        },
        {
            id: 2,
            type: "Dropdown",
            label: "Property Data Type",
            defaultValue: "STRING",
            isRequired: true,
            values: ["STRING", "INTEGER", "BOOLEAN", "DOUBLE", "FLOAT", "LONG", "SHORT", "OM", "JSON"]
        },
        {
            id: 3,
            type: "Dropdown",
            label: "Property Action",
            defaultValue: "set",
            isRequired: true,
            values: ["set", "remove"]
        },
        {
            id: 4,
            type: "Dropdown",
            label: "Property Scope",
            defaultValue: "DEFAULT",
            isRequired: true,
            values: ["DEFAULT", "TRANSPORT", "AXIS2", "AXIS2_CLIENT", "OPERATION", "REGISTRY", "SYSTEM", "ANALYTICS"]
        },
        {
            id: 5,
            type: "Dropdown",
            label: "Value Type",
            defaultValue: "LITERAL",
            isRequired: false,
            values: ["LITERAL", "EXPRESSION"]
        },
        {
            id: 6,
            type: "TextField",
            label: "Value",
            defaultValue: "",
            isRequired: false,
            enableCondition: [{ "Value Type": "LITERAL" }]
        },
        {
            id: 7,
            type: "TextField",
            label: "Value Expression",
            defaultValue: "",
            isRequired: false,
            enableCondition: [{ "Value Type": "EXPRESSION" }]
        },
        {
            id: 8,
            type: "TextField",
            label: "Value String Pattern",
            defaultValue: "",
            isRequired: false
        },
        {
            id: 9,
            type: "TextField",
            label: "Value String Capturing Group",
            defaultValue: "0",
            isRequired: false
        },
        {
            id: 10,
            type: "TextField",
            label: "Description",
            defaultValue: "",
            isRequired: false
        }]
    };

    const [params, setParams] = useState(paramConfigs);

    const handleOnChange = (params: any) => {
        setParams(params);
    };

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
            if (sidePanelContext.formValues["properties"] && sidePanelContext.formValues["properties"].length > 0) {
                const paramValues = sidePanelContext.formValues["properties"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "propertyName",
                                type: "Dropdown",
                                value: property[0],
                                isRequired: true,
                                values: propertyNames
                            },
                            {
                                id: 1,
                                label: "newPropertyName",
                                type: "TextField",
                                value: property[1],
                                isRequired: false
                            },
                            {
                                id: 2,
                                label: "propertyDataType",
                                type: "Dropdown",
                                value: property[2],
                                isRequired: true,
                                values: ["STRING", "INTEGER", "BOOLEAN", "DOUBLE", "FLOAT", "LONG", "SHORT", "OM", "JSON"]
                            },
                            {
                                id: 3,
                                label: "propertyAction",
                                type: "Dropdown",
                                value: property[3],
                                isRequired: true,
                                values: ["set", "remove"]
                            },
                            {
                                id: 4,
                                label: "propertyScope",
                                type: "Dropdown",
                                value: property[4],
                                isRequired: true,
                                values: ["DEFAULT", "TRANSPORT", "AXIS2", "AXIS2_CLIENT", "OPERATION", "REGISTRY", "SYSTEM", "ANALYTICS"]
                            },
                            {
                                id: 5,
                                label: "valueType",
                                type: "Dropdown",
                                value: property[5],
                                isRequired: false,
                                values: ["LITERAL", "EXPRESSION"]
                            },
                            {
                                id: 6,
                                label: "value",
                                type: "TextField",
                                value: property[6],
                                isRequired: false
                            },
                            {
                                id: 7,
                                label: "valueExpression",
                                type: "TextField",
                                value: property[7],
                                isRequired: false
                            },
                            {
                                id: 8,
                                label: "valueStringPattern",
                                type: "TextField",
                                value: property[8],
                                isRequired: false
                            },
                            {
                                id: 9,
                                label: "valueStringCapturingGroup",
                                type: "TextField",
                                value: property[9],
                                isRequired: false
                            },
                            {
                                id: 10,
                                label: "description",
                                type: "TextField",
                                value: property[10],
                                isRequired: false
                            }
                        ]
                    })
                )
                setParams({ ...params, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "properties": [] as string[][],
            });
        }
    }, [sidePanelContext.formValues]);

    const onClick = async () => {
        const newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });
        formValues["properties"] = params.paramValues.map(param => param.parameters.slice(0, 11).map(p => p.value));
        params.paramValues.forEach(param => {
            param.parameters.slice(0, 11).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.PROPERTYGROUP, formValues);
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

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Properties</h3>

                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder="Description"
                        value={formValues["description"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Properties</h3>

                    {formValues["properties"] && (
                        <ParamManager
                            paramConfigs={params}
                            readonly={false}
                            onChange={handleOnChange} />
                    )}
                </ComponentCard>
            </ComponentCard>


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

export default PropertyGroupForm; 
