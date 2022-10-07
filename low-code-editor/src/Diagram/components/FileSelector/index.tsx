/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import React from "react";

import { LinePrimaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import "../../style.scss";

export interface FileSelectorProps {
    label: string;
    extension: 'json' | 'yaml'; // TODO: support for yaml js-yaml library
    onReadFile: (text: string) => void;
}

export function FileSelector(props: FileSelectorProps) {

    const { extension, label, onReadFile } = props;

    const hiddenFileInput = React.useRef(null);

    const handleClick = (event?: any) => {
        hiddenFileInput.current.click();
    };

    const showFile = async (e: any) => {
        e.preventDefault()
        const reader = new FileReader()
        const ext = e.target.files[0].name.split('.').pop().toLowerCase();
        reader.readAsText(e.target.files[0]);
        reader.onload = async (loadEvent: any) => {
            if (ext === extension) {
                const text = (loadEvent.target.result) as string;
                onReadFile(text);
            }
          };
    }

    return (
        <div>
            <input
                hidden={true}
                accept={`.${extension}`}
                type="file"
                onChange={showFile}
                ref={hiddenFileInput}
            />
            <LinePrimaryButton
                text={label}
                fullWidth={false}
                onClick={handleClick}
            />
        </div>
    )

}
