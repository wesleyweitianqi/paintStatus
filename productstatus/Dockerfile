# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory for your app
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your React app runs on
EXPOSE 3000

# Command to run the React app
CMD ["npm", "start"]



