/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline  no-implicit-dependencies no-submodule-imports
import React from "react";

import { ContextMenu, Item } from "@wso2-enterprise/ui-toolkit";

import { useGraphQlContext } from "../../../DiagramContext/GraphqlDiagramContext";
import { getDeleteOperationMenuItem, getDesignOperationMenuItem, getEditOperationMenuItem, getGoToSourceMenuItem } from "../../../MenuItems/menuItems";
import { verticalIconSubMenu, verticalIconWrapperSubMenu } from "../../../MenuItems/style";
import { FunctionType, Position } from "../../../resources/model";

interface FunctionMenuWidgetProps {
    location: Position;
    functionType: FunctionType;
}

export function FunctionMenuWidget(props: FunctionMenuWidgetProps) {
    const { location, functionType } = props;
    const { onDelete, functionPanel, model, operationDesignView, goToSource } = useGraphQlContext();

    const getMenuItems = () => {
        const items: Item[] = [];
        // if (location) {
        //     items.push(getDesignOperationMenuItem(location, operationDesignView));
        //     items.push(getEditOperationMenuItem(location, functionType, functionPanel, model));
        //     items.push(getDeleteOperationMenuItem(location, onDelete));

        // }
        if (location?.filePath) {
            items.push(getGoToSourceMenuItem(location, goToSource));
        }

        return items;
    }

    return (
        <>
            {location &&
                <ContextMenu iconSx={verticalIconSubMenu} sx={verticalIconWrapperSubMenu} menuItems={getMenuItems()} />
            }
        </>
    );
}
