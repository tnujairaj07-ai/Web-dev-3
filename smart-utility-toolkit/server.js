// server.js
const http = require("http");

const PORT = 3000;

const server = http.createServer((req, res) => {
  const url = req.url;

  res.setHeader("Content-Type", "text/plain");

  if (url === "/") {
    res.statusCode = 200;
    res.end("Welcome to Node Server");
  } else if (url === "/about") {
    res.statusCode = 200;
    res.end("About Page");
  } else if (url === "/contact") {
    res.statusCode = 200;
    res.end("Contact Page");
  } else {
    res.statusCode = 404;
    res.end("404 Not Found: The requested route does not exist.");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});