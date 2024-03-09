/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, Codicon, ComponentCard, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps, filterFormValues, getRangeFromTagRange } from '../common';
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

const ButtonComponent = styled.div`
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 5px;
    position: relative;
`
const EditButton = styled.button`
    height: 23px;
    width: 23px;
    display: block;
    margin: 0 auto;
    padding: 2px;
`

const DeleteButton = styled.button`
    height: 23px;
    width: 23px;
    display: block;
    margin: 0 auto;
    // color: red;
    padding: 2px;
`

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

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
        } else {
            setFormValues({
                "properties": [] as string[][],
                "propertyName": "New Property...",
                "propertyDataType": "STRING",
                "propertyAction": "set",
                "propertyScope": "DEFAULT",
                "propertyValueType": "LITERAL",
                "valueStringCapturingGroup": "0",
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
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.PROPERTYGROUP, formValues);
            rpcClient.getMiDiagramRpcClient().applyEdit({
                documentUri: props.documentUri, range: getRangeFromTagRange(props.nodePosition), text: xml
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
        "propertyName": (e?: any) => validateField("propertyName", e, false),
        "newPropertyName": (e?: any) => validateField("newPropertyName", e, false),
        "propertyDataType": (e?: any) => validateField("propertyDataType", e, false),
        "propertyAction": (e?: any) => validateField("propertyAction", e, false),
        "propertyScope": (e?: any) => validateField("propertyScope", e, false),
        "propertyValueType": (e?: any) => validateField("propertyValueType", e, false),
        "value": (e?: any) => validateField("value", e, false),
        "expression": (e?: any) => validateField("expression", e, false),
        "valueStringPattern": (e?: any) => validateField("valueStringPattern", e, false),
        "valueStringCapturingGroup": (e?: any) => validateField("valueStringCapturingGroup", e, false),
        "Properties.description": (e?: any) => validateField("Properties.description", e, false),

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

                    <Field>
                        <label>Property Name</label>
                        <AutoComplete items={propertyNames} selectedItem={formValues["propertyName"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "propertyName": e, "newPropertyName": e == "New Property..." ? "" : e });
                            formValidators["propertyName"](e);
                        }} />
                        {errors["propertyName"] && <Error>{errors["propertyName"]}</Error>}
                    </Field>

                    {formValues["propertyName"] == "New Property..." && <Field>
                        <TextField
                            label="New Property Name"
                            size={50}
                            placeholder="New Property Name"
                            value={formValues["newPropertyName"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "newPropertyName": e });
                                formValidators["newPropertyName"](e);
                            }}
                            required={false}
                        />
                        {errors["newPropertyName"] && <Error>{errors["newPropertyName"]}</Error>}
                    </Field>}

                    {formValues["propertyAction"] == "set" && <Field>
                        <label>Property Data Type</label>
                        <AutoComplete items={["STRING", "INTEGER", "BOOLEAN", "DOUBLE", "FLOAT", "LONG", "SHORT", "OM", "JSON"]} selectedItem={formValues["propertyDataType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "propertyDataType": e });
                            formValidators["propertyDataType"](e);
                        }} />
                        {errors["propertyDataType"] && <Error>{errors["propertyDataType"]}</Error>}
                    </Field>}

                    <Field>
                        <label>Property Action</label>
                        <AutoComplete items={["set", "remove"]} selectedItem={formValues["propertyAction"]} onChange={(e: any) => {
                            const newValues: { [key: string]: any } = { "propertyAction": e }
                            if (formValues["propertyAction"] == "remove" && e == "set") {
                                newValues["propertyDataType"] = "STRING";
                                newValues["propertyValueType"] = "LITERAL";
                            }
                            setFormValues({ ...formValues, ...newValues });
                            formValidators["propertyAction"](e);
                        }} />
                        {errors["propertyAction"] && <Error>{errors["propertyAction"]}</Error>}
                    </Field>

                    <Field>
                        <label>Property Scope</label>
                        <AutoComplete items={["DEFAULT", "TRANSPORT", "AXIS2", "AXIS2_CLIENT", "OPERATION", "REGISTRY", "SYSTEM", "ANALYTICS"]} selectedItem={formValues["propertyScope"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "propertyScope": e });
                            formValidators["propertyScope"](e);
                        }} />
                        {errors["propertyScope"] && <Error>{errors["propertyScope"]}</Error>}
                    </Field>

                    {formValues["propertyAction"] == "set" && <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Value</h3>

                        <Field>
                            <label>Property Value Type</label>
                            <AutoComplete items={["LITERAL", "EXPRESSION"]} selectedItem={formValues["propertyValueType"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "propertyValueType": e });
                                formValidators["propertyValueType"](e);
                            }} />
                            {errors["propertyValueType"] && <Error>{errors["propertyValueType"]}</Error>}
                        </Field>

                        {formValues["propertyValueType"] == "LITERAL" && <Field>
                            <TextField
                                label="Value"
                                size={50}
                                placeholder="Value"
                                value={formValues["value"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "value": e });
                                    formValidators["value"](e);
                                }}
                                required={false}
                            />
                            {errors["value"] && <Error>{errors["value"]}</Error>}
                        </Field>}

                        {formValues["propertyValueType"] == "EXPRESSION" && <Field>
                            <TextField
                                label="Expression"
                                size={50}
                                placeholder="Expression"
                                value={formValues["expression"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "expression": e });
                                    formValidators["expression"](e);
                                }}
                                required={false}
                            />
                            {errors["expression"] && <Error>{errors["expression"]}</Error>}
                        </Field>}

                        <Field>
                            <TextField
                                label="Value String Pattern"
                                size={50}
                                placeholder="Value String Pattern"
                                value={formValues["valueStringPattern"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "valueStringPattern": e });
                                    formValidators["valueStringPattern"](e);
                                }}
                                required={false}
                            />
                            {errors["valueStringPattern"] && <Error>{errors["valueStringPattern"]}</Error>}
                        </Field>

                        <Field>
                            <TextField
                                label="Value String Capturing Group"
                                size={50}
                                placeholder="Value String Capturing Group"
                                value={formValues["valueStringCapturingGroup"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "valueStringCapturingGroup": e });
                                    formValidators["valueStringCapturingGroup"](e);
                                }}
                                required={false}
                            />
                            {errors["valueStringCapturingGroup"] && <Error>{errors["valueStringCapturingGroup"]}</Error>}
                        </Field>

                    </ComponentCard>}

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
                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={() => {
                            if (!(validateField("propertyName", formValues["propertyName"], true))) {
                                if (formValues["propertyAction"] == "remove") {
                                    const keysToInclude = ["properties", "propertyName", "newPropertyName", "propertyAction", "propertyScope", "description"];
                                    setFormValues(filterFormValues(formValues, keysToInclude, null));
                                }
                                setFormValues({
                                    ...formValues, "propertyName": "New Property...", "newPropertyName": undefined, "propertyDataType": undefined, "propertyAction": "set", "propertyScope": "DEFAULT", "value": undefined, "expression": undefined, "propertyValueType": "LITERAL", "valueStringPattern": undefined, "valueStringCapturingGroup": undefined, "description": undefined,
                                    "properties": [...formValues["properties"], [formValues["newPropertyName"], formValues["propertyDataType"], formValues["propertyAction"], formValues["propertyScope"], formValues["propertyValueType"], formValues["value"] ?? formValues["expression"], formValues["valueStringPattern"], formValues["valueStringCapturingGroup"], formValues["description"]]]
                                });
                            }
                        }}>
                            Add
                        </Button>
                    </div>
                    {formValues["properties"] && formValues["properties"].length > 0 && (
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>Properties Table</h3>
                            <VSCodeDataGrid style={{ display: 'flex', flexDirection: 'column' }}>
                                <VSCodeDataGridRow className="header" style={{ display: 'flex', background: 'gray' }}>
                                    <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                        Name
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                        Value Type
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell key={2} style={{ flex: 1 }}>
                                        Value
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell key={3} style={{ flex: 1 }}>
                                    </VSCodeDataGridCell>
                                </VSCodeDataGridRow>
                                {formValues["properties"].map((property: string, index: string) => (
                                    <VSCodeDataGridRow key={index} style={{ display: 'flex' }}>
                                        <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                            {property[0]}
                                        </VSCodeDataGridCell>
                                        <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                            {property[4]}
                                        </VSCodeDataGridCell>
                                        <VSCodeDataGridCell key={2} style={{ flex: 1 }}>
                                            {property[5]}
                                        </VSCodeDataGridCell>
                                        <VSCodeDataGridCell key={3} style={{ flex: 1 }}>
                                            <ButtonComponent>
                                                <DeleteButton onClick={() => {
                                                    formValues["properties"].splice(index, 1);
                                                    setFormValues({ ...formValues })
                                                }}><Codicon name='trash' />
                                                </DeleteButton>
                                                {/* <EditButton onClick={() => { }}>
                                                    <Codicon name='edit' />
                                                </EditButton> */}
                                            </ButtonComponent>
                                        </VSCodeDataGridCell>
                                    </VSCodeDataGridRow>
                                ))}
                            </VSCodeDataGrid>
                        </ComponentCard>
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
