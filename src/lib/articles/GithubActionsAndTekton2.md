---
slug: "github-actions-tekton-step-2-your-first-tekton-pipeline"
date: "15 Apr 2025"
date_updated: ""
tags: ["tutorial", "ci/cd", "github-actions", "tekton"]
title: "CI/CD Getting Started with GitHub Actions and Tekton - Step 2: Your First Tekton Pipeline"
meta_description: "Step-by-step guide by Pantelis Deligiannidis to creating your first Tekton pipeline. Discover flexible, vendor-neutral CI/CD automation on Kubernetes, building on GitHub Actions knowledge."
---

1. [Step 1: Your First GitHub Actions Workflow](/blog/github-actions-tekton-step-1-your-first-github-actions-workflow)
2. (You are here) Step 2: Your First Tekton Pipeline

In the previous article we explored GitHub Actions and built a simple CI Workflow. However, you might need a more flexible, vendor-neutral, and Kubernetes-native CI/CD solution. Enter Tekton.

In this article, we'll take the same simple Python project from Part 1 and build a similar linting pipeline using Tekton. We'll explore its core concepts and see how its approach differs from GitHub Actions.

## Prerequisites

Many and scary 👻:

* Kubernetes (K8s) Cluster: We will be using [Minikube](https://minikube.sigs.k8s.io/docs/start/) locally, other options include [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) and cloud provider clusters (GKE, EKS, AKS, etc.).
* `kubectl`: The Kubernetes command-line tool. You may skip this step if you plan to follow along with Minikube. [Installation Guide](https://kubernetes.io/docs/tasks/tools/install-kubectl/).
* Tekton Pipelines: [Installation Guide](https://tekton.dev/docs/pipelines/install/).
* Tekton Dashboard: [Installation Guide](https://github.com/tektoncd/dashboard/blob/main/docs/install.md#installing-tekton-dashboard-on-kubernetes).
* `tkn` CLI: The Tekton command-line interface makes interacting with Tekton resources easier. [Installation Guide](https://tekton.dev/docs/cli/).
* Our Simple Python Project: The code from the first article, available in your public git repository.

### Set up the Cluster

1. Install Minikube (Linux) and start the cluster:

    ```bash
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb
    sudo dpkg -i minikube_latest_amd64.deb
    minikube start
    ```

2. Get `kubectl` through minikube and set an alias:

    ```bash
    minikube kubectl -- get po -A
    alias kubectl="minikube kubectl --"
    minikube dashboard # Spend a couple of seconds to check it out
    ```

    Consider adding the `alias` command to your `~/.bashrc`.

3. Install Tekton Pipelines:

    ```bash
    kubectl apply --filename https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml
    ```

4. Install and run Tekton Dashboard:

    ```bash
    kubectl apply --filename https://storage.googleapis.com/tekton-releases/dashboard/latest/release.yaml
    kubectl port-forward -n tekton-pipelines service/tekton-dashboard 9097:9097
    ```

    You can now open the Dashboard in your browser at [localhost:9097](http://localhost:9097).

5. Install `tkn`:

    ```bash
    curl -LO https://github.com/tektoncd/cli/releases/download/v0.40.0/tektoncd-cli-0.40.0_Linux-64bit.deb
    sudo dpkg -i ./tektoncd-cli-0.40.0_Linux-64bit.deb
    ```

## Core Tekton Concepts

1. `Pipeline`: Defines the overall structure of your CI/CD process. It orchestrates multiple `Tasks`, specifying their execution order, conditions, and how they share data using `Workspaces`.
      * *Further Learning:* [Tekton Pipelines](https://tekton.dev/docs/pipelines/pipelines/)
2. `Task`: The fundamental building block. A `Task` defines a sequence of `Steps` that run inside containers within a Kubernetes Pod.
      * *Further Learning:* [Tekton Tasks](https://tekton.dev/docs/pipelines/tasks/)
3. `Step`: Similar to a GitHub Actions step, it's a specific command or script run within a container defined in a `Task`. Each step uses a specific container image.
4. `Workspace`: This is crucial. It defines how different `Tasks` within a `Pipeline` share data (like source code). Tekton maps `Workspaces` to actual Kubernetes storage mechanisms (like `PersistentVolumeClaim`, `emptyDir`, `ConfigMap`) when a `Pipeline` runs.
      * *Further Learning:* [Tekton Workspaces](https://tekton.dev/docs/pipelines/workspaces/)
5. `PipelineRun` / `TaskRun`: These are the actual execution instances. A `PipelineRun` executes a specific `Pipeline`, binding `Workspaces` to actual volumes and providing necessary parameters. A `TaskRun` executes a specific `Task` with defined inputs.
      * *Further Learning:* [Tekton PipelineRuns](https://tekton.dev/docs/pipelines/pipelineruns/), [Tekton TaskRuns](https://tekton.dev/docs/pipelines/taskruns/)

### (Optional) GitHub Actions vs. Tekton Terminology

| GH Actions | Tekton                     | Description                                                                 |
| :--------------------- | :--------------------------------- | :-------------------------------------------------------------------------- |
| Workflow | Pipeline | The overall definition of your CI/CD process, ordering jobs/tasks.          |
| Job | Task | A sequence of steps executed within a specific environment/container.       |
| Step | Step | An individual command or script executed within a Task/Job.                 |
| Action | Task  / ClusterTask  | Reusable, parameterized units of work. Tekton tasks can reside within your namespace (`Task`) or within the cluster (`ClusterTask`).   |
| Runner | Kubernetes Pod | The execution environment where steps run. Tekton uses K8s Pods by default. |
| Artifacts                     | Workspace/PersistentVolumeClaim | Files produced by jobs/tasks. |
| Workflow Run | PipelineRun / TaskRun | An instance of a Workflow/Pipeline/Task execution.                          |
| Event Trigger (`on:`)| Trigger / EventListener | Separate component in Tekton for reacting to events (e.g., Git pushes).     |

## Define the Tekton Tasks

We need two main tasks: fetching the source code and linting it.

1. If you haven't already, clone the repository we created in the [previous step](/blog/github-actions-tekton-step-1-your-first-github-actions-workflow#set-up-a-simple-project).
2. Create a `tekton` directory, resulting in the following structure:

```text
├── .github
│   └── workflows
│       └── ci-workflow.yml
├── LICENSE
├── README.md
├── app.py
├── requirements.txt
└── tekton
```

### Task 1: Fetch

Tekton Hub is a catalog of pre-built, reusable Tasks. We'll use the standard `git-clone` task. After going to [Tekton Hub](https://hub.tekton.dev/), searching for it, and clicking on the `Install` button, you will see 2 options: use `kubectl` or `tkn`. Let's use `tkn`:

1. Install the [`git-clone`](https://hub.tekton.dev/tekton/task/git-clone) task from the Hub onto your cluster:

    ```bash
    tkn hub install task git-clone
    ```

    This task requires two inputs: the URL of a git repository to clone, provided with the `url` parameter, and a workspace named `output`. Some [other useful tekton hub commands](https://docs.redhat.com/en/documentation/openshift_container_platform/4.9/html/cli_tools/pipelines-cli-tkn#basic-syntax) are:

    * Search hub: `tkn hub search [--kinds task] <query>`
    * Get info: `tkn hub info task <task-name>`

### Task 2: Lint

For the linting process, let's create a custom `Task`. Create a file named `tekton/python-lint-task.yaml`:

```yaml
# tekton/python-lint-task.yaml
apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: python-lint
spec:
  description: "This task clones a repository, installs dependencies, and runs flake8 linter."

  # Declares the need of a workspace named `source`, where the source code will be provided
  workspaces:
    - name: source
      description: The workspace containing the source code.

  # Define input parameters (optional, but good practice)
  params:
    - name: python-image
      description: The python image to use
      type: string
      default: python:3.10-slim # Use a slim base image

  # Define the steps to execute
  steps:
    - name: run-linter
      image: $(params.python-image) # Possible due to Tekton's built-in variable substitution mechanism
      workingDir: $(workspaces.source.path) # Tells the step to run inside the directory provided by the `source` workspace.
      script: |
        #!/usr/bin/env bash
        set -e # Exit immediately if a command exits with a non-zero status.
        echo "--------- INSTALLING DEPENDENCIES ---------"
        echo "Current directory: $(pwd)" 
        echo "Listing directory contents with 'ls -la':"
        ls -la
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        echo "-------------------------------------------"
        echo "--------- RUNNING FLAKE8 LINTER -----------"
        flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
        flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
        echo "-------------------------------------------"
```

* Notice how the step specifies a container `image`, this is required for all steps. Whereas all steps within a single GitHub Actions `job` [run on the same runner environment](/blog/github-actions-tekton-step-1-your-first-github-actions-workflow#workflow-file---core-concepts) (`ubuntu-latest`).
  * This is why here we don't break the step into 2.
* If `workingDir` is omitted, each step's command will run in the default working directory defined within the container image itself, but that's not where `requirements.txt` or `app.py` get cloned into.

## Define the Tekton Pipeline

Now, let's create a `Pipeline` that wires these two tasks together. Create a file named `tekton/ci-pipeline.yaml`:

```yaml
# tekton/ci-pipeline.yaml
apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: simple-ci-pipeline
spec:
  description: "Pipeline to clone a Python repo and lint the code."

  # Declare the workspace needed by the ENTIRE pipeline
  workspaces:
    - name: shared-data
      description: Workspace for source code shared between tasks.

  # Declare parameters the pipeline expects
  params:
    - name: repo-url
      type: string
      description: The Git repository URL to clone.

  # Define the sequence of tasks
  tasks:
    # Task 1: Fetch the source code
    - name: fetch-repo
      taskRef:
        name: git-clone # Reference the installed git-clone task
      params:
        - name: url
          value: $(params.repo-url) # Pass pipeline param to task param
      workspaces:
        - name: output # The git-clone task calls its output workspace 'output'
          workspace: shared-data # Map it to the pipeline's 'shared-data' workspace

    # Task 2: Run the linter (runs AFTER fetch-repo completes successfully)
    - name: lint-code
      runAfter: ["fetch-repo"] # Explicitly state dependency
      taskRef:
        name: python-lint # Reference our custom lint task
      workspaces:
        - name: source # The python-lint task calls its input workspace 'source'
          workspace: shared-data # Map it to the pipeline's 'shared-data' workspace
      # Optionally pass parameters to the lint task if needed, e.g.:
      # params:
      #   - name: python-image
      #     value: python:3.11-slim
```

## Define the PersistentVolumeClaim

Create a file named `tekton/ci-pvc.yaml`:

```yaml
# tekton/ci-pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pipeline-pvc
spec:
  accessModes:
    - ReadWriteOnce # The volume can be mounted as read-write by a single Worker Node
  resources:
    requests:
      storage: 100Mi
```

A PVC is a request for storage by the user. We are specifically asking for `100Mi` (100 MB) of storage, which will be used to share the cloned repository between the `fetch-repo` and `lint-code` tasks in our Pipeline.

## Define the Tekton PipelineRun

Tasks and Pipelines are *templates*. To execute them, we need a `PipelineRun`. Create a file named `tekton/ci-pipelinerun.yaml`:

```yaml
# tekton/ci-pipelinerun.yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  # Generate a unique name for each run automatically
  generateName: simple-ci-run-
spec:
  # Reference the Pipeline we want to run
  pipelineRef:
    name: simple-ci-pipeline

  # Provide values for the Pipeline's parameters
  params:
    - name: repo-url
      value: https://github.com/YOUR_USERNAME/github-actions-tekton-demo.git # <-- CHANGE THIS

  # Define HOW the pipeline's workspace(s) will be provisioned
  workspaces:
    - name: shared-data # Matches the workspace name in the Pipeline yaml
      persistentVolumeClaim:
        claimName: pipeline-pvc # Matches the name in the PersistentVolumeClaim yaml

  # Optional: Define service account if tasks need K8s permissions
  # serviceAccountName: tekton-pipelines-executor
```

* `generateName`: Creates unique names for each run, e.g. `simple-ci-run-abcde`.
* `params`: Provides the actual values for `repo-url`, remember to change this to your repository URL. Public visibility of the repository is a requirement in our case.
* `workspaces`: Binds the workspace declared in the `Pipeline` to a specific Kubernetes volume type. This single volume is then mounted into each step's container within the Task's Pod, regardless of the different image used by each step.

## Apply and Monitor

1. From the root of our project, apply the Task, Pipeline, and PipelineRun:

    ```bash
    # Apply the custom task definition
    kubectl apply -f tekton/python-lint-task.yaml
    # kubectl get tasks

    # Apply the pipeline definition
    kubectl apply -f tekton/ci-pipeline.yaml
    # kubectl get pipelines

    # Apply the pvc definition
    kubectl apply -f tekton/ci-pvc.yaml
    # kubectl get pvc

    # Apply the PipelineRun to START the execution
    kubectl create -f tekton/ci-pipelinerun.yaml
    # kubectl get pipelineruns
    ```

2. Monitor the Execution:

      * Using `tkn` CLI (easier with prettier output):

        ```bash
        # List PipelineRuns
        tkn pipelinerun list

        # Describe a PipelineRun (shows tasks, status, etc.)
        tkn pr describe <pipelinerun-name>

        # Follow logs for the latest PipelineRun
        tkn pr logs -f --last

        # List TaskRuns
        tkn taskrun list
        ```

        Note that each time a `Task` is executed within a `PipelineRun`, a `TaskRun` resource is created.

      * Using `kubectl`:

        ```bash
        # List PipelineRuns and their status (True=Success, False=Failed, Unknown=Running)
        kubectl get pipelineruns

        # Get details of a specific PipelineRun (replace <pipelinerun-name> with the generated name)
        kubectl get pipelinerun <pipelinerun-name> -o yaml

        # Follow the logs of a specific PipelineRun
        # Each task has a pod, each step has a container within the pod
        kubectl get pods
        kubectl logs <pod-name-for-fetch-task> -c step-clone -f
        kubectl logs <pod-name-for-lint-task> -c step-run-linter -f

        # List the TaskRuns created by the PipelineRun
        kubectl get taskruns
        ```

        To get the names of the containers within a pod, run:

        ```bash
        kubectl get pod <pod-name> -o yaml | grep "name: step-" | uniq
        ```

3. Clean up:

    ```bash
    # To delete all pipelineruns and taskruns
    tkn pipelinerun delete --all 

    # To delete pvcs
    kubectl get pvc
    kubectl delete pvc <pvc-name>
    ```

### (Optional) Use the Dashboards

* Minikube Dashboard:

    ```bash
    # Should open a new browser tab
    minikube dashboard
    ```

* Tekton Dashboard:

    ```bash
    kubectl port-forward -n tekton-pipelines service/tekton-dashboard 9097:9097
    # Enter 127.0.0.1:9097 in a new browser tab
    ```

## (Optional) Explore Further

* Cloning Private Repositories: Learn how to configure access to private Git repositories within Tekton by creating Kubernetes Secrets for authentication (SSH keys or tokens) and referencing them in your `PipelineRun` and `git-clone` task. *Further Learning:* [Configuring authentication for Git](https://tekton.dev/docs/pipelines/auth/#configuring-authentication-for-git).
* Tekton Triggers: Explore how to automatically trigger your `PipelineRun` based on events like Git pushes or API calls. This functionality is not built-in and requires installing Tekton Triggers separately *Further Learning:* [Triggers and EventListeners](https://tekton.dev/docs/triggers/).
* Official Tutorials: Work through more examples in the [official Tekton documentation](https://tekton.dev/docs/getting-started/).
* More Complex Pipelines: Build pipelines with parallel tasks, conditional execution, and artifact management.

Would you like to see a tutorial on one of these? Let me know.

## Final Words

[Repository with final code](https://github.com/pandelig/github-actions-tekton-demo)

Good job! You've now:

* Built a basic CI pipeline using Tekton, replicating the functionality from our GitHub Actions example but using a Kubernetes-native approach.
* Learned about Tekton's core components (`Task`, `Pipeline`, `Workspace`, `PipelineRun`) and how they interact.

While GitHub Actions offers seamless integration with GitHub, Tekton runs on any K8s, excellent for complex, multi-cloud/hybrid pipelines, and defining CI/CD logic within Kubernetes. Understanding both gives you valuable tools for automating workflows in different environments.

I hope it was fun following along!
