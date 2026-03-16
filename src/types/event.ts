import type { Address } from "./address";
import type { Person } from "./person";

export interface EventParticipant {
  id: string;
  person: Person;
  eventType: string;
  roleInEvent: string;
  address: Address;
  name: string;
}

export interface TreeEvent {
  id: string;
  name: string;
  description: string;
  startedAt: string;
  endedAt: string;
  status: number;
  createdBy: string;
  participants: EventParticipant[];
}

export interface TreeEventCreateRequest {
  event: {
    name: string;
    description: string;
    startedAt: string;
    endedAt: string;
  };
  treeEvent: {
    addressId: string;
    name: string;
  };
}

