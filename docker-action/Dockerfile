# Container image that runs your code
#FROM alpine:3.10
FROM alpine/git:latest

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh
COPY eslint-compact.json /eslint-compact.json

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
