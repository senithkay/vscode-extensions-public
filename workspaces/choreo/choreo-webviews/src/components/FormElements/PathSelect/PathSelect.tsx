import React, { FC, HTMLProps, ReactNode } from "react";
import { FormElementWrap } from "../FormElementWrap";
import classnames from "classnames";
import { Control, Controller } from "react-hook-form";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { useMutation } from "@tanstack/react-query";

interface Props {
    name: string;
    label?: string | ReactNode;
    required?: boolean;
    control?: Control;
    basePath: string;
    directoryName?: string;
    wrapClassName?: HTMLProps<HTMLElement>["className"];
    type?: 'file' | 'directory';
    promptTitle?: string;
}

export const PathSelect: FC<Props> = (props) => {
    const { label, required, control, name, basePath, directoryName = "", wrapClassName, type = 'directory', promptTitle = 'Select Directory' } = props;

    const { mutate: handleClick, isLoading } = useMutation({
        mutationFn: async (onSelect: (path: string) => void) => {
            const paths = await ChoreoWebViewAPI.getInstance().showOpenSubDialog({
                canSelectFiles: type === 'file',
                canSelectFolders: type === 'directory',
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
                if (subPath === null) {
                    ChoreoWebViewAPI.getInstance().showErrorMsg("Selected path is not inside your workspace.");
                    return;
                }
                onSelect(subPath || ".");
            }
        },
    });

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                return (
                    <FormElementWrap
                        errorMsg={fieldState.error?.message}
                        label={label}
                        required={required}
                        loading={isLoading}
                        wrapClassName={wrapClassName}
                    >
                        <div
                            onClick={
                                isLoading
                                    ? undefined
                                    : () => handleClick((selectedPath) => field.onChange(selectedPath))
                            }
                            className={classnames(
                                "bg-vsc-input-background w-full h-[26px] rounded cursor-pointer overflow-hidden flex items-stretch border-1 border-vsc-menu-border",
                                isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer opacity-100"
                            )}
                            ref={field.ref}
                        >
                            <div className="hidden sm:block line-clamp-1 bg-vsc-button-secondaryBackground text-vsc-button-secondaryForeground border-r-2 border-vsc-menu-border">
                                <div className="h-full px-3 flex items-center justify-center">Choose {type}</div>
                            </div>
                            <div className="flex-1 flex items-center px-2 line-clamp-1"><span className="font-thin">{directoryName}/</span>{field.value}</div>
                        </div>
                    </FormElementWrap>
                );
            }}
        />
    );
};
