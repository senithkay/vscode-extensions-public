#!/bin/bash

# Script to download Ballerina language server JAR if not present
# Usage: ./download-ls.sh

# Constants
LS_DIR="./ls"
GITHUB_REPO_URL="https://api.github.com/repos/nipunayf/ballerina-language-server"

# Check if any JAR file already exists in the ls directory
if ls "$LS_DIR"/*.jar 1> /dev/null 2>&1; then
    echo "Ballerina language server JAR already exists in $LS_DIR"
    exit 0
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed. Please install jq first."
    exit 1
fi

# Check if curl is available
if ! command -v curl &> /dev/null; then
    echo "Error: curl is required but not installed. Please install curl first."
    exit 1
fi

echo "Downloading Ballerina language server..."

# Create ls directory if it doesn't exist
mkdir -p "$LS_DIR"

# Get the asset ID for the latest language server JAR
echo "Fetching latest release information..."
asset_info=$(curl -sL -H "Accept: application/vnd.github.v3+json" \
    "$GITHUB_REPO_URL/releases/latest")

# Check if curl request was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to fetch release information from GitHub API"
    exit 1
fi

asset_id=$(echo "$asset_info" | jq -r '.assets[] | select(.name | contains("ballerina-language-server-") and endswith(".jar")) | .id')
asset_name=$(echo "$asset_info" | jq -r '.assets[] | select(.name | contains("ballerina-language-server-") and endswith(".jar")) | .name')

if [ -z "$asset_id" ] || [ "$asset_id" = "null" ]; then
    echo "Error: Could not find language server JAR asset ID"
    echo "Available assets:"
    echo "$asset_info" | jq -r '.assets[].name' 2>/dev/null || echo "Could not parse asset information"
    exit 1
fi

echo "Found asset ID: $asset_id"
echo "Asset name: $asset_name"

# Set the output file path
LS_JAR="$LS_DIR/$asset_name"

# Download the JAR file using curl
echo "Downloading language server JAR..."
curl -sL -H "Accept: application/octet-stream" \
    "$GITHUB_REPO_URL/releases/assets/$asset_id" \
    -o "$LS_JAR"

download_exit_code=$?

if [ $download_exit_code -eq 0 ] && [ -f "$LS_JAR" ] && [ -s "$LS_JAR" ]; then
    echo "Successfully downloaded Ballerina language server to $LS_JAR"
    file_size=$(stat -f%z "$LS_JAR" 2>/dev/null || stat -c%s "$LS_JAR" 2>/dev/null || echo "unknown")
    echo "File size: $file_size bytes"
else
    echo "Error: Failed to download language server JAR (exit code: $download_exit_code)"
    # Clean up incomplete download
    [ -f "$LS_JAR" ] && rm -f "$LS_JAR"
    exit 1
fi 
