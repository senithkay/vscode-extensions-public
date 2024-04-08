import React, { FC, ReactNode } from "react";
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
}

export const DirectorySelect: FC<Props> = (props) => {
    const { label, required, control, name, basePath } = props;

    const { mutate: handleClick, isLoading } = useMutation({
        mutationFn: async (onSelect: (path: string) => void) => {
            const paths = await ChoreoWebViewAPI.getInstance().showOpenSubDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: "Select Component Directory",
                defaultUri: basePath,
                filters: {},
            });
            if (paths && paths.length > 0) {
                if (!paths[0].startsWith(basePath)) {
                    ChoreoWebViewAPI.getInstance().showErrorMsg("Selected path is not inside your workspace.");
                    return;
                } else if (basePath === paths[0]) {
                    onSelect(".");
                } else {
                    let subPath = paths[0].replace(basePath, "");
                    // need to remove the first slash if it exists, for both windows and unix
                    if (subPath.startsWith("/") || subPath.startsWith("\\")) {
                        subPath = subPath.substring(1);
                    }
                    onSelect(subPath);
                }
            }
        },
    });

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <FormElementWrap
                    errorMsg={fieldState.error?.message}
                    label={label}
                    required={required}
                    loading={isLoading}
                >
                    <div
                        onClick={
                            isLoading ? undefined : () => handleClick((selectedPath) => field.onChange(selectedPath))
                        }
                        className={classnames(
                            "bg-vsc-input-background w-full h-[26px] rounded cursor-pointer overflow-hidden flex items-stretch",
                            isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer opacity-100"
                        )}
                        ref={field.ref}
                    >
                        <div className="hidden sm:block line-clamp-1 bg-vsc-button-secondaryBackground text-vsc-button-secondaryForeground border-r-1 border-vsc-menu-border">
                            <div className="h-full px-3 flex items-center justify-center">Choose Directory</div>
                        </div>
                        <div className="flex-1 flex items-center px-2 line-clamp-1">{field.value}</div>
                    </div>
                </FormElementWrap>
            )}
        />
    );
};
