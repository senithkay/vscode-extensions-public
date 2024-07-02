## Code refactor
- Remove @emotion/styled and update packages
- Use biomejs or (eslint+prettier)
- Update eslint with prettier and https://github.com/tailwindlabs/prettier-plugin-tailwindcss
- Add copyrights to all files
- Remove cellview and choreo client dependencies
- Cleanup everything
- Use RSpack/rsbuild(webview and extension) and update tailwind

## Functionality
- endpoint.yaml auto completion & code snippet
- Add delete project command

## UI improvements
- Need to show the step that the build is currently in, instead of just showing ‘in-progress’
- User will not understand about what to do with API-Key in the testing view if they decide to manually test it using a different REST client
- Show CLI download progress within webview instead of notification
- It's not very clear what user has to do after build is complete
- Rearrange the context buttons in the activity header. Options should be manage billing, manage, project and logout
- Detect build pack automatically for MI and Ballerina

## API improvements
- Have component/build create endpoints return created data
- Add pagination for build list
- Improve loading times for component/build list

## Context.yaml changes
- sync workspace file automatically

## Other
- Revisit app insights implementation

# Need to discuss
workspace file name should be orghandle.projecthandle.code-workspace
cannot have workspace without any folders

update readme & changelog before release!

//
WSO2 Choreo Blog
Keep it simple, no word count is relevent


// Medium Blog
Use an example to explain step by step every little details


