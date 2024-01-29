/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, TextArea, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import MIWebViewAPI from '../../../../../utils/WebViewRpc';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../constants';

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

const PayloadForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "payload": "<inline/>",
       "args": [] as string[][],
       "argumentType": "Value",
       "argumentValue": "default",
       "evaluator": "xml",
       "literal": false,});
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
           const xml = getXML(MEDIATORS.PAYLOAD, formValues);
           MIWebViewAPI.getInstance().applyEdit({
               documentUri: props.documentUri, range: props.nodePosition, text: xml
           });
           sidePanelContext.setIsOpen(false);
           sidePanelContext.setFormValues(undefined);
           sidePanelContext.setNodeRange(undefined);
           sidePanelContext.setOperationName(undefined);
       }
   };

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "payloadFormat": (e?: any) => validateField("payloadFormat", e, false),
       "mediaType": (e?: any) => validateField("mediaType", e, false),
       "templateType": (e?: any) => validateField("templateType", e, false),
       "payloadKey": (e?: any) => validateField("payloadKey", e, false),
       "payload": (e?: any) => validateField("payload", e, false),
       "argumentType": (e?: any) => validateField("argumentType", e, false),
       "argumentValue": (e?: any) => validateField("argumentValue", e, false),
       "argumentExpression": (e?: any) => validateField("argumentExpression", e, false),
       "evaluator": (e?: any) => validateField("evaluator", e, false),
       "literal": (e?: any) => validateField("literal", e, false),
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
                    <label>Payload Format</label>
                    <AutoComplete items={["Inline", "Registry Reference"]} selectedItem={formValues["payloadFormat"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "payloadFormat": e });
                        formValidators["payloadFormat"](e);
                    }} />
                    {errors["payloadFormat"] && <Error>{errors["payloadFormat"]}</Error>}
                </Field>

                <Field>
                    <label>Media Type</label>
                    <AutoComplete items={["xml", "json", "text"]} selectedItem={formValues["mediaType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "mediaType": e });
                        formValidators["mediaType"](e);
                    }} />
                    {errors["mediaType"] && <Error>{errors["mediaType"]}</Error>}
                </Field>

                <Field>
                    <label>Template Type</label>
                    <AutoComplete items={["Default", "Freemarker"]} selectedItem={formValues["templateType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "templateType": e });
                        formValidators["templateType"](e);
                    }} />
                    {errors["templateType"] && <Error>{errors["templateType"]}</Error>}
                </Field>

                {formValues["payloadFormat"] && formValues["payloadFormat"].toLowerCase() == "registry reference" &&
                    <Field>
                        <TextField
                            label="Payload Key"
                            size={50}
                            placeholder=""
                            value={formValues["payloadKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "payloadKey": e });
                                formValidators["payloadKey"](e);
                            }}
                            required={false}
                        />
                        {errors["payloadKey"] && <Error>{errors["payloadKey"]}</Error>}
                    </Field>
                }

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Payload</h3>

                    {formValues["payloadFormat"] && formValues["payloadFormat"].toLowerCase() == "inline" &&
                        <Field>
                            <TextArea
                            label="Payload"
                            placeholder=""
                            value={formValues["payload"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "payload": e });
                                formValidators["payload"](e);
                            }}
                            required={false}
                        />
                        {errors["payload"] && <Error>{errors["payload"]}</Error>}
                        </Field>
                    }

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Args</h3>

                            <Field>
                                <label>Argument Type</label>
                                <AutoComplete items={["Value", "Expression"]} selectedItem={formValues["argumentType"]} onChange={(e: any) => {
                                    setFormValues({ ...formValues, "argumentType": e });
                                    formValidators["argumentType"](e);
                                }} />
                                {errors["argumentType"] && <Error>{errors["argumentType"]}</Error>}
                            </Field>

                            {formValues["argumentType"] && formValues["argumentType"].toLowerCase() == "value" &&
                                <Field>
                                    <TextField
                                        label="Argument Value"
                                        size={50}
                                        placeholder=""
                                        value={formValues["argumentValue"]}
                                        onChange={(e: any) => {
                                            setFormValues({ ...formValues, "argumentValue": e });
                                            formValidators["argumentValue"](e);
                                        }}
                                        required={false}
                                    />
                                    {errors["argumentValue"] && <Error>{errors["argumentValue"]}</Error>}
                                </Field>
                            }

                            {formValues["argumentType"] && formValues["argumentType"].toLowerCase() == "expression" &&
                                <Field>
                                    <TextField
                                        label="Argument Expression"
                                        size={50}
                                        placeholder=""
                                        value={formValues["argumentExpression"]}
                                        onChange={(e: any) => {
                                            setFormValues({ ...formValues, "argumentExpression": e });
                                            formValidators["argumentExpression"](e);
                                        }}
                                        required={false}
                                    />
                                    {errors["argumentExpression"] && <Error>{errors["argumentExpression"]}</Error>}
                                </Field>
                            }

                            {formValues["argumentType"] && formValues["argumentType"].toLowerCase() == "expression" &&
                                <Field>
                                    <label>Evaluator</label>
                                    <AutoComplete items={["xml", "json"]} selectedItem={formValues["evaluator"]} onChange={(e: any) => {
                                        setFormValues({ ...formValues, "evaluator": e });
                                        formValidators["evaluator"](e);
                                    }} />
                                    {errors["evaluator"] && <Error>{errors["evaluator"]}</Error>}
                                </Field>
                            }

                            <Field>
                                <VSCodeCheckbox type="checkbox" checked={formValues["literal"]} onChange={(e: any) => {
                                    setFormValues({ ...formValues, "literal": e.target.checked });
                                    formValidators["literal"](e);
                                }
                                }>Literal </VSCodeCheckbox>
                                {errors["literal"] && <Error>{errors["literal"]}</Error>}
                            </Field>


                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        {formValues["argumentType"] && formValues["argumentType"].toLowerCase() == "expression" && <Button appearance="primary" onClick={() => {
                            if (!(validateField("argumentExpression", formValues["argumentExpression"], true))) {
                                setFormValues({
                                    ...formValues, "argumentType": undefined, "argumentExpression": undefined,
                                    "args": [...formValues["args"], [null, formValues["argumentType"], formValues["argumentExpression"]]]
                                });
                            }
                        }}>
                            Add
                        </Button>}
                        {formValues["argumentType"] && formValues["argumentType"].toLowerCase() == "value" && <Button appearance="primary" onClick={() => {
                            if (!(validateField("argumentValue", formValues["argumentValue"], true))) {
                                setFormValues({
                                    ...formValues, "argumentType": undefined, "argumentExpression": undefined,
                                    "args": [...formValues["args"], [null, formValues["argumentType"], formValues["argumentValue"]]]
                                });
                            }
                        }}>
                            Add
                        </Button>}
                    </div>
                    {formValues["args"] && formValues["args"].length > 0 && (
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>Args Table</h3>
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
                                {formValues["args"].map((property: string, index: string) => (
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

export default PayloadForm; 
