import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloServer, gql } from "apollo-server";
import { buildSubgraphSchema } from "@apollo/subgraph";

import { authDirectives } from "../../shared/src/index.js";
import initMongoose from "./config/mongoose.js";
import Profile from "./models/Profile.js";
import ProfilesDataSource from "./graphql/dataSources/ProfilesDataSources.js";
import resolvers from "./graphql/resolvers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;

const { authDirectivesTypeDefs, authDirectivesTransformer } = authDirectives();
const subgraphTypeDefs = readFileSync(
  resolve(__dirname, "./graphql/schema.graphql"),
  "utf-8",
);
const typeDefs = gql(`${subgraphTypeDefs}\n${authDirectivesTypeDefs}`);
let subgraphSchema = buildSubgraphSchema({ typeDefs, resolvers });
subgraphSchema = authDirectivesTransformer(subgraphSchema);

const server = new ApolloServer({
  schema: subgraphSchema,
  context: ({ req }) => {
    const user = req.headers.user ? JSON.parse(req.headers.user) : null;
    return { user };
  },
  dataSources: () => {
    return {
      profilesAPI: new ProfilesDataSource({ Profile }),
    };
  },
});

initMongoose();

server.listen({ port }).then(({ url }) => {
  console.log(`Profiles service ready at ${url}`);
});
