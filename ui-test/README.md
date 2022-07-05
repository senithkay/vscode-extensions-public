## E2E tests

### Setup test runner locally :

 1. Clone the repository
 2. Execute `npm install`
 3. Copy the vsix into root folder or Execute `./gradlew build -x test -x uiTest`
 4. Execute `npm run ui-test-setup`

### Run tests :

 1. Execute `npm run ui-test`

### Debug tests :

 1. Select "Run and Debug" from side bar
 2. Select "Debug UI Tests" from dropdown
 3. Click "Start Debug" icon

### Set plugin settings :
 Update the [settings.json](settings.json) file with particular setting.
 
 Sample settings.json: 
 ```
{
    "ballerina.home": "/path/to/ballerina",
}
```
