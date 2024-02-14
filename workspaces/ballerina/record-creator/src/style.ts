/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import { css } from "@emotion/css";

export const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 600px;
    background-color: var(--vscode-sideBar-background);
`;

export const FormHeaderSection = styled.div`
    display: "flex";
    flex-direction: "row";
    align-items: "center";
    justify-content: "space-around";
    border-bottom: "1px solid #d8d8d8";
    padding-left: "12px";
`;

export const FormWrapper = styled.div`
    width: 100%;
    display: flex;
    padding: 15px 20px;
`;

export const InputWrapper = styled.div`
    margin-top: 1rem;
    display: flex;
`;

export const LabelWrapper = styled.div`
    display: flex;
`;

export const FileSelect = styled.div`
    margin-left: "auto";
    padding: 1.6px;
    & svg {
        margin: 5;
    }
    & svg:hover {
        -webkit-filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
        filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.3));
    }
`;

export const useStyles = () => ({
    inputLabelForRequired: css({
        padding: 0,
        color: "#1D2028",
        fontSize: 13,
        textTransform: "capitalize",
        display: "inline-block",
        lineHeight: "35px",
        fontWeight: 300,
    }),
});
