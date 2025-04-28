# Node.js API with REST and GraphQL Endpoints

## Description
This project is a Node.js backend API built with GraphQL for querying and mutating data. It focuses on modularity and scalability, ensuring that the API is easy to maintain and extend. The project follows best practices, such as using Apollo Server for the GraphQL layer, and also includes authentication, authorization, and database interaction functionalities.

## Features
* GraphQL API: Interact with the backend using GraphQL.
* Apollo Server: Handles GraphQL requests.
* Node.js & Express: Backend built with Node.js and Express.
* MongoDB: NoSQL database for data storage.
* Modular & Scalable: Easy to add new features and endpoints.

## Installation
Make sure you have the following installed:
- Node.js (>=18.0.0)

## Steps
1. Clone the repository:
- git clone https://github.com/luizcurti/node-rest-graphql-api.git

2. Navigate to the project directory:
- cd node-rest-graphql-api

3. Install dependencies:
- npm install

## Run the application:
- npm run dev

The server will start running on http://localhost:4003 (or the port you specified).

## GraphQL Playground
Once the application is running, you can test your GraphQL queries and mutations by navigating to the following URL:

http://localhost:4003/graphql

This will open up the GraphQL Playground where you can interact with the API by writing GraphQL queries and mutations.

## Postman Collections
Additionally, we have two Postman collections available at the root of the project:

- GraphQL API.postman_collection.json
- REST API.postman_collection.json

You can easily import these collections into Postman and start testing the respective APIs with pre-configured requests.

## Running Tests
To run the tests for the application, you can use the following command:
- npm run test 
