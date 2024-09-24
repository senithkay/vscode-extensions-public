/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { MAX_FILE_SIZE } from '../constants';

/**
 * Function to Handle file attachment
 */

export const handleFileAttach = (
    e: any,
    setFiles: Function,
    setImages: Function,
    setFileUploadStatus: Function,
) => {
    const files = e.target.files;
    const validFileTypes = ["text/plain", "application/json", "application/x-yaml", "application/xml", "text/xml"];
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];

    for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
            setFileUploadStatus({ type: 'error', text: `File '${file.name}' exceeds the size limit of 5 MB.` });
            continue;
        }

        if (validFileTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                const fileContents = event.target.result;
                setFiles((prevFiles: any) => [...prevFiles, { fileName: file.name, fileContent: fileContents }]);
                setFileUploadStatus({ type: 'success', text: `File uploaded successfully.` });
            };
            reader.readAsText(file);
        } else if (validImageTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                const imageBase64 = event.target.result;
                setImages((prevImages: any) => [...prevImages, { imageName: file.name, imageBase64: imageBase64 }]);
                setFileUploadStatus({ type: 'success', text: `File uploaded successfully.` });
            };
            reader.readAsDataURL(file);
        } else {
            setFileUploadStatus({ type: 'error', text: `File format not supported for '${file.name}'` });
        }
    }
    e.target.value = '';  
};
