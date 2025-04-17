/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import AIChatInput, { AIChatInputRef, TagOptions } from "../../AIChatInput";
import { Input } from "../../AIChatInput/utils/inputUtils";
import { Attachment } from "@wso2-enterprise/ballerina-core";
import { commandTemplates } from "../../../commandTemplates/data/commandTemplates.const";
import { AttachmentOptions } from "../../AIChatInput/hooks/useAttachments";

export const FooterContainer = styled.footer({
    padding: "20px",
});

type FooterProps = {
    aiChatInputRef: React.RefObject<AIChatInputRef>;
    tagOptions: TagOptions;
    attachmentOptions: AttachmentOptions;
    onSend: (content: { input: Input[]; attachments: Attachment[] }) => Promise<void>;
    onStop: () => void;
    isLoading: boolean;
};

const Footer: React.FC<FooterProps> = ({
    aiChatInputRef,
    tagOptions,
    attachmentOptions,
    onSend,
    onStop,
    isLoading,
}) => {
    return (
        <FooterContainer>
            <AIChatInput
                ref={aiChatInputRef}
                initialCommandTemplate={commandTemplates}
                tagOptions={tagOptions}
                attachmentOptions={attachmentOptions}
                onSend={onSend}
                onStop={onStop}
                isLoading={isLoading}
            />
        </FooterContainer>
    );
};

export default Footer;
