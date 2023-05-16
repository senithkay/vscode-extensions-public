/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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
 *
 */

import React from 'react';
import { Container, ResolutionTitle, WarningContainer, WarningMessage, WarningResolution } from './styles';
import { WarningIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import Box from "@mui/material/Box";
import { Colors } from "../../../resources";
import { List, ListItem } from "@mui/material";

export function UnSupportedMessage() {

    return (
        <>
            <Box
                sx={{
                    position: "relative",
                    mt: "10px",
                    "&::before": {
                        backgroundColor: "white",
                        content: '""',
                        display: "block",
                        position: "absolute",
                        width: 12,
                        height: 12,
                        top: -6,
                        transform: "rotate(45deg)",
                        left: "calc(50%)",
                        borderTop: `1px solid ${Colors.PRIMARY_SELECTED}`,
                        borderLeft: `1px solid ${Colors.PRIMARY_SELECTED}`,
                    },
                }}
            />
            <Container>
                <WarningContainer>
                    <WarningIcon/>
                    <WarningMessage>
                        Component metadata retrieval failed. The displayed box represents a component, not the constructs within it.
                    </WarningMessage>
                </WarningContainer>
                <div>
                    <ResolutionTitle>
                        <b>Possible Resolution:</b>
                    </ResolutionTitle>
                    <WarningResolution>
                        <List sx={{ listStyleType: 'disc', marginTop: 0, marginLeft: 0, paddingTop: 0 }}>
                            <ListItem sx={{ display: 'list-item', paddingLeft: '8px !important', paddingBottom: '0 !important' }}>
                                Update Ballerina to 2201.5.0 or higher and submit a commit with fixes.
                            </ListItem>
                            <ListItem sx={{ display: 'list-item', paddingLeft: '8px !important', paddingBottom: '0 !important' }}>
                                Resolve build issues and submit a commit with fixes.
                            </ListItem>
                        </List>
                    </WarningResolution>
                </div>
            </Container>
        </>
    );
}
