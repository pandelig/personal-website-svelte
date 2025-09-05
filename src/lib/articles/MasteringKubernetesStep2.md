---
slug: "mastering-kubernetes-step-2-deploying-to-aws-eks"
date: "05 Sep 2025"
date_updated: ""
tags: ["tutorial", "aws", "kubernetes", "docker", "flask"]
title: "Mastering Kubernetes - Step 2: Deploying to AWS EKS"
meta_description: "Learn how to deploy a Flask application to Amazon EKS, the managed Kubernetes service on AWS. This tutorial by Pantelis Deligiannidis covers everything from setting up the EKS cluster with `eksctl` to using Amazon ECR and exposing your app with a Load Balancer."
---

1. [Step 1: The Core Architecture](/blog/mastering-kubernetes-step-1-the-core-architecture)
2. (You are here) Step 2: Deploying to AWS EKS

Welcome back! In the first Step of the "Mastering Kubernetes" series, we demystified the core architecture of Kubernetes and successfully deployed a Flask application to a local Minikube cluster. Now that we have a solid understanding of the fundamental concepts, it's time to take our journey to the cloud.

In this Step, we will explore **Amazon Elastic Kubernetes Service (EKS)**, a managed Kubernetes service on AWS, by deploying our Flask application to a live EKS cluster, exposing it to the internet, without, and then with an AWS Load Balancer.

## Prerequisites

To follow this tutorial, you'll need:

