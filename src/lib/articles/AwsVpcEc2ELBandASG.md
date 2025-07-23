---
slug: "aws-web-app-essentials-networking-ec2-load-balancing-and-auto-scaling"
date: "09 Jul 2025"
date_updated: ""
tags: ["tutorial", "aws", "flask"]
title: "AWS Web App Essentials: Networking, EC2, Load Balancing and Auto Scaling"
meta_description: "Learn to build a scalable Flask web application on AWS with Pantelis Deligiannidis. This comprehensive tutorial covers setting up VPC, deploying on EC2 with Nginx and Gunicorn, and ensuring high availability and scalability using Elastic Load Balancing and Auto Scaling."
---

Welcome back to our AWS journey! In our [previous article](/blog/getting-started-with-aws-core-concepts-and-iam), we laid the groundwork by understanding the fundamentals of AWS and securing our initial steps with IAM. Now, it's time to dive deeper into building a robust and scalable web application in the cloud.

This tutorial will guide you through setting up a foundational network infrastructure using Amazon Virtual Private Cloud (VPC), deploying a simple Flask web application on an Amazon EC2 instance, and then (optionally) enhancing its resilience and scalability with Elastic Load Balancing (ELB) and Auto Scaling. By the end, you'll have a clear understanding of how these core AWS services work together to host a production-ready application.

Whether you're new to cloud networking or looking to solidify your understanding of essential AWS compute services, this hands-on guide will equip you with the practical skills needed to deploy applications confidently.

## Prerequisites

Before we begin, ensure you have the following:

