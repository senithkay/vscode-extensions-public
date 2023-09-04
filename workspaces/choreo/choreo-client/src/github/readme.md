## Dev Config

```json
{
    "GH_APP_CLIENT_ID": "Iv1.f6cf2cd585148ee7",
    "PUBLIC_URL": "https://github.com/apps/choreo-apps-dev",
    "GH_APP_AUTH_REDIRECTION_URL": "https://localhost:3000/ghapp",
    "GH_APP_INSTALL_URL": "https://github.com/apps/choreo-apps-dev/installations/new"
}
```

## Prod Config

```json
{
    "GH_APP_CLIENT_ID": "Iv1.804167a242012c66",
    "PUBLIC_URL": "https://github.com/marketplace/choreo-apps",
    "GH_APP_AUTH_REDIRECTION_URL": "https://console.choreo.dev/ghapp",
    "GH_APP_INSTALL_URL": "https://github.com/apps/choreo-apps/installations/new"
}
```

## Auth URL

```javascript
`https://github.com/login/oauth/authorize?` +
        `redirect_uri=${GH_APP_AUTH_REDIRECTION_URL}` +
        `&client_id=${GH_APP_CLIENT_ID}`
```

## Post Auth GQL mutation

```graphql
mutation {
    obtainUserToken(authorizationCode:"") {
        success
        message
    }
}
```

```json
{
  "obtainUserToken": {
    "success": true,
    "message": "USER GITHUB TOKEN RETRIEVED"
  }
}
```

## Get Repos

```graphql
query {
    userRepos {
        orgName
        repositories {
            name
        }
    }
}
```

```json
{
  "userRepos": [
    {
      "orgName": "org1",
      "repositories": [
        {
          "name": "repo1"
        },
        {
          "name": "repo2"
        }
      ]
    },
    {
      "orgName": "org2",
      "repositories": [
        {
          "name": "repo1"
        }
      ]
    }
}
```