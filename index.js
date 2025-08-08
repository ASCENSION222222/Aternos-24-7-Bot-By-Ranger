const mc = require('minecraft-protocol');

const SERVER_HOST = 'MamaneAini2ForFree.aternos.me';
const SERVER_PORT = 62455;
const MC_VERSION = '1.21.1';    //Do Not Change The Version, Install Via Version Or Via Backward Depending On You'r Aternos Server Version.
const USERNAME = 'Ko3MamanetAzizi';

let isAlive = false;
let pos = { x: 0, y: 0, z: 0 };
let yaw = 0;
let pitch = 0;
let rotatingInterval = null;

function startBot() {
  const client = mc.createClient({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: USERNAME,
    version: MC_VERSION,
    keepAlive: true,
  });

  function moveLoop(dir) {
    if (!isAlive) return;
    const dz = 0.25 * dir;
    pos.z += dz;

    client.write('position', {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      onGround: true,
    });

    setTimeout(() => moveLoop(-dir), 500);
  }

  function startRotation() {
    if (rotatingInterval) clearInterval(rotatingInterval);
    rotatingInterval = setInterval(() => {
      yaw = (yaw + 45) % 360;
      client.write('position_look', {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        yaw,
        pitch,
        onGround: true,
      });
    }, 500);
  }

  client.on('position', (data) => {
    pos = { x: data.x, y: data.y, z: data.z };
    if (!isAlive) {
      isAlive = true;
      moveLoop(1);
    }
    startRotation();
  });

  client.on('update_health', (data) => {
    if (data.health <= 0) {
      isAlive = false;
      setTimeout(() => {
        client.write('client_command', { actionId: 0 });
      }, 1000);
    } else if (!isAlive && data.health > 0) {
      isAlive = true;
      moveLoop(1);
      startRotation();
    }
  });

  client.on('end', () => {
    console.log('[x] Disconnected. Reconnecting in 3s...');
    clearInterval(rotatingInterval);
    rotatingInterval = null;
    setTimeout(startBot, 3000);
  });

  client.on('error', (err) => {
    console.log('[!] Error:', err.message);
    setTimeout(startBot, 3000);
  });
}

startBot();

