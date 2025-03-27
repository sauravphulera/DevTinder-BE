const express = require("express");

const app = express();

app.use((req, res) => {
  res.send("Hello from the server test");
});

app.listen(3000, () => {
  console.log("server started at 3000");
});
