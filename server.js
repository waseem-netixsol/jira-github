const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Define the webhook endpoint for a test route
app.get("/", (req, res) => {
  console.log("/ triggered");
  res.status(200).send("JIRA -> GITHUB webhook is running...");
});

// Define the webhook endpoint for Jira
app.post("/webhook-endpoint", async (req, res) => {
  console.log("vercel body = >", req.body); // Log the entire request body for debugging

  const issue = req.body.issue;
  //   console.log("New issue created in Jira:", issue);

  if (issue && issue.fields && issue.fields.summary) {
    const issueSummary = issue.fields.summary;
    const issueDescription = issue.fields.description || "";

    // Check if the issue title starts with "testing-issue"
    if (issueSummary.startsWith("sqa:")) {
      try {
        const { Octokit } = await import("octokit");
        const octokit = new Octokit({
          auth: process.env.GITHUB_TOKEN,
        });
        // Extract label from the issue title
        const labelIndex = issueSummary.lastIndexOf("-");
        const label =
          labelIndex !== -1
            ? issueSummary.substring(labelIndex + 1).trim()
            : "";

        // Create request body for GitHub issue
        const requestBody = {
          owner: process.env.OWNER,
          repo: process.env.REPO,
          title: issueSummary,
          body: `Jira Issue: ${issue.key}\n\n${issueDescription}`,
          labels: label ? [label] : [],
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        };

        // Make request to create GitHub issue
        const response = await octokit.request(
          "POST /repos/" +
            process.env.OWNER +
            "/" +
            process.env.REPO +
            "/issues",
          requestBody
        );

        console.log("GitHub issue created:", response.data.html_url);
        res.status(200).send("Webhook received and GitHub issue created");
      } catch (error) {
        console.error("Error creating GitHub issue:", error);
        res.status(500).json({
          message: "Error creating GitHub issue",
          error: error.message,
        });
      }
    } else {
      console.log(
        "Jira issue does not start with 'testing-issue', skipping GitHub issue creation."
      );
      res.status(200).send("Webhook received, but no GitHub issue created");
    }
  } else {
    res.status(400).send("Invalid payload from Jira");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
