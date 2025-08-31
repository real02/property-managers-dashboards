const app = require("./app");
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Flex Living Backend running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});
