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
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { AddMediatorProps } from '../../../../Form/common';
import { getRecipientListEndpointMustacheTemplate } from "../../../../../utils/template-engine/mustach-templates/endpoints/recipientList";
import Mustache from 'mustache';

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

const RecipientListEndpointForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
        } else {
            setFormValues({
                "endpointType": "Inline",
                "proeprties": [] as string[][],
                "scope": "default",
                "valueType": "LITERAL",
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
            const template = getRecipientListEndpointMustacheTemplate();
            const xml = Mustache.render(template, formValues).trim();
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
        "endpointName": (e?: any) => validateField("endpointName", e, false),
        "endpointType": (e?: any) => validateField("endpointType", e, false),
        "endpointValue": (e?: any) => validateField("endpointValue", e, false),
        "maxCache": (e?: any) => validateField("maxCache", e, false),
        "name": (e?: any) => validateField("name", e, false),
        "scope": (e?: any) => validateField("scope", e, false),
        "valueType": (e?: any) => validateField("valueType", e, false),
        "value": (e?: any) => validateField("value", e, false),
        "valueExpression": (e?: any) => validateField("valueExpression", e, false),
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
                        label="Endpoint Name"
                        size={50}
                        placeholder=""
                        value={formValues["endpointName"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "endpointName": e });
                            formValidators["endpointName"](e);
                        }}
                        required={false}
                    />
                    {errors["endpointName"] && <Error>{errors["endpointName"]}</Error>}
                </Field>

                <Field>
                    <label>Endpoint Type</label>
                    <AutoComplete identifier='endpoint-type' items={["Inline", "Value", "XPath"]} value={formValues["endpointType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "endpointType": e });
                        formValidators["endpointType"](e);
                    }} />
                    {errors["endpointType"] && <Error>{errors["endpointType"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Endpoint Value"
                        size={50}
                        placeholder=""
                        value={formValues["endpointValue"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "endpointValue": e });
                            formValidators["endpointValue"](e);
                        }}
                        required={false}
                    />
                    {errors["endpointValue"] && <Error>{errors["endpointValue"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Max Cache"
                        size={50}
                        placeholder=""
                        value={formValues["maxCache"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "maxCache": e });
                            formValidators["maxCache"](e);
                        }}
                        required={false}
                    />
                    {errors["maxCache"] && <Error>{errors["maxCache"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Properties</h3>

                    <Field>
                        <TextField
                            label="Name"
                            size={50}
                            placeholder=""
                            value={formValues["name"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "name": e });
                                formValidators["name"](e);
                            }}
                            required={false}
                        />
                        {errors["name"] && <Error>{errors["name"]}</Error>}
                    </Field>

                    <Field>
                        <label>Scope</label>
                        <AutoComplete identifier='scope' items={["default", "transport", "axis2", "axis2-client"]} value={formValues["scope"]} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "scope": e });
                            formValidators["scope"](e);
                        }} />
                        {errors["scope"] && <Error>{errors["scope"]}</Error>}
                    </Field>

                    <Field>
                        <label>Value Type</label>
                        <AutoComplete identifier='value-type' items={["LITERAL", "EXPRESSION"]} value={formValues["valueType"]} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "valueType": e });
                            formValidators["valueType"](e);
                        }} />
                        {errors["valueType"] && <Error>{errors["valueType"]}</Error>}
                    </Field>

                    {formValues["valueType"] && formValues["valueType"].toLowerCase() == "literal" &&
                        <Field>
                            <TextField
                                label="Value"
                                size={50}
                                placeholder=""
                                value={formValues["value"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "value": e });
                                    formValidators["value"](e);
                                }}
                                required={false}
                            />
                            {errors["value"] && <Error>{errors["value"]}</Error>}
                        </Field>
                    }

                    {formValues["valueType"] && formValues["valueType"].toLowerCase() == "expression" &&
                        <Field>
                            <TextField
                                label="Value Expression"
                                size={50}
                                placeholder=""
                                value={formValues["valueExpression"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "valueExpression": e });
                                    formValidators["valueExpression"](e);
                                }}
                                required={false}
                            />
                            {errors["valueExpression"] && <Error>{errors["valueExpression"]}</Error>}
                        </Field>
                    }


                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={() => {
                            if (!(validateField("name", formValues["name"], true) || validateField("valueType", formValues["valueType"], true))) {
                                setFormValues({
                                    ...formValues, "name": undefined, "valueType": undefined,
                                    "proeprties": [...formValues["proeprties"], [formValues["name"], formValues["scope"], formValues["valueType"]]]
                                });
                            }
                        }}>
                            Add
                        </Button>
                    </div>
                    {formValues["proeprties"] && formValues["proeprties"].length > 0 && (
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
                                </VSCodeDataGridRow>
                                {formValues["proeprties"].map((property: string, index: string) => (
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

export default RecipientListEndpointForm; 
