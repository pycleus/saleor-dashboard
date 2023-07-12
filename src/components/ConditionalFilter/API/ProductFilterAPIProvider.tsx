import { ApolloClient, useApolloClient } from "@apollo/client";

import { FilterContainer, FilterElement } from "../FilterElement";
import { FilterAPIProvider } from "./FilterAPIProvider";
import {
  AttributeChoicesHandler,
  AttributesHandler,
  CategoryHandler,
  ChannelHandler,
  CollectionHandler,
  Handler,
  ProductTypeHandler,
} from "./Handler";

const getFilterElement = (
  value: FilterContainer,
  index: number,
): FilterElement => {
  const possibleFilterElement = value[index];
  if (
    typeof possibleFilterElement !== "string" &&
    !Array.isArray(possibleFilterElement)
  ) {
    return possibleFilterElement;
  }

  throw new Error("Unknown filter element used to create API handler");
};

const createAPIHandler = (
  selectedRow: FilterElement,
  client: ApolloClient<unknown>,
  inputValue: string,
): Handler => {
  if (selectedRow.isAttribute()) {
    return new AttributeChoicesHandler(
      client,
      selectedRow.value.value,
      inputValue,
    );
  }

  if (selectedRow.isCollection()) {
    return new CollectionHandler(client, inputValue);
  }

  if (selectedRow.isCategory()) {
    return new CategoryHandler(client, inputValue);
  }

  if (selectedRow.isProductType()) {
    return new ProductTypeHandler(client, inputValue);
  }

  if (selectedRow.isChannel()) {
    return new ChannelHandler(client, inputValue);
  }

  throw new Error("Unknown filter element");
};

export const useProductFilterAPIProvider = (): FilterAPIProvider => {
  const client = useApolloClient();

  const fetchRightOptions = async (
    position: string,
    value: FilterContainer,
    inputValue: string,
  ) => {
    const index = parseInt(position, 10);
    const filterElement = getFilterElement(value, index);
    const handler = createAPIHandler(filterElement, client, inputValue);

    return handler.fetch();
  };

  const fetchLeftOptions = async (inputValue: string) => {
    const handler = new AttributesHandler(client, inputValue);
    return handler.fetch();
  };

  return {
    fetchRightOptions,
    fetchLeftOptions,
  };
};
