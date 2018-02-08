import express from "express";
import { graphqlExpress } from "apollo-server-express";
import bodyParser from "body-parser";

import { schema } from "./schema";

const PORT = process.env.PORT || 3000;
const server = express();

server.post("/", bodyParser.json(), graphqlExpress({ schema, tracing: true }));

server.listen(PORT, () => {
  console.log(
    `GraphQL Server is now running on http://localhost:${PORT}/graphql`
  );
});
