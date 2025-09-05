---
slug: "remote-debugging-on-gcp-ce-with-vscode"
date: "31 May 2025"
date_updated: ""
tags: ["tutorial", "gcp", "vscode", "docker"]
title: "Remote Debugging on Google Cloud Compute Engine with VS Code"
meta_description: "Pantelis Deligiannidis guides you through remote debugging on Google Cloud Compute Engine with VS Code SSH. Discover isolated development environments using Dev Containers and Docker for cloud-based projects."
---

Debugging is an essential part of the software development lifecycle. While local debugging is common, often our applications run in remote environments (e.g. when they require NVIDIA A100s), making traditional debugging challenging. Google Cloud Platform's Compute Engine (GCP CE) provides virtual machines, and Visual Studio Code (VS Code) offers powerful remote development capabilities.

This article will guide you step-by-step on how to leverage VS Code's debugging features to debug a simple Python script running directly on a GCP CE instance. We will cover establishing an SSH connection and configuring VS Code for remote debugging.

Additionally, we will explore how to set up a development environment inside a Docker container on the GCP CE instance using VS Code's Dev Containers extension. This provides an isolated and reproducible environment for development and debugging.

![Architecture of debugging a GCP CE with VS Code.](/imgs/gcp_ce_remote_debugging_with_vscode_architecture.webp)

## Prerequisites

Before you begin, ensure you have the following:

