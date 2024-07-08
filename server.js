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
  console.log("env  = ", process.env.GITHUB_TOKEN);
  if (issue) {
    const { Octokit } = await import("octokit");
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const issueSummary = issue.fields.summary;
    const issueDescription = issue.fields.description || "";

    try {
      const response = await octokit.request(
        "POST /repos/{owner}/{repo}/issues",
        {
          owner: "SkillMatch-tech",
          repo: "skillmatch-interface",
          title: issueSummary,
          body: `Jira Issue: ${issue.key}\n\n${issueDescription}`,
          assignees: ["waseem-netixsol"], // Replace with your GitHub username
          milestone: 1,
          labels: ["bug"],
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
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
    res.status(400).send("Invalid payload");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
