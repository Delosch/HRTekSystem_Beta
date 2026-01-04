const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  ignoredRouteFiles: ["**/.*"],
  future: {
    v3_singleFetch: true,
    v3_relativeSplatPath: true,
    v3_lazyRouteDiscovery: true
  }
};
