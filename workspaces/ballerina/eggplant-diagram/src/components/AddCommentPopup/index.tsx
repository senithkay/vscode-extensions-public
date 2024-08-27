/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { LinePosition } from "../../utils/types";
import { useDiagramContext } from "../DiagramContext";
import styled from "@emotion/styled";
import { Colors, NODE_PADDING, POPUP_BOX_HEIGHT, POPUP_BOX_WIDTH } from "../../resources/constants";
import { TextField } from "@wso2-enterprise/ui-toolkit";

export namespace PopupStyles {
    export const Container = styled.div`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: ${POPUP_BOX_WIDTH}px;
        height: ${POPUP_BOX_HEIGHT}px;
        padding: 0 ${NODE_PADDING}px;
        border-radius: 10px;
        background-color: ${Colors.SURFACE};
        color: ${Colors.ON_SURFACE};
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        gap: 4px;
        width: 100%;
    `;

    export const InfoText = styled.div`
        font-size: 11px;
        font-family: monospace;
        color: ${Colors.ON_SURFACE};
        opacity: 0.7;
        height: 14px;
    `;
}

interface AddCommentPopupProps {
    target: LinePosition;
    onClose: () => void;
}

export function AddCommentPopup(props: AddCommentPopupProps) {
    const { target, onClose } = props;
    const { onAddComment } = useDiagramContext();

    const [comment, setComment] = useState("");

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
            if (event.key === "Enter") {
                handleAddComment();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [comment]);

    const handleAddComment = () => {
        if (!target) {
            console.error(">>> AddCommentPopup: AddCommentPopup: target not found");
            return;
        }
        onAddComment(comment, { startLine: target, endLine: target });
    };

    const handleOnCommentChange = (value: string) => {
        setComment(value);
    };

    return (
        <PopupStyles.Container>
            <TextField
                placeholder="Add a comment here"
                onTextChange={handleOnCommentChange}
                value={comment}
                sx={{ width: "100%", height: 28 }}
            />
            <PopupStyles.InfoText>Press Enter to add a comment. Press Esc to cancel.</PopupStyles.InfoText>
        </PopupStyles.Container>
    );
}

export default AddCommentPopup;
