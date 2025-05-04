//mkdir graphql-api && cd graphql-api
//npm init -y
//npm install express express-graphql graphql mongoose

// db.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

module.exports = mongoose.model('User', userSchema);

const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLID } = require('graphql');
const User = require('./models/User');

// User Type
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
    }),
});

// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { _id: { type: GraphQLID } },
            resolve(parent, args) {
                return User.findById(args._id);
            },
        },
        users: {
            type: require('graphql').GraphQLList(UserType),
            resolve() {
                return User.find();
            },
        },
    },
});


// Mutation
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                name: { type: GraphQLString },
                email: { type: GraphQLString },
            },
            resolve(parent, args) {
                const user = new User({
                    name: args.name,
                    email: args.email,
                });
                return user.save();
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});

// server.js
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema');
require('./db');

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000/graphql');
});


//node server.js

// mutation {
//     addUser(name: "Alice", email: "alice@example.com") {
//       name
//       email
//     }
//   }

//Retrieval
//---------------------
// {
//     users {
//       id
//       name
//       email
//     }

// {
//     user(_id: "6817a0d4d8df76c4bbc7a5ee") {
//       name
//       email
//     }
// }
