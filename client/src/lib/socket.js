import { io } from 'socket.io-client';

const SERVER = import.meta.env.VITE_SERVER_URL || '';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SERVER, { autoConnect: false });
  }
  return socket;
}

export function connectSocket(token) {
  const s = getSocket();
  s.auth = { token };
  s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
