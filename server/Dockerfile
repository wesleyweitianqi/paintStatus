# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory for your server
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install the server dependencies
RUN npm install

# Copy the rest of the server files
COPY . .

# Expose the port your server will run on (e.g., 8082)
EXPOSE 8082

# Command to start the server
CMD ["npm", "start"]
