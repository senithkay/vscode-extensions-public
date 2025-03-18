/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { AttachmentResult, AttachmentStatus } from "@wso2-enterprise/ballerina-core";
import { AttachmentHandler } from "./attachmentHandler";
import { getFileTypesForCommand } from "../views/AIPanel/AIChat";
import { validateFileSize, validateFileType } from "./attachmentUtils";

export class DataMapperAttachment implements AttachmentHandler {
    private validFileTypes: string[];

    constructor(private command: string) {
        this.validFileTypes = getFileTypesForCommand(command);
    }

    async handleFileAttach(
        e: React.ChangeEvent<HTMLInputElement>
    ): Promise<AttachmentResult[]> {
        const files = e.target.files;
        const results: AttachmentResult[] = [];

        if (!files) {
            return results;
        }

        const fileArray = Array.from(files);

        for (const file of fileArray) {
            if (!validateFileSize(file)) {
                results.push({
                    name: file.name,
                    status: AttachmentStatus.FileSizeError,
                });
                continue;
            }

            if (!validateFileType(file, this.validFileTypes)) {
                results.push({
                    name: file.name,
                    status: AttachmentStatus.FileFormatError,
                });
                continue;
            }

            try {
                const content = await this.readFileAsText(file);
                results.push({
                    name: file.name,
                    content,
                    status: AttachmentStatus.Success,
                });
            } catch {
                results.push({
                    name: file.name,
                    status: AttachmentStatus.Unknown,
                });
            }
        }
        e.target.value = "";
        return results;
    }

    // Override readFileAsText specifically for DataMapperAttachment
    readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                if (reader.result) {
                    const base64String = reader.result.toString().split(",")[1];
                    if (base64String) {
                        resolve(base64String);
                    } else {
                        reject(new Error("Failed to extract Base64 content."));
                    }
                } else {
                    reject(new Error("FileReader result is null or undefined."));
                }
            };

            reader.onerror = () => {
                reject(new Error("Error reading the file."));
            };

            reader.readAsDataURL(file);
        });
    }
}
