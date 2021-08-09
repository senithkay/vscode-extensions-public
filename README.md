# ballerina-low-code-editor

Monorepo for multiple tools under chore-console and ballerina.

## Getting Started 

### Developer Guide

> Avoid working directly on `wso2-enterprise/ballerina-low-code-editor`, fork this repositoty to your account first.

```
git clone https://github.com/<your-username>/ballerina-low-code-editor.git
```

You'll see number of directories in the root.

#### @ballerina/syntax-tree

```
cd ballerina-low-code-editor/syntax-tree
npm install
```

#### For local development

You need to run `npm link` inside `syntax-tree/` directory to test `syntax-tree` library with `choreo-console` and `low-code-editor` in local environment.

```
npm link
npm run watch
```

> You can use `npm unlink` command inside the same directory to force switch back to remote referance of the package. You might want to run `npm install` on parent repository also.

Currently you can't test `syntaxt-tree` locally without support of `choreo-console`.

#### Publishing guide for `syntax-tree`

- Contact [`@ballerina`](https://www.npmjs.com/org/ballerina) npm orgnization admin to get publishing rights if you don't have access yet.
- Open your terminal and change to `syntax-tree` directory. (`cd /syntaxt-tree/`)
- Login to your npm account using `npm login`
- Run `npm version <major|minor|patch>` to state package version you want to publish. It'll update `package.json`.
- Run `npm publish` to publish your package.
- Create a separate branch `syntaxt-tree/vx.x.x` with latest changes, and send a PR against master.

### @wso2-enterprise/low-code-editor

```
cd ballerina-low-code-editor/low-code-editor
npm install
```

#### For local development

You need to run `npm link` inside `low-code-editor/` directory to test `low-code-editor` library with `choreo-console` in local environment.

```
npm link
npm run watch
```

> You can use `npm unlink` command inside the same directory to force switch back to remote referance of the package. You might want to run `npm install` on parent repository also.

Currently you can't test `low-code-editor` locally without support of `choreo-console`.

#### Publishing guide for `low-code-editor`

- [Generate a personal access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)  in github if you dont have one already.
- Create new file named `.npmrc` inside `low-code-editor` directory.
- Add the follwing lines to the file.

```bash
@wso2-enterprise:registry = https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken = [PERSONAL_ACCESS_TOKEN]
always-auth = true
```
- Run the following command inside `low-code-editor` directory.
```bash
npm publish
```
- This will publish the package to `@wso2-enterprise` github package registry. You can check the published package from the [packages page](https://github.com/wso2-enterprise/ballerina-low-code-editor/packages).

## Links

- [npm-link](https://docs.npmjs.com/cli/v7/commands/npm-link)
- [Understanding npm-link @ dailyjs](https://medium.com/dailyjs/how-to-use-npm-link-7375b6219557)
