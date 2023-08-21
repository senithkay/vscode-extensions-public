#!/bin/bash

# Start xvfb
xvfb-run --listen-tcp --server-num 98.0 -s "-ac -screen 0 1920x1080x24" pnpm run e2e-test > test-resources/output.txt 2>&1 &
XVFB_RUN_PID=$!

# Wait for xvfb to start (adjust the sleep time as needed)
sleep 2

# Start recording with ffmpeg
ffmpeg -video_size 1920x1080 -framerate 25 -f x11grab -i :98.0 test-resources/e2e-test-out.mp4

# Wait for the xvfb-run process to finish
wait $XVFB_RUN_PID

# Capture the exit code of xvfb-run process
XVFB_RUN_EXIT_CODE=$?

# Check if xvfb-run command failed
if [ $XVFB_RUN_EXIT_CODE -ne 0 ]; then
  echo "log=$(cat test-resources/output.txt)" >> $GITHUB_OUTPUT
  echo "xvfb-run failed with exit code $XVFB_RUN_EXIT_CODE"
  exit $XVFB_RUN_EXIT_CODE
fi