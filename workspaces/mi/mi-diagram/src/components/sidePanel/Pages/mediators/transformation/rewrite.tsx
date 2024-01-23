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
import { MIWebViewAPI } from '../../../../../utils/WebViewRpc';
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

const RewriteForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "urlRewriteRules": [] as string[][],
       "rewriteRuleAction": [] as string[][],
       "ruleAction": "Replace",
       "ruleFragment": "protocol",
       "ruleOption": "Value",});
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
           const xml = getXML(MEDIATORS.REWRITE, formValues);
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
       "ruleAction": (e?: any) => validateField("ruleAction", e, false),
       "ruleFragment": (e?: any) => validateField("ruleFragment", e, false),
       "ruleOption": (e?: any) => validateField("ruleOption", e, false),
       "actionValue": (e?: any) => validateField("actionValue", e, false),
       "actionExpression": (e?: any) => validateField("actionExpression", e, false),
       "actionRegex": (e?: any) => validateField("actionRegex", e, false),
       "urlRewriteRuleCondition": (e?: any) => validateField("urlRewriteRuleCondition", e, false),
       "inProperty": (e?: any) => validateField("inProperty", e, false),
       "outProperty": (e?: any) => validateField("outProperty", e, false),
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
                <h3>URL Rewrite Rules</h3>

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Rewrite Rule Action</h3>

                            <Field>
                                <label>Rule Action</label>
                                <AutoComplete items={["Replace", "Remove", "Append", "Prepend", "Set"]} selectedItem={formValues["ruleAction"]} onChange={(e: any) => {
                                    setFormValues({ ...formValues, "ruleAction": e });
                                    formValidators["ruleAction"](e);
                                }} />
                                {errors["ruleAction"] && <Error>{errors["ruleAction"]}</Error>}
                            </Field>

                            <Field>
                                <label>Rule Fragment</label>
                                <AutoComplete items={["protocol", "host", "port", "path", "query", "ref", "user", "full"]} selectedItem={formValues["ruleFragment"]} onChange={(e: any) => {
                                    setFormValues({ ...formValues, "ruleFragment": e });
                                    formValidators["ruleFragment"](e);
                                }} />
                                {errors["ruleFragment"] && <Error>{errors["ruleFragment"]}</Error>}
                            </Field>

                            <Field>
                                <label>Rule Option</label>
                                <AutoComplete items={["Value", "Expression"]} selectedItem={formValues["ruleOption"]} onChange={(e: any) => {
                                    setFormValues({ ...formValues, "ruleOption": e });
                                    formValidators["ruleOption"](e);
                                }} />
                                {errors["ruleOption"] && <Error>{errors["ruleOption"]}</Error>}
                            </Field>

                            {formValues["ruleOption"] && formValues["ruleOption"].toLowerCase() == "value" &&
                                <Field>
                                    <TextField
                                        label="Action Value"
                                        size={50}
                                        placeholder=""
                                        value={formValues["actionValue"]}
                                        onChange={(e: any) => {
                                            setFormValues({ ...formValues, "actionValue": e });
                                            formValidators["actionValue"](e);
                                        }}
                                        required={false}
                                    />
                                    {errors["actionValue"] && <Error>{errors["actionValue"]}</Error>}
                                </Field>
                            }

                            {formValues["ruleOption"] && formValues["ruleOption"].toLowerCase() == "expression" &&
                                <Field>
                                    <TextField
                                        label="Action Expression"
                                        size={50}
                                        placeholder=""
                                        value={formValues["actionExpression"]}
                                        onChange={(e: any) => {
                                            setFormValues({ ...formValues, "actionExpression": e });
                                            formValidators["actionExpression"](e);
                                        }}
                                        required={false}
                                    />
                                    {errors["actionExpression"] && <Error>{errors["actionExpression"]}</Error>}
                                </Field>
                            }

                            <Field>
                                <TextField
                                    label="Action Regex"
                                    size={50}
                                    placeholder=""
                                    value={formValues["actionRegex"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "actionRegex": e });
                                        formValidators["actionRegex"](e);
                                    }}
                                    required={false}
                                />
                                {errors["actionRegex"] && <Error>{errors["actionRegex"]}</Error>}
                            </Field>


                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={() => {
                            if (!(validateField("ruleAction", formValues["ruleAction"], true) || validateField("ruleOption", formValues["ruleOption"], true))) {
                                setFormValues({
                                    ...formValues, "ruleAction": undefined, "ruleOption": undefined,
                                    "rewriteRuleAction": [...formValues["rewriteRuleAction"], [formValues["ruleAction"], formValues["ruleFragment"], formValues["ruleOption"]]]
                                });
                            }
                        }}>
                            Add
                        </Button>
                    </div>
                    {formValues["rewriteRuleAction"] && formValues["rewriteRuleAction"].length > 0 && (
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            <h3>Rewrite Rule Action Table</h3>
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
                                {formValues["rewriteRuleAction"].map((property: string, index: string) => (
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
                            label="URLRewriteRuleCondition"
                            size={50}
                            placeholder=""
                            value={formValues["urlRewriteRuleCondition"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "urlRewriteRuleCondition": e });
                                formValidators["urlRewriteRuleCondition"](e);
                            }}
                            required={false}
                        />
                        {errors["urlRewriteRuleCondition"] && <Error>{errors["urlRewriteRuleCondition"]}</Error>}
                    </Field>


            <div style={{ textAlign: "right", marginTop: "10px" }}>
                <Button appearance="primary" onClick={() => {
                    if (!(validateField("rewriteRuleAction", formValues["rewriteRuleAction"], true) || validateField("", formValues[""], true))) {
                        setFormValues({
                            ...formValues, "rewriteRuleAction": undefined, "": undefined,
                            "urlRewriteRules": [...formValues["urlRewriteRules"], [formValues["rewriteRuleAction"], formValues["urlRewriteRuleCondition"], formValues[""]]]
                        });
                    }
                }}>
                    Add
                </Button>
            </div>
            {formValues["urlRewriteRules"] && formValues["urlRewriteRules"].length > 0 && (
                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>URL Rewrite Rules Table</h3>
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
                        {formValues["urlRewriteRules"].map((property: string, index: string) => (
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
            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>In-Out Properties</h3>

                <Field>
                </Field>

                <Field>
                </Field>

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

export default RewriteForm; 
