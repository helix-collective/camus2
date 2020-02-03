#!/bin/bash
set -e

# docker login, so we can access images from AWS ECRs
eval $(/opt/bin/hx-deploy-tool aws-docker-login-cmd)

# and pull the ones we need
docker-compose pull
