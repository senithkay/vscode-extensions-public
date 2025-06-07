#!/bin/bash

# Script to download MI language server ZIP if not present
# Usage: ./download-ls.sh

# Constants
LS_DIR="./ls"
GITHUB_REPO_URL="https://api.github.com/repos/wso2/mi-language-server"

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

# Check if unzip is available
if ! command -v unzip &> /dev/null; then
    echo "Error: unzip is required but not installed. Please install unzip first."
    exit 1
fi

# Check if any files already exist in the ls directory
if [ -d "$LS_DIR" ] && [ "$(ls -A "$LS_DIR" 2>/dev/null)" ]; then
    echo "MI language server files already exist in $LS_DIR"
    exit 0
fi

echo "Downloading MI language server..."

# Create ls directory if it doesn't exist
mkdir -p "$LS_DIR"

# Get the asset ID for the latest language server ZIP
echo "Fetching latest release information..."
asset_info=$(curl -sL -H "Accept: application/vnd.github.v3+json" \
    "$GITHUB_REPO_URL/releases/latest")

# Check if curl request was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to fetch release information from GitHub API"
    exit 1
fi

asset_id=$(echo "$asset_info" | jq -r '.assets[] | select(.name | contains("mi-language-server-")) | .id')
asset_name=$(echo "$asset_info" | jq -r '.assets[] | select(.name | contains("mi-language-server-")) | .name')

if [ -z "$asset_id" ] || [ "$asset_id" = "null" ]; then
    echo "Error: Could not find language server ZIP asset ID"
    echo "Available assets:"
    echo "$asset_info" | jq -r '.assets[].name' 2>/dev/null || echo "Could not parse asset information"
    exit 1
fi

echo "Found asset ID: $asset_id"
echo "Asset name: $asset_name"

# Set the temporary file path for download
TEMP_ZIP="/tmp/mi-language-server.zip"

# Download the ZIP file using curl
echo "Downloading language server ZIP..."
curl -sL -H "Accept: application/octet-stream" \
    "$GITHUB_REPO_URL/releases/assets/$asset_id" \
    -o "$TEMP_ZIP"

download_exit_code=$?

if [ $download_exit_code -eq 0 ] && [ -f "$TEMP_ZIP" ] && [ -s "$TEMP_ZIP" ]; then
    echo "Successfully downloaded MI language server ZIP"
    file_size=$(stat -f%z "$TEMP_ZIP" 2>/dev/null || stat -c%s "$TEMP_ZIP" 2>/dev/null || echo "unknown")
    echo "File size: $file_size bytes"
    
    # Unzip the contents to the ls directory
    echo "Extracting language server files..."
    unzip -j "$TEMP_ZIP" -d "$LS_DIR"
    unzip_exit_code=$?
    
    # Clean up the temporary ZIP file
    rm -f "$TEMP_ZIP"
    
    if [ $unzip_exit_code -eq 0 ]; then
        echo "Successfully extracted MI language server files to $LS_DIR"
        echo "Contents:"
        ls -la "$LS_DIR"
    else
        echo "Error: Failed to extract language server ZIP (exit code: $unzip_exit_code)"
        exit 1
    fi
else
    echo "Error: Failed to download language server ZIP (exit code: $download_exit_code)"
    # Clean up incomplete download
    [ -f "$TEMP_ZIP" ] && rm -f "$TEMP_ZIP"
    exit 1
fi 
