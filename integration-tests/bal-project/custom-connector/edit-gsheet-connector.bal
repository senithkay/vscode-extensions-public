import ballerinax/googleapis.sheets;

sheets:Client gsheet = check new ({auth: {token: "hello-world"}});
