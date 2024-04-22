/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import classNames from "classnames";
import React, { HTMLProps, FC } from "react";

interface Props {
    name: string;
    className?: HTMLProps<HTMLElement>["className"];
    title?: HTMLProps<HTMLElement>["title"];
}

export const Codicon: FC<Props> = ({ title, name, className }) => {
    return <i title={title} className={classNames(`codicon`, `codicon-${name}`, className)} />;
};
