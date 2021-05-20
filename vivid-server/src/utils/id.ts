import { v4 as uuid } from 'uuid';

export enum IdType {
  Channel = 42,
  User = 42,
}

export function generateId(type: IdType): string {
  return `${uuid()}-${<number>type}`;
}
