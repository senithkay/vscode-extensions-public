/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

// tslint:disable: jsx-no-multiline-js
import React, { useState } from 'react';

import { Popover } from "@material-ui/core";
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { ParametersPopup } from "../../../Popup/ParametersPopup";
import { popOverStyle } from "../../../Popup/styles";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { QueryIcon } from "../../../resources/assets/icons/QueryIcon";
import { SubscriptionIcon } from "../../../resources/assets/icons/SubscriptionIcon";
import { ResourceFunction } from "../../../resources/model";
import { FieldName, FieldType, } from "../../../resources/styles/styles";
import { GraphqlServiceNodeModel } from "../GraphqlServiceNodeModel";

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
            {resource.subscription ? <SubscriptionIcon/> : <QueryIcon/>}
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
