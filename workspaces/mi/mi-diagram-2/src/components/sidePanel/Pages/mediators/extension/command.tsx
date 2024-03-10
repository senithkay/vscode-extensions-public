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
import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
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

const CommandForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({
                ...formValues, ...sidePanelContext.formValues, "valueType": "LITERAL", "messageAction": "ReadMessage",
                "contextAction": "ReadContext"
            });
        } else {
            setFormValues({
                "properties": [] as string[][],
                "valueType": "LITERAL",
                "messageAction": "ReadMessage",
                "contextAction": "ReadContext",
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
            const xml = getXML(MEDIATORS.COMMAND, formValues);
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
        "className": (e?: any) => validateField("className", e, false),
        "propertyName": (e?: any) => validateField("propertyName", e, false),
        "valueType": (e?: any) => validateField("valueType", e, false),
        "valueLiteral": (e?: any) => validateField("valueLiteral", e, false),
        "messageAction": (e?: any) => validateField("messageAction", e, false),
        "valueMessageElementXpath": (e?: any) => validateField("valueMessageElementXpath", e, false),
        "valueContextPropertyName": (e?: any) => validateField("valueContextPropertyName", e, false),
        "contextAction": (e?: any) => validateField("contextAction", e, false),
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
                        label="Class Name"
                        size={50}
                        placeholder=""
                        value={formValues["className"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "className": e });
                            formValidators["className"](e);
                        }}
                        required={false}
                    />
                    {errors["className"] && <Error>{errors["className"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Properties</h3>

                    <Field>
                        <TextField
                            label="Property Name"
                            size={50}
                            placeholder=""
                            value={formValues["propertyName"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "propertyName": e });
                                formValidators["propertyName"](e);
                            }}
                            required={false}
                        />
                        {errors["propertyName"] && <Error>{errors["propertyName"]}</Error>}
                    </Field>

                    <Field>
                        <label>Value Type</label>
                        <AutoComplete items={["LITERAL", "MESSAGE_ELEMENT", "CONTEXT_PROPERTY"]} selectedItem={formValues["valueType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "valueType": e });
                            formValidators["valueType"](e);
                        }} />
                        {errors["valueType"] && <Error>{errors["valueType"]}</Error>}
                    </Field>

                    {formValues["valueType"] && formValues["valueType"].toLowerCase() == "literal" &&
                        <Field>
                            <TextField
                                label="Value Literal"
                                size={50}
                                placeholder=""
                                value={formValues["valueLiteral"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "valueLiteral": e });
                                    formValidators["valueLiteral"](e);
                                }}
                                required={false}
                            />
                            {errors["valueLiteral"] && <Error>{errors["valueLiteral"]}</Error>}
                        </Field>
                    }

                    {formValues["valueType"] && formValues["valueType"].toLowerCase() == "message_element" &&
                        <Field>
                            <label>Message Action</label>
                            <AutoComplete items={["ReadMessage", "UpdateMessage", "ReadAndUpdateMessage"]} selectedItem={formValues["messageAction"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "messageAction": e });
                                formValidators["messageAction"](e);
                            }} />
                            {errors["messageAction"] && <Error>{errors["messageAction"]}</Error>}
                        </Field>
                    }

                    {formValues["valueType"] && formValues["valueType"].toLowerCase() == "message_element" &&
                        <Field>
                            <TextField
                                label="Value Message Element Xpath"
                                size={50}
                                placeholder=""
                                value={formValues["valueMessageElementXpath"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "valueMessageElementXpath": e });
                                    formValidators["valueMessageElementXpath"](e);
                                }}
                                required={false}
                            />
                            {errors["valueMessageElementXpath"] && <Error>{errors["valueMessageElementXpath"]}</Error>}
                        </Field>
                    }

                    {formValues["valueType"] && formValues["valueType"].toLowerCase() == "context_property" &&
                        <Field>
                            <TextField
                                label="Value Context Property Name"
                                size={50}
                                placeholder=""
                                value={formValues["valueContextPropertyName"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "valueContextPropertyName": e });
                                    formValidators["valueContextPropertyName"](e);
                                }}
                                required={false}
                            />
                            {errors["valueContextPropertyName"] && <Error>{errors["valueContextPropertyName"]}</Error>}
                        </Field>
                    }

                    {formValues["valueType"] && formValues["valueType"].toLowerCase() == "context_property" &&
                        <Field>
                            <label>Context Action</label>
                            <AutoComplete items={["ReadContext", "UpdateContext", "ReadAndUpdateContext"]} selectedItem={formValues["contextAction"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "contextAction": e });
                                formValidators["contextAction"](e);
                            }} />
                            {errors["contextAction"] && <Error>{errors["contextAction"]}</Error>}
                        </Field>
                    }


                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={() => {
                            if (formValues["valueType"].toLowerCase() == "literal") {
                                if (!(validateField("propertyName", formValues["propertyName"], true) || validateField("valueLiteral", formValues["valueLiteral"], true))) {
                                    setFormValues({
                                        ...formValues, "propertyName": undefined, "valueLiteral": undefined,
                                        "properties": [...formValues["properties"], [formValues["propertyName"], formValues["valueType"], formValues["valueLiteral"], "", ""]]
                                    });
                                }
                            } else if (formValues["valueType"].toLowerCase() == "message_element") {
                                if (!(validateField("propertyName", formValues["propertyName"], true) || validateField("messageAction", formValues["messageAction"], true) || validateField("valueMessageElementXpath", formValues["valueMessageElementXpath"], true))) {
                                    setFormValues({
                                        ...formValues, "propertyName": undefined, "valueMessageElementXpath": undefined,
                                        "properties": [...formValues["properties"], [formValues["propertyName"], formValues["valueType"], formValues["valueMessageElementXpath"], "", formValues["messageAction"]]]
                                    });
                                }
                            } else if (formValues["valueType"].toLowerCase() == "context_property") {
                                if (!(validateField("propertyName", formValues["propertyName"], true) || validateField("contextAction", formValues["contextAction"], true) || validateField("valueContextPropertyName", formValues["valueContextPropertyName"], true))) {
                                    setFormValues({
                                        ...formValues, "propertyName": undefined, "valueContextPropertyName": undefined,
                                        "properties": [...formValues["properties"], [formValues["propertyName"], formValues["valueType"], formValues["valueContextPropertyName"], formValues["contextAction"], ""]]
                                    });
                                }
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
                                        Context Action
                                    </VSCodeDataGridCell>
                                    <VSCodeDataGridCell key={4} style={{ flex: 1 }}>
                                        Message Action
                                    </VSCodeDataGridCell>
                                </VSCodeDataGridRow>
                                {formValues["properties"].map((property: string, index: string) => (
                                    <VSCodeDataGridRow key={index} style={{ display: 'flex' }}>
                                        <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                            {property[0]}
                                        </VSCodeDataGridCell>
                                        <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                            {property[1]}
                                        </VSCodeDataGridCell>
                                        <VSCodeDataGridCell key={2} style={{ flex: 1 }}>
                                            {property[2]}
                                        </VSCodeDataGridCell>
                                        <VSCodeDataGridCell key={3} style={{ flex: 1 }}>
                                            {property[3]}
                                        </VSCodeDataGridCell>
                                        <VSCodeDataGridCell key={4} style={{ flex: 1 }}>
                                            {property[4]}
                                        </VSCodeDataGridCell>
                                    </VSCodeDataGridRow>
                                ))}
                            </VSCodeDataGrid>
                        </ComponentCard>
                    )}
                </ComponentCard>
                <Field>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder=""
                        value={formValues["description"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
                </Field>

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

export default CommandForm; 
