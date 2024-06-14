remove @emotion/styled
update packages
update eslint with prettier and https://github.com/tailwindlabs/prettier-plugin-tailwindcss
add copyrights

add deployment track selector

endpoint.yaml auto completion & code snippet

add view more button

clone project/component command

delete project command

API improvements
have component/build create endpoints return created data
pagination for build list
improve loading times for component/build list

remove cellview and choreo client dependencies
cleanup everything
improve docs


////
Fix first time user flow in cli and vscode (org creation flow)

create a project view

// New context yaml

have settings icon(change project) and clicking that should provide
during cloning flow, always create a workspace file and open it
automatically sync

1. current project
2. available projects
3. other options
3.1 create link with a different project
3.2 Remove link for selected project
during create component command, if context not set, ask to select org & project
during component creation, do not validate if the directory is within the root dir, only check if its a git repo, after creating, update the context.yaml at the root of the repo
check clone functionality

sync workspace file
remove link.yaml related stuff
check all commands to use context if available, user should be able to select stuff outside of context
