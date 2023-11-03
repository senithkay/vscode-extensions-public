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
import styled from "@emotion/styled";
import React from "react";
import { ComponentsCard } from "./ComponentsCard";
import { CellViewButton } from "./projectActions/CellViewButton";
import { useChoreoComponentsContext } from "../../context/choreo-components-ctx";
import { OpenConsoleButton } from "./projectActions/OpenConsoleButton";

const Container = styled.div`
    margin-top: 10px;
`;

const Body = styled.div`
    display: flex;
    flex-direction: row;
    gap: 5px;
    flex-wrap: wrap;
`;

export const ProjectActionsCard: React.FC = () => {
    const { components } = useChoreoComponentsContext();

    return (
        <>
            <Container>
                <Body>
                    {components?.length > 0 && (
                        <>
                            <CellViewButton />
                        </>
                    )}
                    <OpenConsoleButton />
                </Body>
            </Container>
            <ComponentsCard />
        </>
    );
};
