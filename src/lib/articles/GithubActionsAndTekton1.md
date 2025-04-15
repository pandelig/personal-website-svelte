---
slug: "github-actions-tekton-step-1-your-first-github-actions-workflow"
date: "14 Apr 2025"
date_updated: ""
tags: ["tutorial", "ci/cd", "github-actions", "tekton"]
title: "CI/CD Getting Started with GitHub Actions and Tekton - Step 1: Your First GitHub Actions Workflow"
meta_description: "GitHub Actions tutorial by Pantelis Deligiannidis. Set up a workflow for Python, understand events, jobs, steps, actions & Marketplace. Ideal for beginners."
---

1. (You are here) Step 1: Your First GitHub Actions Workflow
2. [Step 2: Your First Tekton Pipeline](/blog/github-actions-tekton-step-2-your-first-tekton-pipeline)

Continuous Integration (CI) and Continuous Delivery/Deployment (CD), CI/CD, automates the steps involved in getting our code from our development machine into production, including building, testing, and deploying.

Two popular tools in the CI/CD landscape, especially relevant if you're working with containers and cloud-native technologies, are GitHub Actions and Tekton.

* **GitHub Actions**: This is GitHub's native CI/CD platform which allows us to automate workflows directly within our GitHub repository. It's tightly integrated with GitHub events (code pushes, pull requests etc.) and is generally easier to get started with, especially for projects already hosted on GitHub.
* **Tekton**: This is a powerful, flexible, Kubernetes-native open-source framework for creating CI/CD systems. Tekton lets us build, test, and deploy across various cloud providers or on-premises systems by defining our pipelines as Kubernetes Custom Resources.

In this first article, we'll focus on GitHub Actions. We'll create a simple project, set up a basic CI Workflow, and understand the fundamental concepts. In the next article, we'll explore how Tekton could manage a similar workflow, highlighting its different approach.

## Prerequisites

