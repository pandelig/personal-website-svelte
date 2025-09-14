---
slug: "ten-linux-terminal-tricks-to-supercharge-your-workflow"
date: "14 Sep 2025"
date_updated: ""
tags: ["linux"]
title: "10 Linux Terminal Tricks to Supercharge Your Workflow"
meta_description: "Master your Linux terminal with these 10 powerful and time-saving command-line tricks. Learn how to navigate faster, re-run commands quickly, and monitor logs in real-time easily. This guide by Pantelis Deligiannidis is perfect for developers, system administrators, and anyone looking to boost their productivity."
---

I recently came across the `cd -` command and was surprised by what a simple but handy trick it is. So, I decided to create the following list of useful Linux commands that may be common knowledge to some but definitely not to most!

## 1. `cd -`: Change to Last Dir

It lets us quickly switch back to the previous directory we were in, saving us from typing out long paths.

**Example:**

```bash
pwd
# shows e.g. /home/user/repos/infrastructure/prod/aws/

# We need to switch to our application code to check something
cd /home/user/repos/microservice-api/

# After a quick look, we want to get back to our aws directory
cd -
# Now we are back in /home/user/repos/infrastructure/prod/aws/
```

## 2. `pushd` and `popd`: Dir Stack

These two commands let us manage a stack of directories. `pushd` changes to a directory and adds it to the stack, while `popd` removes the top directory from the stack and changes to it. This is more powerful than `cd -` for navigating multiple directories.

**Example:**

```bash
~$ pushd my-svelte-app/
~/my-svelte-app ~

~/my-svelte-app$ pushd ../projects/my_eks_k8s_flask_app/
~/projects/my_eks_k8s_flask_app ~/my-svelte-app ~

~/projects/my_eks_k8s_flask_app$ popd
~/my-svelte-app ~

~/my-svelte-app$ popd
~

~$
```

## 3. `!!`: Repeat Last Command

Typing `!!` will execute the last command we entered. It's particularly useful for commands that fail due to permission errors.

**Example:**

```bash
apt update  # Permission denied, we forgot sudo
sudo !!     # This runs: sudo apt update
```

## 4. `tee`: Write to File and stdout

The `tee` command is used for both displaying output on the screen and saving it to a file simultaneously.

**Example:**

```bash
$ echo "Hello World!" | tee output.txt
Hello World!
```

This will print "Hello World!" to the terminal and also save it in `output.txt`. We can also append output to a file by using the `-a` flag.

## 5. `tree`: Print Dir Structure

The `tree` command is a simple but powerful tool for visualizing the directory hierarchy in a clear, tree-like format.

**Example:**

```bash
$ tree
.
├── README.md
└── project_folder
    ├── app.py
    ├── config.ini
    └── data
        ├── dataset.csv
        └── raw_data
            └── temp.txt

4 directories, 5 files
```

Some useful flags are:

- `-a`: i.e. `tree -a` to also list hidden files.
- `-L`: e.g. `tree -L 1` to limit the depth of the directory tree to 1.
- `-d`: i.e. `tree -d` to see only the directory structure without listing the files.
- `-h`: i.e. `tree -h` to display file sizes in a human-readable format.

## 6. `cat -n`: Number Lines

The standard cat command just prints a file's content to the terminal, the -n flag adds line numbers.

**Example:**

```bash
$ cat -n fruits.py
     1  fruits = ["apple", "banana", "cherry"]
     2
     3  for fruit in fruits:
     4      print(f"I have a {fruit}.")
     5
     6  print("Finished!")
```

A common alternative is `less -N fruits.py`.

## 7. `{...}`: Brace Expansion

This shell feature lets us generate multiple strings from a single pattern. It's great for creating multiple files or directories with a consistent naming scheme.

**Examples:**

```bash
mkdir -p project/{src,bin,lib}
```

This creates three directories: `project/src`, `project/bin`, and `project/lib` (and the `project` directory if needed due to `-p`).

```bash
touch file{1..3}.txt
```

This creates three files: `file1.txt`, `file2.txt`, and `file3.txt`.

## 8. `$(...)`: Command Substitution

The `$(...)` syntax is a form of command substitution. It allows us to use the output of a command as an argument for another command. The shell first executes the command inside the parentheses, then replaces the entire `$(...)` expression with the command's standard output.

**Example:**

Let's say we want to create a new directory with a timestamp in its name. Without command substitution, we would first need to run `date` to get the timestamp, then copy and paste the output into the `mkdir` command:

```bash
$ date +%Y-%m-%d
2025-09-14
$ mkdir project_2025-09-14
```

Using `$(...)`, we can do it all in a single command, as the output of `date` is directly passed to `mkdir`:

```bash
mkdir project_$(date +%Y-%m-%d)
```

This command first executes `date +%Y-%m-%d` and returns its output, `2025-09-14`. The shell then substitutes this value into the `mkdir` command, resulting in `mkdir project_2025-09-14`.

## 9. `watch`: Periodic Execution

This command runs a command repeatedly, displaying the output in full-screen view. It's perfect for monitoring logs, disk usage, or any other live data.

**Example:**

```bash
# Check disk space every 2 seconds
watch -n 2 df -h
```

## 10. `tail -f`: Follow a File

This command is used to output the last part of a file, similar to a regular `tail` command, but with a crucial difference: the `-f` flag tells it to "follow" the file. This means that as new lines are added to the file by another process, `tail -f` will automatically display them in the terminal in real-time. This is indispensable for monitoring log files as they're being written.

**Example:**

```bash
# View the end of the log file and follow new entries
tail -f /var/log/my-flask-app/app.log
```

## Final Words

I hope you learned something new! Mastering the terminal is a continuous journey, the best way to learn is to practice. Try integrating one new command into your workflow each day and see how much time you can save!
