const { ApolloServer, gql } = require('apollo-server');
let users = [
  {
    id: 1,
    firstname: 'bob',
    lastname: 'kameel',
    email: 'b@g.com',
    isSuspended: true,
    dob: '15-2-2020',
  },
  {
    id: 2,
    firstname: 'mike',
    lastname: 'kameel',
    email: 'jjjj',
    isSuspended: true,
    dob: '15-2-2020',
  },
  {
    id: 3,
    firstname: 'mina',
    lastname: 'kameel',
    email: 'm@g.com',
    isSuspended: true,
    dob: '15-2-2020',
  },
];
let comments = [
  { id: 1, content: 'this is my comment', user: users[1], date: '15-2-2020' },
];
let articles = [
  {
    id: 1,
    title: 'article1',
    body: 'article body1',
    date: '15-2-2020',
    author: users[0],
    comments: [comments[0]],
  },
  {
    id: 2,
    title: 'article2',
    body: 'article body2',
    date: '15-2-2020',
    author: users[0],
    comments: [comments[0]],
  },
  {
    id: 3,
    title: 'article3',
    body: 'article body13',
    date: '15-2-2020',
    author: users[0],
    comments: [comments[0]],
  },
];
const schema = `
type Article {
    id:ID!
    firstname:String!
    lastname:String!
    email:String
    dob:Date
    isSusbended:Boolean
    articles:[Article]    
    }

type Comment {
    id:ID!
    content:String!
    date:Date!
    user:User
    
    }

type Article {
id:ID!
title:String!
body:String!
content:String

}

type Query {
    allArticles:[Article]
}
type Mutation {
    deleteArticle (id: Int): [Article]
createArticle(id: Int, title: String,
body:String,
author:Int): [Article]
    
 }
`;

const resolvers = {
  Query: {
    allArticles: (_, { last }) => {
      if (!last) return articles;
      if (last) return articles.slice(articles.length - last);
    },
  },
  Mutation: {
    deleteArticle: (_, { id }) => {
      articles = articles.filter((article) => article.id !== id);
      return articles;
    },
    createArticle: (_, { id, title, body, content, author }) => {
      articles.push({
        id,
        title,
        body,
        content,
        author: users.filter((user) => user.id === author)[0],
      });
      return articles;
    },
  },
};

const typeDefs = gql(schema);
const server = new ApolloServer({ typeDefs, resolvers });
server.listen(4200).then(({ url }) => {
  console.log(`url is ${url}`);
});
