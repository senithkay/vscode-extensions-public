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
import { keyframes, css } from "@emotion/css";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
    width: 100%;
`;

const loading = keyframes`
    to {
        background-position-x: -20%;
    }
`;

const styles = css`
    background: linear-gradient(
        100deg,
        rgba(255, 255, 255, 0) 40%,
        rgba(255, 255, 255, .5) 50%,
        rgba(255, 255, 255, 0) 60%
    ) var(--vscode-dropdown-background);
    background-size: 200% 100%;
    background-position-x: 180%;
    animation: 1s ${loading} ease-in-out infinite;
`;

const Line = styled.div`
    width: 80%;
    min-height: 1.2rem;
    margin-bottom: 5px;
    background-color: var(--vscode-dropdown-background);
`;

export const SkeletonLoader = (props: { lineCount: number }) => {
    return (
        <Container>
            {Array.from(Array(props.lineCount).keys()).map((i) => (
                <Line style={{ animationDelay: `.0${2 * i}s`}} className={styles} key={i} />
            ))}
        </Container>
    )
}
