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

const XQueryForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "scriptKeyType": "Static",
       "variables": [] as string[][],
       "variableType": "STRING",
       "variableOption": "LITERAL",});
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
           const xml = getXML(MEDIATORS.XQUERY, formValues);
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
       "scriptKeyType": (e?: any) => validateField("scriptKeyType", e, false),
       "staticScriptKey": (e?: any) => validateField("staticScriptKey", e, false),
       "dynamicScriptKey": (e?: any) => validateField("dynamicScriptKey", e, false),
       "targetXPath": (e?: any) => validateField("targetXPath", e, false),
       "variableName": (e?: any) => validateField("variableName", e, false),
       "variableType": (e?: any) => validateField("variableType", e, false),
       "variableOption": (e?: any) => validateField("variableOption", e, false),
       "variableLiteral": (e?: any) => validateField("variableLiteral", e, false),
       "variableExpression": (e?: any) => validateField("variableExpression", e, false),
       "variableKey": (e?: any) => validateField("variableKey", e, false),
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
                    <label>Script Key Type</label>
                    <AutoComplete items={["Static", "Dynamic"]} selectedItem={formValues["scriptKeyType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "scriptKeyType": e });
                        formValidators["scriptKeyType"](e);
                    }} />
                    {errors["scriptKeyType"] && <Error>{errors["scriptKeyType"]}</Error>}
                </Field>

                {formValues["scriptKeyType"] && formValues["scriptKeyType"].toLowerCase() == "static" &&
                    <Field>
                        <TextField
                            label="Static Script Key"
                            size={50}
                            placeholder=""
                            value={formValues["staticScriptKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "staticScriptKey": e });
                                formValidators["staticScriptKey"](e);
                            }}
                            required={false}
                        />
                        {errors["staticScriptKey"] && <Error>{errors["staticScriptKey"]}</Error>}
                    </Field>
                }

                {formValues["scriptKeyType"] && formValues["scriptKeyType"].toLowerCase() == "dynamic" &&
                    <Field>
                        <TextField
                            label="Dynamic Script Key"
                            size={50}
                            placeholder=""
                            value={formValues["dynamicScriptKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "dynamicScriptKey": e });
                                formValidators["dynamicScriptKey"](e);
                            }}
                            required={false}
                        />
                        {errors["dynamicScriptKey"] && <Error>{errors["dynamicScriptKey"]}</Error>}
                    </Field>
                }

                <Field>
                    <TextField
                        label="Target XPath"
                        size={50}
                        placeholder=""
                        value={formValues["targetXPath"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "targetXPath": e });
                            formValidators["targetXPath"](e);
                        }}
                        required={false}
                    />
                    {errors["targetXPath"] && <Error>{errors["targetXPath"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Variables</h3>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Variables</h3>

                            <Field>
                                <TextField
                                    label="Variable Name"
                                    size={50}
                                    placeholder=""
                                    value={formValues["variableName"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "variableName": e });
                                        formValidators["variableName"](e);
                                    }}
                                    required={false}
                                />
                                {errors["variableName"] && <Error>{errors["variableName"]}</Error>}
                            </Field>

                            <Field>
                                <label>Variable Type</label>
                                <AutoComplete items={["DOCUMENT", "DOCUMENT_ELEMENT", "ELEMENT", "INT", "INTEGER", "BOOLEAN", "BYTE", "DOUBLE", "SHORT", "LONG", "FLOAT", "STRING"]} selectedItem={formValues["variableType"]} onChange={(e: any) => {
                                    setFormValues({ ...formValues, "variableType": e });
                                    formValidators["variableType"](e);
                                }} />
                                {errors["variableType"] && <Error>{errors["variableType"]}</Error>}
                            </Field>

                            <Field>
                                <label>Variable Option</label>
                                <AutoComplete items={["LITERAL", "EXPRESSION"]} selectedItem={formValues["variableOption"]} onChange={(e: any) => {
                                    setFormValues({ ...formValues, "variableOption": e });
                                    formValidators["variableOption"](e);
                                }} />
                                {errors["variableOption"] && <Error>{errors["variableOption"]}</Error>}
                            </Field>

                            {formValues["variableType"] && formValues["variableType"].toLowerCase() == "literal" &&
                                <Field>
                                    <TextField
                                        label="Variable Literal"
                                        size={50}
                                        placeholder=""
                                        value={formValues["variableLiteral"]}
                                        onChange={(e: any) => {
                                            setFormValues({ ...formValues, "variableLiteral": e });
                                            formValidators["variableLiteral"](e);
                                        }}
                                        required={false}
                                    />
                                    {errors["variableLiteral"] && <Error>{errors["variableLiteral"]}</Error>}
                                </Field>
                            }

                            {formValues["variableType"] && formValues["variableType"].toLowerCase() == "expression" &&
                                <Field>
                                    <TextField
                                        label="Variable Expression"
                                        size={50}
                                        placeholder=""
                                        value={formValues["variableExpression"]}
                                        onChange={(e: any) => {
                                            setFormValues({ ...formValues, "variableExpression": e });
                                            formValidators["variableExpression"](e);
                                        }}
                                        required={false}
                                    />
                                    {errors["variableExpression"] && <Error>{errors["variableExpression"]}</Error>}
                                </Field>
                            }

                            <Field>
                                <TextField
                                    label="Variable Key"
                                    size={50}
                                    placeholder=""
                                    value={formValues["variableKey"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "variableKey": e });
                                        formValidators["variableKey"](e);
                                    }}
                                    required={false}
                                />
                                {errors["variableKey"] && <Error>{errors["variableKey"]}</Error>}
                            </Field>


                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={() => {
                            if (!(validateField("variableName", formValues["variableName"], true) || validateField("variableOption", formValues["variableOption"], true))) {
                                setFormValues({
                                    ...formValues, "variableName": undefined, "variableOption": undefined,
                                    "variables": [...formValues["variables"], [formValues["variableName"], formValues["variableType"], formValues["variableOption"]]]
                                });
                            }
                        }}>
                            Add
                        </Button>
                    </div>
                    {formValues["variables"] && formValues["variables"].length > 0 && (
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>Variables Table</h3>
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
                                {formValues["variables"].map((property: string, index: string) => (
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

export default XQueryForm; 