* A GitHub account and basic understanding of `git` commands: `clone`, `add`, `commit`, `push`.
* A code editor, e.g. [VS Code](https://code.visualstudio.com/). Optional: Install the [GitHub Actions](https://marketplace.visualstudio.com/items?itemName=github.vscode-github-actions) extension.
* Optional: Basic Python knowledge, we'll use a very simple Python example.

## Set Up a Simple Project

Let's start with a minimal Python project.

1. Create a new repository on GitHub:
    * Call it something like `github-actions-tekton-demo`.
    * Initialize it with a `README.md` file.

2. Configure authentication method, needed for cloning a Private repository as well as pushing to a repository regardless of visibility: Use a [Personal Access Token](https://kettan007.medium.com/how-to-clone-a-git-repository-using-personal-access-token-a-step-by-step-guide-ab7b54d4ef83) or [set up SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys)(recommended).

3. Clone the repository:
    * If you created a Personal Access Token:

      ```bash
      git clone https://github.com/YOUR_USERNAME/github-actions-tekton-demo.git
      cd github-actions-tekton-demo
      ```

    * If you set up SSH keys:

      ```bash
      git clone git@github.com:YOUR_USERNAME/github-actions-tekton-demo.git
      cd github-actions-tekton-demo
      ```

4. Create a simple Python script, a file named `app.py` with the following content:

    ```python
    # app.py

    def main():
        message = "Hello, GitHub Actions!"
        print(message)

    if __name__ == "__main__":
        main()
    ```

5. Add a linter configuration: Linters check our code for style issues. Let's add `flake8`. Create a file named `requirements.txt` and add:

    ```text
    flake8
    ```

6. Commit and push the initial code:

    ```bash
    git add .
    git commit -m "Initial project setup with simple Python script"
    git push origin main
    ```

## Create the Workflow File

GitHub Actions workflows are defined in YAML files located in the `.github/workflows/` directory of our repository.

1. Create the directory:

    ```bash
    mkdir -p .github/workflows
    ```

2. Create the workflow file: Let's call it `ci-workflow.yml`.

    ```bash
    touch .github/workflows/ci-workflow.yml
    ```

Now, let's edit `ci-workflow.yml` and add the workflow definition.

## Workflow File - Core Concepts

Open `ci-workflow.yml` and add the following content. We'll break it down afterwards.

```yaml
# .github/workflows/ci-workflow.yml

# 1. Workflow Name
name: Simple CI Workflow

# 2. Event Triggers
on:
  push:
    branches: [ main ] # Runs on pushes to the main branch
  pull_request:
    branches: [ main ] # Runs on pull requests targeting the main branch
  workflow_dispatch: # Allows manual triggering from the Actions tab

# 3. Jobs
jobs:
  # Job ID (can be anything descriptive)
  build-and-lint:
    # Runner environment
    runs-on: ubuntu-latest # Specifies the type of machine to run the job on

    # 4. Steps - sequence of tasks
    steps:
      # Action: Checks out the repository code
      - name: Check out repository code
        uses: actions/checkout@v4 # Using a pre-built action from the marketplace

      # Action: Sets up Python environment
      - name: Set up Python
        uses: actions/setup-python@v4 # Another marketplace action
        with:
          python-version: '3.10' # Specify the Python version

      # Install dependencies
      - name: Install dependencies
        run: | # Use 'run' for executing shell commands
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      # Run linter (Flake8)
      - name: Lint with Flake8
        run: |
          # Stop the build if there are Python syntax errors or undefined names
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
          # Exit-zero treats all errors as warnings. The GitHub editor is 127 chars wide
          flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

      # Run a simple test (execute the script)
      - name: Run Python script
        run: python app.py
```

Explanation of Core Concepts:

1. `name`: (Optional) The name of the workflow, displayed on GitHub's Actions tab.
2. `on`: Defines the Events that trigger this workflow.
      * `push`: Triggered when we push code. We specified it only runs for pushes to the `main` branch.
      * `pull_request`: Triggered when a pull request is opened or updated targeting the `main` branch.
      * `workflow_dispatch`: Allows us to manually trigger the workflow from the GitHub UI.
      * *Further Learning:* [Events that trigger workflows (GitHub Docs)](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
3. `jobs`: Workflows are made up of one or more jobs, which run in parallel unless specified otherwise (`needs`).
      * `build-and-lint`: This is the unique ID for the job.
      * `runs-on`: Specifies the type of virtual machine (runner) to execute the job on (e.g., `ubuntu-latest`, `windows-latest`, `macos-latest`). GitHub provides hosted runners, or we can configure self-hosted runners.
      * *Further Learning:* [Workflow Syntax - Jobs (GitHub Docs)](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#jobs)
4. `steps`: A job contains a *sequence* of tasks called steps. Steps can run commands (`run`) or use pre-built Actions (`uses`).
      * `name`: (Optional) A descriptive name for the step shown in the UI.
      * `uses`: Specifies an Action to use. Actions are reusable pieces of code. `actions/checkout@v4` and `actions/setup-python@v4` are official actions provided by GitHub, fetched from the GitHub Marketplace. The `@v4` specifies the version.
          * *Further Learning:* [GitHub Marketplace](https://github.com/marketplace?type=actions) & [Understanding GitHub Actions (GitHub Docs)](https://docs.github.com/en/actions/about-github-actions/understanding-github-actions?learn=getting_started&learnProduct=actions)
      * `with`: Used to provide input parameters required by an action, like `python-version` for `setup-python`.
      * `run`: Executes command-line programs using the operating system's shell. We can run single-line or multi-line scripts, using `|`.

## Commit and Run the Workflow

1. Add and commit the workflow file:

    ```bash
    git add .github/workflows/ci-workflow.yml
    git commit -m "Add basic CI workflow for linting and running script"
    ```

2. Push the changes to GitHub:

    ```bash
    git push origin main
    ```

3. Observe the workflow run:
      * Go to the repository on GitHub.
      * Click on the "Actions" tab.
      ![GitHub Actions Tab](/imgs/github_actions_tab.webp)
      * You should see the "Simple CI Workflow" workflow listed. It will likely have a yellow indicator while running and turn green upon successful completion (or red if it fails).
      ![Simple CI Workflow Running](/imgs/simple_ci_workflow_running.webp)
      ![Simple CI Workflow Completed](/imgs/simple_ci_workflow_completed.webp)
      * Click on the workflow run name to see the details of the `build-and-lint` job and the output of each step.
      ![Simple CI Workflow Details](/imgs/simple_ci_workflow_details.webp)
        Click on the `Run Python Script` step to see the output of our python script `Hello, GitHub Actions!`!

## (Optional) Explore Further

* Add More Steps: Include steps for building a package, running more complex tests (using `pytest`, for example), or even deploying to a simple hosting service (like GitHub Pages if it were a web project).
* Explore More Events: Trigger the workflow on issue creation or on a schedule.
* Use Secrets: Store sensitive data like API keys securely using GitHub Secrets and reference them in your workflow. *Further Learning:* [Using secrets in GitHub Actions (GitHub Docs)](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

## Wrapping up Step 1

[Repository with final code](https://github.com/pandelig/github-actions-tekton-demo)

You've successfully created your first CI workflow using GitHub Actions! You learned how to:

* Define a workflow using YAML in the `.github/workflows` directory.
* Trigger workflows based on Events like `push` and `pull_request`.
* Structure your workflow into Jobs that run on specific environments.
* Define Steps within jobs to execute commands or use pre-built Actions.
* Find and utilize Actions from the GitHub Marketplace.

This simple workflow automates the process of checking your code quality (linting) and verifying basic execution every time you push changes.

This foundation is crucial for building more complex automation. In the next article we'll explore how to [achieve similar goals using Tekton](/blog/github-actions-tekton-step-2-your-first-tekton-pipeline) within a Kubernetes environment, highlighting its different architecture and capabilities.
