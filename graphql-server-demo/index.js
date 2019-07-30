const { ApolloServer, gql } = require('apollo-server')

const books = [
    {
        title: 'Harry Potter and the Chamber of Secrets',
        author: 'J.K. Rowling',
    },
    {
        title: 'Jurassic Park',
        author: 'Michael Crichton',
    },
]

const typeDefs = gql`
    type Book {
        title: String
        author: String
    }

    type Query {
        books(bookId: Int!): [Book]
    }
`

const resolvers = {
    Query: {
        books: ({bookId}) => {
            console.log(bookId)
            let arr = []
            arr.push(books[bookId])
            return arr
        },
    },
}

const server = new ApolloServer({ typeDefs, resolvers })

server.listen()
    .then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`)
    })