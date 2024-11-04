/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, CheckBox, CheckBoxGroup, Codicon, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { PathItem as P } from '../../../Definitions/ServiceDefinitions';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';
import { useState } from 'react';
import { getColorByMethod } from '../../Utils/OpenAPIUtils';
import { Parameters } from '../Parameters/Parameters';

const PanelBody = styled.div`
    height: calc(100% - 87px);
    overflow-y: auto;
    padding: 16px;
    gap: 15px;
    display: flex;
    flex-direction: column;
`;

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: flex-grow;
    justify-content: flex-end;
`;

interface PathItemProps {
    pathItem: P;
    path: string;
    onPathItemChange: (pathItem: P, path: string) => void;
}

const httpMethods = ["get", "post", "put", "delete", "options", "head", "patch", "trace"];
const moreOptions = ["Summary", "Description"];

const getAllOperationsFromPathItem = (pathItem: P) => {
    return Object.keys(pathItem).filter(key => httpMethods.includes(key));
}

// Title, Vesrion are mandatory fields
export function PathItem(props: PathItemProps) {
    const { pathItem, path, onPathItemChange } = props;
    const [description, setDescription] = useState<string>(pathItem?.description || "");
    const { rpcClient } = useVisualizerContext();
    let selectedOptions: string[] = [];
    if (pathItem && pathItem.summary === "" || pathItem.summary) {
        selectedOptions.push("Summary");
    }
    if (pathItem && pathItem.description === "" || pathItem.description) {
        selectedOptions.push("Description");
    }

    const handlePathItemChange = (pathItem: P, path: string) => {
        onPathItemChange(pathItem, path);
    };
    const handleOptionChange = (options: string[]) => {
        // Update the path item with the selected options
        let updatedPathItem = { ...pathItem };
        if (options.includes("Summary")) {
            updatedPathItem.summary = "";
        } else {
            delete updatedPathItem.summary;
        }
        if (options.includes("Description")) {
            updatedPathItem.description = "";
        } else {
            delete updatedPathItem.description;
        }
        handlePathItemChange(updatedPathItem, path);
    }
    const onConfigureClick = () => {
        rpcClient.selectQuickPickItems({
            title: "Select sections",
            items: moreOptions.map(item => ({ label: item, picked: selectedOptions.includes(item) }))
        }).then(resp => {
            if (resp) {
                handleOptionChange(resp.map(item => item.label))
            }
        })
    };
    const handleDescriptionChange = (e: any) => {
        setDescription(e.target.value);
        handlePathItemChange({ ...pathItem, description: e.target.value }, path);
    };
    const handleOperationChange = (isChecked: boolean, method: string) => {
        let updatedPathItem = { ...pathItem };
        if (isChecked) {
            updatedPathItem[method] = {
                parameters: [],
                responses: {
                    200: {
                        description: "OK",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "string",
                                },
                            },
                        },
                    },
                },
            };
            // If the method is post, put or patch, add a request body
            if (method === 'post' || method === 'put' || method === 'patch') {
                updatedPathItem[method].requestBody = {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                            },
                        },
                    },
                };
            }
        } else {
            delete updatedPathItem[method];
        }
        handlePathItemChange(updatedPathItem, path);
    };
    
    const operations = getAllOperationsFromPathItem(pathItem);

    return (
        <PanelBody>
            <ButtonWrapper>
                <Button tooltip='Select sections' onClick={onConfigureClick} appearance='icon'>
                    <Codicon name='gear' sx={{ marginRight: "4px" }} />
                    Configure
                </Button>
            </ButtonWrapper>
            <TextField
                label="Path"
                id="path"
                sx={{ width: "100%" }}
                value={path}
                forceAutoFocus
                onBlur={(e) => handlePathItemChange({ ...pathItem }, e.target.value)}
            />
            {selectedOptions.includes("Summary") && (
                <TextField
                    label="Summary"
                    id="summary"
                    sx={{ width: "100%" }}
                    value={pathItem.summary}
                    onBlur={(e) => handlePathItemChange({ ...pathItem, summary: e.target.value }, path)}
                />
            )}
            {selectedOptions.includes("Description") && (
                <TextField
                    label="Description"
                    id="description"
                    sx={{ width: "100%" }}
                    value={description}
                    onChange={handleDescriptionChange}
                />
            )}
            <label>Operations</label>
            <CheckBoxGroup
                    direction="vertical"
                    columns={2}
                >
                    {httpMethods && httpMethods.map((method: string) => (
                        <CheckBox
                            label={method?.toLocaleUpperCase()}
                            value={method} checked={operations.includes(method)}
                            onChange={(isChecked: boolean) => handleOperationChange(isChecked, method)}
                            sx={{ "--foreground": getColorByMethod(method) }}
                        />
                    ))}
            </CheckBoxGroup>
            <Parameters
                title='Path Parameters'
                type='path'
                parameters={pathItem.parameters}
                onParametersChange={(parameters) => handlePathItemChange({ ...pathItem, parameters }, path)}
            />
            <Parameters
                title='Query Parameters'
                type='query'
                parameters={pathItem.parameters}
                onParametersChange={(parameters) => handlePathItemChange({ ...pathItem, parameters }, path)}
            />
            <Parameters
                title='Header Parameters'
                type='header'
                parameters={pathItem.parameters}
                onParametersChange={(parameters) => handlePathItemChange({ ...pathItem, parameters }, path)}
            />
        </PanelBody>
    )
}
