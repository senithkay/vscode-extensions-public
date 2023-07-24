/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import React, { useContext } from "react";
import {
    CMAnnotation as Annotation, CMLocation as Location, CMRemoteFunction as RemoteFunction, CMResourceFunction as ResourceFunction
} from "@wso2-enterprise/ballerina-languageclient";
import { Paper, MenuList, Divider } from "@mui/material";
import { DiagramContext } from "../DiagramContext/DiagramContext";
import { EntryNodeModel, ServiceNodeModel } from "../../service-interaction";
import { AddConnectorButton, DeleteComponentButton, EditLabelButton, Go2SourceButton, GoToDesign, LinkingButton } from "./components";

interface MenuProps {
    linkingEnabled: boolean;
    location: Location;
    node?: ServiceNodeModel | EntryNodeModel;
    resource?: ResourceFunction | RemoteFunction; // TODO: figure out a way to merge service and resource
    handleEditLabelDialog: (status: boolean) => void;
    handleDeleteComponentDialog: (status: boolean) => void;
}

export function NodeMenuPanel(props: MenuProps) {
    const {
        handleDeleteComponentDialog,
        handleEditLabelDialog,
        linkingEnabled,
        location,
        resource,
        node
    } = props;
    const { deleteComponent } = useContext(DiagramContext);

    const isMainFuncEditable: boolean = node instanceof EntryNodeModel && !!node.modelVersion && parseFloat(node.modelVersion) > 0.2;
    const annotation: Annotation | undefined = node instanceof ServiceNodeModel || isMainFuncEditable ? node?.nodeObject.annotation : undefined;
    const isModelLinkingCompatible: boolean = node instanceof ServiceNodeModel || isMainFuncEditable;
    const isNonBalService = node instanceof ServiceNodeModel && !node.isBalService;

    return (
        <Paper sx={{ maxWidth: "100%" }}>
            <MenuList>
                <Go2SourceButton location={location} isBalPackage={!isNonBalService}/>
                {node instanceof ServiceNodeModel && !isNonBalService && <GoToDesign element={node.nodeObject} />}
                {resource && node && <GoToDesign element={resource} />}
                {annotation && (annotation.elementLocation || node?.nodeObject.elementLocation) &&
                    <EditLabelButton handleDialogStatus={handleEditLabelDialog} />
                }
                {node && location && deleteComponent &&
                    <DeleteComponentButton
                        canDelete={node instanceof ServiceNodeModel ? !node.isLinked : true}
                        handleDialogStatus={handleDeleteComponentDialog}
                    />
                }
                {node && linkingEnabled && isModelLinkingCompatible && !isNonBalService && (
                    <>
                        <Divider />
                        <LinkingButton node={node} />
                        <AddConnectorButton node={node.nodeObject} />
                    </>
                )}
            </MenuList>
        </Paper>
    );
}
