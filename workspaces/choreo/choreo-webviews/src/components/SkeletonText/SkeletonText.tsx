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

import classnames from "classnames";
import React, { type FC, type HTMLProps } from "react";

interface Props {
	className?: HTMLProps<HTMLElement>["className"];
}

export const SkeletonText: FC<Props> = ({ className }) => {
	return <div className={classnames("my-0.5 h-4 animate-pulse rounded bg-vsc-button-secondaryBackground", className)} />;
};
