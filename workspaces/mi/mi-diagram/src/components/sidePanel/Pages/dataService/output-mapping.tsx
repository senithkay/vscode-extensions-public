/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/

import React, { useEffect, useRef } from 'react';
import { Button, ComponentCard, ProgressIndicator, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../SidePanelContexProvider';
import { AddMediatorProps, getParamManagerValues, getParamManagerFromValues } from '../mediators/common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../resources/constants';
import { Controller, useForm } from 'react-hook-form';
import { ParamManager, ParamValue } from '../../../Form/ParamManager/ParamManager';
import { sidepanelGoBack } from '../..';

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

const OutputMappingsForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [ isLoading, setIsLoading ] = React.useState(true);
    const handleOnCancelExprEditorRef = useRef(() => { });

    const { control, formState: { errors, dirtyFields }, handleSubmit, watch, reset } = useForm();

    useEffect(() => {
        reset({
            outputMappings: {
                paramValues: sidePanelContext?.formValues?.outputMappings ? getParamManagerFromValues(sidePanelContext?.formValues?.outputMappings) : [],
                paramFields: [
                    {
                        "type": "Dropdown",
                        "label": "Mapping Type",
                        "defaultValue": "Element",
                        "isRequired": false,
                        "values": [
                            "Element",
                            "Attribute",
                            "Query",
                            "Complex Element"
                        ]
                    },
                    {
                        "label": "Query ID",
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "type": "Dropdown",
                        "label": "Datasource Type",
                        "defaultValue": "Column",
                        "isRequired": false,
                        "values": [
                            "Column",
                            "Query Param"
                        ],
                        "enableCondition": [
                            "OR",
                            {
                                "0": "Element"
                            },
                            {
                                "0": "Attribute"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Output Field Name",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            "OR",
                            {
                                "0": "Element"
                            },
                            {
                                "0": "Attribute"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Element Name",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "0": "Complex Element"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Element Namespace",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            "OR",
                            {
                                "0": "Element"
                            },
                            {
                                "0": "Complex Element"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Datasource Column Name",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            "AND",
                            [
                                "OR",
                                {
                                    "0": "Element"
                                },
                                {
                                    "0": "Attribute"
                                }
                            ],
                            {
                                "2": "Column"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Datasource Query Param Name",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            "AND",
                            [
                                "OR",
                                {
                                    "0": "Element"
                                },
                                {
                                    "0": "Attribute"
                                }
                            ],
                            {
                                "2": "Query Param"
                            }
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Parameter Type",
                        "defaultValue": "Scalar",
                        "isRequired": false,
                        "values": [
                            "Scalar",
                            "Array"
                        ],
                        "enableCondition": [
                            "NOT",
                            {
                                "0": "Query"
                            }
                        ]
                    },
                    {
                        "type": "TextField",
                        "label": "Array Name",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            "AND",
                            [
                                "NOT",
                                {
                                    "0": "Query"
                                }
                            ],
                            {
                                "8": "Array"
                            }
                        ]
                    },
                    {
                        "type": "Dropdown",
                        "label": "Schema Type",
                        "defaultValue": "string",
                        "isRequired": false,
                        "values": [
                            "string",
                            "integer",
                            "boolean",
                            "float",
                            "double",
                            "decimal",
                            "dateTime",
                            "time",
                            "date",
                            "long",
                            "base64Binary"
                        ],
                        "enableCondition": [
                            "OR",
                            {
                                "0": "Element"
                            },
                            {
                                "0": "Complex Element"
                            }
                        ]
                    },
                    {
                        "type": "Checkbox",
                        "label": "Optional",
                        "defaultValue": false,
                        "isRequired": false
                    },
                    {
                        "label": "Child Elements",
                        "defaultValue": "",
                        "isRequired": false,
                        "enableCondition": [
                            {
                                "0": "Complex Element"
                            }
                        ]
                    },
                    {
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "defaultValue": "",
                        "isRequired": false
                    },
                    {
                        "defaultValue": "",
                        "isRequired": false
                    },
                ]
            },
        });
        setIsLoading(false);
    }, [sidePanelContext.formValues]);

    useEffect(() => {
        handleOnCancelExprEditorRef.current = () => {
            sidepanelGoBack(sidePanelContext);
        };
    }, [sidePanelContext.pageStack]);

    const onClick = async (values: any) => {
        
        values["outputMappings"] = getParamManagerValues(values.outputMappings);
        // const xml = getXML(MEDIATORS.OUTPUTMAPPINGS, values, dirtyFields, sidePanelContext.formValues);
        // if (Array.isArray(xml)) {
        //     for (let i = 0; i < xml.length; i++) {
        //         await rpcClient.getMiDiagramRpcClient().applyEdit({
        //             documentUri: props.documentUri, range: xml[i].range, text: xml[i].text
        //         });
        //     }
        // } else {
        //     rpcClient.getMiDiagramRpcClient().applyEdit({
        //         documentUri: props.documentUri, range: props.nodePosition, text: xml
        //     });
        // }
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            isOpen: false,
            isEditing: false,
            formValues: undefined,
            nodeRange: undefined,
            operationName: undefined
        });
    };

    if (isLoading) {
        return <ProgressIndicator/>;
    }
    return (
        <>
            <Typography sx={{ padding: "10px 20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }} variant="body3"></Typography>
            <div style={{ padding: "20px" }}>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <Typography variant="h3">Output Mappings</Typography>
                

                    <Controller
                        name="outputMappings"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <ParamManager
                                paramConfigs={value}
                                readonly={false}
                                onChange= {(values) => {
                                    values.paramValues = values.paramValues.map((param: any, index: number) => {
                                        const property: ParamValue[] = param.paramValues;
                                        param.key = property[0].value;
                                        param.value = property[3].value;
                                        param.icon = 'query';
                                        return param;
                                    });
                                    onChange(values);
                                }}
                            />
                        )}
                    />
                </ComponentCard>


                <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit(onClick)}
                    >
                    Submit
                    </Button>
                </div>

            </div>
        </>
    );
};

export default OutputMappingsForm; 
