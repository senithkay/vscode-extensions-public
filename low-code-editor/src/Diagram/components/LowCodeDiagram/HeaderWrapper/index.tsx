/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react';

interface HeaderWrapperProps {
    children?: JSX.Element[] | JSX.Element;
    className: string;
    onClick: () => void;
}

export function HeaderWrapper(props: HeaderWrapperProps) {
    const { className, onClick } = props;

    const handleOnClick = (evt: React.MouseEvent) => {
        if (!evt.isPropagationStopped()) {
            onClick();
        }
    }

    return (
        <div className={className} onClick={handleOnClick}>
            {props.children}
        </div>
    );
}
