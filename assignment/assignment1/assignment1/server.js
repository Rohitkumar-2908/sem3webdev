const http = require("http");

const server = http.createServer((req, res) => {

    res.setHeader("Content-Type", "text/plain");

    if (req.url === "/") {
        res.statusCode = 200;
        res.end("Welcome to Smart Utility Toolkit");
    }

    else if (req.url === "/about") {
        res.statusCode = 200;
        res.end("About Smart Utility Toolkit");
    }

    else if (req.url === "/contact") {
        res.statusCode = 200;
        res.end("Contact: smarttoolkit@example.com");
    }

    else {
        res.statusCode = 404;
        res.end("404 - Page Not Found");
    }
});

const PORT = 8000;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});