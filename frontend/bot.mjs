import WebSocket from 'ws';

let onlineUsers = [];

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('User connected');
  
  onlineUsers.push(ws);
  ws.send(JSON.stringify({ onlineUsers: onlineUsers.length }));

  ws.on('close', () => {
    onlineUsers = onlineUsers.filter(user => user !== ws);
    wss.clients.forEach(client => {
      client.send(JSON.stringify({ onlineUsers: onlineUsers.length }));
    });
  });
});
