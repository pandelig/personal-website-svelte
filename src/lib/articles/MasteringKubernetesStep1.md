---
slug: "mastering-kubernetes-step-1-the-core-architecture"
date: "04 Sep 2025"
date_updated: ""
tags: ["tutorial", "kubernetes", "docker", "flask"]
title: "Mastering Kubernetes - Step 1: The Core Architecture"
meta_description: "In this comprehensive guide, Pantelis Deligiannidis provides a breakdown of Kubernetes core architecture. Learn about how the core components interact with each other and what the most common kubectl commands are. Finally, step-by-step, deploy a simple Flask application to a local Minikube cluster."
---

1. (You are here) Step 1: The Core Architecture
2. [Step 2: Deploying to AWS EKS](/blog/mastering-kubernetes-step-2-deploying-to-aws-eks)

Welcome to the first installment of my "Mastering Kubernetes" series! In today's dynamic cloud landscape, **Kubernetes (K8s)** has emerged as the de facto standard for orchestrating containerized applications. If you've ever struggled with deploying, scaling, or managing applications across multiple servers, Kubernetes is the answer you've been looking for. It automates much of the manual work involved in deploying, managing, and scaling containerized applications.

This article aims to be your most comprehensive guide to understanding Kubernetes from the ground up. We'll conclude with a hands-on demonstration, deploying a simple Flask application to a local Kubernetes cluster.

## Prerequisites

