#!/bin/bash

while true; do
  # Find all images and display with fim
  fim -a -R 5 -q ~/digital-signage/slides/*.png 2>/dev/null
  sleep 5
done