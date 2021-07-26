export enum Status {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  INGAME = 'INGAME',
}

export interface UserStatus {
  userId: string;
  status: Status;
}

// global instance of client statuses
let clientStatuses: {
  userId: string;
  clients: string[];
  status: Status;
}[] = [];
let callback: (data: UserStatus) => void | null = null;

// register callback
export function registerCallback(cb: (data: UserStatus) => void) {
  callback = cb;
}

function sendStatus(userId: string, status: Status) {
  callback && callback({ userId, status });
}

// get all statuses
export function getAllStatuses(): UserStatus[] {
  return clientStatuses.map((v) => ({ userId: v.userId, status: v.status }));
}

// set status of specific user
export function setUserStatus(
  userId: string,
  status: Status,
  game = false,
): void {
  if ([Status.OFFLINE].includes(status)) return;
  const found = clientStatuses.find((v) => v.userId === userId);
  if (!found) return;
  if (found.status === status) return;
  if (!game && found.status === Status.INGAME) return;
  if (
    (found.status === Status.OFFLINE && status === Status.INGAME && game) ||
    (found.status === Status.OFFLINE && status === Status.ONLINE && game)
  )
    return; // dont allow ingame while offline or setting to online from game
  found.status = status;
  sendStatus(found.userId, found.status);
}

// when client connects
export function connectClient(userId: string, clientId: string): void {
  let found = clientStatuses.find((v) => v.userId === userId);
  if (!found) {
    found = {
      userId: userId,
      status: Status.ONLINE,
      clients: [],
    };
    clientStatuses.push(found);
    sendStatus(found.userId, found.status);
  }
  if (!found.clients.includes(clientId)) found.clients.push(clientId);
}

// when client disconnects
export function disconnectClient(clientId: string): void {
  const found = clientStatuses.find((v) => v.clients.includes(clientId));
  if (!found) return;

  // remove client from client list
  found.clients = found.clients.filter((v) => v !== clientId);

  // remove user completely
  if (found.clients.length == 0) {
    clientStatuses = clientStatuses.filter((v) => v.userId !== found.userId);
    sendStatus(found.userId, Status.OFFLINE);
  }
}
