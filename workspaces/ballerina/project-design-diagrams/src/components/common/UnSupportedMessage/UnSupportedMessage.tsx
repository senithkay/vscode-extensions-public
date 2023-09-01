/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
