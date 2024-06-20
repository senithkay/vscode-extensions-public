## Code refactor
- Remove @emotion/styled and update packages
- Update eslint with prettier and https://github.com/tailwindlabs/prettier-plugin-tailwindcss
- Add copyrights to all files
- Remove cellview and choreo client dependencies
- Cleanup everything

## Functionality
- Add deployment track selector
- endpoint.yaml auto completion & code snippet
- Add delete project command

## UI improvements
- Need to show the step that the build is currently in, instead of just showing ‘in-progress’
- User will not understand about what to do with API-Key in the testing view if they decide to manually test it using a different REST client
- Show CLI download progress within webview instead of notification
- It's not very clear what user has to do after build is complete
- Rearrange the context buttons in the activity header. Options should be manage billing, manage, project and logout

## API improvements
- Have component/build create endpoints return created data
- Add pagination for build list
- Improve loading times for component/build list

## Bugs
- Fix first time user flow in cli and vscode (org creation flow) - Critical
- RPC initialization not persisted in mac os - Critical

## Context.yaml changes
- sync workspace file automatically
- hamburger icon in component details page, replace it with small delete button

## Other
- Revisit app insights implementation
