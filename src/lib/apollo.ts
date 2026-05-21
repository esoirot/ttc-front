import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from "@apollo/client/core";
import { ErrorLink } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { Observable, getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { tryRefresh } from "./api";

const PUBLIC_PATHS = ["/login", "/register", "/2fa"];
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/graphql";
const WS_URL = API_URL.replace(/^http/, "ws");

const wsClient = createClient({ url: WS_URL });

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  const isUnauth =
    (CombinedGraphQLErrors.is(error) &&
      error.errors.some(
        (e) =>
          (e.extensions as Record<string, unknown>)?.["code"] ===
          "UNAUTHENTICATED",
      )) ||
    (ServerError.is(error) && error.statusCode === 401);

  if (
    isUnauth &&
    !PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p))
  ) {
    return new Observable((observer) => {
      void tryRefresh().then((refreshed) => {
        if (refreshed) {
          wsClient.terminate();
          forward(operation).subscribe(observer);
        } else {
          window.location.replace("/login");
          observer.complete();
        }
      });
    });
  }
});

const httpLink = new HttpLink({
  uri: API_URL,
  credentials: "include",
});

const wsLink = new GraphQLWsLink(wsClient);

const splitLink = ApolloLink.split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" && def.operation === "subscription"
    );
  },
  wsLink,
  ApolloLink.from([errorLink, httpLink]),
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
