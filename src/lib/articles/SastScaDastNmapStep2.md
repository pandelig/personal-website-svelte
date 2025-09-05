---
slug: "security-in-devops-step-2-uncovering-runtime-vulnerabilities-with-dast"
date: "04 May 2025"
date_updated: ""
tags: ["tutorial", "security", "docker", "owasp-zap", "ci/cd", "github-actions", "flask"]
title: "Security in DevOps - Step 2: Uncovering Runtime Vulnerabilities with DAST"
meta_description: "Learn Dynamic Application Security Testing (DAST) with OWASP ZAP via Docker and GitHub Actions. Pantelis Deligiannidis guides you to find runtime vulnerabilities in a Flask app. Part 2 of Security in DevOps."
---

1. [Step 1: Fortifying the Foundation with SAST and SCA](/blog/security-in-devops-step-1-fortifying-the-foundation-with-sast-and-sca)
2. (You are here) Step 2: Uncovering Runtime Vulnerabilities with DAST

In the previous article, we examined the blueprints (SAST) and the materials (SCA) of our vulnerable Flask application. Now, it's time to test the actual structure after it's been built, with *Dynamic Application Security Testing* (DAST).

- **DAST:** Similar to a building inspector testing a finished house, DAST tests a *running* application by sending requests and observing responses to identify vulnerabilities like injection flaws (SQL Injection, Command Injection), broken authentication, and misconfigurations.

In this second step of our series, we'll focus on using a powerful and popular DAST tool, [OWASP ZAP](https://www.zaproxy.org/), to find vulnerabilities in our containerized Flask application.

## Run the Flask App

