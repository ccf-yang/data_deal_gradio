#!/bin/bash

# Function to show current status
show_status() {
    echo "=== Current Git Status ==="
    git status
}

# Function to merge changes to main
merge_to_main() {
    echo "=== Merging to main ==="
    git add . && \
    git commit -m "final changes before merging" && \
    git checkout main && \
    git pull origin main && \
    git merge yang && \
    git push origin main && \
    git checkout yang && \
    git push origin yang
}

# Function to create new feature branch
create_feature_branch() {
    if [ -z "$1" ]
    then
        echo "Please provide a feature name"
        exit 1
    fi
    echo "=== Creating new feature branch: feature/$1 ==="
    git checkout -b "feature/$1"
}

# Function to discard changes and return to main
rollback_changes() {
    echo "=== Rolling back to main ==="
    git checkout main
    git pull origin main
}

# Show usage
echo "Git Command Helper"
echo "Usage:"
echo "1. ./git_command.sh status - Show current git status"
echo "2. ./git_command.sh merge - Merge yang branch to main"
echo "3. ./git_command.sh feature <name> - Create new feature branch"
echo "4. ./git_command.sh rollback - Discard changes and return to main"

# Handle command line arguments
case "$1" in
    "status")
        show_status
        ;;
    "merge")
        merge_to_main
        ;;
    "feature")
        create_feature_branch "$2"
        ;;
    "rollback")
        rollback_changes
        ;;
    *)
        echo "Invalid command. Use: status, merge, feature, or rollback"
        ;;
esac
