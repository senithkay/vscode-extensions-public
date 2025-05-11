/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeColors } from "../../../resources/constants";

export interface GenerateDivProps {
    element: any;
    generatedFormDetails: Record<string, any>;
    handleOnClickChecked: () => void;
    handleOnClickClose: () => void;
    isChecked?: boolean;
    isExpression?: boolean;
    isConnection?: boolean;
}

// Styles
const State = {
    Selected: {
        PrimaryButton: {
            border: "1px solid var(--focus-border)",
            backgroundColor: VSCodeColors.PRIMARY_BUTTON,
        },
        SecondaryButton: {
            border: "1px solid var(--button-border)",
            backgroundColor: VSCodeColors.SECONDARY_BG_BUTTON,
        },
        SecondaryIcon: {
            color: VSCodeColors.SECONDARY_ICON,
        },
        PrimaryIcon: {
            color: VSCodeColors.PRIMARY_ICON,
        },
    },
} as const;

const GenerateDiv = (props: GenerateDivProps) => {
    const {
        element,
        generatedFormDetails,
        handleOnClickChecked,
        handleOnClickClose,
        isChecked,
        isExpression,
        isConnection,
    } = props;

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    AlignItems: "center",
                }}>
                <div
                    style={{
                        backgroundColor: "var(--vscode-diffEditor-insertedTextBackground)",
                        color: "white",
                        padding: "6px",
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        position: "relative",
                    }}>
                    <div
                        style={{
                            width: "80%",
                            overflowWrap: "break-word",
                            color: "var(--vscode-editor-foreground)",
                        }}>
                        {!isChecked && !isExpression && isConnection && generatedFormDetails["configKey"]}
                        {!isChecked && isExpression && generatedFormDetails[element.name].value}
                        {!isChecked && !isExpression && generatedFormDetails[element.name]}
                        {isChecked && !isExpression && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                    position: "relative",
                                }}>
                                {generatedFormDetails[element.name].toString() == "true" ? (
                                    <Codicon
                                        name="check"
                                        iconSx={{
                                            border: "1px solid var(--vscode-editor-foreground)",
                                            borderRadius: "10%",
                                            padding: "1px",
                                            fontSize: "12px",
                                        }}
                                    />
                                ) : (
                                    <Codicon name="chrome-maximize" />
                                )}

                                {element.displayName}
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    appearance="icon"
                    onClick={handleOnClickClose}
                    buttonSx={{
                        position: "absolute",
                        right: "52px",
                        bottom: "-15px",
                        borderBottomLeftRadius: "5px",
                        borderBottomRightRadius: "0px",
                        borderTopRightRadius: "0px",
                        borderTopLeftRadius: "0px",
                        maxHeight: "15px",
                        minHeight: "15px",
                        ...State.Selected.SecondaryButton,
                    }}>
                    <div style={{ display: "flex", alignItems: "center", ...State.Selected.SecondaryIcon }}>
                        <Codicon name="chrome-close" iconSx={{ fontSize: "10px" }} />
                        <span style={{ fontSize: "10px" }}>Reject</span>
                    </div>
                </Button>

                <Button
                    appearance="icon"
                    onClick={handleOnClickChecked}
                    buttonSx={{
                        ...State.Selected.PrimaryButton,
                        position: "absolute",
                        right: "0px",
                        bottom: "-15px",
                        borderBottomRightRadius: "5px",
                        borderBottomLeftRadius: "0px",
                        borderTopLeftRadius: "0px",
                        borderTopRightRadius: "0px",
                        maxHeight: "15px",
                        minHeight: "15px",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", ...State.Selected.PrimaryIcon }}>
                        <Codicon name="check" iconSx={{ fontSize: "10px" }} />
                        <span style={{ fontSize: "10px" }}> Accept</span>
                    </div>
                </Button>
            </div>

            <div
                style={{
                    minHeight: "10px",
                }}></div>
        </div>
    );
};

export default GenerateDiv;
