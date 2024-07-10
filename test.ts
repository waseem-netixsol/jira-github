async function githubIssue() {
  try {
    const { Octokit } = await import("octokit");
    const octokit = new Octokit({
      auth: "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",
    });

    const gitIssue = await octokit.request(
      "POST /repos/waseem567/addin/issues",
      {
        owner: "waseem567",
        repo: "addin",
        title: "Found a bug title",
        body: "I'm having a problem with this.",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
          authorization:
            "bearer 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",
        },
      }
    );
    console.log(githubIssue);
  } catch (error) {
    console.log("catch = ", error);
  }
}
githubIssue();
