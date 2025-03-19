#!/bin/bash

os_name=$(uname -s)
echo "Operating System detected: $os_name"

if [ "$os_name" = "Linux" ]; then
    echo "Checking dependencies for Linux..."

    # git
    if ! command -v git >/dev/null 2>&1; then
        echo "Installing git..."
        sudo apt-get update && sudo apt-get install -y git
    else
        echo "git is already installed."
    fi

    # Node.js
    if ! command -v node >/dev/null 2>&1; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo "Node.js is already installed."
    fi

    # npm
    if ! command -v npm >/dev/null 2>&1; then
        echo "Installing npm..."
        sudo apt-get install -y npm
    else
        echo "npm is already installed."
    fi

    # yarn
    if ! command -v yarn >/dev/null 2>&1; then
        echo "Installing yarn..."
        sudo npm install -g yarn
    else
        echo "yarn is already installed."
    fi

    # GNU Make
    if ! command -v make >/dev/null 2>&1; then
        echo "Installing GNU Make (build-essential)..."
        sudo apt-get install -y build-essential
    else
        echo "GNU Make is already installed."
    fi

    # Perl-Digest-SHA
    if perl -MDigest::SHA -e '1' 2>/dev/null; then
        echo "Perl-Digest-SHA is already installed."
    else
        echo "Installing Perl-Digest-SHA..."
        sudo apt-get install -y libdigest-sha-perl
    fi

elif [ "$os_name" = "Darwin" ]; then
    echo "Checking dependencies for macOS..."

    # git
    if ! command -v git >/dev/null 2>&1; then
        echo "Installing git..."
        brew install git
    else
        echo "git is already installed."
    fi

    # Node.js
    if ! command -v node >/dev/null 2>&1; then
        echo "Installing Node.js..."
        brew install node
    else
        echo "Node.js is already installed."
    fi

    # npm
    if ! command -v npm >/dev/null 2>&1; then
        echo "npm is not detected. Installing npm..."
        brew install npm
    else
        echo "npm is already installed."
    fi

    # yarn
    if ! command -v yarn >/dev/null 2>&1; then
        echo "Installing yarn..."
        brew install yarn
    else
        echo "yarn is already installed."
    fi

    # GNU Make
    if ! command -v make >/dev/null 2>&1; then
        echo "Installing GNU Make..."
        brew install make
    else
        echo "GNU Make is already installed."
    fi

    # Perl-Digest-SHA
    if perl -MDigest::SHA -e '1' 2>/dev/null; then
        echo "Perl-Digest-SHA is already installed."
    else
        echo "Installing Perl-Digest-SHA..."
        brew install perl
        brew install cpanminus
        cpanm Digest::SHA
    fi

else
    echo "Unsupported OS: $os_name"
fi

echo "All specified dependencies are installed (if they were not already available)."
