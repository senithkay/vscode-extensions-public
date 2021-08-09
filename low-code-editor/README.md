# @wso2-enterprise/low-code-editor

## Getting Started 

### Developer Guide

> Avoid working directly on `wso2-enterprise/ballerina-low-code-editor`, fork this repositoty to your account first.

```
git clone https://github.com/<your-username>/ballerina-low-code-editor.git
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

TODO
