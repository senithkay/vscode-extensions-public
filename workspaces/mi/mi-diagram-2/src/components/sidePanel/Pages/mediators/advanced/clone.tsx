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
import { AddMediatorProps } from '../common';
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

const CloneForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "sequentialMediation": false,
       "continueParent": false,
       "targets": [] as string[][],
       "sequenceType": "Default",
       "endpointType": "Default",});
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
           const xml = getXML(MEDIATORS.CLONE, formValues);
           rpcClient.getMiDiagramRpcClient().applyEdit({
               documentUri: props.documentUri, range: props.nodePosition, text: xml
           });
           sidePanelContext.setIsOpen(false);
           sidePanelContext.setFormValues(undefined);
           sidePanelContext.setNodeRange(undefined);
           sidePanelContext.setOperationName(undefined);
       }
   };

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "cloneId": (e?: any) => validateField("cloneId", e, false),
       "sequentialMediation": (e?: any) => validateField("sequentialMediation", e, false),
       "continueParent": (e?: any) => validateField("continueParent", e, false),
       "sequenceType": (e?: any) => validateField("sequenceType", e, false),
       "sequenceRegistryKey": (e?: any) => validateField("sequenceRegistryKey", e, false),
       "endpointType": (e?: any) => validateField("endpointType", e, false),
       "endpointRegistryKey": (e?: any) => validateField("endpointRegistryKey", e, false),
       "soapAction": (e?: any) => validateField("soapAction", e, false),
       "toAddress": (e?: any) => validateField("toAddress", e, false),
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
                        label="Clone ID"
                        size={50}
                        placeholder=""
                        value={formValues["cloneId"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "cloneId": e });
                            formValidators["cloneId"](e);
                        }}
                        required={false}
                    />
                    {errors["cloneId"] && <Error>{errors["cloneId"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["sequentialMediation"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "sequentialMediation": e.target.checked });
                        formValidators["sequentialMediation"](e);
                    }
                    }>Sequential Mediation </VSCodeCheckbox>
                    {errors["sequentialMediation"] && <Error>{errors["sequentialMediation"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["continueParent"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "continueParent": e.target.checked });
                        formValidators["continueParent"](e);
                    }
                    }>Continue Parent </VSCodeCheckbox>
                    {errors["continueParent"] && <Error>{errors["continueParent"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Targets</h3>

                        <Field>
                            <label>Sequence Type</label>
                            <AutoComplete items={["NONE", "ANONYMOUS", "REGISTRY_REFERENCE"]} selectedItem={formValues["sequenceType"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "sequenceType": e });
                                formValidators["sequenceType"](e);
                            }} />
                            {errors["sequenceType"] && <Error>{errors["sequenceType"]}</Error>}
                        </Field>

                        {formValues["sequenceType"] && formValues["sequenceType"].toLowerCase() == "registry_reference" &&
                            <Field>
                                <TextField
                                    label="Sequence Registry Key"
                                    size={50}
                                    placeholder=""
                                    value={formValues["sequenceRegistryKey"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "sequenceRegistryKey": e });
                                        formValidators["sequenceRegistryKey"](e);
                                    }}
                                    required={false}
                                />
                                {errors["sequenceRegistryKey"] && <Error>{errors["sequenceRegistryKey"]}</Error>}
                            </Field>
                        }

                        <Field>
                            <label>Endpoint Type</label>
                            <AutoComplete items={["NONE", "ANONYMOUS", "REGISTRY_REFERENCE"]} selectedItem={formValues["endpointType"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "endpointType": e });
                                formValidators["endpointType"](e);
                            }} />
                            {errors["endpointType"] && <Error>{errors["endpointType"]}</Error>}
                        </Field>

                        {formValues["endpointType"] && formValues["endpointType"].toLowerCase() == "registry_reference" &&
                            <Field>
                                <TextField
                                    label="Endpoint Registry Key"
                                    size={50}
                                    placeholder=""
                                    value={formValues["endpointRegistryKey"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "endpointRegistryKey": e });
                                        formValidators["endpointRegistryKey"](e);
                                    }}
                                    required={false}
                                />
                                {errors["endpointRegistryKey"] && <Error>{errors["endpointRegistryKey"]}</Error>}
                            </Field>
                        }

                        <Field>
                            <TextField
                                label="SOAP Action"
                                size={50}
                                placeholder=""
                                value={formValues["soapAction"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "soapAction": e });
                                    formValidators["soapAction"](e);
                                }}
                                required={false}
                            />
                            {errors["soapAction"] && <Error>{errors["soapAction"]}</Error>}
                        </Field>

                        <Field>
                            <TextField
                                label="To Address"
                                size={50}
                                placeholder=""
                                value={formValues["toAddress"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "toAddress": e });
                                    formValidators["toAddress"](e);
                                }}
                                required={false}
                            />
                            {errors["toAddress"] && <Error>{errors["toAddress"]}</Error>}
                        </Field>


                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (!(validateField("sequenceType", formValues["sequenceType"], true) || validateField("endpointType", formValues["endpointType"], true))) {
                            setFormValues({
                                ...formValues, "sequenceType": undefined, "endpointType": undefined,
                                "targets": [...formValues["targets"], [formValues["sequenceType"], formValues["sequenceRegistryKey"], formValues["endpointType"]]]
                            });
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["targets"] && formValues["targets"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Targets Table</h3>
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
                            {formValues["targets"].map((property: string, index: string) => (
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

export default CloneForm; 