1. An [AWS Account](https://aws.amazon.com/): With sufficient permissions to create VPCs, EC2 instances, Security Groups, and (optionally) Load Balancers and Auto Scaling Groups. It is recommended to avoid using the root user and to [use an admin user instead](/blog/getting-started-with-aws-core-concepts-and-iam#create-a-user-and-a-group).
2. Familiarity with [basic AWS terminology](/blog/getting-started-with-aws-core-concepts-and-iam#optional-abbreviations) is recommended.
3. Basic understanding of Linux commands, SSH and Flask is also recommended.

## What is a VPC

The Amazon VPC is the cornerstone of networking in AWS. It allows you to provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define. A VPC is region-specific.

Let's break down the key components of a VPC:

* **VPC:** Your isolated network environment. When you create a VPC, you specify a range of IP addresses for it in the form of a Classless Inter-Domain Routing (CIDR) block (e.g. `10.0.0.0/16`). [What is a CIDR?](https://aws.amazon.com/what-is/cidr/)
* **Subnets:** A VPC can be divided into one or more subnets. Subnets enable you to segment your network within the VPC and provide different levels of security and accessibility. We'll typically use:
  * **Public Subnets:** Resources in a public subnet can send outbound traffic directly to the internet via an Internet Gateway. They are suitable for web servers, load balancers, and other internet-facing resources.
  * **Private Subnets:** Resources in a private subnet cannot directly reach the internet. They are ideal for databases, application servers, and other backend components that don't need direct internet access.
* **Internet Gateway (IGW):** A horizontally scaled, redundant, and highly available VPC component that allows communication between your VPC and the internet. A VPC can only have one IGW.
* **NAT Gateway (Network Address Translation):** A service that enables instances in a private subnet to connect to the internet or other AWS services (e.g. for software updates) while preventing the internet from initiating a connection to those instances.
* **Route Tables:** These govern network traffic flow within your VPC and to external networks. Every subnet must have an associated route table. AWS automatically creates a "main route table" for new VPCs, including a "local route" for intra-VPC communication.
* **Network Access Control Lists (NACLs):** Optional firewalls at the subnet level that are stateless, meaning you must explicitly define both inbound and outbound rules for any protocol. By default, they allow all traffic, but you can configure them with both allow and deny rules.
* **Security Groups:** Mandatory firewalls at the EC2 instance level. By default, they block all inbound traffic and allow all outbound traffic, so you only use allow rules to open specific ports (e.g. HTTP on 80). Unlike Network ACLs, Security Groups are stateful. This means they automatically allow response traffic for initiated connections, without needing separate outbound rules.

Here is a simple example graph that brings these components together:

![Simple AWS VPC architecture graph.](/imgs/aws_vpc_architecture.webp)

## Create a VPC

While AWS provides a default VPC in each region, creating a custom VPC gives you complete control over your network topology.

1. **Navigate to the VPC Dashboard:**
    * Log in to the [AWS Management Console](https://console.aws.amazon.com/).
    * Search for "VPC" in the search bar and select the service.
    * In the VPC dashboard, click "Create VPC".

2. **Configure Your VPC:**
    * Choose "VPC and more", this way we can create additional VPC resources.
    * Leave "Auto-generate" selected.
    * VPC name: `my-flask-app`
    * IPv4 CIDR block: `10.0.0.0/16`
    * Number of [Availability Zones (AZs)](/blog/getting-started-with-aws-core-concepts-and-iam#aws-global-infrastructure): `2`
    * Number of public subnets: `2`
    * Number of private subnets: `0`
    * NAT gateways ($): `None`
    * VPC endpoints: `None`
    * Leave the remaining options as default for now.

Confirm that you see something similar to the following graph and click "Create VPC":

![VPC creation graph.](/imgs/vpc_creation_graph.webp)

AWS will now provision your VPC, subnets, route tables, and IGW. This process might take a few minutes.

## Create a Security Group

A Security Group acts as a virtual firewall, controlling traffic to and from your EC2 instance.

1. **Navigate to Security Groups:**
    * In the VPC dashboard, under "Security" in the left navigation pane, click "Security Groups".
    * Click "Create security group".

2. **Configure the Security Group:**
    * Security group name: `my-flask-app-sg`
    * Description: `Security group for Flask web application`
    * VPC: Select `my-flask-app-vpc`, the VPC you just created.
    * Inbound rules:
        * Click "Add rule" -> Type: `SSH`, Source: `My IP`, or `Anywhere-IPv4` if you need broader access, but `My IP` is more secure.
        * Click "Add rule" -> Type: `HTTP`, Source: `Anywhere-IPv4` to allow web access from anywhere.
        * Click "Add rule" -> Type: `Custom TCP`, Port range: `5000`, Source: `Anywhere-IPv4` if you run Flask on port 5000, although later we'll use Nginx.
    * Outbound rules: Leave as default, allow all outbound traffic.

After clicking "Create security group", you should see something similar to this:

![Security groups screen after sg creation.](/imgs/sg_screen_after_creation.webp)

## Create an EC2 Instance

We'll launch our EC2 instance in the public subnet so it can receive direct internet traffic via the Internet Gateway.

1. **Navigate to EC2 Dashboard:**
    * Search for "EC2" in the AWS Management Console and select the service.
    * Click "Launch instance".

2. **Choose a Name and an Amazon Machine Image (AMI):**
    * Name: `my-flask-app-ec2`
    * Select `Ubuntu Server 24.04 LTS (HVM), SSD Volume Type`. [Free tier](/blog/getting-started-with-aws-core-concepts-and-iam#aws-free-tier) eligible.

3. **Choose an Instance Type:**
    * Select `t3.micro`. Free tier eligible.

4. **Create a Key Pair:**
    * Click "Create new key pair": Give it a name, e.g. `my-flask-app-key`, select [`ED25519`](https://www.geeksforgeeks.org/devops/rsa-vs-ed25519-which-key-pair-is-right-for-your-security-needs/) and download the ".pem" file. **Keep this file secure, as it's your only way to SSH into the instance.**

5. **Configure Network Settings:**
    * Network: Select `my-flask-app-vpc`.
    * Subnet: Select one public subnet.
    * Auto-assign Public IP: `Enable`. This is crucial for direct internet access.
    * Select "Select an existing security group".
    * Choose `my-flask-app-sg`.

6. **Configure Storage:**
    * Keep the default 8 GiB gp3 volume.

7. **Review and Launch:**
    * Review your configuration.
    * Click "Launch instance".

Wait a few minutes for your instance to enter the "running" state. Note its Public IPv4 address.

## Deploy the Flask Web App

Now we'll connect to our EC2 instance via SSH and deploy a simple Flask application.

### Connect to the EC2 Instance

```bash
ssh -i /path/to/my-flask-app-key.pem ubuntu@<Your_EC2_Public_IPv4_Address>
```

Type `yes` if prompted to confirm the host's authenticity.

If after executing the command, nothing happens, and some seconds later you see a "Connection timed out" message, the inbound ssh rule of the security group has the wrong IP. Update the IP using a website like [whatismyip](https://www.whatismyip.com/) or select `Anywhere-IPv4` (not recommended for production).

If you are still having issues, click on your instance, then the "Connect" button at the top right, then go to the "SSH client" tab to see more detailed instructions.

### Create and Deploy the App

Once connected:

1. **Update system packages:**

    ```bash
    sudo apt update && sudo apt upgrade -y
    sudo reboot
    ```

2. **Install Python and pip:**

    ```bash
    sudo apt install python3-pip -y
    ```

3. **Create a directory for the application:**

    ```bash
    mkdir flask_app && cd flask_app
    ```

4. **Create the Flask app files on EC2:**

    ```bash
    nano app.py
    # Paste the app.py content shown below, then Ctrl+X, Y, Enter
    nano requirements.txt
    # Paste the requirements.txt content shown below, then Ctrl+X, Y, Enter
    ```

    `app.py`:

    ```python
    from flask import Flask

    app = Flask(__name__)

    @app.route('/')
    def hello_world():
        return 'Hello from Flask on AWS EC2! Welcome to our scalable application!'

    if __name__ == '__main__':
        app.run(host='0.0.0.0', port=5000)
    ```

    `requirements.txt`:

    ```text
    Flask
    ```

5. **Create and activate a virtual environment:**

    ```bash
    sudo apt install python3-venv -y
    python3 -m venv venv
    source venv/bin/activate
    ```

6. **Install Flask:**

    ```bash
    pip3 install -r requirements.txt
    ```

7. **Run the Flask application (for testing):**

    ```bash
    python3 app.py
    ```

    You should see output like `Running on http://127.0.0.1:5000`.

8. **Test in browser:**

    Open your web browser and navigate to `http://<Your_EC2_Public_IPv4_Address>:5000`. You should see "Hello from Flask on AWS EC2! Welcome to our scalable application!".

    If you don't see anything, make sure you used `http` and not `https` in the address.

9. **Stop the app (`Ctrl+C`).** We need a more robust way to run it.

### Use Gunicorn and Nginx

Running Flask directly with `app.run()` is not suitable for production. We'll use Gunicorn as the WSGI server and Nginx as a reverse proxy.

1. **Install Gunicorn and Nginx:**

    ```bash
    sudo apt install gunicorn nginx -y
    ```

2. **Install Gunicorn for Flask:**

    ```bash
    pip3 install gunicorn
    ```

3. **Create a Gunicorn service file:**

    ```bash
    sudo nano /etc/systemd/system/flask_app.service
    ```

    This command creates a systemd service file for our Flask application. systemd is a system and service manager for Linux, which allows us to manage our Flask application as a background service. Paste the following:

    ```ini
    [Unit]
    Description=Gunicorn instance for Flask App
    After=network.target

    [Service]
    User=ubuntu
    Group=www-data
    WorkingDirectory=/home/ubuntu/flask_app
    ExecStart=/home/ubuntu/flask_app/venv/bin/python3 -m gunicorn --workers 3 --bind 0.0.0.0:5000 app:app
    Restart=always

    [Install]
    WantedBy=multi-user.target
    ```

    This service file tells systemd how to run our Gunicorn server and ensures it restarts automatically if it crashes. *Explore further:* [Setting up a `systemd` service](https://documentation.suse.com/smart/systems-management/html/systemd-setting-up-service/index.html)

4. **Start and enable the Gunicorn service:**

    ```bash
    sudo systemctl daemon-reload
    sudo systemctl start flask_app
    sudo systemctl enable flask_app
    ```

    First, we reload the systemd manager configuration to recognize our new service file. Then, we start the Gunicorn service, and finally we make it start automatically when the EC2 instance boots up.

5. **Configure Nginx as a reverse proxy:**

    ```bash
    sudo nano /etc/nginx/sites-available/flask_app
    ```

    This step creates an Nginx configuration file. Nginx will listen for incoming HTTP requests on port 80 and act as a reverse proxy, forwarding these requests to our Gunicorn server, which is running the Flask app on `http://127.0.0.1:5000`. Paste the following:

    ```nginx
    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://127.0.0.1:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

    `server_name _;`: This tells Nginx to respond to any hostname. While we could enter the running EC2 instance's public ip address instead of the `_` wildcard, the hardcoded ip would cause the auto-scaling later on to not work. The ip addresses change as instances are created / destroyed.

    *Explore further:* [An excellent introduction to Gunicorn and Nginx](https://www.fullstackpython.com/wsgi-servers.html), [a deeper dive into Nginx syntax](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).

6. **Enable the Nginx configuration and restart Nginx:**

    ```bash
    sudo ln -s /etc/nginx/sites-available/flask_app /etc/nginx/sites-enabled
    sudo rm /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    ```

    We create a symbolic link to enable the Nginx configuration. then delete the default site (which also listens to port 80) to avoid priority issues, then test the Nginx configuration for syntax errors, and finally, restart the Nginx service to apply our new configuration, making the Flask application accessible via Nginx.

    Now, you should be able to access the Flask application directly on port 80 (HTTP) by navigating to `http://<Your_EC2_Public_IPv4_Address>` in your browser.

## (Optional) Load Balancing and Auto Scaling

To make our Flask application truly scalable and highly available, we'll introduce an Elastic Load Balancer (ELB) and an Auto Scaling Group (ASG). This ensures our application can handle increased traffic and remains available even if an instance fails.

### What is an ELB

An ELB automatically distributes incoming application traffic across multiple targets, such as EC2 instances, in multiple Availability Zones. ELB is a highly available and automatically scalable regional service managed by AWS.

We'll use an Application Load Balancer (ALB), which operates at the [application layer](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/) (Layer 7). Other types of load balancers are: Network Load Balancer (NLB) and Gateway Load Balancer (GLB).

![AWS load balancer types.](/imgs/aws_load_balancer_types.webp)

**Key Components:**

1. **Listeners:** Check for incoming requests on a specified port and protocol. Here we define the protocol (e.g. HTTP) and port (e.g. 80) the load balancer listens on. There can be many listeners for a single load balancer.
2. **Target Groups:** A logical grouping of backend resources (e.g. EC2 instances, Lambda functions) that the load balancer routes traffic to. We have to define the backend target type, as well as how the load balancer checks the health of targets within the group to ensure they are ready to receive traffic.
3. **Rules:** To associate a target group to a listener, a rule must be used, they determine how requests are routed to specific target groups.

### What is an ASG

An ASG ensures that you have a specified number of healthy instances running at all times. It can automatically adjust the number of instances in your group up or down in response to demand, according to the scaling policies you define. This helps maintain performance and reduce costs by only running instances when needed.

**Key Components:**

1. **Launch Template:** It specifies the configuration for all new EC2 instances, guaranteeing consistency.
2. **Scaling policies:** They define when the resources should be added or removed.

### Create an AMI

For Auto Scaling to launch new instances with the Flask app pre-configured, we'll create an Amazon Machine Image (AMI) from the current EC2 instance.

1. Navigate to EC2 Dashboard -> Instances.
2. Select the `my-flask-app-ec2` instance.
3. Click "Actions" -> "Image and templates" -> "Create image".
4. Image name: `my-flask-app-ami`
5. Image description: `AMI for Flask web application with Gunicorn and Nginx`
6. Click "Create image". This process can take several minutes.

### Create a Launch Template

Launch templates are a newer way to specify the instance configuration for Auto Scaling groups, replacing launch configurations.

1. Navigate to EC2 Dashboard -> Launch Templates.
2. Click "Create launch template".
3. Launch template name: `my-flask-app-lt`
4. Description: `Launch template for Flask web application`
5. AMI: Select the `my-flask-app-ami` you just created, under "My AMIs" -> "Owned by me".
6. Instance type: `t3.micro`
7. Key pair (login): Select the existing `my-flask-app-key` key pair.
8. Network settings:
    * Security groups: Select the `my-flask-app-sg`.
    * Auto-assign Public IP: `Enable`. The setting should be visible in the "Advanced network configuration". You may have to click "Add network interface" first.
9. Leave other settings as default.
10. Click "Create launch template".

### Create an ALB

1. Navigate to EC2 Dashboard -> Load Balancers.
2. Click "Create Load Balancer".
3. Choose "Application Load Balancer" and click "Create".
4. Load balancer name: `my-flask-app-alb`
5. Scheme: `Internet-facing`
6. IP address type: `IPv4`
7. VPC: Select `my-flask-app-vpc`.
8. Mappings: Select both your public subnets (e.g. `10.0.0.0/20` in `eu-north-1a` and `10.0.16.0/20` in `eu-north-1b`). This provides high availability across AZs.
9. Security groups: Create a new security group for the ALB:
    * Security group name: `alb-sg`
    * Description: `Security group for Flask App ALB`
    * VPC: `my-flask-app-vpc`
    * Inbound rules:
        * Type: `HTTP`, Source: `0.0.0.0/0`
    * Click "Create security group" and then select `alb-sg` for your ALB.
10. Listeners and routing:
    * Protocol: `HTTP`, Port: `80`.
    * Create target group: Click "Create target group".
        * Target group name: `my-flask-app-tg`
        * Target type: `Instances`
        * Protocol: `HTTP`, Port: `80`, as Nginx is listening on port 80.
        * IP address type: `IPv4`
        * VPC: `my-flask-app-vpc`
        * Health checks: Path `/`
        * Click "Create target group".
11. Return to the Load Balancer creation page, click the refresh icon next to "Choose a target group", and select `my-flask-app-tg`.

Make sure the "Summary" looks similar to this and click "Create load balancer":

![ALB creation summary.](/imgs/aws_alb_creation_summary.webp)

Wait for the ALB to become `active`, note its DNS name.

### Create an ASG

1. Navigate to EC2 Dashboard -> Auto Scaling Groups.
2. Click "Create Auto Scaling group".
3. Auto Scaling group name: `my-flask-app-asg`
4. Launch template: Select `my-flask-app-lt`.
5. Click "Next".
6. Network:
    * VPC: Select `my-flask-app-vpc`.
    * Subnets: Select **both** the public subnets. This allows ASG to launch instances across AZs.
7. Load balancing: Select "Attach to an existing load balancer".
    * Choose from your load balancer target groups: Select `my-flask-app-tg`.
    * Health checks: Enable "ELB health checks".
8. Click "Next".
9. Configure group size and scaling policies:
    * Desired capacity: `2` (Start with two instances)
    * Scaling:
        * Minimum capacity: `2`
        * Maximum capacity: `4`
        * Choose "Target tracking scaling policy".
        * Policy name: `CPU Utilization`
        * Metric type: `Average CPU utilization`
        * Target value: `60`. This means ASG will add instances if CPU goes above 60%.
    * Additional Settings: Enable monitoring within CloudWatch.
    * Click "Next".
10. Add Notifications (Optional): You can set up SNS notifications here.
11. Add Tags (Optional):
    * `Key: Name`, `Value: FlaskASGInstance`
12. Review and create.

Now, your Auto Scaling group will launch instances based on your launch template, and these instances will be registered with your Application Load Balancer. It might take a few minutes for instances to launch and become healthy.

Once active, navigate to your ALB's DNS name in your browser. You should see the Flask application! Try terminating one of the instances in the ASG – the ASG should automatically launch a replacement, demonstrating its self-healing capability.

### Final Architecture

This diagram illustrates the final architecture for our highly available and scalable Flask web application on AWS.

![Final architecture.](/imgs/aws_final_alb_asg_architecture.webp)

Incoming internet traffic passes through the Internet Gateway (IGW) into our VPC. An Application Load Balancer (ALB) distributes requests to Amazon EC2 instances. Each EC2 instance, running our Flask application via Nginx and Gunicorn, resides within a public subnet and is protected by its own Security Group, controlling inbound and outbound traffic.

Although not explicitly shown for simplicity, these EC2 instances are managed by an Auto Scaling Group (ASG), ensuring that the desired number of healthy instances are running at all times and dynamically adjusting capacity based on demand. The ALB also has its own Security Group to manage traffic flow to the load balancer itself.

## Cleanup

To avoid unnecessary charges, delete the Auto Scaling Group, Application Load Balancer, EC2 instances, Security Groups, Network Interfaces and finally the VPC you created. Ensure all resources associated with `my-flask-app` are removed!

## (Optional) Explore Further

* **Production-Ready Architecture with Private Subnets:** To enhance security and mimic a production setup, redeploy the EC2 instances into a private subnet. Configure a NAT Gateway in a public subnet to enable internet access (e.g. `apt update`) for these private instances, as they won't be directly exposed to the internet.
* **Custom Domains with Route 53:** Map your ALB's DNS name to a custom domain name using Amazon Route 53 for a more professional URL.
* **HTTPS with AWS Certificate Manager (ACM):** Integrate ACM with your ALB to serve your application over HTTPS, ensuring secure communication.
* **Database Integration (RDS):** Connect your Flask application to a relational database like PostgreSQL or MySQL using Amazon RDS in a private subnet. This would further enhance the scalability and persistence of your data.
* **Logging and Monitoring with CloudWatch:** Set up detailed CloudWatch logs for your EC2 instances and Nginx, and create custom metrics and alarms for your Flask application.

## Final Words

Congratulations! You've just built a robust and scalable web application infrastructure on AWS, starting from fundamental networking concepts in VPC, deploying the application on EC2, and then enhancing it with Elastic Load Balancing and Auto Scaling.

This architecture provides a solid foundation for deploying production-grade applications that can handle varying loads and remain highly available.

Let me know if you have a preference on what you would like to see next!
