FROM node:20.12-bookworm-slim
RUN apt-get update && \
    apt-get install -y git && \
    apt-get install -y openjdk-17-jdk && \
    apt-get install -y maven;
WORKDIR /workspace
RUN yarn install --frozen-lockfile