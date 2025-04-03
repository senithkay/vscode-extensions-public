import React from "react";

import { FlexRow, FlexColumn } from "../styles";
import { FileInfo, ImageInfo } from "../types";
import { getFileIcon } from "../../../utils/fileIcons";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { useMICopilotContext } from "./MICopilotContext";

interface AttachmentProps {
    attachments: FileInfo[] | ImageInfo[];
    nameAttribute: string;
    addControls?: boolean;
}

const Attachments: React.FC<AttachmentProps> = ({ attachments, nameAttribute, addControls }) => {
    const { setFiles, setImages } = useMICopilotContext();

    const handleRemove = (index: number) => {
        if (nameAttribute === "fileName") {
            setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        } else if (nameAttribute === "imageName") {
            setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        }
    };

    const getAttachmentName = (attachment: any): string => {
        if (nameAttribute === "fileName") {
            return attachment.fileName;
        } else if (nameAttribute === "imageName") {
            return attachment.imageName;
        }
        return "";
    };

    return (
        <FlexRow style={{ flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
            {attachments.map((attachment, index) => (
                <FlexRow
                    key={index}
                    style={{
                        alignItems: "center",
                        backgroundColor: "var(--vscode-input-background)",
                        padding: "2px 5px",
                        borderRadius: "4px",
                        border: "1px solid var(--vscode-editorGroup-border)",
                    }}
                >
                    <Codicon name={getFileIcon(getAttachmentName(attachment))} />
                    <span
                        style={{
                            color: "var(--vscode-editor-foreground)",
                            margin: "5px",
                            fontSize: "10px",
                        }}
                    >
                        {getAttachmentName(attachment)}
                    </span>
                    {addControls && (
                        <Button
                            appearance="icon"
                            onClick={() => {
                                handleRemove(index);
                            }}
                        >
                            <Codicon name="close" />
                        </Button>
                    )}
                </FlexRow>
            ))}
        </FlexRow>
    );
};

export default Attachments;
