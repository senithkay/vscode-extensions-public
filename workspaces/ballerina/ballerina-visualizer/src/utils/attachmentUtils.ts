/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export enum AttachmentStatus {
    Success = "Success",
    FileSizeError = "FileSizeError",
    FileFormatError = "FileFormatError",
    Unknown = "Unknown"
}

export interface AttachmentResult {
    name: string;
    content?: string; // Present only if status is AttachmentStatus.Success
    status: AttachmentStatus;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_FILE_TYPES = [
    "text/plain",
    "application/json",
    "application/x-yaml",
    "application/xml",
    "text/xml"
];

export const handleFileAttach = async (
    e: React.ChangeEvent<HTMLInputElement>
): Promise<AttachmentResult[]> => {
    const files = e.target.files;
    const results: AttachmentResult[] = [];

    if (!files) {
        return results;
    }
    const fileArray = Array.from(files);

    for (const file of fileArray) {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            results.push({
                name: file.name,
                status: AttachmentStatus.FileSizeError
            });
            continue;
        }

        // Validate file type
        if (!VALID_FILE_TYPES.includes(file.type)) {
            results.push({
                name: file.name,
                status: AttachmentStatus.FileFormatError
            });
            continue;
        }

        try {
            const fileContent = await readFileAsText(file);

            results.push({
                name: file.name,
                content: fileContent,
                status: AttachmentStatus.Success
            });
        } catch (error) {
            results.push({
                name: file.name,
                status: AttachmentStatus.Unknown
            });
        }
    }
    e.target.value = '';

    return results;
};

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('File content is not a string.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Error reading the file.'));
        };

        reader.readAsText(file);
    });
};
