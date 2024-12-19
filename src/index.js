import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { gql } from 'graphql-tag'; // for defining schema
import cors from 'cors';
import { prismaClient } from '../lib/db.js'; // Ensure the correct path and file extension

async function init() {
  const app = express();
  const port = process.env.PORT || 8000;

  app.use(express.json());
  app.use(cors());

  // Define GraphQL schema
  const typeDefs = gql`
    type Query {
      hello: String
      say(name: String!): String
      users: [User]
    }
    type Mutation {
      createdUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean
    }
    type User {
      id: Int
      firstName: String
      lastName: String
      email: String
    }
  `;

  // Define resolvers
  const resolvers = {
    Query: {
      hello: () => 'Hello, world!',
      say: (_, { name }) => `Hey, ${name}!`,
      users: async () => await prismaClient.user.findMany(),
    },
    Mutation: {
      createdUser: async (_, { firstName, lastName, email, password }) => {
        try {
          await prismaClient.user.create({
            data: {
              firstName,
              lastName,
              email,
              password,
              salt: 'random_salt',
            },
          });
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      },
    },
  };

  // Create an ApolloServer instance
  const gqlServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start the Apollo Server
  await gqlServer.start();

  // Set up Express routes
  app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
  });

  // Use Apollo Server middleware with Express
  app.use('/graphql', expressMiddleware(gqlServer));

  // Start the Express app
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

init();
