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

const ValidateForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "enableSchemaCaching": false,
       "schemas": [] as string[][],
       "validateSchemaKeyType": "Static",
       "features": [] as string[][],
       "featureEnabled": false,
       "resources": [] as string[][],});
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
           const xml = getXML(MEDIATORS.VALIDATE, formValues);
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
       "source": (e?: any) => validateField("source", e, false),
       "enableSchemaCaching": (e?: any) => validateField("enableSchemaCaching", e, false),
       "validateSchemaKeyType": (e?: any) => validateField("validateSchemaKeyType", e, false),
       "validateStaticSchemaKey": (e?: any) => validateField("validateStaticSchemaKey", e, false),
       "validateDynamicSchemaKey": (e?: any) => validateField("validateDynamicSchemaKey", e, false),
       "featureName": (e?: any) => validateField("featureName", e, false),
       "featureEnabled": (e?: any) => validateField("featureEnabled", e, false),
       "location": (e?: any) => validateField("location", e, false),
       "locationKey": (e?: any) => validateField("locationKey", e, false),
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
                        label="Source"
                        size={50}
                        placeholder=""
                        value={formValues["source"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "source": e });
                            formValidators["source"](e);
                        }}
                        required={false}
                    />
                    {errors["source"] && <Error>{errors["source"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["enableSchemaCaching"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "enableSchemaCaching": e.target.checked });
                        formValidators["enableSchemaCaching"](e);
                    }
                    }>Enable Schema Caching </VSCodeCheckbox>
                    {errors["enableSchemaCaching"] && <Error>{errors["enableSchemaCaching"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Schemas</h3>

                        <Field>
                            <label>Validate Schema Key Type</label>
                            <AutoComplete items={["Static", "Dynamic"]} selectedItem={formValues["validateSchemaKeyType"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "validateSchemaKeyType": e });
                                formValidators["validateSchemaKeyType"](e);
                            }} />
                            {errors["validateSchemaKeyType"] && <Error>{errors["validateSchemaKeyType"]}</Error>}
                        </Field>

                        {formValues["validateSchemaKeyType"] && formValues["validateSchemaKeyType"].toLowerCase() == "static" &&
                            <Field>
                                <TextField
                                    label="Validate Static Schema Key"
                                    size={50}
                                    placeholder=""
                                    value={formValues["validateStaticSchemaKey"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "validateStaticSchemaKey": e });
                                        formValidators["validateStaticSchemaKey"](e);
                                    }}
                                    required={false}
                                />
                                {errors["validateStaticSchemaKey"] && <Error>{errors["validateStaticSchemaKey"]}</Error>}
                            </Field>
                        }

                        {formValues["validateSchemaKeyType"] && formValues["validateSchemaKeyType"].toLowerCase() == "dynamic" &&
                            <Field>
                                <TextField
                                    label="Validate Dynamic Schema Key"
                                    size={50}
                                    placeholder=""
                                    value={formValues["validateDynamicSchemaKey"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "validateDynamicSchemaKey": e });
                                        formValidators["validateDynamicSchemaKey"](e);
                                    }}
                                    required={false}
                                />
                                {errors["validateDynamicSchemaKey"] && <Error>{errors["validateDynamicSchemaKey"]}</Error>}
                            </Field>
                        }


                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (!(validateField("validateSchemaKeyType", formValues["validateSchemaKeyType"], true) || validateField("validateDynamicSchemaKey", formValues["validateDynamicSchemaKey"], true))) {
                            setFormValues({
                                ...formValues, "validateSchemaKeyType": undefined, "validateDynamicSchemaKey": undefined,
                                "schemas": [...formValues["schemas"], [formValues["validateSchemaKeyType"], formValues["validateStaticSchemaKey"], formValues["validateDynamicSchemaKey"]]]
                            });
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["schemas"] && formValues["schemas"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Schemas Table</h3>
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
                            {formValues["schemas"].map((property: string, index: string) => (
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
                    <h3>Features</h3>

                        <Field>
                            <TextField
                                label="Feature Name"
                                size={50}
                                placeholder=""
                                value={formValues["featureName"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "featureName": e });
                                    formValidators["featureName"](e);
                                }}
                                required={false}
                            />
                            {errors["featureName"] && <Error>{errors["featureName"]}</Error>}
                        </Field>

                        <Field>
                            <VSCodeCheckbox type="checkbox" checked={formValues["featureEnabled"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "featureEnabled": e.target.checked });
                                formValidators["featureEnabled"](e);
                            }
                            }>Feature Enabled </VSCodeCheckbox>
                            {errors["featureEnabled"] && <Error>{errors["featureEnabled"]}</Error>}
                        </Field>


                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (!(validateField("featureName", formValues["featureName"], true) || validateField("", formValues[""], true))) {
                            setFormValues({
                                ...formValues, "featureName": undefined, "": undefined,
                                "features": [...formValues["features"], [formValues["featureName"], formValues["featureEnabled"], formValues[""]]]
                            });
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["features"] && formValues["features"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Features Table</h3>
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
                            {formValues["features"].map((property: string, index: string) => (
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
                    <h3>Resources</h3>

                        <Field>
                            <TextField
                                label="Location"
                                size={50}
                                placeholder=""
                                value={formValues["location"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "location": e });
                                    formValidators["location"](e);
                                }}
                                required={false}
                            />
                            {errors["location"] && <Error>{errors["location"]}</Error>}
                        </Field>

                        <Field>
                            <TextField
                                label="Location Key"
                                size={50}
                                placeholder=""
                                value={formValues["locationKey"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "locationKey": e });
                                    formValidators["locationKey"](e);
                                }}
                                required={false}
                            />
                            {errors["locationKey"] && <Error>{errors["locationKey"]}</Error>}
                        </Field>


                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (!(validateField("location", formValues["location"], true) || validateField("", formValues[""], true))) {
                            setFormValues({
                                ...formValues, "location": undefined, "": undefined,
                                "resources": [...formValues["resources"], [formValues["location"], formValues["locationKey"], formValues[""]]]
                            });
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["resources"] && formValues["resources"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Resources Table</h3>
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
                            {formValues["resources"].map((property: string, index: string) => (
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

export default ValidateForm; 
