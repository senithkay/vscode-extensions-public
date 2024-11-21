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
import { VSCodeCheckbox, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { ENDPOINTS } from '../../../../../resources/constants';
import { AddMediatorProps } from '../../../../Form/common';

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

const LoadbalanceEndpointForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "buildMessage": false,
       "sessionType": "NONE",
       "proeprties": [] as string[][],
       "scope": "default",
       "valueType": "LITERAL",
       "failover": false,
       "member": [] as string[][],});
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
           const xml = getXML(ENDPOINTS.LOADBALANCE, formValues);
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
       "algorithm": (e?: any) => validateField("algorithm", e, false),
       "buildMessage": (e?: any) => validateField("buildMessage", e, false),
       "sessionType": (e?: any) => validateField("sessionType", e, false),
       "sessionTimeout": (e?: any) => validateField("sessionTimeout", e, false),
       "name": (e?: any) => validateField("name", e, false),
       "scope": (e?: any) => validateField("scope", e, false),
       "valueType": (e?: any) => validateField("valueType", e, false),
       "value": (e?: any) => validateField("value", e, false),
       "valueExpression": (e?: any) => validateField("valueExpression", e, false),
       "children": (e?: any) => validateField("children", e, false),
       "failover": (e?: any) => validateField("failover", e, false),
       "hostName": (e?: any) => validateField("hostName", e, false),
       "httpPort": (e?: any) => validateField("httpPort", e, false),
       "httpsPort": (e?: any) => validateField("httpsPort", e, false),
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
                    <TextField
                        label="Algorithm"
                        size={50}
                        placeholder=""
                        value={formValues["algorithm"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "algorithm": e });
                            formValidators["algorithm"](e);
                        }}
                        required={false}
                    />
                    {errors["algorithm"] && <Error>{errors["algorithm"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["buildMessage"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "buildMessage": e.target.checked });
                        formValidators["buildMessage"](e);
                    }
                    }>Build Message </VSCodeCheckbox>
                    {errors["buildMessage"] && <Error>{errors["buildMessage"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Session</h3>

                    <Field>
                        <label>Session Type</label>
                        <AutoComplete identifier='session-type' items={["NONE", "http", "soap", "simpleClientSession"]} value={formValues["sessionType"]} onValueChange={(e: any) => {
                            setFormValues({ ...formValues, "sessionType": e });
                            formValidators["sessionType"](e);
                        }} />
                        {errors["sessionType"] && <Error>{errors["sessionType"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Session Timeout"
                            size={50}
                            placeholder=""
                            value={formValues["sessionTimeout"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "sessionTimeout": e });
                                formValidators["sessionTimeout"](e);
                            }}
                            required={false}
                        />
                        {errors["sessionTimeout"] && <Error>{errors["sessionTimeout"]}</Error>}
                    </Field>

                </ComponentCard>

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
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["failover"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "failover": e.target.checked });
                        formValidators["failover"](e);
                    }
                    }>Failover </VSCodeCheckbox>
                    {errors["failover"] && <Error>{errors["failover"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Member</h3>

                        <Field>
                            <TextField
                                label="Host Name"
                                size={50}
                                placeholder=""
                                value={formValues["hostName"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "hostName": e });
                                    formValidators["hostName"](e);
                                }}
                                required={false}
                            />
                            {errors["hostName"] && <Error>{errors["hostName"]}</Error>}
                        </Field>

                        <Field>
                            <TextField
                                label="Http Port"
                                size={50}
                                placeholder=""
                                value={formValues["httpPort"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "httpPort": e });
                                    formValidators["httpPort"](e);
                                }}
                                required={false}
                            />
                            {errors["httpPort"] && <Error>{errors["httpPort"]}</Error>}
                        </Field>

                        <Field>
                            <TextField
                                label="Https Port"
                                size={50}
                                placeholder=""
                                value={formValues["httpsPort"]}
                                onTextChange={(e: any) => {
                                    setFormValues({ ...formValues, "httpsPort": e });
                                    formValidators["httpsPort"](e);
                                }}
                                required={false}
                            />
                            {errors["httpsPort"] && <Error>{errors["httpsPort"]}</Error>}
                        </Field>


                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (!(validateField("hostName", formValues["hostName"], true) || validateField("httpsPort", formValues["httpsPort"], true))) {
                            setFormValues({
                                ...formValues, "hostName": undefined, "httpsPort": undefined,
                                "member": [...formValues["member"], [formValues["hostName"], formValues["httpPort"], formValues["httpsPort"]]]
                            });
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["member"] && formValues["member"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Member Table</h3>
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
                            {formValues["member"].map((property: string, index: string) => (
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

export default LoadbalanceEndpointForm; 
