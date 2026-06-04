import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from "@apollo/client/core";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";
import { Observable } from "@apollo/client/utilities";
import { tryRefresh } from "./api";

const PUBLIC_PATHS = ["/login", "/register", "/2fa"];
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/graphql";

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

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "no-cache" },
    query: { fetchPolicy: "no-cache" },
  },
});
