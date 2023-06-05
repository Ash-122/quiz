const http = require("http");
const corsAnywhere = require("cors-anywhere");

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 8080;

corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
}).listen(port, host, () => {
  console.log(`Proxy server running on http://${host}:${port}`);
});
