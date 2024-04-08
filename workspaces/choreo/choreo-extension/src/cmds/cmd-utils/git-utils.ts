/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ExtensionContext, window, QuickPickItem } from "vscode";

import { initGit } from "../../git/main";
import { Remote } from "../../git";

// export const getGitRemotes = async (context: ExtensionContext, directoryPath: string): Promise<Remote[] | void> => {
//     const newGit = await initGit(context);
//     const repoRootPath = await newGit?.getRepositoryRoot(directoryPath);
//     const dotGit = await newGit?.getRepositoryDotGit(directoryPath);

//     if (!repoRootPath || !dotGit) {
//         return;
//     }

//     const repo = newGit?.open(repoRootPath!, dotGit);
//     const remotes = await repo?.getRemotes();
//     return remotes!;
// };

// export const resolveGitRemote = async (remotes: Remote[]): Promise<Remote> => {
//     if (remotes?.length === 0) {
//         throw new Error("No Git remotes found");
//     } else if (remotes?.length === 1) {
//         return remotes[0];
//     } else {
//         const items: QuickPickItem[] = remotes.map((item) => ({
//             label: item.name,
//             detail: item.fetchUrl,
//         }));

//         const remoteSelection = await window.showQuickPick(items, { title: "Select Remote" });
//         return remotes?.find((item) => item.name === remoteSelection?.label)!;
//     }
// };
