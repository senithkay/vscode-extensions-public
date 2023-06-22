/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React from "react";
import styled from "@emotion/styled";
import { Component } from "@wso2-enterprise/choreo-core";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { ComponentDetails } from "./ComponentDetails";

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

// Header div will lay the items horizontally
const Header = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin: 5px;
`;
// Body div will lay the items vertically
const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 15px;
    position: relative;
`;

const ComponentName = styled.span`
    font-size: 14px;
    cursor: pointer;
`;


export const ComponentCard = (props: { component: Component }) => {

    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    }
    return (<Container>
        <Header>
            <ComponentName>{props.component.name}</ComponentName>
            <span>{props.component.description}</span>

            <VSCodeButton
                appearance="icon"
                onClick={handleExpandClick}
                title={expanded ? "Collapse" : "Expand"}
                id="expand-components-btn"
                style={{ marginLeft: "auto" }}
            >
                <Codicon name={expanded ? "chevron-up" : "chevron-down"} />
            </VSCodeButton>
        </Header>
        {expanded && (
            <Body>
                <ComponentDetails component={props.component} />
            </Body>
        )}
    </Container>)
};
