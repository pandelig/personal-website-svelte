---
slug: "optimizing-docker-images-a-step-by-step-guide"
date: "22 Sep 2025"
date_updated: ""
tags: ["tutorial", "docker", "security", "flask"]
title: "Optimizing Docker Images: A Step-by-Step Guide"
meta_description: "Learn to build smaller, faster, and more secure Docker images for your applications. Pantelis Deligiannidis provides a step-by-step tutorial, from minimizing the base image to using multi-stage builds and non-root users."
---

In the world of cloud-native applications and DevOps, Docker has become an indispensable tool. But a common mistake is creating Docker images that are unnecessarily large, slow to build, and insecure. These issues can bloat storage costs, slow down deployments, and introduce security vulnerabilities.

In this article, we'll walk through a step-by-step process to optimize a Docker image for a simple Flask application. We'll start with a basic, unoptimized Dockerfile and, with each step, apply a key best practice, explaining the "why" behind every change.

Finally, we will see the gains (💪) when it comes to the image size and build time.

## Prerequisites

To follow this tutorial, you should have the following:

- [Docker installed](https://docs.docker.com/engine/install/).
- A [basic understanding of Dockerfiles](https://www.docker.com/101-tutorial/).

## Create the Flask App

Create a local directory for our project:

```bash
mkdir docker_image_optimization && cd docker_image_optimization
```

Create the following simple Flask application files.

`app.py`:

```python
from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello_world():
    return "Hello, Docker!"

if __name__ == "__main__":
    app.run(host="0.0.0.0")
```

`requirements.txt`:

```text
Flask==3.1.2
```

## Create the Dockerfile

This version is intentionally inefficient to highlight the problems we need to solve.

`Dockerfile`:

```Dockerfile
FROM python:3.13

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["python", "app.py"]
```

Note that the `--no-cache-dir` flag tells `pip` to not store packages in its cache directory after they are installed. By default, `pip` caches downloaded packages to speed up future installations, but this cache is not needed inside a container image. Including it would unnecessarily increase the image size.

While useful, this flag doesn't fix a bigger issue: the inefficient placement of the `RUN` command relative to the `COPY` command, which we'll address later with layer caching optimization and a multi-stage build.

Your `docker_image_optimization` directory should look like this:

```bash
.
├── Dockerfile
├── app.py
└── requirements.txt
```

### Build the Image

```bash
docker build -t flask-unoptimized .
```

Note down how long it took to build. After applying the best practices, we will compare the before vs after build times and image sizes.

## 1. Minimize the Base Image

The foundation of any Docker image is the *base image*. Choosing the right one is the single most effective way to reduce the final image size. Our initial, unoptimized Dockerfile uses `python:3.13`, which is based on a full Debian OS and includes many packages we don't need.

**The Problem:** A full base image can be hundreds of megabytes in size, leading to slower pulls, increased storage usage, and a larger attack surface.

**The Fix:** We will switch to the `python:3.13-slim` image. The `slim` variant is a much smaller, stripped-down version of the same Debian image, containing only the bare essentials. For even greater size reduction, one may use `python:3.13-alpine`, which is based on the lightweight Alpine Linux distribution.

**Before:**

```dockerfile
FROM python:3.13
```

**After:**

```dockerfile
FROM python:3.13-slim
```

## 2. Use `.dockerignore`

When we use the `COPY . /app` command, Docker copies everything from the local directory into the image. This can include source control files like `.git`, temporary build files, or personal notes that have no place in the final image.

**The Problem:** These extra files unnecessarily increase the size of the image's layers and can also expose sensitive information if they contain secrets or configuration details.

**The Fix:** Create a file in the project root named `.dockerignore`. This file works just like a `.gitignore` and tells the Docker daemon which files and directories to ignore when building the image.

`.dockerignore`:

```text
.git
__pycache__/
.vscode/
.env
```

Even if the listed files don't exist in the current project, it's a crucial step to prevent them from being accidentally included in a more complex, real-world scenario.

## 3. Optimize Layer Caching

Docker builds images layer by layer, and each `RUN`, `COPY`, or `ADD` command creates a new layer. Docker uses a powerful build cache that can reuse layers from previous builds if the command hasn't changed.

**The Problem:** Our initial Dockerfile copies everything (`COPY . /app`) and *then* installs dependencies (`RUN pip install ...`). If we change just a single line of our application code in `app.py`, the `COPY . /app` layer *and all layers after it* are invalidated. This means Docker will have to re-run the `pip install` command, even if the `requirements.txt` hasn't changed, wasting time.

**The Fix:** We'll rearrange the commands to leverage Docker's caching mechanism more effectively. We'll copy only `requirements.txt` first, install the dependencies, and then copy the rest of the application code.

**Before:**

```dockerfile
# ...
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
# ...
```

**After:**

```dockerfile
# ...
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# ...
```

With this change, the `RUN pip install` layer will only be re-built if `requirements.txt` is modified, significantly speeding up subsequent builds during development.

## 4. Use a Multi-Stage Build

A multi-stage build is the gold standard for creating small and secure images. It allows us to use one "builder" image that contains all the tools needed for the build process (like compilers or dependency managers) and a separate "final" image that only contains the final, runnable artifacts.

**The Problem:** Our current Dockerfile includes build-time tools and intermediate files that are not needed at runtime, like the `pip` executable. This contributes to the final image size and can be a security concern.

**The Fix:** We will use two `FROM` statements. The first stage will be a "builder" that installs our Python dependencies. The second stage will be a clean, minimal image where we only copy the Python packages and our application code.

**After:**

```dockerfile
# Stage 1: The Builder Stage
FROM python:3.13-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: The Final, Lean Stage
FROM python:3.13-slim

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

We add `AS <name>` to give a name to the first stage. The `--from=<name>` flag tells Docker to copy a file or directory from a previously named stage instead of from the local build context.

We decide which files to copy to the final stage based on what is *absolutely necessary for the application to run*. The goal is to separate build-time dependencies from runtime requirements. For our Flask app, the essential files are:

- **The installed Python packages:** The application depends on Flask, which was installed during the "builder" stage. These packages are located in a directory inside the container's file system. We copy it (`site-packages`) to ensure all dependencies are present.
- **The application code itself (`app.py`):** The source code is obviously needed to run the app.

The final stage of the Dockerfile is the one that becomes the final, lean image, intermediate stages are discarded. Keep in mind that the base images do not need to match in a multi-stage Dockerfile.

## 5. Use a Non-Root User

By default, Docker containers run as the *root* user.

**The Problem:** While convenient, this is a major security risk. If a container were to be compromised, an attacker could gain root access to the host machine.

**The Fix:** We'll create a new, unprivileged user inside the container and switch to it. This follows the *Principle of Least Privilege*, a fundamental security concept.

**After:**

```dockerfile
# ...

RUN adduser --system --no-create-home appuser
USER appuser

EXPOSE 5000

CMD ["python", "app.py"]
```

- `adduser` command: Creates a new user named `appuser` within the container's operating system.
  - `--system`: This flag creates a *system user*, which is a special type of user account not intended for interactive logins. System users are typically used for running services and background processes, and often have limited privileges.
  - `--no-create-home`: Prevents the command from creating a home directory for the new user. A home directory is often unnecessary as the application's working directory is already defined with the `WORKDIR` command. Omitting the home directory helps keep the image size as small as possible.

- `USER` command: Switches the user context for all subsequent commands in the Dockerfile and, most importantly, for the container's runtime process.

Now, if our container is ever breached, the attacker will be limited by the permissions of the `appuser` account, preventing them from accessing sensitive system files or making changes to the host.

## Before vs After Comparison

Now, let's see the impact. Build the optimized image:

```bash
docker build -t flask-optimized .
```

Compare the image sizes:

```bash
docker images
```

We expect to see a significant difference in the `SIZE` column for the two images. For example:

```text
REPOSITORY                       TAG        SIZE
flask-optimized                  latest     188MB
flask-unoptimized                latest     1.62GB
```

The image size was reduced by about 88%! The build time was reduced by 93% (for me), `253.1s` -> `17.0s`.

## (Optional) Run a Container

Feel free to use our newly created image and visit `http://localhost:5000/`, after running:

```bash
docker run -dp 5000:5000 --name hello-docker flask-optimized
```

You should see:

![Hello Docker container up and running.](/imgs/hello_docker.webp)

## Final Words

By applying these five simple, yet powerful, best practices, we have created a final image that is significantly smaller, builds faster, and runs with enhanced security. To wrap up, here's a quick summary of the changes we made:

- **Smaller Base Image:** Switched from a full Python image to `slim`.
- **`.dockerignore`:** Excluded unnecessary files from the build context.
- **Layer Caching:** Reordered `COPY` and `RUN` to speed up builds.
- **Multi-Stage Build:** Used a "builder" stage to produce a tiny final image.
- **Non-Root User:** Enhanced security by using an unprivileged user.

These practices apply to any language or framework, as the principles of efficiency, caching, and security are universal in containerization. Incorporating them into your workflow will lead to more robust, reliable, and cost-effective deployments. I hope you learned something new!
