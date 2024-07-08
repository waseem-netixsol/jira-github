const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Define the webhook endpoint
app.get("/", (req, res) => {
  res.status(200).send("Webhook received");
});
app.post("/webhook-endpoint", (req, res) => {
  const issue = req.body.issue;
  console.log("New issue created:", req.body);
  // Handle the issue created event here
  res.status(200).send("Webhook received");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
