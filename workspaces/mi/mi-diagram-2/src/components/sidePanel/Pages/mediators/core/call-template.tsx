/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, ParamConfig, ParamManager, TextField } from '@wso2-enterprise/ui-toolkit';
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

const CallTemplateForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [availableSequenceTemplates, setAvailableSequenceTemplates] = useState([] as string[]);
   const [availableEndpointTemplates, setAvailableEndpointTemplates] = useState([] as string[]);
   const [errors, setErrors] = useState({} as any);

   const paramConfigs: ParamConfig = {
       paramValues: [],
       paramFields: [
       {
           type: "TextField",
           label: "Parameter Name",
           defaultValue: "Name",
           isRequired: true
       },
       {
           type: "Dropdown",
           label: "Template Parameter Type",
           defaultValue: "LITERAL",
           isRequired: true,
           values: ["LITERAL", "EXPRESSION"]
       },
       {
           type: "TextField",
           label: "Parameter Value",
           defaultValue: "value",
           isRequired: true
       },]
   };
 
   const [params, setParams] = useState(paramConfigs);
 
   const handleOnChange = (params: any) => {
       setParams(params);
   };

   useEffect(() => {
        fetchAvailableResources();
       if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
           if (sidePanelContext.formValues["parameterNameTable"] && sidePanelContext.formValues["parameterNameTable"].length > 0 ) {
               const paramValues = sidePanelContext.formValues["parameterNameTable"].map((property: string, index: string) => (
                   {
                       id: index,
                       parameters: [
                           {
                               id: 0,
                               label: "parameterName",
                               type: "TextField",
                               value: property[0],
                               isRequired: true
                           },
                           {
                               id: 1,
                               label: "templateParameterType",
                               type: "TextField",
                               value: property[1],
                               isRequired: true
                           },
                           {
                               id: 2,
                               label: "parameterValue",
                               type: "TextField",
                               value: property[2],
                               isRequired: true
                           }
                       ]
                   })
               )
               setParams({ ...params, paramValues: paramValues });
           }
       } else {
            setFormValues({
                "availableTemplates": "Select From Templates",
                "parameterNameTable": [] as string[][],});
        }
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        if (!formValues["availableTemplates"]) {
            if (availableEndpointTemplates.includes(formValues["targetTemplate"]) || availableSequenceTemplates.includes(formValues["targetTemplate"])) {
                formValues["availableTemplates"] = formValues["targetTemplate"];
            }
        }
    }, [availableEndpointTemplates, availableSequenceTemplates]);

    const fetchAvailableResources = async () => {
        rpcClient.getMiDiagramRpcClient().getAvailableResources({ documentIdentifier: props.documentUri, resourceType: "sequenceTemplate" }).then(resp => {
            const resourceArray: string[] = [];
            resp.resources.map((res: { [key: string]: any }) => {
                resourceArray.push(res.name);
            })
            setAvailableSequenceTemplates(resourceArray);
        });
        rpcClient.getMiDiagramRpcClient().getAvailableResources({ documentIdentifier: props.documentUri, resourceType: "endpointTemplate" }).then(resp => {
            const resourceArray: string[] = [];
            resp.resources.map((res: { [key: string]: any }) => {
                resourceArray.push(res.name);
            })
            setAvailableEndpointTemplates(resourceArray);
        });
    }

   const onClick = async () => {
       const newErrors = {} as any;
       Object.keys(formValidators).forEach((key) => {
           const error = formValidators[key]();
           if (error) {
               newErrors[key] = (error);
           }
       });
       formValues["parameterNameTable"] = params.paramValues.map((param: any) => [param.parameters[0].value, param.parameters[1].value, param.parameters[2].value]);
       if (Object.keys(newErrors).length > 0) {
           setErrors(newErrors);
       } else {
           const xml = getXML(MEDIATORS.CALLTEMPLATE, formValues);
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
       "availableTemplates": (e?: any) => validateField("availableTemplates", e, false),
       "targetTemplate": (e?: any) => validateField("targetTemplate", e, false),
       "onError": (e?: any) => validateField("onError", e, false),
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
                    <label>Available Templates</label>
                   <AutoComplete items={[...availableSequenceTemplates, ...availableEndpointTemplates]} selectedItem={formValues["availableTemplates"]} onChange={(e: any) => {
                       const updateValues: { [key: string]: any } = { "availableTemplates": e }
                       if (e != "Select From Templates") {
                           updateValues["targetTemplate"] = e;
                       }
                       setFormValues({ ...formValues, "availableTemplates": e, ...updateValues });
                       formValidators["availableTemplates"](e);
                   }} />
                    {errors["availableTemplates"] && <Error>{errors["availableTemplates"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Parameter Name Table</h3>

                {formValues["parameterNameTable"] && (
                    <ParamManager
                        paramConfigs={params}
                        readonly={false}
                        onChange= {handleOnChange} />
                )}
                </ComponentCard>
                <Field>
                    <TextField
                        label="Target Template"
                        size={50}
                        placeholder=""
                        value={formValues["targetTemplate"]}
                        onChange={(e: any) => {
                            const updateValues: { [key: string]: any } = { "targetTemplate": e }
                            if (availableEndpointTemplates.includes(e) || availableSequenceTemplates.includes(e)) {
                                updateValues["availableTemplates"] = e;
                            } else {
                                updateValues["availableTemplates"] = "Select From Templates";
                            }
                            setFormValues({ ...formValues, ...updateValues });
                            formValidators["targetTemplate"](e);
                        }}
                        required={false}
                    />
                    {errors["targetTemplate"] && <Error>{errors["targetTemplate"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="OnError"
                        size={50}
                        placeholder=""
                        value={formValues["onError"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "onError": e });
                            formValidators["onError"](e);
                        }}
                        required={false}
                    />
                    {errors["onError"] && <Error>{errors["onError"]}</Error>}
                </Field>

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

export default CallTemplateForm; 
