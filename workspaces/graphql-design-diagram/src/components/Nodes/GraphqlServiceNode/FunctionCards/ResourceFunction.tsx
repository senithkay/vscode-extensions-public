/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
// tslint:disable: jsx-no-multiline-js
import React, { useState } from 'react';

import { DiagramEngine } from '@projectstorm/react-diagrams';

import { Popover } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ParametersPopup } from "../../../Popup/ParametersPopup";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { ResourceFunction } from "../../../resources/model";
import { FieldName, FieldType, } from "../../../resources/styles/styles";
import { GraphqlServiceNodeModel } from "../GraphqlServiceNodeModel";
import { popOverStyle } from "../../../Popup/styles";
import { QueryIcon } from "../../../resources/assets/icons/QueryIcon";

interface ResourceFunctionProps {
    engine: DiagramEngine;
    node: GraphqlServiceNodeModel;
    resource: ResourceFunction;
    resourcePath: string;
}

export function ResourceFunctionWidget(props: ResourceFunctionProps) {
    const { engine, node, resource, resourcePath} = props;
    const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(null);

    const onMouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorElement(event.currentTarget);
    }

    const onMouseLeave = () => {
        setAnchorElement(null);
    }

    const classes = popOverStyle();

    return (
        <>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${resourcePath}`)}
                engine={engine}
            />
                <QueryIcon/>
                <FieldName onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} style={{marginLeft: '7px'}}>
                    {resource.identifier}
                </FieldName>
                <FieldType>{resource.returns}</FieldType>
            <GraphqlBasePortWidget
                port={node.getPort(`right-${resourcePath}`)}
                engine={engine}
            />

            {resource.parameters.length > 0 && (
                <Popover
                    id='mouse-over-popover'
                    open={Boolean(anchorElement)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    disableRestoreFocus={true}
                    anchorEl={anchorElement}
                    onClose={onMouseLeave}
                    className={classes.popover}
                    classes={{
                        paper: classes.popoverContent,
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                >
                    <ParametersPopup parameters={resource.parameters}/>
                </Popover>
            )}
        </>
    );
}
