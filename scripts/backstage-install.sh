#!/bin/bash

# install base backstage app
echo "Installing the latest Backstage app"
BACKSTAGE_APP_NAME=backstage npx -y -q @backstage/create-app@latest --path ./backstage

# Copy the backstage-plugins into the backstage/plugins directory
echo "Copying AWS Apps plugins"
# \cp -R ./backstage-plugins/ ./backstage
cd backstage

echo "Copying the aws production configuration to backstage"
cp ../config/app-config.aws-production.yaml .

# Install backend dependencies
echo "Installing backend dependencies"
yarn --cwd packages/backend add \
    "@roadiehq/catalog-backend-module-okta" \
    "@immobiliarelabs/backstage-plugin-gitlab-backend" \
    "@aws/plugin-aws-apps-backend-for-backstage" \
    "@aws/plugin-scaffolder-backend-aws-apps-for-backstage"

# Install frontend dependencies
echo "Installing frontend dependencies"
yarn --cwd packages/app add \
    "@immobiliarelabs/backstage-plugin-gitlab" \
    "@aws/plugin-aws-apps-for-backstage" \
    "@backstage/plugin-home" \
    "@aws/plugin-aws-apps-demo-for-backstage"

# Copy/overwrite modified backstage files.
# Note that these modifications were based on modifying Backstage 1.13 files.  
# Later versions of Backstage may modify the base versions of these files and the overwrite action may wipe out intended Backstage changes.
# A preferred approach is to be intentional in the customization of Backstage and follow the instructions in the 
# plugins' README files to manually modify the Backstage source files
\cp -R ../backstage-mods/* .
