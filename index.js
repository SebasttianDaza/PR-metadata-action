const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
    try {
        //Need a fecth all the inputs that were provided our action

        const owner = core.getInput('owner', { required: true });
        const repo = core.getInput('repo', { required: true });
        const pr_number = core.getInput('pr_number', { required: true });
        const token = core.getInput('token', { required: true });

        // Need to create an instance of Octokit which use to call

        const octokit = new github.getOctokit(token);

        // Need to fetch the list of files that were changed in the PR

        const { data: changedFiles } = await octokit.rest.pulls.listFiles({
            owner,
            repo,
            pull_number: pr_number
        });

        // Contains the sum of all the additions, deletions and changes in all PR

        let diffData = {
            additions: 0,
            deletions: 0,
            changes: 0
        }

        // Array.reduce()
        diffData = changedFiles.reduce(( acc, file) => {
            acc.additions += file.additions;
            acc.deletions += file.deletions;
            acc.changes += file.changes;
            return acc;
        }, diffData);

        // Loop over all the files changed in the PR

        for ( const file of changedFiles) {
            const fileExtension = file.filename.split('.').pop();
            switch (fileExtension) {
                case 'md':
                    await octokit.rest.issues.addLabels({
                        owner,
                        repo,
                        issue_number: pr_number,
                        labels: ['markdown'],
                    });
                case 'js':
                    await octokit.rest.issues.addLabels({
                        owner,
                        repo,
                        issue_number: pr_number,
                        labels: ['javascript'],
                    });
                case 'yml':
                    await octokit.rest.issues.addLabels({
                        owner,
                        repo,
                        issue_number: pr_number,
                        labels: ['yaml'],
                    });
                case 'yaml':
                    await octokit.rest.issues.addLabels({
                        owner,
                        repo,
                        issue_number: pr_number,
                        labels: ['yaml'],
                    });
            }
        }

        // Comment on the PR wirh the information we compiled

        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pr_number,
          body: `
                Pull request #${pr_number} has been updated with --Summary--
                \n
                - ${diffData.changes} changes \n
                - ${diffData.additions} additions \n
                - ${diffData.deletions} deletions \n
            
            `,
        });

    }
    catch (error) {
        core.setFailed(error.message);
    }
}

main();