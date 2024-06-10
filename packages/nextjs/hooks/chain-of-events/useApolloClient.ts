import { useEffect, useState } from "react";
import useTheGraphUri from "./useTheGraphUri";
import { ApolloClient, InMemoryCache } from "@apollo/client";

const useApolloClient = () => {
  const uri = useTheGraphUri();
  const [client, setClient] = useState(
    new ApolloClient({
      uri: uri || "https://api.studio.thegraph.com/query/71641/coe_base/version/latest",
      cache: new InMemoryCache(),
    }),
  );

  useEffect(() => {
    if (uri) {
      setClient(
        new ApolloClient({
          uri,
          cache: new InMemoryCache(),
        }),
      );
    }
  }, [uri]);

  return client;
};

export default useApolloClient;
