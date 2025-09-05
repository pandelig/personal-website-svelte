---
slug: "security-in-devops-step-1-fortifying-the-foundation-with-sast-and-sca"
date: "03 May 2025"
date_updated: ""
tags: ["tutorial", "security", "docker", "sonarqube", "ci/cd", "github-actions", "flask"]
title: "Security in DevOps - Step 1: Fortifying the Foundation with SAST and SCA"
meta_description: "Learn the fundamentals of DevOps security with Pantelis Deligiannidis. This hands-on tutorial introduces Static Application Security Testing (SAST) and Software Composition Analysis (SCA) by building and scanning a vulnerable Flask application. Integrate security into your CI/CD pipeline using GitHub Actions."
---

1. (You are here) Step 1: Fortifying the Foundation with SAST and SCA
2. [Step 2: Uncovering Runtime Vulnerabilities with DAST](/blog/security-in-devops-step-2-uncovering-runtime-vulnerabilities-with-dast)

This tutorial series will guide you through the fundamentals of application security testing, focusing on the following crucial methodologies: *Static Application Security Testing* (SAST), *Software Composition Analysis* (SCA) and *Dynamic Application Security Testing* (DAST).

Think of building a house.

- **SAST:** Like examining blueprints, SAST analyzes source code before runtime to find design flaws and vulnerabilities.
- **SCA:** Like checking material quality, SCA identifies vulnerabilities and licensing issues in third-party libraries.

