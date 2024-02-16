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
import { ComponentPropsWithoutRef } from "react";

export const FormContainer: React.FC<ComponentPropsWithoutRef<"div">> = styled.div`
    display: flex;
    flex-direction: column;
    width: 600px;
    background-color: var(--vscode-sideBar-background);
`;

export const FormWrapper: React.FC<ComponentPropsWithoutRef<"div">> = styled.div`
    width: 100%;
    display: flex;
    padding: 15px 20px;
`;

export const FormGroup: React.FC<ComponentPropsWithoutRef<"div">> = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const FormControlLabel: React.FC<ComponentPropsWithoutRef<"div">> = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

export const InputWrapper: React.FC<ComponentPropsWithoutRef<"div">> = styled.div`
    margin-top: 1rem;
    display: flex;
`;

export const InputLabel: React.FC<ComponentPropsWithoutRef<"div">> = styled.div`
    color: #1d2028;
    font-size: 15;
    text-transform: capitalize;
    line-height: 35px;
    font-weight: 400;
    margin: 0;
`;

export const InputLabelDetail: React.FC<ComponentPropsWithoutRef<"p">> = styled.p`
    color: #4a4d55;
    font-size: 13;
    text-transform: capitalize;
    font-weight: 300;
`;

export const LabelWrapper: React.FC<ComponentPropsWithoutRef<"div">> = styled.div`
    display: flex;
`;

export const RecordFormWrapper: React.FC<ComponentPropsWithoutRef<"div">> = styled.div`
    width: 100%;
    max-height: 540;
    overflow-y: scroll;
    flex-direction: row;
`;

export const FileSelect: React.FC<ComponentPropsWithoutRef<"div">> = styled.div`
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
    optionalLabel: css({
        paddingRight: "5px",
        color: "#CBCEDB",
        fontSize: "12px",
        textTransform: "capitalize",
        display: "inline-block",
        lineHeight: "40px",
        marginBottom: "0.06rem",
        marginLeft: "0.25rem",
        marginTop: "0.094375rem",
    }),
    starLabelForRequired: css({
        padding: 0,
        color: "#DC143C",
        fontSize: "13px",
        textTransform: "capitalize",
        display: "inline-block",
    }),
    readOnlyEditor: css({
        width: 130,
        padding: 0,
        color: "#000209",
        fontSize: 13,
        textTransform: "capitalize",
        display: "inline-block",
        lineHeight: "25px",
        fontWeight: 300,
    }),
    inputSuccessTick: css({
        color: "#08d608",
        marginBottom: -5,
    }),
    recordOptions: css({
        padding: 10,
        display: "inline-flex",
        alignItems: "center",
        "& a": {
            cursor: "pointer",
            color: "#5567D5",
        },
        "& a:hover": {
            textDecoration: "none",
        },
    }),
    deleteRecord: css({
        display: "flex",
        alignItems: "center",
        color: "#FE523C",
        cursor: "pointer",
        "& svg": {
            marginRight: 8,
        },
    }),
    marginSpace: css({
        marginLeft: 15,
        marginRight: 15,
    }),
    undoButton: css({
        padding: 2,
    }),
    doneButtonWrapper: css({
        display: "flex",
        justifyContent: "flex-end",
        marginRight: 20,
        marginTop: 16,
    }),
    headerWrapper: css({
        background: "white",
        padding: 10,
        borderRadius: 5,
        cursor: "pointer",
        border: "1px solid #dee0e7",
        marginTop: 15,
        marginLeft: 20,
        marginRight: 10,
        justifyContent: "space-between",
        display: "flex",
        flexDirection: "row",
        height: 40,
        alignItems: "center",
    }),
    contentSection: css({
        display: "flex",
        width: "75%",
        justifyContent: "flex-start",
    }),
    iconSection: css({
        display: "flex",
        flexDirection: "row",
        width: "25%",
        justifyContent: "flex-end",
    }),
});
