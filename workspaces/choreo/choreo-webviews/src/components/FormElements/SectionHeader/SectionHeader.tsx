/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Divider } from "../../Divider";

export const SectionHeader = ({ title, subTitle }: { title: string; subTitle?: string }) => {
	return (
		<div className="mb-2">
			<div className="flex items-center gap-2 sm:gap-4">
				<Divider className="flex-1" />
				<h1 className="text-right font-light text-base opacity-50">{title}</h1>
			</div>
			{subTitle && <h1 className="hidden text-right font-thin text-xs opacity-50 sm:block">{subTitle}</h1>}
		</div>
	);
};
