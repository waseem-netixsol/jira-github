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
  //   console.log("vercel body issue = >", req.body.issue);
  console.log(process.env.GITHUB_TOKEN);
  const issue = req.body.issue;

  if (issue && issue.fields && issue.fields.summary) {
    const issueSummary = issue.fields.summary;
    const issueDescription = issue.fields.description || "";

    console.log("jira issue summary", issueSummary);
    console.log("jira issue Desc", issueDescription);
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

        await githubIssue(issueSummary, issueDescription, label);
        console.log(process.env.GITHUB_TOKEN);
        res.status(200).send("Webhook received and GitHub issue created");
      } catch (error) {
        console.error("Error creating GitHub issue:", error);
        res.status(500).json({
          message: "Error creating GitHub issue",
          error: error.message,
        });
      }
    } else {
      //   console.log(
      //     "Jira issue does not start with 'testing-issue', skipping GitHub issue creation."
      //   );
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

async function githubIssue(summary, description, label) {
  try {
    const { Octokit } = await import("octokit");
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const gitIssue = await octokit.request(
      "POST /repos/waseem567/addin/issues",
      {
        owner: "waseem567",
        repo: "addin",
        title: summary,
        body: description,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
          authorization: "bearer " + process.env.GITHUB_TOKEN,
        },
      }
    );
    console.log(githubIssue);
  } catch (error) {
    console.log("catch = ", error);
  }
}
