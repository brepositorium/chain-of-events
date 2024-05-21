import { gql } from '@apollo/client';

//TODO: update for isActive

export const GET_PERSONS_EVENTS = gql`
query GetEventsByAdmin($address: Bytes!) {
    eventCreateds(first: 5, where: { createdEvent_admin: $address }) {
        createdEvent_id
        createdEvent_name
    }
  }
  `;

export const GET_EVENT_DETAILS_BY_ID = gql`
query GetEventDetailsById($id: BigInt!){
    eventCreateds(where:{createdEvent_id: $id}) {
      createdEvent_name
      createdEvent_description
      createdEvent_location
      createdEvent_logoUrl
      createdEvent_numberOfTickets
    }
  }
  `;

  export const GET_EVENTS_DETAILS_BY_IDS = gql`
  query GetEventsByIds($ids: [BigInt!]!) {
    eventCreateds(where: { createdEvent_id_in: $ids }) {
      createdEvent_id
      createdEvent_name
      createdEvent_description
      createdEvent_location
      createdEvent_logoUrl
      createdEvent_numberOfTickets
    }
  }
`;

export const GET_ALL_EVENTS_PAGINATED = gql`
query GetEventCreateds($first: Int, $after: BigInt) {
    eventCreateds(first: $first, where: { cursorField_gt: $after }, orderBy: cursorField, orderDirection: asc) {
      createdEvent_id
      createdEvent_name
      createdEvent_description
      createdEvent_location
      createdEvent_logoUrl
      createdEvent_numberOfTickets
      cursorField
    }
  }
  `;