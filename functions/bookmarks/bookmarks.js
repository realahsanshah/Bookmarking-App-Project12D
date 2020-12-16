const {ApolloServer,gql} = require('apollo-server-lambda');
const faunadb=require('faunadb')
const query=faunadb.query;

const typeDefs=gql`
  type Query{
    message:String
    getWebsites:[Website]
  }


  type Website{
    id:String
    name:String
    link:String
  }

`

const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET,
});

const resolvers={
  Query:{
    message:()=>{
      return "Hello with Bookmarks"
    },
    getWebsites:async ()=>{
      var result = await client.query(
        query.Map(
          query.Paginate(query.Documents(query.Collection("websites"))),
          query.Lambda(x => query.Get(x))
        )
      )

      const websites=result.data.map(website=>({id:website.ref.id,name:website.data.name,link:website.data.link,}))

      return websites

      // return [{id:'1',name:"Google",link:"https://www.google.com"}]
    }
  }
}

const server=new ApolloServer({
  typeDefs,
  resolvers,
  playground:true,
  introspection:true
});

exports.handler=server.createHandler();