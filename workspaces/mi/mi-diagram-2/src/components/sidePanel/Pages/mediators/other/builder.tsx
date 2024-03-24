/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { Button, ComponentCard, ParamConfig, ParamManager, TextField } from '@wso2-enterprise/ui-toolkit';
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

const generateDisplayValue = (paramValues: any) => {
    const result: string = paramValues.parameters[1].value + " " + paramValues.parameters[2].value;
    return result.trim();
};

const BuilderForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "TextField",
                label: "Content Type",
                defaultValue: "",
                isRequired: false,
            },
            {
                id: 1,
                type: "TextField",
                label: "Builder Class",
                defaultValue: "",
                isRequired: false,
            },
            {
                id: 2,
                type: "TextField",
                label: "Formatter Class",
                defaultValue: "",
                isRequired: false,
            },]
    };

    const [params, setParams] = useState(paramConfigs);
    const handleOnChange = (params: any) => {
        const modifiedParams = { ...params, paramValues: params.paramValues.map((param: any) => {
            return {
                ...param,
                key: param.parameters[0].value,
                value: generateDisplayValue(param),
                icon: "query"
            }
        })};
        setParams(modifiedParams);
    };

    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
            if (sidePanelContext.formValues["messageBuilders"] && sidePanelContext.formValues["messageBuilders"].length > 0) {
                const paramValues = sidePanelContext.formValues["messageBuilders"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "contentType",
                                type: "TextField",
                                value: property[0],
                                isRequired: false
                            },
                            {
                                id: 1,
                                label: "builderClass",
                                type: "TextField",
                                value: property[1],
                                isRequired: true
                            },
                            {
                                id: 2,
                                label: "formatterClass",
                                type: "TextField",
                                value: property[2],
                                isRequired: false
                            }
                        ],
                        key: property[0],
                        value: property[1] + " " + property[2],
                        icon: "query"
                    })
                )
                setParams({ ...params, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "messageBuilders": [] as string[][],
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
        formValues["messageBuilders"] = params.paramValues.map(param => param.parameters.slice(0, 4).map(p => p.value));
        params.paramValues.forEach(param => {
            param.parameters.slice(0, 4).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const xml = getXML(MEDIATORS.BUILDER, formValues);
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
        "contentType": (e?: any) => validateField("contentType", e, false),
        "builderClass": (e?: any) => validateField("builderClass", e, false),
        "formatterClass": (e?: any) => validateField("formatterClass", e, false),
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

                {formValues["messageBuilders"] && (
                    <ParamManager
                        paramConfigs={params}
                        readonly={false}
                        onChange={handleOnChange} />
                )}
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

export default BuilderForm; 