- An [AWS account](https://aws.amazon.com/).
- Familiarity with [basic AWS concepts](/blog/getting-started-with-aws-core-concepts-and-iam) is recommended, as well as [setting up and using an admin user](/blog/getting-started-with-aws-core-concepts-and-iam#create-a-user-and-a-group) instead of the root user.
- AWS CLI configured: Ensure the AWS CLI is [installed](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [configured with your credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-methods) by running `aws configure`.
- [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/) installed. We will need a proper `kubectl` installation for this Step. Remember to remove the `alias kubectl="minikube kubectl --"` line from your `~/.bashrc` if you added it earlier.
- `eksctl` [installed](https://eksctl.io/installation/).
- [Docker](https://docs.docker.com/engine/install/). *Explore further:* [Docker Tutorial](https://www.docker.com/101-tutorial/).
- The Flask app code and `Dockerfile` from [Step 1](/blog/mastering-kubernetes-step-1-the-core-architecture#create-the-flask-app).

## Why EKS

While Minikube is perfect for local development and learning, it's not a solution for production. Managing a Kubernetes cluster's control plane manually can be complex and time-consuming. This is where EKS shines.

EKS manages the Kubernetes control plane for you, across multiple [Availability Zones](/blog/getting-started-with-aws-core-concepts-and-iam#aws-global-infrastructure) to ensure high availability and scalability. This frees you up to focus on your applications, not on managing the underlying infrastructure.

## Create the EKS Cluster

`eksctl` is a command-line tool for creating and managing EKS clusters. It's the simplest way to get started with EKS, as it automates much of the boilerplate configuration.

Create a local directory for our project:

```bash
mkdir my_eks_k8s_flask_app && cd my_eks_k8s_flask_app
```

We will create a simple cluster with two worker nodes, but first we need to set up an EC2 SSH key pair. The key pair is required to manage and troubleshoot the nodes:

```bash
ssh-keygen -t rsa -f ~/.ssh/eks-key
```

This command will create two files:

- `~/.ssh/eks-key`: The private key. Do not share this file.
- `~/.ssh/eks-key.pub`: The public key. This is the file we will provide to AWS.

```bash
aws ec2 import-key-pair --key-name eks-key --public-key-material fileb://~/.ssh/eks-key.pub
```

The `aws ec2 import-key-pair` command expects the public key material as a raw string. The `fileb://` prefix is the AWS CLI's way of reading the content of the public key file (`~/.ssh/eks-key.pub`) and passing it to the command as a raw string.

Run `aws ec2 import-key-pair help` if you want to read more about the command and its flags, then e.g., type `/fileb` [to search](https://linuxhandbook.com/search-less-command/) for `fileb`. Press `Q` to quit the help docs.

To verify that our key pair was successfully created and imported to AWS, we have 2 options:

- Using the terminal: `aws ec2 describe-key-pairs` or `aws ec2 describe-key-pairs --query "KeyPairs[*].KeyName" --output text` to see only the key names.
- Using the [AWS Management Console](https://aws.amazon.com/console/): Search for "EC2" -> In the left-hand navigation pane, under "Network & Security", click on "Key Pairs".

![EKS key pair listed in AWS Management Console](/imgs/eks_key_pair_listed_in_aws_management_console.webp)

Now, create a file named `cluster.yaml` with the following content:

```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: flask-app-cluster
  region: eu-central-1 # Choose your desired AWS region

nodeGroups: # Defines a group of worker nodes
  - name: flask-app-nodes
    instanceType: t3.medium # The type of EC2 instance to use for our nodes (https://aws.amazon.com/ec2/instance-types/)
    desiredCapacity: 2 # Start with 2 worker nodes
    minSize: 1  # This is the minimum number of nodes the cluster can scale down to
    maxSize: 3
    volumeSize: 20
    ssh:
      allow: true # Allows SSH access to the nodes for debugging
      publicKeyPath: ~/.ssh/eks-key.pub # The public key path of the key pair we just created
```

In `eksctl` terminology, a `ClusterConfig` is the root object for [creating an EKS cluster](https://eksctl.io/usage/creating-and-managing-clusters/#using-config-files). `volumeSize: 20` sets the size of the [EBS](/blog/getting-started-with-aws-core-concepts-and-iam#optional-abbreviations) volume, in GB, for each node.

Now, we will use `eksctl` to create the cluster. This process will take several minutes as it provisions all the necessary AWS resources: [VPC, subnets](/blog/aws-web-app-essentials-networking-ec2-load-balancing-and-auto-scaling#what-is-a-vpc), [EC2 instances](/blog/getting-started-with-aws-core-concepts-and-iam#optional-abbreviations), [IAM roles](/blog/getting-started-with-aws-core-concepts-and-iam#use-iam-roles-for-aws-services), etc.

```bash
eksctl create cluster -f cluster.yaml
```

Once the command completes, `eksctl` will have automatically configured our local `kubectl` to connect to the new EKS cluster. You can verify this by running:

```bash
kubectl get nodes
```

You should see:

```bash
NAME                                              STATUS   ROLES    AGE   VERSION
ip-192-168-57-155.eu-central-1.compute.internal   Ready    <none>   28s   v1.32.7-eks-3abbec1
ip-192-168-85-195.eu-central-1.compute.internal   Ready    <none>   26s   v1.32.7-eks-3abbec1
```

`kubectl config get-contexts` is also useful here. Remember, we have already gone through [a concise cheatsheet of `kubectl` commands](/blog/mastering-kubernetes-step-1-the-core-architecture#kubectl-commands).

If we go to the AWS Management Console -> "VPC" -> Select the newly created VPC and go to the "Resource map" tab, we will see:

![AWS EKS cluster creation resulting network.](/imgs/eksctl_aws_cluster_creation_resulting_network.webp)

### (Optional) Inspect the Subnet Tags

Tagging subnets is crucial because it allows AWS to integrate with Kubernetes controllers. While `eksctl` handles this for us during cluster creation, it's a good practice to be aware of it.

The [Kubernetes cloud provider controller](/blog/mastering-kubernetes-step-1-the-core-architecture#control-plane-components), which is responsible for managing cloud resources like load balancers and volumes, needs a way to discover which AWS resources belong to a specific EKS cluster. It does this by scanning for specific tags.

You may check the tags of the subnets in the AWS Management Console -> "VPC" -> "Subnets" -> Select a subnet and go to the "Tags" tab.

For a refresher on VPCs, check out [my article on AWS Web App Essentials](/blog/aws-web-app-essentials-networking-ec2-load-balancing-and-auto-scaling#what-is-a-vpc). *Explore further:* [Organize Amazon EKS resources with tags](https://docs.aws.amazon.com/eks/latest/userguide/eks-using-tags.html)

## Deploy to EKS

### Prepare the Docker Image

Unlike with Minikube, we can't use the `minikube docker-env` trick. For our EKS cluster to access our Docker image, it needs to be available in a container registry. We will use [Amazon Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/) for this.

1. Create a new ECR Repository:

    ```bash
    aws ecr create-repository --repository-name k8s-flask-app
    ```

    Save the `repositoryUri` value, we will need it shortly. Other useful commands:

    - `aws ecr describe-repositories`
    - `aws ecr describe-repositories --repository-names k8s-flask-app --query 'repositories[0].repositoryUri' --output text`

    We can also see our new repository in the AWS Management Console -> "ECR" -> "Private registry" -> "Repositories".

2. Create the `app.py`, `requirements.txt`, `Dockerfile` files:

    Follow the [instructions mentioned in Step 1](/blog/mastering-kubernetes-step-1-the-core-architecture#create-the-flask-app). This should be the resulting `my_eks_k8s_flask_app` directory structure:

    ```bash
    .
    ├── Dockerfile
    ├── app.py
    ├── cluster.yaml
    └── requirements.txt
    ```

3. Build the Docker image:

    ```bash
    docker build -t k8s-flask-app:latest .
    ```

4. Tag and push the Docker image:

    Firstly, we handle authentication. The Docker client needs it, in order to push images to the ECR repository. Use the `repositoryUri` you saved earlier.

    ```bash
    aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin <YOUR_ECR_REPOSITORY_URI>
    ```

    The `aws ecr get-login-password` command returns a temporary authentication token that acts as a password, granting Docker temporary permissions to push and pull images from ECR. For ECR, the username is always `AWS`. You should see: `Login Succeeded`.

    To push an image to a registry, it needs to be tagged appropriately.

    ```bash
    docker tag k8s-flask-app:latest <YOUR_ECR_REPOSITORY_URI>:latest
    docker push <YOUR_ECR_REPOSITORY_URI>:latest
    ```

### Define the Manifests

[Our `deployment.yaml`](/blog/mastering-kubernetes-step-1-the-core-architecture#define-the-manifests) needs a small change. We must update the `image` field to point to our ECR repository and remove the `imagePullPolicy: Never` line, as Kubernetes will now pull from the remote registry.

Create the updated `deployment.yaml`:

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
        image: <YOUR_ECR_REPOSITORY_URI>:latest # Updated to use ECR image
        ports:    # Specifies the ports that the container exposes
        - containerPort: 5000
        env:      # Sets an environment variable
        - name: NAME
          value: "EKS User"
```

Use the same `service.yaml`:

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

We have [already discussed the way a `NodePort` service operates](/blog/mastering-kubernetes-step-1-the-core-architecture#define-the-manifests).

### Apply the Manifests

Now, let's deploy our application to EKS:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

Check the status of the service.

```bash
kubectl get all
```

You should see something similar to this:

```bash
NAME                                        READY   STATUS    RESTARTS   AGE
pod/flask-app-deployment-67b5ffdc46-5sgvl   1/1     Running   0          2m27s
pod/flask-app-deployment-67b5ffdc46-pnt8d   1/1     Running   0          2m27s

NAME                        TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/flask-app-service   NodePort    10.100.187.254   <none>        80:30472/TCP   2m18s
service/kubernetes          ClusterIP   10.100.0.1       <none>        443/TCP        32m

NAME                                   READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/flask-app-deployment   2/2     2            2           2m27s

NAME                                              DESIRED   CURRENT   READY   AGE
replicaset.apps/flask-app-deployment-67b5ffdc46   2         2         2       2m27s
```

Remember the NodePort's `PORT`, in this case: `30472`.

### Create a SG Rule

In order to access our Flask app, we need 3 things: 1. the NodePort's port, 2. one of the worker nodes' `EXTERNAL-IP`:

```bash
$ kubectl get nodes -o wide
NAME                                              STATUS   ROLES    AGE   VERSION               INTERNAL-IP      EXTERNAL-IP      OS-IMAGE         KERNEL-VERSION                  CONTAINER-RUNTIME
ip-192-168-57-155.eu-central-1.compute.internal   Ready    <none>   30m   v1.32.7-eks-3abbec1   192.168.57.155   18.197.7.188     Amazon Linux 2   5.10.240-238.959.amzn2.x86_64   containerd://1.7.27
ip-192-168-85-195.eu-central-1.compute.internal   Ready    <none>   30m   v1.32.7-eks-3abbec1   192.168.85.195   35.159.234.242   Amazon Linux 2   5.10.240-238.959.amzn2.x86_64   containerd://1.7.27
```

Then we need to add an inbound rule to our nodegroup's SG. We need to get the SG's id, make sure to replace the `Values` value with one of your nodes' `NAME`:

```bash
$ aws ec2 describe-instances --filters "Name=private-dns-name,Values=<ONE_OF_YOUR_NODES_NAME>" --query "Reservations[].Instances[].SecurityGroups[]"
[
    {
        "GroupId": "sg-0b15e5c975512118c",
        "GroupName": "eksctl-flask-app-cluster-cluster-ClusterSharedNodeSecurityGroup-amXxSsK3UPHC"
    },
    {
        "GroupId": "sg-03bde289978db7166",
        "GroupName": "eksctl-flask-app-cluster-nodegroup-flask-app-nodes-SG-q2P3fKtCSIvQ"
    }
]
```

The id we are looking for is `sg-03bde289978db7166` (yours will be different), so let's add the rule by running:

```bash
aws ec2 authorize-security-group-ingress \
    --group-id <YOUR_NODEGROUPS_SG_ID> \
    --protocol tcp \
    --port <YOUR_NODEPORTS_PORT> \
    --cidr 0.0.0.0/0
```

### Access the Flask App

Write `http://<ONE_OF_YOUR_NODES_EXTERNAL_IP>:<YOUR_NODEPORTS_PORT>` into your web browser. You should see a similar message to the one from [our Minikube deployment](/blog/mastering-kubernetes-step-1-the-core-architecture#access-the-flask-app), but this time, it's running on a highly available EKS cluster managed by AWS!

![Browser view after deploying our Kubernetes Flask app to EKS.](/imgs/kubernetes_flask_app_deployed_on_eks_browser.webp)

If the page doesn't load, make sure you are using `http` in the url, not `https`.

### (Optional) Use a LoadBalancer

The `NodePort` service type is useful for development, but in a cloud environment, we typically want a managed load balancer. Let's change the `type` to `LoadBalancer`.

Update `service.yaml`:

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
  type: LoadBalancer    # Changed service type from NodePort
```

With `type: LoadBalancer`, EKS automatically provisions an [AWS Elastic Load Balancer (ELB)](/blog/aws-web-app-essentials-networking-ec2-load-balancing-and-auto-scaling#optional-load-balancing-and-auto-scaling) and configures it to distribute incoming traffic to our pod replicas. Run:

```bash
kubectl apply -f service.yaml
```

Then, let's visit our LoadBalancer's `EXTERNAL-IP`:

```bash
$ kubectl get all
NAME                                        READY   STATUS    RESTARTS   AGE
pod/flask-app-deployment-67b5ffdc46-5sgvl   1/1     Running   0          60m
pod/flask-app-deployment-67b5ffdc46-pnt8d   1/1     Running   0          60m

NAME                        TYPE           CLUSTER-IP       EXTERNAL-IP                                                                 PORT(S)        AGE
service/flask-app-service   LoadBalancer   10.100.187.254   a3c00472dfe4e4ed29e88c324b4dd748-122521935.eu-central-1.elb.amazonaws.com   80:30472/TCP   60m
service/kubernetes          ClusterIP      10.100.0.1       <none>                                                                      443/TCP        91m

NAME                                   READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/flask-app-deployment   2/2     2            2           60m

NAME                                              DESIRED   CURRENT   READY   AGE
replicaset.apps/flask-app-deployment-67b5ffdc46   2         2         2       60m
```

We should see:

![Using a LoadBalancer to access our EKS Flask app.](/imgs/using_a_loadbalancer_to_access_our_eks_flask_app.webp)

It's worth noting that if we inspect the ELB's SG:

![EKS Flask app ELB's SG.](/imgs/eks_flask_app_elb_sg.webp)

And then we go to the nodegroup's SG:

![Nodegroup's SG rules after ELB creation.](/imgs/nodegroup_sg_rules_after_elb_creation.webp)

We see that a new rule has been created, allowing inbound traffic from the ELB's SG! This ensures the traffic that makes it past the ELB can reach our pods.

If you don't see such a rule, you will have to create it manually in order to access the Flask app.

## Clean Up

The following command will delete all the resources provisioned by `eksctl`.

```bash
eksctl delete cluster --name flask-app-cluster --disable-nodegroup-eviction
```

If you don't use the `--disable-nodegroup-eviction` flag, the process may get stuck at `2025-09-05 00:32:16 [!] 2 pods are unevictable from node...`.

## (Optional) Explore Further

- **Explore AWS CLI commands:** The AWS CLI is a powerful tool. Learn more advanced queries to filter and extract specific information, like we did when we found our node's security group. The `--query` and `--output` flags are extremely useful for automating tasks and scripting.
- **Implement an Ingress Controller:** For more advanced routing and management of external traffic, consider using a [Kubernetes Ingress resource](https://kubernetes.io/docs/concepts/services-networking/ingress/). An Ingress allows you to expose multiple services under a single load balancer, manage SSL/TLS certificates, and handle more complex routing rules for production environments.

## Wrapping Up Step 2

In this Step, we did some work! We successfully migrated our Flask application from a local Minikube cluster to a managed EKS cluster on AWS. We saw how EKS simplifies cluster management by handling the control plane and seamlessly integrating with AWS services like ECR and ELB.

I hope you enjoyed the process, let me know what you think and stay tuned for more Kubernetes related guides!
