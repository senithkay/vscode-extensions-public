# syntax-tree

## Developer Guide

### Publish

- Contact `@ballerina` npm orgnization admin to get publishing rights if you don't have access yet.
- Open your terminal and change to `syntax-tree` directory. (`cd /tools/syntaxt-tree/`)
- Login to your npm account using `npm login`
- Run `npm version <major|minor|patch>` to state package version you want to publish. It'll update `package.json`.
- Run `npm publish` to publish your package.
- Create a separate branch `syntaxt-tree/vx.x.x` with latest changes, and send a PR against master.
