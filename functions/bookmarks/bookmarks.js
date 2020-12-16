const {ApolloServer,gql} = require('apollo-server-lambda');
const faunadb=require('faunadb')
const query=faunadb.query;

const typeDefs=gql`
  type Query{
    getWebsites:[Website]

  }

  type Mutation {
    addWebsite(name:String,link:String):Website
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
    getWebsites:async ()=>{
      var result = await client.query(
        query.Map(
          query.Paginate(query.Documents(query.Collection("websites"))),
          query.Lambda(x => query.Get(x))
        )
      )
      const websites=result.data.map(website=>({id:website.ref.id,name:website.data.name,link:website.data.link,}))

      return websites
    },
  },
  Mutation:{
    addWebsite:async (_,{name,link})=>{
      const item = {
        data:{name:name,link:link}
      }

      try{
        const result=await client.query(query.Create(query.Collection('websites'), item))
        console.log("result",result);

        return {
          name:result.data.name,
          link:result.data.link,
          id:result.ref.id
        }
      }
      catch(error){
        console.log("Error",error);
        return {
          name:"error",
          link:"null",
          id:"-1"
        }
      }
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