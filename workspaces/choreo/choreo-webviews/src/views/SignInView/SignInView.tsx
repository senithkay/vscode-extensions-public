import { useMutation } from "@tanstack/react-query";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import classNames from "classnames";
import React, { type FC, type HTMLProps } from "react";
import { Button } from "../../components/Button";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

interface Props {
	className?: HTMLProps<HTMLElement>["className"];
}

export const SignInView: FC<Props> = ({ className }) => {
	const { mutate: signInCmd, isLoading: isInitSignIn } = useMutation({
		mutationFn: async () => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.SignIn),
	});
	return (
		<div className={classNames("w-full flex flex-col px-6 py-2 gap-[10px]", className)}>
			<p>Sign in to Choreo to get started.</p>
			<Button className="w-full max-w-80 self-center sm:self-start" onClick={() => signInCmd()} disabled={isInitSignIn}>
				Sign In
			</Button>
		</div>
	);
};
