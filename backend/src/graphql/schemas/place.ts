import { gql } from 'apollo-server-express';

export default gql`
  type Place {
    id: ID!
    name: String!
    photoUri: String!
    latitude: Float!
    longitude: Float!
    expenses: [Expense!]
    createdAt: Date!
    updatedAt: Date!
  }
`;