We will start the Flask application container after creating a network for it, so that [OWASP ZAP will be able to see it](https://www.zaproxy.org/docs/docker/about/#scanning-an-app-running-in-another-docker-container) by being under the same network:

```bash
docker network create zap-network
```

If you haven't been following along, the app's code is [available on github](https://github.com/pandelig/sast-sca-dast-demo):

```bash
git clone https://github.com/pandelig/sast-sca-dast-demo
cd sast-sca-dast-demo/vulnerable_flask_app/
docker build -t my-vulnerable-flask-app .
```

Let's start the container:

```bash
docker run -d --name flask-app-container -p 5000:5000 --network zap-network my-vulnerable-flask-app
```

Make sure it's running:

```bash
docker ps
```

```bash
CONTAINER ID   IMAGE                     COMMAND           CREATED          STATUS          PORTS                                         NAMES
e16a2d953b0b   my-vulnerable-flask-app   "python app.py"   19 seconds ago   Up 42 minutes   0.0.0.0:5000->5000/tcp, [::]:5000->5000/tcp   flask-app-container
```

You should be able to access the running application at [localhost:5000](http://localhost:5000). In case of trouble, you can always refer to the [useful Docker commands](/blog/security-in-devops-step-1-fortifying-the-foundation-with-sast-and-sca#optional-useful-docker-commands) we have mentioned.

## Set Up  OWASP ZAP GUI

OWASP ZAP offers a user-friendly graphical interface, which is excellent for understanding how the tool works and exploring its features manually. We'll [run the ZAP GUI using Docker](https://www.zaproxy.org/docs/docker/webswing/) to keep our system clean:

```bash
docker run -u zap -p 8080:8080 -p 8090:8090 -i --network zap-network ghcr.io/zaproxy/zaproxy:stable zap-webswing.sh
```

This might take a moment. Once it starts, visit [`localhost:8080/zap`](http://localhost:8080/zap) to see the OWASP ZAP splash screen followed by the main application window:

![Zap in the browser.](/imgs/zap_in_the_browser.webp)

Let's select `No, I do not want to persist this session at this moment in time`->`Start` in the first pop-up and just `Close` the second, `Manage Add-ons`, pop-up.

### Running a Scan

Under the `Quick Start` tab, select `Automated Scan`. Enter the URL of our running application (`http://flask-app-container:5000`) in the `URL to attack` field and click the `Attack` button.

![Zap in the browser automated scan.](/imgs/zap_in_the_browser_2.webp)

We are able to use the Flask app's container name in the URL because both containers are under the same network (`zap-network`).

After the scan is completed, we should see the following `Progress` message:

![Zap in the browser scan is completed message.](/imgs/zap_in_the_browser_3.webp)

And in the `Sites` tree on the left we should see that all our routes have been discovered:

![Zap in the browser sites list.](/imgs/zap_in_the_browser_4.webp)

If not, re-run the Automated Scan but select `Always` for `Use ajax spider`.

At the bottom, under the `Alerts` tab, we should see all the issues of various Risk Levels that have been discovered:

![Zap in the browser alerts.](/imgs/zap_in_the_browser_5.webp)

By clicking on an alert, we see more information about it, as well as suggested solutions! As expected, the Command Injection vulnerability was discovered and marked as High Risk. Explore the alerts, read their descriptions, and understand the evidence ZAP provides. This is crucial for learning how to identify and prioritize vulnerabilities.

## (Optional) Integrate with GitHub Actions

Running manual scans with the GUI is useful for exploration and debugging, but for continuous security, we need to automate DAST scans in [our CI/CD pipeline](/blog/github-actions-tekton-step-1-your-first-github-actions-workflow). We can use [OWASP ZAP's command-line capabilities](https://www.zaproxy.org/docs/docker/about/#packaged-scans)  within a GitHub Actions workflow. Alternatively, we can use [GitHub Actions directly](https://www.zaproxy.org/docs/docker/about/#github-actions).

Here we will choose the first option (CLI). Create a new workflow file `.github/workflows/dast_scan.yml`:

```yaml
name: DAST Scan

on:
  push:
    branches: [ main ] # Runs on pushes to the main branch
  workflow_dispatch: # Allows manual triggering from the Actions tab

jobs:
  dast_checks:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Create Docker Network
        run: docker network create zap-network

      - name: Build Flask Docker image
        run: docker build -t my-vulnerable-flask-app ./vulnerable_flask_app

      # Run the built container and map a port to the host
      - name: Run Flask Docker container
        run: docker run -d --name flask-app-container -p 5000:5000 --network zap-network my-vulnerable-flask-app

      # Wait for the app to start (sleep is simple, a healthcheck loop is better)
      - name: Wait for app to start
        run: sleep 10 # Adjust if needed

      # Create a directory for ZAP reports on the runner
      - name: Create ZAP reports directory
        run: mkdir ${{ github.workspace }}/zap_reports

      # This grants write permissions to all users, ensuring the container user can write
      - name: Set ZAP reports directory permissions
        run: chmod 777 ${{ github.workspace }}/zap_reports

      - name: Run OWASP ZAP Full Scan
        # Use the full scan script, read more about the command and its flags here: https://www.zaproxy.org/docs/docker/full-scan/#usage
        run: |
          docker run -t --network zap-network -v ${{ github.workspace }}/zap_reports:/zap/wrk/:rw ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t http://flask-app-container:5000 -I -j -r report.html -J report.json -x report.xml -a    

      # https://github.com/marketplace/actions/upload-a-build-artifact
      - name: Upload ZAP reports
        uses: actions/upload-artifact@v4
        # This step will run even if the previous ZAP scan step fails
        if: always()
        with:
          name: zap-reports
          # Path on the runner where the reports were written via the volume mount
          path: ${{ github.workspace }}/zap_reports/
          retention-days: 5
```

The [term `runner` is explained here](/blog/github-actions-tekton-step-1-your-first-github-actions-workflow#workflow-file---core-concepts), in case it's unfamiliar.

If you now push your project:

```bash
.
├── .github
│   └── workflows
│       ├── dast_scan.yml
│       └── sast_sca_scan.yml
└── vulnerable_flask_app
    ├── app.py
    ├── Dockerfile
    └── requirements.txt
```

You should see a [successful `DAST Scan`](https://github.com/pandelig/sast-sca-dast-demo/actions/runs/14808179379). If you click on the `dast_checks` job:

![DAST workflow success.](/imgs/dast_workflow_success.webp)

You will see how the output of the `Run OWASP ZAP Full Scan` and `Upload ZAP reports` steps looks like:

```bash
...
WARN-NEW: Remote OS Command Injection [90020] x 1 
	http://flask-app-container:5000/execute?cmd=cat+%2Fetc%2Fpasswd (200 OK)
FAIL-NEW: 0	FAIL-INPROG: 0	WARN-NEW: 10	WARN-INPROG: 0	INFO: 0	IGNORE: 0	PASS: 134
```

```bash
...
Finalizing artifact upload
Artifact zap-reports.zip successfully finalized. Artifact ID 3054807541
Artifact zap-reports has been successfully uploaded! Final size is 47466 bytes. Artifact ID is 3054807541
Artifact download URL: https://github.com/pandelig/sast-sca-dast-ports-demo/actions/runs/14808179379/artifacts/3054807541
```

Notice that despite all the warnings, the ZAP Scan step succeeds, this is [because of the `-I` flag](https://www.zaproxy.org/docs/docker/full-scan/#usage) we used, which may be omitted.

After clicking on the download URL, we get the `.zip` with all the reports, here's how part of the [(quite extensive) html report](https://pandelig.com/other/zap_html_report.html) looks like:

![ZAP HTML report part 1 of 2.](/imgs/zap_html_report.webp)

![ZAP HTML Report part 2 of 2.](/imgs/zap_html_report_2.webp)

Similarly to the GUI version of ZAP, more information about each issue is available in the report, as well as suggested solutions.

## (Optional) Explore Further

- **Fix the found vulnerabilities:** The most important step after identifying vulnerabilities is to fix them! OWASP ZAP provides detailed information for each alert, take the time to review these recommendations and modify the `app.py` code to address the issues.
- **Configuring ZAP:** Learn how to configure ZAP for specific needs, including authenticated scans (if your application requires login), custom scripts, and different scan policies for more in-depth testing. The [OWASP ZAP Documentation](https://www.zaproxy.org/docs/) is an excellent resource.
- **Research other DAST tools:** While ZAP is popular and open-source, many other DAST tools exist, both open-source and commercial. Research tools like [Burp Suite](https://portswigger.net/burp), [Nikto](https://github.com/sullo/nikto), and commercial solutions. Each has its strengths and weaknesses.
- **Interactive Application Security Testing (IAST):** Learn about IAST tools. These tools combine elements of SAST and DAST by analyzing code execution from within the running application, offering insights that traditional SAST or DAST might miss.
- **Network scanning with Nmap:** Before attacking an application, attackers often scan the network to discover open ports and running services – the potential entry points. Tools like [Nmap](https://nmap.org/) are fundamental for this reconnaissance phase, helping you understand the network-level attack surface of your systems.

What security topic would you like to dive into next? IAST, Nmap, or perhaps something else in the realm of DevSecOps? Let me know!

## Final Words

Congratulations for powering through! This article introduced you to DAST using OWASP ZAP's GUI and its integration into GitHub Actions. We've now covered key application security testing types: SAST, SCA, and DAST. This concludes our tutorial series on introducing key security testing methodologies in a DevOps context.

Integrating these practices into your CI/CD pipeline is a vital step towards building more secure applications from the start. Security isn't a one-time check, it's a continuous process.

Thank you for following along! The world of application security is vast and constantly evolving, with many more fascinating areas to explore. Keep learning and keep securing your applications!
