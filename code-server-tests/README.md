## Code server integration tests

### Run tests locally :

 1. Clone the repository
 2. Manually Run the code server docker image
 3.  Navigate to code-server-tests directory in local terminal
 4. Execute "npm install"
 5. Execute "npx cypress open"
 6. Run the tests

### What to do when tests fail in pipeline ?
Step 1 :
Check what caused the error. You can check the Cypress log in pipeline to see which tests failed and what were the reasons for the failures.
<img width="1431" alt="Screenshot 2022-06-22 at 9 48 58 PM" src="https://user-images.githubusercontent.com/32265029/175094656-40e54a82-162f-448f-b531-e64b80080860.png">

Step 2 :
Go and check the screenshots inside "Published artifacts" directory. If you aren't sure about what went wrong in the tests, you can check the screenshots taken by the tests at the time of failure.
<img width="1382" alt="Screenshot 2022-06-22 at 9 49 58 PM" src="https://user-images.githubusercontent.com/32265029/175094777-8322351e-eb8d-46b2-a458-9e57191c06b8.png">


Step 3 :
Go and check the snapshot difference. In the code-server tests we do a snapshot comparison of the lowcode diagram that is generated. If there was a new change in the diagram or if the diagram does not get rendered as expected, the tests will fail. You can find a snapshot comparison of the diagram images inside "Published artifacts" directory of the build run.
![Low-code-diagram diff (1)](https://user-images.githubusercontent.com/32265029/175095132-428c6933-0458-4b08-bdcb-a21ce6e74fb1.png)


### How to update the snapshot image?
If the diagram is changed intentionally and if you want to update the snapshot image in the tests, follow these steps,
1. Download the new snapshot in Artifacts > Screenshots > Validate_vs_code_is_opened_without_errors_and_Diagram_is_rendered.png (This will be a screenshot of the updated diagram)
2. Go to Ballerina-Plugin-Vscode repository
3. Navigate to code-server-tests > cypress > snapshots
4. Replace the existing snapshot with the downloaded one and rename in to "Low-code-diagram.snap.png"
5. Commit the changes
