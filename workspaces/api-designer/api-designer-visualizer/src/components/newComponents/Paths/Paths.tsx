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
import { Paths as P, PathItem as PI } from '../../../Definitions/ServiceDefinitions';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';
import { useState } from 'react';
import { getColorByMethod } from '../../Utils/OpenAPIUtils';
import { Parameters } from '../Parameters/Parameters';
import { PathItem } from '../PathItem/PathItem';

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

interface PathsProps {
    paths: P;
    selectedPath?: string;
    onPathsChange: (pathItem: P) => void;
}

export function Paths(props: PathsProps) {
    const { paths, selectedPath, onPathsChange } = props;
    const handlePathsChange = (pathItem: PI, path: string) => {
        onPathsChange({ ...paths, [path]: pathItem });
    };
    return (
        <>
            {Object.keys(paths).map((key) => {
                if (key !== "$ref" && key !== "summary" && key !== "description" && key !== "servers" && selectedPath === key) {
                    return (
                        <PathItem
                            pathItem={paths[key]}
                            path={key}
                            onPathItemChange={handlePathsChange}
                        />
                    )
                }
            })}
        </>
    )
}
