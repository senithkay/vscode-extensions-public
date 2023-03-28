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

import React from "react";
import { Location, RemoteFunction, ResourceFunction, Service, ServiceAnnotation } from "../../../resources";
import { AddConnectorButton, GoToDesign, Go2SourceButton, LinkingButton, EditLabelButton } from "./components";
import { Paper, MenuList, Divider } from "@mui/material";

interface MenuProps {
    location: Location;
    linkingEnabled: boolean;
    service?: Service;
    resource?: ResourceFunction | RemoteFunction; // TODO: figure out a way to merge service and resource
    serviceAnnotation?: ServiceAnnotation;
    handleDialogStatus: (status: boolean) => void;
}

export function NodeMenuPanel(props: MenuProps) {
    const { handleDialogStatus, location, linkingEnabled, service, serviceAnnotation, resource } = props;

    return (
        <>
            <Paper sx={{ maxWidth: "100%" }}>
                <MenuList>
                    <Go2SourceButton location={location} />
                    {service && <GoToDesign element={service} />}
                    {resource && <GoToDesign element={resource} />}
                    {serviceAnnotation && (serviceAnnotation.elementLocation || service.elementLocation) &&
                        <EditLabelButton handleDialogStatus={handleDialogStatus} />
                    }
                    {linkingEnabled && service && (
                        <>
                            <Divider />
                            <LinkingButton service={service} />
                            <AddConnectorButton service={service} />
                        </>
                    )}
                </MenuList>
            </Paper>
        </>
    );
}
