# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/userservice

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

ARG BASE_URI=""
ENV CORS_ORIGIN=$BASE_URI

# Copy the app source code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8001

# Define the command to run your app
CMD ["node", "user-service.js"]