Integrating SAST and SCA early ("shifting left") in the [Software Development Life Cycle (SDLC)](https://aws.amazon.com/what-is/sdlc/)
catches issues before production, saving time and resources. In this first step, we'll build a simple, intentionally vulnerable Flask web application and then use SAST and SCA tools to uncover these weaknesses.

## Prerequisites

To follow along with this tutorial, you will need to have the following installed on your system:

- [Docker](https://docs.docker.com/engine/install/). *Explore further:* [Docker Tutorial](https://www.docker.com/101-tutorial/).
- A GitHub Account, if you want to [implement the CI/CD pipeline](/blog/security-in-devops-step-1-fortifying-the-foundation-with-sast-and-sca#optional-integrate-with-github-actions).

## Create a Flask Application

Now, let's create a basic Flask application with a couple of deliberate vulnerabilities. Create a new directory for the app:

```bash
mkdir sast-sca-dast-demo && cd sast-sca-dast-demo
git init -b main
mkdir vulnerable_flask_app && cd vulnerable_flask_app
```

Create `vulnerable_flask_app/app.py`:

```python
from flask import Flask, request
import subprocess

app = Flask(__name__)
app.config['SECRET_KEY'] = "verysecretkey123" # Hardcoded secret!

@app.route('/')
def index():
    return """
    <h1>Welcome to our vulnerable Flask App! 😎</h1>
    <p>Explore the different pages:</p>
    <ul>
        <li><a href="/hello?name=World">Hello Page (try changing the name in the URL!)</a></li>
        <li><a href="/execute?cmd=ls -la">Execute Command Page (try changing the command in the URL!)</a></li>
        <li><a href="/admin">Admin Area (contains a secret!)</a></li>
    </ul>
    
    <a href="https://github.com/pandelig/sast-sca-dast-demo" target="_blank">GitHub Repo↗</a></li>
    """

@app.route('/hello')
def hello():
    name = request.args.get('name', 'Guest')
    return f"""
    <h1>Hello Page</h1>
    <p>Hello, {name}!</p>
    <p><a href="/">Back to Homepage</a></p>
    """

@app.route('/execute')
def execute():
    command = request.args.get('cmd', 'ls -l')
    # Insecure command execution!
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return f"""
    <h1>Execute Command Page</h1>
    <p>Executing command: <code>{command}</code></p>
    <pre>{result.stdout}</pre>
    <pre style="color: red;">{result.stderr}</pre>
    <p><a href="/">Back to Homepage</a></p>
    """

@app.route('/admin')
def admin():
    return f"""
    <h1>Admin Area</h1>
    <p>Admin area - Secret Key: {app.config['SECRET_KEY']}</p>
    <p><a href="/">Back to Homepage</a></p>
    """

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
```

Create `vulnerable_flask_app/requirements.txt`:

```text
Flask==2.0.0
Werkzeug==2.0.3 # required by Flask 2.0.0
```

This simple application has a few intentional weaknesses, *some of them* are:

1. Command Injection (`/execute`): The `execute` route takes a `cmd` parameter directly from the URL and executes it using `subprocess.run(shell=True)`. This allows an attacker to run arbitrary commands on the server.
2. Hardcoded Secret (`/admin`): The /admin route relies on a `SECRET_KEY` configured directly in the application's settings (`app.config['SECRET_KEY'] = "verysecretkey123"`) which is bad practice, secrets should never be hardcoded.
3. Outdated Dependency (`requirements.txt`): We're using an older version of Flask (2.0.0) which has  known security vulnerabilities.

## Containerize with Docker

To make it easier to run and scan our application later, let's containerize it using Docker. Create `vulnerable_flask_app/Dockerfile`:

```dockerfile
FROM python:3.9-slim-buster
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

Now you can build and run the application using Docker, inside the `vulnerable_flask_app` directory run:

```bash
docker build -t my-vulnerable-flask-app .
docker run -dp 5000:5000 my-vulnerable-flask-app
```

- `-t`: Tags the image with a name.
- `-d`: Runs the container in detached mode (background).
- `-p 5000:5000`: Maps port 5000 on your host machine to port 5000 inside the container (`-p host_port:container_port`).

You can access the application in your browser at [localhost:5000](http://localhost:5000). Try navigating to `/hello?name=World`, `/execute?cmd=ls -la`, `/admin`.

### (Optional) Useful Docker Commands

```bash
# List all containers (running and stopped)
docker ps -a

# Stop a running container (replace <container_id_or_name>)
docker stop <container_id_or_name>

# Remove a stopped container
docker rm <container_id_or_name>

# List all Docker images
docker images

# Remove a Docker image
docker rmi <image_id_or_tag>

# View the logs of a container
docker logs <container_id_or_name>

# View the real-time logs of a container
docker logs -f <container_id_or_name>
```

If you are using [VSCode](https://code.visualstudio.com/), you may install the [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker) extension to manage Docker images and containers using your mouse.

## Apply SAST with SonarQube

SonarQube is a popular open-source platform for continuous inspection of code quality and security. We will [set up SonarQube Community using its Docker image](https://docs.sonarsource.com/sonarqube-community-build/setup-and-upgrade/installing-sonarqube-from-docker/).

1. SonarQube is recommended being used alongside a database, we will set up a postgres database in its own container but under the same docker network with the (soon to be) SonarQube container, this way the 2 containers can communicate with each other. If the `postgres` image isn't already available in your machine, it will be downloaded:

    ```bash
    docker network create sonarqube-network
    docker run -d --name postgres-container -e POSTGRES_USER=root -e POSTGRES_PASSWORD=strongpass -p 5432:5432 --network sonarqube-network postgres
    ```

2. Set up the SonarQube Server:

    ```bash
    docker run -d --name sonarqube-container -e sonar.jdbc.url=jdbc:postgresql://postgres/postgres -e sonar.jdbc.username=root -e sonar.jdbc.password=strongpass -p 9000:9000 --network sonarqube-network sonarqube
    ```

    Now `docker ps` should show something similar to this:
  
    ```bash
    CONTAINER ID   IMAGE                     COMMAND                  CREATED          STATUS          PORTS                                         NAMES
    2826d6d95b07   sonarqube                 "/opt/sonarqube/dock…"   8 seconds ago    Up 8 seconds    0.0.0.0:9000->9000/tcp, [::]:9000->9000/tcp   sonarqube-container
    73b9a30bdc62   postgres                  "docker-entrypoint.s…"   16 seconds ago   Up 16 seconds   0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp   postgres-container
    ```

3. Log in to SonarQube. Visit [localhost:9000](http://localhost:9000/) and enter `admin` in both fields:

    ![SonarQube log-in screen.](/imgs/sonarqube_login_screen.webp)

    Update your password when asked, make sure to take note of your new password.

4. We will `Create a local project`, let's call it `Vulnerable Flask App`:

    ![Create a local SonarQube project.](/imgs/create_local_sonarqube_project.webp)
    ![Create a local SonarQube project 2.](/imgs/create_local_sonarqube_project_2.webp)

    On the next page, for `Analysis Method` select `Locally`.

    ![Select analysis method, locally.](/imgs/select_sonarqube_analysis_method.webp)

5. Generate a SonarQube Scanner Token:

    ![Generate Sonnar Scanner command part 1 of 3.](/imgs/generate_sonarscanner_command.webp)

    Click `Generate`.

    ![Generate Sonnar Scanner command part 2 of 3.](/imgs/generate_sonarscanner_command_2.webp)

    Click `Continue`.

    ![Generate Sonnar Scanner command part 3 of 3.](/imgs/generate_sonarscanner_command_3.webp)

    Finally, save the generated `sonar-scanner` command.

6. Set up the SonarQube Scanner: Keep in mind the separation between the SonarQube Server and the SonarQube Scanner, the tool used to perform the actual scans. So far we've established a database for storing the results and prepared the SonarQube Server that serves the UI. Run:

    ```bash
    # --rm: Automatically remove the container after it exits
    # --network sonarqube-network: Connects this container to the same network as the SonarQube Server
    # -v "$(pwd):/usr/src": Mount the current directory into the container's /usr/src, where the scanner expects code to scan
    alias sonar-scanner='docker run --rm --network sonarqube-network -v "$(pwd):/usr/src" sonarsource/sonar-scanner-cli'
    ```

7. Run the SonarQube Scanner: Now we are ready for the `sonar-scanner` command we saved earlier, let's run it (inside the `vulnerable_flask_app` directory), your token will be different and unique to your project:

    ```bash
    sonar-scanner \
    -Dsonar.projectKey=Vulnerable-Flask-App \
    -Dsonar.sources=. \
    -Dsonar.host.url=http://sonarqube-container:9000 \
    -Dsonar.token=sqp_34ac955bcce21c2a6d3d8285325f6ee8b5bd53d8 # Replace this!
    ```

8. Review SonarQube findings: Once the scan is complete, navigate to your project in the SonarQube web interface at [localhost:9000](http://localhost:9000). We should see something similar to this:

    ![Review SonarQube Scanner results part 1 of 3.](/imgs/review_sonarqube_scanner_results.webp)

    After clicking on the project and navigating to the `Issues` tab, we see:

    ![Review SonarQube Scanner results part 2 of 3.](/imgs/review_sonarqube_scanner_results_2.webp)

    After clicking on the `Don't disclose "Flask" secret keys.` issue, it is worth spending some time going through the following tabs, especially the `How to fix it?` one:
    ![Review SonarQube Scanner results part 3 of 3.](/imgs/review_sonarqube_scanner_results_3.webp)

For now, let's not make any changes to our Flask app's code.

### Security Hotspots

![Review SonarQube Scanner results part 1 of 2.](/imgs/sonarqube_security_hotspots.webp)

It's important to distinguish between `Security Hotspots` and `Issues` in SonarQube. Hotspots are potential security-sensitive pieces of code that require manual review to determine if they are actual vulnerabilities. Issues, on the other hand, are code patterns that SonarQube has confidently identified as security flaws based on its rules. By clicking on each security hotspot and then the `Review` button, you should see the following pop-up:

![Review SonarQube Scanner results part 2 of 2.](/imgs/sonarqube_security_hotspots_2.webp)

This concludes our SAST endeavor for now, soon we will see how to integrate SonarQube into GitHub Actions.

## Apply SCA with `pip-audit`

[`pip-audit`](https://pypi.org/project/pip-audit/) is a tool for auditing Python environments for security vulnerabilities. It checks your installed packages and their dependencies against known vulnerability databases, providing a report of any identified issues.

- Install and run `pip-audit`. You may install pip-audit globally on your system. For this tutorial, we'll run it inside our Docker container.

    ```bash
    # Find the name of our Flask App running container
    docker ps

    # Open an interactive shell in the running container
    docker exec -it <container_id_or_name> /bin/bash

    # Install and run `pip-audit`
    pip install pip-audit
    pip-audit -r requirements.txt
    ```

- We should see output similar to this:

    ```bash
    Found 8 known vulnerabilities in 2 packages
    Name     Version ID                  Fix Versions
    -------- ------- ------------------- ------------
    flask    2.0.0   PYSEC-2023-62       2.2.5,2.3.2
    werkzeug 2.0.3   PYSEC-2022-203      2.1.1
    werkzeug 2.0.3   PYSEC-2023-58       2.2.3
    werkzeug 2.0.3   PYSEC-2023-57       2.2.3
    werkzeug 2.0.3   PYSEC-2023-221      2.3.8,3.0.1
    werkzeug 2.0.3   GHSA-2g68-c3qc-8985 3.0.3
    werkzeug 2.0.3   GHSA-f9vj-2wh5-fj8j 3.0.6
    werkzeug 2.0.3   GHSA-q34m-jh98-gwm2 3.0.6
    ```

    These IDs allow us to look up more detailed information about the vulnerability in security databases, e.g. [`PYSEC-2023-62`](https://deps.dev/advisory/osv/PYSEC-2023-62). We typically mitigate these vulnerabilities by updating vulnerable packages to fixed versions, (rebuilding the application e.g. Docker image, ) and re-scanning to confirm resolution.

    Terminate the interactive pseudo-TTY session (`-it`) with `exit` or `Ctrl+D`.

Don't make any changes to the Flask app's code if you plan to also follow the GitHub Actions section below.

## (Optional) Integrate with GitHub Actions

To automate these security checks, we can integrate SonarQube and `pip-audit` into a [GitHub Actions Workflow](/blog/github-actions-tekton-step-1-your-first-github-actions-workflow) to automatically run the security scans on each push, among [many other triggers](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows).

### Set up the SonarQube Action

1. If you haven't already, [initialize a local git repository](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github#initializing-a-git-repository) outside of the `vulnerable_flask_app` directory and [push it to a new public repository](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github#importing-a-git-repository-with-the-command-line) on your GitHub account, e.g. [`sast-sca-dast-demo`](https://github.com/pandelig/sast-sca-dast-demo).
2. Go to [GitHub Marketplace](https://github.com/marketplace), select `Actions`->`All Actions` from the list on the left and search for `sonarqube`:

    ![GitHub Marketplace SonarQube action search.](/imgs/github_marketplace_sonarqube_action.webp)

3. Click on the `Official SonarQube Scan` action:

    ![GitHub Marketplace SonarQube action.](/imgs/github_marketplace_sonarqube_action_2.webp)

    This is the action we will use.

4. This time we will choose the [SonarQube Cloud Option](https://www.sonarsource.com/products/sonarcloud/) by creating an account and logging in.
5. Go to `Projects` and select `Analyze new project`:

    ![SonarQube Cloud projects.](/imgs/sonarqube_cloud.webp)
    ![SonarQube Cloud analyze new project.](/imgs/sonarqube_cloud_2.webp)

    Give SonarQube access to the public GitHub repository you created earlier or to all your repositories if you prefer.

6. We will be asked to create a SonarQube Cloud organization, so let's do that:

    ![Create an organization on SonarQube Cloud.](/imgs/sonarqube_cloud_3.webp)

    Select the `Free` plan.

7. Select our `sast-sca-dast-demo` to create a new project from. For `Set up project for Clean as You Code` let's select `Number of Days`:

    ![Set up project, for Clean as You Code select Number of Days.](/imgs/sonarqube_cloud_4.webp)

8. After a couple of seconds, the analysis of our repository should be completed. If we browse the `Issues` and `Security Hotspots`, we may notice differences from when we ran the analysis locally. For example, more issues were identified here, i.e. issues with our `/hello` and `/execute` routes:

    ![SonarQube Cloud analysis issues identified.](/imgs/sonarqube_cloud_5.webp)

9. Disable `Automatic Analysis`, from `Administration`->`Analysis Method`:

    ![SonarQube Cloud Analysis Method option from the Administration menu.](/imgs/sonarqube_cloud_9.webp)

    Otherwise we will get an error while running the workflow:

    ```text
    You are running CI analysis while Automatic Analysis is enabled. Please consider disabling one or the other.
    ```

10. We will soon need to use the Project and Organization keys that can be found under `Information`:

    ![SonarQube Cloud project information.](/imgs/sonarqube_cloud_6.webp)

11. Generate a Security Token after going to `My Account` from the top right of the screen:

    ![Generate a SonarQube Cloud token.](/imgs/sonarqube_cloud_7.webp)

12. Store the token as a GitHub Secret. Go to your GitHub repository's `Settings`->`Secrets and variables`->`Actions`:

    ![Store the SonarQube Cloud token as a GitHub repository Secret.](/imgs/sonarqube_cloud_8.webp)

### Create the Workflow

After creating the workflow file, our project's structure is:

```bash
.
├── .github
│   └── workflows
│       └── sast_sca_scan.yml
└── vulnerable_flask_app
    ├── app.py
    ├── Dockerfile
    └── requirements.txt
```

`.github/workflows/sast_sca_scan.yml`:

```yaml
name: SAST & SCA Scan

on: 
  push:
    branches: [ main ] # Runs on pushes to the main branch
  workflow_dispatch: # Allows manual triggering from the Actions tab

jobs:
  # Job ID (can be anything descriptive)
  sast_sca_checks:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          # Shallow clones can cause SonarQube to miss changes in files.
          # Fetch all history for accurate analysis.
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.9'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r vulnerable_flask_app/requirements.txt

      - name: Run SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@v5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.organization=pandelig-1
            -Dsonar.projectKey=pandelig_sast-sca-dast-ports-demo
            -Dsonar.sources=vulnerable_flask_app

      - name: SonarQube Quality Gate check
        uses: sonarsource/sonarqube-quality-gate-action@v1
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: Run pip-audit
        # This step will run even if the previous SonarQube Quality Gate check step fails
        if: always()
        run: |
          pip install pip-audit
          pip-audit -r vulnerable_flask_app/requirements.txt
```

For a more information regarding the [workflow syntax, you may refer here](/blog/github-actions-tekton-step-1-your-first-github-actions-workflow#workflow-file---core-concepts) and regarding the specifics of an action we are using, here: [Checkout](https://github.com/marketplace/actions/checkout), [Setup Python](https://github.com/marketplace/actions/setup-python), [SonarQube Scan](https://github.com/marketplace/actions/official-sonarqube-scan), [SonarQube Quality Gate](https://github.com/marketplace/actions/sonarqube-quality-gate-check).

The workflow will automatically run on each push, performing the SAST and SCA scans. You can view the results in the `Actions` tab of your repository.

SonarQube Quality Gate behavior may change by going to the Organization the project belongs to, from the top right of the SonarQube Cloud screen, and then selecting the `Quality Gates` tab.

## (Optional) Explore Further

- **Fix the Vulnerabilities:** Once you've completed this tutorial series, come back to this article and try to fix the vulnerabilities. Re-run the SAST and SCA scans (both locally and in your GitHub Actions workflow) to verify that the issues are resolved. For SCA / `pip-audit` / `requirements.txt`, the [solution is quite simple](https://github.com/pandelig/sast-sca-dast-demo/blob/e3db1df1d1dfc325f70e336d40e80f617e8fc32a/vulnerable_flask_app/requirements.txt).
- **Advanced `pip-audit` usage:** Look into the various command-line options for `pip-audit`, including different reporting formats or integrating with specific vulnerability sources.
- **Master SonarQube:** SonarQube is a powerful platform with many features beyond basic scanning. The [SonarQube documentation](https://docs.sonarsource.com/) is a great resource.
- **Dive Deeper into SAST:** Research other popular SAST tools like [CodeQL](https://codeql.github.com/), [Checkmarx](https://www.checkmarx.com/), or [Fortify](https://www.opentext.com/products/static-application-security-testing). Understand their differences, supported languages, and rule sets.
- Learn about vulnerability databases like the [National Vulnerability Database (NVD)](https://nvd.nist.gov/) and [Open Source Vulnerabilities (OSV)](https://osv.dev/).

## Wrapping Up Step 1

Amazing job! In this step, we've taken our first steps into application security by building a simple Flask application with intentional vulnerabilities. We then used SAST (SonarQube) and SCA (`pip-audit`) to identify vulnerabilities. Finally, we integrated these checks into a basic CI/CD pipeline using GitHub Actions, demonstrating how security can be automated early in the development process.

In the next step, we'll [dive into Dynamic Application Security Testing (DAST)](/blog/security-in-devops-step-2-uncovering-runtime-vulnerabilities-with-dast) to uncover runtime vulnerabilities in our containerized application!
