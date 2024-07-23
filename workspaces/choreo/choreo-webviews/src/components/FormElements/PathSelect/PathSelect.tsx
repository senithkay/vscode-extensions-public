/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import classnames from "classnames";
import React, { type FC, type HTMLProps, type ReactNode } from "react";
import { type Control, Controller } from "react-hook-form";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";
import { FormElementWrap } from "../FormElementWrap";

interface Props {
	name: string;
	label?: string | ReactNode;
	required?: boolean;
	control?: Control;
	basePath: string;
	directoryName?: string;
	wrapClassName?: HTMLProps<HTMLElement>["className"];
	type?: "file" | "directory";
	promptTitle?: string;
}

export const PathSelect: FC<Props> = (props) => {
	const { label, required, control, name, basePath, directoryName = "", wrapClassName, type = "directory", promptTitle = "Select Directory" } = props;

	const { mutate: handleClick, isLoading } = useMutation({
		mutationFn: async (onSelect: (path: string) => void) => {
			const paths = await ChoreoWebViewAPI.getInstance().showOpenSubDialog({
				canSelectFiles: type === "file",
				canSelectFolders: type === "directory",
				canSelectMany: false,
				title: promptTitle,
				defaultUri: basePath,
				filters: {},
			});
			if (paths && paths.length > 0) {
				const subPath = await ChoreoWebViewAPI.getInstance().getSubPath({
					subPath: paths[0],
					parentPath: basePath,
				});
				onSelect(subPath || "");
			}
		},
	});

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => {
				const { data: joinedPath } = useQuery({
					queryKey: ["joined-file-path", { directoryName, value: field.value }],
					queryFn: () => ChoreoWebViewAPI.getInstance().joinFilePaths([directoryName, field.value]),
				});

				return (
					<FormElementWrap errorMsg={fieldState.error?.message} label={label} required={required} loading={isLoading} wrapClassName={wrapClassName}>
						<div
							onClick={isLoading ? undefined : () => handleClick((selectedPath) => field.onChange(selectedPath))}
							className={classnames(
								"flex min-h-[26px] w-full cursor-pointer items-stretch overflow-hidden rounded border-1 border-vsc-menu-border bg-vsc-input-background",
								isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer opacity-100",
							)}
							ref={field.ref}
						>
							<div className="hidden border-vsc-menu-border border-r-2 bg-vsc-button-secondaryBackground text-vsc-button-secondaryForeground sm:block">
								<p className="flex h-full items-center justify-center px-3">Choose {type}</p>
							</div>
							<div className="flex flex-1 items-center break-all px-2">{joinedPath}</div>
						</div>
					</FormElementWrap>
				);
			}}
		/>
	);
};