- [Docker](https://docs.docker.com/engine/install/). We'll need Docker to build container images and for Minikube to run its virtual machine. *Explore further:* [Docker Tutorial](https://www.docker.com/101-tutorial/).

## Why Kubernetes

Imagine you have a web application. As traffic grows, you need more instances of your application. What if one instance fails? How do you update your application without downtime? How do you ensure it always has enough resources? Kubernetes addresses these complex challenges by providing:

- **Automated Rollouts & Rollbacks:** Seamlessly update your application with new versions and easily revert if something goes wrong.
- **Self-Healing:** Automatically restarts failed containers, replaces unhealthy ones, and reschedules containers on healthy nodes.
- **Service Discovery & Load Balancing:** Automatically exposes your application services and distributes network traffic to maintain stability.
- **Resource Management:** Efficiently allocates CPU and memory resources across your applications.
- **Horizontal Scaling:** Easily scale your application up or down based on demand.

In essence, Kubernetes provides an operating system for your distributed applications, abstracting away the underlying infrastructure complexities.

## The Core Components

A Kubernetes cluster consists of a set of worker machines, called **nodes**, that run containerized applications. Every cluster has at least one worker node. The worker nodes host the **pods**, a pod is a group of one or more containers that share storage and network resources and are scheduled together on a single node.

The **control plane** manages the worker nodes and the pods in the cluster.

![Kubernetes Architecture](/imgs/kubernetes_architecture.webp)

Looks scary 👻, but let's take a closer look.

### Control Plane Components

These components make global decisions about the cluster, e.g. scheduling, and detect and respond to cluster events, e.g. starting up new pods when a deployment's `replicas` field is unsatisfied.

- `kube-apiserver`:

  - Role: The front-end for the Kubernetes control plane. It exposes the Kubernetes API. All communication between cluster components, internal and external, goes through the API server. This is the only component that directly interacts with the **`etcd`** data store.
  - How it works: When we use the [`kubectl` command](/blog/mastering-kubernetes-step-1-the-core-architecture#kubectl-commands) to deploy a new application, our command first hits the `kube-apiserver`.
  - *Explore Further:* [kube-apiserver](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/)

- `etcd`:

  - Role: A consistent and highly available key-value store used as Kubernetes' backing store for all cluster data. All cluster state and configuration information is stored here.
  - How it works: When `kube-apiserver` receives a request to create a pod, it records this desired state in `etcd`.
  - *Explore Further:* [etcd](https://etcd.io/)

- `kube-scheduler`:

  - Role: Watches for newly created pods that have no assigned node, and selects a node for them to run on. It considers factors like resource requirements and more.
  - How it works: After `etcd` stores the new pod information, the `kube-scheduler` sees this unassigned pod and determines the best node for it, then updates the pod's information in `etcd`, via `kube-apiserver`, with the selected node.
  - *Explore Further:* [kube-scheduler](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-scheduler/)

- `kube-controller-manager`:

  - Role: Runs controller processes. A controller continuously watches the state of the cluster and makes changes to drive the current state towards the desired state.
  - How it works: For instance, if a deployment requests 3 replicas of a pod, the deployment controller (part of `kube-controller-manager`) ensures that 3 pods are running. If one fails, it instructs `kube-apiserver` to create a new one.
  - *Explore Further:* [kube-controller-manager](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/)

- `cloud-controller-manager`:

  - Role: Embeds cloud-specific control logic. It lets us link the cluster into a cloud provider's API, separating components that interact with the cloud platform from components that only interact with the cluster.
  - How it works: For example, when we create a Kubernetes service of type `LoadBalancer`, the `cloud-controller-manager` interacts with the cloud provider's API, e.g. [AWS ELB](/blog/getting-started-with-aws-core-concepts-and-iam#optional-abbreviations), to provision a load balancer for the service.
  - *Explore Further:* [cloud-controller-manager](https://kubernetes.io/docs/concepts/architecture/cloud-controller/)

- `coredns`:

  - Role: Provides DNS services for the entire cluster. It translates service names, e.g. `flask-app-service`, into internal cluster IP addresses.
  - How it works: When a pod needs to communicate with another service, it sends a DNS query to `coredns`. `coredns` responds with the IP address of the service, allowing `kube-proxy` to route the traffic correctly.
  - *Explore Further:* [coredns](https://coredns.io/manual/toc/#what-is-coredns)

- `storage-provisioner`:

  - Role: Automates the creation of storage volumes.
  - How it works: When a pod that requests a [PVC](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) is created, the `storage-provisioner` detects this request and dynamically creates a new volume in the underlying storage system, e.g. Minikube's local storage, and binds it to the pod.
  - *Explore Further:* [storage-provisioner](https://kubernetes.io/docs/concepts/storage/storage-classes/#provisioner)

### Worker Node Components

These components run on each node, maintaining running pods and providing the Kubernetes runtime environment.

- `kubelet`:

  - Role: An agent that runs on each node in the cluster. It ensures that containers are running in a pod. It registers the node with `kube-apiserver`, reports its status, and ensures pods defined in the manifest (YAML file) are running and healthy.
  - How it works: The `kubelet` constantly watches the `kube-apiserver` for new pods assigned to its node. When it sees one, it uses the container runtime, e.g. Docker, to start the containers specified in the pod's manifest.
  - *Explore Further:* [kubelet](https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/)

- `kube-proxy`:

  - Role: A network proxy that runs on each node. It maintains network rules on nodes, allowing network communication to our pods from inside or outside of the cluster. It handles forwarding requests to the correct pods behind a service.
  - How it works: `kube-proxy` observes `kube-apiserver` changes to services and endpoints and updates the local `iptables` rules to ensure network traffic reaches the correct pods.
  - *Explore Further:* [kube-proxy](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-proxy/)

- Container Runtime:

  - Role: The software that is responsible for running containers. Kubernetes supports container runtimes such as Containerd and Docker.
  - How it works: The `kubelet` interacts with the container runtime to pull container images, run containers, and manage their lifecycle.
  - *Explore Further:* [Container Runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes/)

## The Workflow

Putting everything together, let's trace the journey of a simple pod deployment, from the `kubectl` command to a running container:

1. `kubectl` command sends a request to the `kube-apiserver`.
2. `kube-apiserver` validates the request and saves the pod's desired state in `etcd`.
3. `kube-scheduler` sees the unassigned pod and picks the best node for it, updating the pod's state in `etcd` via `kube-apiserver`.
4. `kubelet` on the chosen node notices the new assignment, pulls the container image, and starts the container.
5. `kube-proxy` configures network rules to route traffic to the new pod, and `coredns` registers the service so other pods can find it by name.
6. `kube-controller-manager` constantly ensures the cluster's actual state matches the desired state we defined, and `storage-provisioner` watches for PVCs.

## `kubectl` Commands

`kubectl` is the command-line tool we'll use to interact with our Kubernetes cluster, here are some of the most common commands:

| Command                                                    | Description                                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| `kubectl get <resource>`                                   | List resources.                                                             |
| `kubectl apply -f <filename>`                              | Create or update resources based on the provided YAML or JSON manifest.     |
| `kubectl create deployment <dep-name> --image=<im-name>`   | Create a new deployment quickly.                                            |
| `kubectl describe <resource> <res-name>`                   | Provide detailed information about a specific resource.                     |
| `kubectl logs <pod-name>`                                  | Fetch the logs from a specific pod's containers.                            |
| `kubectl exec -it <pod-name> -- <command>`                 | Execute a command in a pod, e.g. `/bin/bash`.                               |
| `kubectl delete <resource> <res-name>`                     | Delete resources.                                                           |

Where `<resource>` can be: `pods`, `services`, `deployments`, `replicasets`, `nodes`, `namespaces`. This is not an exhaustive list, use `kubectl api-resources` to find a comprehensive list of all the resources the Kubernetes cluster can manage.

Remember you can get help for a command using the `--help` / `-h` flag, e.g. `kubectl -h` or `kubectl get -h`.

**Declarative vs. Imperative:**

- Declarative commands, e.g. `apply -f`, are the recommended approach for managing resources. They define the desired state in a file and allow Kubernetes to figure out how to get there. This is the foundation of [Infrastructure as Code (IaC)](/blog/serverless-backend-on-aws-step-2-iac-with-terraform#why-iac-and-terraform).
- Imperative commands, e.g. `create`, `delete`, directly execute a command to create or modify a resource. They are great for one-off tasks and learning, but less suitable for production environments where we need a reproducible state.

## Deploy a Flask App

Let's put this theory into practice by deploying a basic "Hello World" Flask application to a local Kubernetes cluster using **Minikube**, a tool that runs a single-node Kubernetes cluster locally.

### Install and Start Minikube

Following the [official docs](https://minikube.sigs.k8s.io/docs/start/?arch=%2Flinux%2Fx86-64%2Fstable%2Fdebian+package), we run:

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb
sudo dpkg -i minikube_latest_amd64.deb
minikube start
```

Once complete, you should see output indicating the cluster is running:

```bash
🏄  Done! kubectl is now configured to use "minikube" cluster and "default" namespace by default
```

We continue with:

```bash
minikube kubectl -- get po -A # `po` is shorthand for `pods`
```

Minikube will download `kubectl` and it should list most of the components we discussed earlier, belonging to the `kube-system` namespace. [Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) are a way to divide cluster resources.

Kubelet and the container runtime are not pods, they run directly on the host machine as system services, so they are not listed. The cloud controller manager is also not shown because it's only required when running Kubernetes on a cloud provider.

A status of `Running` indicates that the pod is active and has been assigned to a node.

```bash
alias kubectl="minikube kubectl --"
minikube dashboard # Spend a couple of seconds to check it out
```

Consider adding the `alias` command to your `~/.bashrc`.

### Create the Flask App

Create a local directory for our project:

```bash
mkdir my_k8s_flask_app && cd my_k8s_flask_app
```

Create a simple `app.py` file:

```python
from flask import Flask
import os

app = Flask(__name__)

@app.route('/')
def hello():
    name = os.environ.get('NAME', 'World')
    return f"Hello, {name} from your Flask app on Kubernetes!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

`requirements.txt`:

```text
Flask
```

The `Dockerfile` to containerize the app:

```dockerfile
FROM python:3.9-slim-buster

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

### Build the Docker Image

We will use Minikube's Docker daemon to build the image directly into the Minikube environment:

```bash
eval $(minikube docker-env) # Connects the shell to Minikube's Docker daemon
docker build -t k8s-flask-app:latest .
eval $(minikube docker-env -u) # Disconnects from Minikube's Docker daemon
```

The first `eval` command ensures that any `docker` commands we run will build images directly into Minikube's Docker daemon, making them available to our Kubernetes cluster without needing to push to a remote registry. The second `eval` command disconnects us again, so the regular `docker` commands work as usual.

### Define the Manifests

Now, let's create the Kubernetes YAML files to define our deployment and service.

Create a file named `deployment.yaml`:

```yaml
apiVersion: apps/v1 # Specifies the Kubernetes API version.
kind: Deployment    # Defines the type of resource we're creating

metadata:
  name: flask-app-deployment
  labels:
    app: flask-app

spec:
  replicas: 2   # The desired number of pod instances, they may or may not run on the same node
  selector:     # How the deployment finds which pods it manages
    matchLabels:
      app: flask-app
  template:     # The pod template used to create new pods
    metadata:
      labels:
        app: flask-app  # It should match with the `spec.selector.matchLabels` label
    spec:
      containers: # Configuration of containers within the pod
      - name: flask-app-container
        image: k8s-flask-app:latest # Use the image we just built
        imagePullPolicy: Never      # Tell Kubernetes not to try pulling from a remote registry
        ports:    # Specifies the ports that the container exposes
        - containerPort: 5000
        env:      # Sets an environment variable
        - name: NAME
          value: "Kubernetes User"
```

To see what `kind` corresponds to what resource, run `kubectl api-resources` which we mentioned [earlier](/blog/mastering-kubernetes-step-1-the-core-architecture#kubectl-commands).

Next, create a file named `service.yaml`:

```yaml
apiVersion: v1
kind: Service

metadata:
  name: flask-app-service

spec:
  selector:         # No `matchLabels` used here, different API syntax for `Service`
    app: flask-app  # Selects pods with this label
  ports:
    - protocol: TCP
      port: 80      # This is the port the service itself is running on within the cluster's internal network
      targetPort: 5000  # The port the Flask app listens on inside the container, the traffic is ultimately destined for this port
  type: NodePort    # Exposes the service on a port on each node's IP
```

A `NodePort` service exposes a static port **on all nodes**, forwarding external traffic from `<node-ip-address>:<NodePort>` to the service's internal port (`80`) and then to the target port (`5000`) on a pod. The `NodePort` is a port within the default range of `30000-32767`, and Kubernetes' internal networking (`kube-proxy`) handles the forwarding of traffic to the correct pod, using a simple load-balancing algorithm, no matter which node receives the initial request.

### Apply the Manifests

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

You should see output confirming the creation of the deployment and service.

Check the status of our resources:

```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

You should see the `flask-app-deployment` running, the pods in a `Running` state, and the `flask-app-service` with a `NodePort`. Feel free to revisit the `minikube dashboard`.

### Access the Flask App

In a standard Kubernetes setup, we should be able to access the Flask app via `<node-ip-address>:<NodePort>`, but in our case, we have to use the URL provided by Minikube:

```bash
minikube service flask-app-service --url
```

Copy the URL printed in the terminal and paste it into your web browser. You should see:

![Browser view after deploying our Kubernetes Flask app.](/imgs/kubernetes_flask_app_deployed_browser.webp)

Congratulations! You've successfully deployed a containerized Flask application to your local Kubernetes cluster!

## (Optional) Explore Further

- **Kubernetes Concepts:** Dive deeper into the [official Kubernetes documentation](https://kubernetes.io/docs/concepts/) to learn about other crucial concepts.
- **`kubectl` Cheatsheet:** Familiarize yourself with [more commands](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) and set up autocompletion.

## Wrapping Up Step 1

In this first Step of the series, we embarked on a detailed journey through the core architecture of Kubernetes. We dissected each major component of the control plane and worker nodes. More importantly, we traced their interactions, illustrating how a simple `kubectl` command creates a chain reaction of events and we discussed the most common `kubectl` commands.

The hands-on demonstration of deploying a Flask application on Minikube solidified these theoretical concepts, giving you practical experience with defining deployments and services.

In the [next Step](/blog/mastering-kubernetes-step-2-deploying-to-aws-eks), we'll take our Kubernetes journey to the cloud, exploring **Amazon Elastic Kubernetes Service (EKS)**. Stay tuned!
