import ballerinax/googleapis.sheets;

function myfunction() returns error? {
    sheets:Client sheetsEp = check new (config = {
        auth: {
            token: ""
        }
    });
}
