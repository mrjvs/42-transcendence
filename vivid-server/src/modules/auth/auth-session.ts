import { TypeormStore } from 'connect-typeorm/out';
import { TypeORMSession } from '@/session.entity';
import { getRepository } from 'typeorm';

let store = null;

// lazy loaded store loading, used for middleware and socket.io
export function getSessionStore() {
  if (store === null) {
    const sessionRepo = getRepository(TypeORMSession);

    store = new TypeormStore({
      cleanupLimit: 42,
    }).connect(sessionRepo);
  }

  return store;
}
