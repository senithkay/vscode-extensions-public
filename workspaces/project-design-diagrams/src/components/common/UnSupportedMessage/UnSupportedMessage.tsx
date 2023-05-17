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

import React, { useContext } from 'react';
import { WarningIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Link, List, ListItem } from "@mui/material";
import { DiagramContext } from '../DiagramContext/DiagramContext';
import { Container, ResolutionTitle, WarningContainer, WarningMessage, WarningResolution, WarningTitle } from './styles';

export function UnSupportedMessage() {
    const { consoleView, editingEnabled } = useContext(DiagramContext);

    return (
        <Container>
            <WarningContainer>
                <WarningIcon />
                <WarningMessage>
                    <WarningTitle>
                        {consoleView || !editingEnabled ? 'Component' : 'Package'} metadata retrieval failed
                    </WarningTitle>
                    The displayed box represents a {consoleView || !editingEnabled ? 'component' : 'package'}, not the constructs within it.
                </WarningMessage>
            </WarningContainer>
            <>
                <ResolutionTitle>
                    <b>Possible Resolutions:</b>
                </ResolutionTitle>
                <WarningResolution>
                    <List sx={{ listStyleType: 'disc', marginTop: 0, marginLeft: 0, paddingTop: 0 }}>
                        <ListItem sx={{ display: 'list-item', paddingLeft: '8px !important', paddingBottom: '0 !important' }}>
                            <Link href={"https://ballerina.io/downloads/"}>Update</Link> Ballerina to 2201.5.0 or higher{consoleView || !editingEnabled ? ' and submit a commit with fixes' : ''}.
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', paddingLeft: '8px !important', paddingBottom: '0 !important' }}>
                            Resolve build issues{consoleView || !editingEnabled ? ' and submit a commit with fixes' : ''}.
                        </ListItem>
                    </List>
                </WarningResolution>
            </>
        </Container>
    );
}
