import ballerinax/googleapis.sheets;

function myfunction() returns error? {
    sheets:Client gsheet = check new ({auth: {token: "hello-world"}});
    sheets:Sheet addSheetResponse = check gsheet->addSheet("id123", "sheet1");
}
