/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate file size against the global MAX_FILE_SIZE.
 */
export const validateFileSize = (file: File): boolean => {
    return file.size <= MAX_FILE_SIZE;
};

/**
 * Validate file type by checking against a list of valid MIME types/extensions.
 */
export const validateFileType = (file: File, validFileTypes: string[]): boolean => {
    return validFileTypes.includes(file.type);
};

/**
 * Default way to read the file as text, returning a Promise<string>.
 */
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
