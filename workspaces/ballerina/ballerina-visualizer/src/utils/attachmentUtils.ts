/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFileSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
};

export const validateFileType = (file: File, validFileTypes: string[]): boolean => {
    return validFileTypes.includes(file.type);
};

export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("File content is not a string."));
            }
        };

        reader.onerror = () => reject(new Error("Error reading the file."));
        reader.readAsText(file);
    });
};
