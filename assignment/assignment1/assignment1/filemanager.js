const fs = require("fs");

const fileName = "test.txt";

// CREATE
fs.writeFile(fileName, "Hello Node.js\n", (err) => {

    if (err) {
        console.log("Error creating file:", err);
        return;
    }

    console.log("File Created");

    // READ
    fs.readFile(fileName, "utf8", (err, data) => {

        if (err) {
            console.log("Error reading file:", err);
            return;
        }

        console.log("File Content:", data);

        // UPDATE
        fs.appendFile(fileName, "Learning FS Module\n", (err) => {

            if (err) {
                console.log("Error updating file:", err);
                return;
            }

            console.log("File Updated");

            // READ UPDATED FILE
            fs.readFile(fileName, "utf8", (err, data) => {

                if (err) {
                    console.log("Error reading updated file:", err);
                    return;
                }

                console.log("Updated Content:");
                console.log(data);

                // DELETE
                fs.unlink(fileName, (err) => {

                    if (err) {
                        console.log("Error deleting file:", err);
                        return;
                    }

                    console.log("File Deleted");
                });
            });
        });
    });
});