- [GCP account](https://cloud.google.com/): You'll need an active GCP account with billing enabled to create CE instances.
- [`gcloud` CLI installed](https://cloud.google.com/sdk/docs/install)
- [VS Code installed](https://code.visualstudio.com/)
- VS Code "Remote Development" extension pack: This pack includes "Remote - SSH" and "Dev Containers" which are crucial for this tutorial. Install it from the VS Code Extensions view (`Ctrl+Shift+X`) by searching for "Remote Development".

## Create a GCP CE Instance

Have a tab open at the [GCP Console](https://cloud.google.com/).

1. Create a project:
    - At the GCP Console search for "resources" in the search bar at the top, and select "Manage resources".
    - Click "Create project" and give a name to your project.
    ![Create a new GCP project.](/imgs/create_new_gcp_project.webp)
    - After clicking "Create", click "Select project" on the notification that pops on the top right.
2. Authenticate with `gcloud` CLI:
    - Open a terminal locally and run: `gcloud auth login`
    - To set your project, run: `gcloud config set project YOUR_PROJECT_ID`. To see your project's ID on the GCP Console, reveal the menu from the top-left and click on "Cloud overview" -> "Dashboard". For me, it is `remote-debugging-with-vscode`.
3. Create a new Compute Engine instance:
    - On the GCP Console, from the left side menu, navigate to "Compute Engine" -> "VM instances".
    - If you see the following, click "Enable" and wait for it to complete:
    ![Enable GCP Compute Engine API.](/imgs/enable_gcp_ce_api.webp)
    - Click "Create instance".
    - Give your instance a "Name", e.g. `my-debug-vm`, at the "Machine Configuration" tab.
    - For "Machine type", select `e2-medium (2 vCPU, 1 core, 4 GB memory)`. Lower specs may cause the CPU / RAM to max-out.
    - On the "OS and storage" tab, the defaults should be good enough:
    ![OS and storage for our GCP CE debug VM.](/imgs/os_and_storage_for_gcp_ce_debug_vm.webp)
    - On the "Data protection" tab, let's select "No backups" to avoid extra costs.
    - Click "Create".
    - Once the instance is running, note down its "Name", "Zone" and "External IP" address. We'll need them to connect via SSH.

## Create the Python Script

Now, let's get a simple Python script onto the newly created instance.

1. Connect to the GCP CE instance via SSH using `gcloud`. In the local terminal session you opened earlier for authentication, run:

    ```bash
    gcloud compute ssh my-debug-vm --zone YOUR_ZONE
    ```

    Replace `my-debug-vm` and `YOUR_ZONE` with the instance name and zone from the previous step.
2. Create a directory for the project:
    Once connected, run:

    ```bash
    mkdir my_debug_project && cd my_debug_project
    ```

3. Create a simple Python script:
    Use `nano` or `vim` to create a file named `my_script.py`:

    ```bash
    nano my_script.py
    ```

    Paste the following code into the file:

    ```python
    def calculate_sum(a, b):
        result = a + b
        print(f"The sum of {a} and {b} is: {result}")
        return result

    def multiply_numbers(x, y):
        product = x * y
        print(f"The product of {x} and {y} is: {product}")
        return product

    if __name__ == "__main__":
        num1 = 10
        num2 = 5
        total = calculate_sum(num1, num2)
        final_product = multiply_numbers(total, 2)
        print(f"Final calculated value: {final_product}")
    ```

    Save and exit the editor (`Ctrl+X` -> `Y` -> `Enter` for nano).

## Configure VS Code for Remote SSH Debugging

This is where the magic happens! We'll use the "Remote - SSH" extension to connect VS Code directly to the GCP CE instance.

1. Open VS Code on your local machine.
2. Click the green remote indicator icon (`><`) in the bottom-left corner of the VS Code window, or press `F1` and type "Remote-SSH: Connect to Host...".
3. Select "Add New SSH Host...".
4. Enter the SSH connection command: VS Code will prompt you to enter the SSH connection command. We will use a direct SSH command. Replace `YOUR_EXTERNAL_IP` with your instance's actual external IP.

    ```bash
    ssh -i ~/.ssh/google_compute_engine USERNAME@YOUR_EXTERNAL_IP
    ```

    - `USERNAME`: This is typically your Google account username (the part before `@gmail.com`) or the username shown when you connected via `gcloud compute ssh`.
    - `~/.ssh/google_compute_engine`: This is the default path where `gcloud` stores the SSH private key it generated. Ensure this path is correct. If you used a different method to create SSH keys, adjust this path accordingly.

    Press `Enter`.
5. When prompted "Which configuration file would you like to update?", choose the default: `/home/YOUR_USERNAME/.ssh/config`.
6. After adding the host, click the green remote indicator again, and this time select the newly added host. This will open a new VS Code window.
7. In the new VS Code window connected to your GCP instance, go to "File" -> "Open Folder..." and navigate to `/home/USERNAME/my_debug_project`. Click "OK".
8. Install the Python extension by going to the "Extensions" view, searching for "Python" and installing the "Python" extension, this should also install the "Python Debugger" extension.
    ![Searching for python VS Code extensions.](/imgs/install_python_vscode_extensions_on_gcp_ce.webp)

Notice that you have complete control on creating folders and files in the GCP CE instance through VS Code.

## Debug the Python Script

Now that VS Code is connected and the Python extension is installed, we can debug.

1. In the VS Code Explorer, open `my_script.py`.
2. Click in the gutter next to a line number (e.g. line 2: `result = a + b`) to set a red breakpoint.
3. Start debugging:
      - Go to the "Run and Debug" view (`Ctrl+Shift+D`).
      - Click the "Run and Debug" button.
      - VS Code will detect it's a Python file and suggest "Python File" as the debug configuration. Select it.
4. Observe the debugger: The script will start running on the GCP instance, and execution will pause at your breakpoint. You can now:
      - Inspect variables in the "Variables" pane.
      - Step over (F10), step into (F11), or step out (Shift+F11) of functions.
      - Continue execution (F5).
      - Use the Debug Console to evaluate expressions.

Congratulations! You are now debugging a Python script running on a GCP CE instance directly from your local VS Code environment.

## (Optional) Debugging in a Docker Container on GCP CE

This section builds upon the previous steps by introducing Docker and VS Code's Dev Containers extension for an even more isolated and reproducible development and debugging environment.

### Install Docker on the GCP CE Instance

Connect to the GCP CE instance via SSH again (using `gcloud compute ssh` or through VS Code's remote connection).

1. Update packages:

    ```bash
    sudo apt update && sudo apt upgrade -y # This may take some time
    ```

2. [Install Docker](https://docs.docker.com/engine/install/debian/#install-using-the-repository) make sure you also follow the [Linux postinstall](https://docs.docker.com/engine/install/linux-postinstall) steps under "Manage Docker as a non-root user", so that we are able to run `docker` without `sudo`.

    You must log out and log back in to your SSH session for this change to take effect. Close your current SSH session and reconnect.

    If you still get the `permission denied` error while connected through VS Code, open the Command Palette (`F1`) and select "Remote-SSH: Kill VS Code Server on Host..." or "Remote-SSH: Kill Current VS Code Server", depending on whether you use the local VS Code window or the one connected to the GCP CE instance.
3. Verify Docker installation:

    ```bash
    docker run hello-world
    ```

    You should see a message confirming Docker is working.

### Configure Dev Containers

1. In your remote VS Code window (connected via SSH to `my-debug-vm`), ensure you have the folder `/home/USERNAME/my_debug_project` open.

2. Add Dev Container Configuration:
    - Press `F1` and type "Dev Containers: Add Dev Container Configuration Files...".
    - Select "From a predefined container configuration template...".
    - Search for and select "Python 3".
    - Choose a Python version e.g. "3.12-bullseye (default)".
    - When asked to select features, you can skip this for now or add common ones like `git` or `zsh`.
    - You can also skip selecting "Optional Files/Directories".

This will create a new folder `.devcontainer` in our project with a `devcontainer.json` file. Take a look in the `devcontainer.json`, it has several useful comments.

### Reopen in Container

Now, let's open our project inside the newly configured dev container.

1. Click the green remote indicator icon (`><`) in the bottom-left corner of the VS Code window. Select "Reopen in Container".

    VS Code will now build the Docker image (if it hasn't already) and start a new container based on the `.devcontainer/devcontainer.json` configuration. It will then connect to this running container. This might take a few moments the first time.
2. Observe the VS Code environment:
    Once connected, you'll notice the green remote indicator now says "Dev Container: Python 3". The terminal within VS Code is now a shell *inside* the Docker container. Any Python extensions or settings specified in `devcontainer.json` are installed and applied within this isolated environment.

    The `my_script.py` file is now mounted into the container at the `workspaceFolder` defined in `devcontainer.json`, if not defined, it should default to `/workspaces/my_debug_project`.

### Debug the Python Script in the Container

Now that you're inside the dev container, debugging is straightforward.

1. Open `my_script.py` in the VS Code Explorer.
2. Set a breakpoint (e.g. on line 2: `result = a + b`).
3. Go to the Run and Debug view (`Ctrl+Shift+D`).
4. Click the "Run and Debug" button.
5. VS Code will detect it's a Python file and suggest "Python File" as the debug configuration. Select it.

The script will now run and pause within the Docker container on the GCP CE instance. You can debug exactly as you did earlier the main tutorial. This time, however, the execution is entirely isolated within a Docker container, ensuring consistent dependencies and a clean environment.

## (Optional) Explore Further

- **Persistent Data:** For Docker containers, consider using Docker volumes to persist data outside the container, especially for development environments where you might frequently rebuild containers.
- **Customizing Dev Containers:** Explore `devcontainer.json` options to install specific tools, forward ports, set environment variables, and more, all within your containerized development environment.
- **VS Code Tasks:** For more complex setups, you can define `tasks.json` in `.vscode` to automate steps like starting / stopping Docker containers, building images, etc.

Let me know if you would like to see something like that in a future article!

## Final Words

Good job! You've successfully set up and performed remote debugging on a Google Cloud Compute Engine instance using VS Code, both directly via SSH and within a Docker container using the Dev Containers extension.

This workflow significantly streamlines the process of developing and troubleshooting applications deployed in cloud environments.
