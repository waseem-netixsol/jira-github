const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Define the webhook endpoint for a test route
app.get("/", (req, res) => {
  console.log("/ triggered");
  res.status(200).send("Webhook received with slash");
});

// Define the webhook endpoint for Jira
app.post("/webhook-endpoint", async (req, res) => {
  const issue = req.body.issue;
  console.log("New issue created in Jira:", issue);

  if (issue) {
    const issueSummary = issue.fields.summary;
    const issueDescription = issue.fields.description || "";

    // Create a new issue on GitHub
    try {
      const response = await axios.post(
        process.env.GITHUB_REPO_URL,
        {
          title: issueSummary,
          body: `Jira Issue: ${issue.key}\n\n${issueDescription}`,
        },
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("GitHub issue created:", response.data.html_url);
      res.status(200).send("Webhook received and GitHub issue created");
    } catch (error) {
      console.error(
        "Error creating GitHub issue:",
        error.response ? error.response.data : error.message
      );
      res.status(500).send("Error creating GitHub issue");
    }
  } else {
    res.status(400).send("Invalid payload");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
