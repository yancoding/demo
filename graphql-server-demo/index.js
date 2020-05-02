const { ApolloServer, gql } = require('apollo-server');

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const photo = []

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  type Photo {
    id: ID!
    name: String!
    url: String
    description: String
  }
  type Query {
    photos: [Photo!]!
  }

  type Mutation {
    uploadPhoto(name: String description: String): Photo
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    photos: () => photo
  },
  Mutation: {
    uploadPhoto: (obj, { name, description }, context) => {
      console.log(context.token)
      let id = photo.length
      photo.push({ id, name, description })
      return photo[id]
    }
  }
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || 'token'
    return { token }
  }
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});