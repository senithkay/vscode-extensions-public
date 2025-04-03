/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
        case 'json':
        case 'yaml':
        case 'yml':
            return "file-code"; 
        case 'md':
        case 'markdown':
            return 'book';
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
            return 'file-media';
        case 'pdf':
            return 'file-pdf';
        case 'zip':
        case 'rar':
        case '7z':
            return 'file-zip';
        default:
            return 'file';
    }
};

export default {};
