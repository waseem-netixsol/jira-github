const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// In-memory storage for mapping Jira issues to GitHub issues
const jiraToGithubMap = {};

// Define the webhook endpoint for a test route
app.get("/", (req, res) => {
  console.log("/ triggered");
  res.status(200).send("JIRA -> GITHUB webhook is running...");
});

// Define the webhook endpoint for Jira
app.post("/webhook-endpoint", async (req, res) => {
  const issue = req.body.issue;
  console.log(req.body);

  if (issue && issue.fields && issue.fields.summary) {
    const issueSummary = issue.fields.summary;
    const issueDescription = issue.fields.description || "";
    const jiraIssueKey = issue.key;

    console.log("jira issue summary", issueSummary);
    console.log("jira issue Desc", issueDescription);

    let repoName;
    if (issueSummary.startsWith("sqa_api:")) {
      repoName = "skillmatch-backend";
    } else if (issueSummary.startsWith("sqa_ft:")) {
      repoName = "skillmatch-interface";
    } else {
      res.status(200).send("Payload received, but no issue was created");
      return;
    }

    try {
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });

      // Extract label from the issue title
      const labelIndex = issueSummary.lastIndexOf("-");
      const label =
        labelIndex !== -1 ? issueSummary.substring(labelIndex + 1).trim() : "";
      let titleWithoutPrefixAndLabel = issueSummary
        .replace(/^sqa_api:|^sqa_ft:/, "")
        .replace(/-\s*\w+$/, "")
        .trim();

      if (req.body.webhookEvent === "jira:issue_created") {
        // If the event is for a new issue creation
        const githubIssue = await createGithubIssue(
          octokit,
          titleWithoutPrefixAndLabel,
          issueDescription,
          label,
          repoName
        );

        // Map Jira issue key to GitHub issue number for later updates
        jiraToGithubMap[jiraIssueKey] = githubIssue.number;

        res.status(200).send("Webhook received and GitHub issue created");
      } else if (req.body.webhookEvent === "jira:issue_updated") {
        // If the event is for an issue update
        const githubIssueNumber = jiraToGithubMap[jiraIssueKey];

        if (githubIssueNumber) {
          await updateGithubIssue(
            octokit,
            githubIssueNumber,
            issueDescription,
            repoName
          );

          res.status(200).send("Webhook received and GitHub issue updated");
        } else {
          res
            .status(400)
            .send("GitHub issue not found for the given Jira issue");
        }
      } else {
        res.status(400).send("Unhandled webhook event");
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({
        message: "Error processing webhook",
        error: error.message,
      });
    }
  } else {
    res.status(400).send("Invalid payload from Jira");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function createGithubIssue(
  octokit,
  summary,
  description,
  label,
  repoName
) {
  try {
    const response = await octokit.request(
      `POST /repos/SkillMatch-tech/${repoName}/issues`,
      {
        owner: "SkillMatch-tech",
        repo: repoName,
        title: summary,
        body: `Jira Issue Description: ${description}`,
        labels: label ? [label] : [],
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating GitHub issue:", error);
    throw error;
  }
}

async function updateGithubIssue(octokit, issueNumber, description, repoName) {
  try {
    await octokit.request(
      `PATCH /repos/SkillMatch-tech/${repoName}/issues/${issueNumber}`,
      {
        owner: "SkillMatch-tech",
        repo: repoName,
        body: `Updated Jira Issue Description: ${description}`,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
  } catch (error) {
    console.error("Error updating GitHub issue:", error);
    throw error;
  }
}
