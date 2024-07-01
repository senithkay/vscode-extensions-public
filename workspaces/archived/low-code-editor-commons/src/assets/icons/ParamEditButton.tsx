/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';

export function ParamEditButton(props: any) {
    const { onClick, ...restProps } = props;

    const handleOnClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (props && onClick) {
            onClick();
        }
    }

    return (
        <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" onClick={handleOnClick}>
            <g id="VSC" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="config-showed-options" transform="translate(-953.000000, -197.000000)" fill="#8D91A3" fillRule="nonzero">
                    <g id="Group" transform="translate(642.000000, 184.000000)">
                        <g id="Icon/Delete-app-Copy" transform="translate(311.000000, 13.000000)">
                            <path d="M7,2.27373675e-13 C7.27614237,2.27373675e-13 7.5,0.223857625 7.5,0.5 C7.5,0.776142375 7.27614237,1 7,1 C3.6862915,1 1,3.6862915 1,7 C1,10.3137085 3.6862915,13 7,13 C10.3137085,13 13,10.3137085 13,7 C13,6.72385763 13.2238576,6.5 13.5,6.5 C13.7761424,6.5 14,6.72385763 14,7 C14,10.8659932 10.8659932,14 7,14 C3.13400675,14 0,10.8659932 0,7 C0,3.13400675 3.13400675,2.27373675e-13 7,2.27373675e-13 Z M10.7645042,0.556025946 C11.4914446,-0.179341475 12.6768794,-0.186172916 13.4122468,0.540767497 C14.1682678,1.28812479 14.1950055,2.50050757 13.4726677,3.28046834 L13.4726677,3.28046834 L9.0375037,8.06943845 L5.62291462,8.90938018 L6.33956953,5.3676207 Z M12.7092266,1.25193739 C12.3666275,0.913264307 11.8143472,0.916446996 11.4819888,1.25254138 L11.4819888,1.25254138 L7.24469958,5.85998623 L6.77469958,7.65998623 L8.49469958,7.18198623 L12.7389782,2.6009834 C13.0673016,2.24646868 13.0813391,1.71052476 12.7887559,1.34072489 L12.7887559,1.34072489 Z" id="param-edit-icon"/>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}
