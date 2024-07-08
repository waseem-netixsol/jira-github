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

        // Create request body for GitHub issue
        const requestBody = {
          owner: process.env.OWNER,
          repo: process.env.REPO,
          title: issueSummary,
          body: issueDescription,
          labels: label ? [label] : [],
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        };
        console.log("creating github issue");
        // Make request to create GitHub issue
        const response = await octokit.request(
          "POST /repos/" +
            process.env.OWNER +
            "/" +
            process.env.REPO +
            "/issues",
          requestBody
        );

        console.log("GitHub issue created:", response);
        res.status(200).send("Webhook received and GitHub issue created");
      } catch (error) {
        // console.error("Error creating GitHub issue:", error);
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

const issue = {
  id: "11002",
  self: "https://testing-skillmatch.atlassian.net/rest/api/2/11002",
  key: "SQA-522",
  fields: {
    statuscategorychangedate: "2024-07-08T19:56:25.595+0500",
    issuetype: {
      self: "https://testing-skillmatch.atlassian.net/rest/api/2/issuetype/10013",
      id: "10013",
      description: "Tasks track small, distinct pieces of work.",
      iconUrl:
        "https://testing-skillmatch.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
      name: "Task",
      subtask: false,
      avatarId: 10318,
      entityId: "478cae67-8057-43e8-963d-93598edbdda7",
      hierarchyLevel: 0,
    },
    timespent: null,
    customfield_10031: null,
    project: {
      self: "https://testing-skillmatch.atlassian.net/rest/api/2/project/10002",
      id: "10002",
      key: "SQA",
      name: "SQA",
      projectTypeKey: "software",
      simplified: true,
      avatarUrls: [Object],
    },
    fixVersions: [],
    aggregatetimespent: null,
    resolution: null,
    customfield_10027: null,
    customfield_10028: null,
    customfield_10029: null,
    resolutiondate: null,
    workratio: -1,
    issuerestriction: { issuerestrictions: {}, shouldDisplay: true },
    watches: {
      self: "https://testing-skillmatch.atlassian.net/rest/api/2/issue/SQA-522/watchers",
      watchCount: 0,
      isWatching: true,
    },
    lastViewed: null,
    created: "2024-07-08T19:56:25.291+0500",
    customfield_10020: null,
    customfield_10021: null,
    customfield_10022: null,
    customfield_10023: null,
    priority: {
      self: "https://testing-skillmatch.atlassian.net/rest/api/2/priority/3",
      iconUrl:
        "https://testing-skillmatch.atlassian.net/images/icons/priorities/medium.svg",
      name: "Medium",
      id: "3",
    },
    customfield_10024: null,
    customfield_10025: null,
    labels: [],
    customfield_10026: null,
    customfield_10016: null,
    customfield_10017: null,
    customfield_10018: {
      hasEpicLinkFieldDependency: false,
      showField: false,
      nonEditableReason: [Object],
    },
    customfield_10019: "0|i003zb:",
    timeestimate: null,
    aggregatetimeoriginalestimate: null,
    versions: [],
    issuelinks: [],
    assignee: null,
    updated: "2024-07-08T19:56:25.291+0500",
    status: {
      self: "https://testing-skillmatch.atlassian.net/rest/api/2/status/10006",
      description: "",
      iconUrl: "https://testing-skillmatch.atlassian.net/",
      name: "To Do",
      id: "10006",
      statusCategory: [Object],
    },
    components: [],
    timeoriginalestimate: null,
    description: null,
    customfield_10010: null,
    customfield_10014: null,
    customfield_10015: null,
    timetracking: {},
    customfield_10005: null,
    customfield_10006: null,
    security: null,
    customfield_10007: null,
    customfield_10008: null,
    aggregatetimeestimate: null,
    customfield_10009: null,
    attachment: [],
    summary: "sqa: issue creation",
    creator: {
      self: "https://testing-skillmatch.atlassian.net/rest/api/2/user?accountId=712020%3A75bc8983-e0f7-42d6-b24c-76f23232d4d0",
      accountId: "712020:75bc8983-e0f7-42d6-b24c-76f23232d4d0",
      avatarUrls: [Object],
      displayName: "waseem",
      active: true,
      timeZone: "Asia/Karachi",
      accountType: "atlassian",
    },
    subtasks: [],
    reporter: {
      self: "https://testing-skillmatch.atlassian.net/rest/api/2/user?accountId=712020%3A75bc8983-e0f7-42d6-b24c-76f23232d4d0",
      accountId: "712020:75bc8983-e0f7-42d6-b24c-76f23232d4d0",
      avatarUrls: [Object],
      displayName: "waseem",
      active: true,
      timeZone: "Asia/Karachi",
      accountType: "atlassian",
    },
    aggregateprogress: { progress: 0, total: 0 },
    customfield_10001: null,
    customfield_10002: null,
    customfield_10003: null,
    customfield_10004: null,
    environment: null,
    duedate: null,
    progress: { progress: 0, total: 0 },
    votes: {
      self: "https://testing-skillmatch.atlassian.net/rest/api/2/issue/SQA-522/votes",
      votes: 0,
      hasVoted: false,
    },
  },
};
