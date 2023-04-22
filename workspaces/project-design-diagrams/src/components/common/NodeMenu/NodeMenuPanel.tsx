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
import { Paper, MenuList, Divider } from "@mui/material";
import { Location, RemoteFunction, ResourceFunction, ServiceAnnotation } from "../../../resources";
import { AddConnectorButton, GoToDesign, Go2SourceButton, LinkingButton, EditLabelButton, DeleteComponentButton } from "./components";
import { DiagramContext } from "../DiagramContext/DiagramContext";
import { ServiceNodeModel } from "../../service-interaction";

interface MenuProps {
    linkingEnabled: boolean;
    location: Location;
    resource?: ResourceFunction | RemoteFunction; // TODO: figure out a way to merge service and resource
    serviceNode?: ServiceNodeModel;
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
        serviceNode
    } = props;
    const { deleteComponent } = useContext(DiagramContext);

    const serviceAnnotation: ServiceAnnotation = serviceNode?.serviceObject.annotation;

    return (
        <Paper sx={{ maxWidth: "100%" }}>
            <MenuList>
                <Go2SourceButton location={location} />
                {serviceNode && <GoToDesign element={serviceNode.serviceObject} />}
                {resource && <GoToDesign element={resource} />}
                {serviceAnnotation && (serviceAnnotation.elementLocation || serviceNode.serviceObject.elementLocation) &&
                    <EditLabelButton handleDialogStatus={handleEditLabelDialog} />
                }
                {serviceNode && location && deleteComponent &&
                    <DeleteComponentButton canDelete={!serviceNode.isLinked} handleDialogStatus={handleDeleteComponentDialog} />
                }
                {linkingEnabled && serviceNode && (
                    <>
                        <Divider />
                        <LinkingButton service={serviceNode.serviceObject} />
                        <AddConnectorButton service={serviceNode.serviceObject} />
                    </>
                )}
            </MenuList>
        </Paper>
    );
}
