import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { ApolloError } from "apollo-server";
import { defaultFieldResolver } from "graphql";
import { getDirectives, MapperKind, mapSchema } from "@graphql-tools/utils";
import { get } from "lodash-es";

function authDirectives() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return {
    authDirectivesTypeDefs: readFileSync(
      resolve(__dirname, "./authDirectives.graphql"),
      "utf-8",
    ),
    authDirectivesTransformer: (schema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          // Directive handling logic will go here...
          const fieldDirectives = getDirectives(schema, fieldConfig);
          const privateDirective = fieldDirectives.find(
            (dir) => dir.name === "private",
          );
          const ownerDirective = fieldDirectives.find(
            (dir) => dir.name === "owner",
          );
          const { resolve = defaultFieldResolver } = fieldConfig;

          if (privateDirective || ownerDirective) {
            fieldConfig.resolve = function (source, args, context, info) {
              const privateAuthorized = privateDirective && context.user?.sub;
              const ownerArgAuthorized =
                ownerDirective &&
                context.user?.sub &&
                get(args, ownerDirective.args.argumentName) ===
                  context.user.sub;
              if (
                (privateDirective && !privateAuthorized) ||
                (ownerDirective && !ownerArgAuthorized)
              ) {
                throw new ApolloError("Not authorized!");
              }
              return resolve(source, args, context, info);
            };
            return fieldConfig;
          }
        },
      }),
  };
}

export default authDirectives;
