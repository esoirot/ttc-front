import {
  ApolloClient,
  InMemoryCache,
  from,
  HttpLink,
} from "@apollo/client/core";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL ?? "http://localhost:3000/graphql",
  credentials: "include",
});

export const apolloClient = new ApolloClient({
  link: from([httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
