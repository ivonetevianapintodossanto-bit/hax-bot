/* eslint-disable no-undef */
// ============================================
// Olympus Arena - HaxBall Headless Host Script
// ============================================

const HaxballJS = require("haxball.js").default;

HaxballJS().then(function(HBInit) {

var HAXBALL_TOKEN = process.env.HAXBALL_TOKEN;
var DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
var BAN_AUTH = "ox7I2MnaEtVO-RAYT3eyfS4fnlSErcmUpE5QosbcbqQ";
var MAX_PLAYERS = 30;

var room = HBInit({
roomName: "⚫🟡 Arena Guardians 🟡⚫",
maxPlayers: MAX_PLAYERS,
public: true,
noPlayer: true,
token: TOKEN,
geo: { lat: -16.1014, lon: -47.9912, code: "br" }
});

var redScore = 0;
var blueScore = 0;
var matchEvents = [];
var matchStartTime = null;
var inMatch = false;

function announce(text, id) {
room.sendAnnouncement(text, id, 0xE5B94C, "bold", 1);
}

function sendDiscord(content) {
if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL === "SEU_WEBHOOK_AQUI") return;

fetch(DISCORD_WEBHOOK_URL, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ content: content })
}).catch(function() {});
}

function recordCommand(command, playerName) {
matchEvents.push({
type: "command",
command: command,
player: playerName || "sistema",
time: new Date().toISOString()
});
}

room.onRoomLink = function(link) {
console.log("Sala criada: " + link);
sendDiscord("🔗 Sala criada: " + link);
};

room.onPlayerJoin = function(player) {
console.log(player.name + " entrou na sala.");

sendDiscord(
"🎮 **" + player.name +
"** entrou na sala **Olympus Arena**!\nAuth: " +
(player.auth || "—") +
"\nIP: " +
(player.conn || "—")
);

if (player.auth === BAN_AUTH) {
room.setPlayerAdmin(player.id, true);
announce("Administrador concedido automaticamente.", player.id);
}

if (room.getPlayerList().length === 1) {
announce("Você está sozinho. Digite !adm para receber administrador.", player.id);
}
};

room.onPlayerLeave = function(player) {
console.log(player.name + " saiu da sala.");
};

room.onPlayerChat = function(player, message) {
var parts = message.trim().toLowerCase().split(/\s+/);

if (parts[0] === "!bb") {
room.kickPlayer(player.id, "Até logo!", false);
recordCommand("!bb", player.name);
return false;
}

if (parts[0] === "!adm") {
if (room.getPlayerList().length === 1) {
room.setPlayerAdmin(player.id, true);
announce("Administrador concedido.", player.id);
} else {
announce("Disponível apenas quando estiver sozinho.", player.id);
}
return false;
}

if (parts[0] === "!swap") {
if (!player.admin) {
announce("Apenas administradores.", player.id);
return false;
}

```
room.getPlayerList().forEach(function(p) {
  if (p.team > 0) {
    room.setPlayerTeam(p.id, p.team === 1 ? 2 : 1);
  }
});

recordCommand("!swap", player.name);
return false;
```

}

if (parts[0] === "!rr") {
if (!player.admin) {
announce("Apenas administradores.", player.id);
return false;
}

```
room.stopGame();

setTimeout(function() {
  room.startGame();
}, 500);

recordCommand("!rr", player.name);
return false;
```

}

if (parts[0] === "!ban") {
if (player.auth !== BAN_AUTH) {
announce("Você não tem permissão para banir.", player.id);
return false;
}

```
var targetId = parseInt(parts[1]);
var target = room.getPlayerList().find(function(p) {
  return p.id === targetId;
});

if (target) {
  room.kickPlayer(targetId, "Banido pelo administrador", true);

  matchEvents.push({
    type: "ban",
    player: target.name,
    time: new Date().toISOString()
  });

  announce(target.name + " foi banido.", null);
  console.log(target.name + " foi banido por " + player.name);
} else {
  announce("Jogador não encontrado. Use: !ban <id>", player.id);
}

return false;
```

}

if (parts[0] === "!ajuda") {
announce(
"Comandos: !adm (admin sozinho), !bb (sair), !swap (trocar times), !rr (reiniciar), !ban <id> (requer auth), !unban <id> (requer auth), !ajuda (esta lista)",
player.id
);

```
return false;
```

}

if (parts[0] === "!unban") {
if (player.auth !== BAN_AUTH) {
announce("Você não tem permissão para desbanir.", player.id);
return false;
}

```
room.clearBan(parseInt(parts[1]));
announce("Ban removido.", player.id);
recordCommand("!unban", player.name);
return false;
```

}

return true;
};

room.onGameStart = function() {
redScore = 0;
blueScore = 0;
matchEvents = [];
inMatch = true;
matchStartTime = new Date();

console.log("Partida iniciada.");
};

room.onTeamGoal = function(team) {
if (team === 1) {
redScore++;
} else if (team === 2) {
blueScore++;
}
};

room.onGameStop = function() {
if (!inMatch) return;

inMatch = false;

var winner =
redScore > blueScore
? "Vermelho"
: blueScore > redScore
? "Azul"
: "Empate";

var bans = matchEvents
.filter(function(e) {
return e.type === "ban";
})
.map(function(e) {
return e.player;
});

var cmds = matchEvents
.filter(function(e) {
return e.type === "command";
})
.map(function(e) {
return e.command + " (" + e.player + ")";
});

console.log("=== Partida Encerrada ===");
console.log(
"Vencedor: " +
winner +
" | Placar: " +
redScore +
"x" +
blueScore
);

console.log(
"Banidos: " +
(bans.length ? bans.join(", ") : "Nenhum")
);

console.log(
"Comandos: " +
(cmds.length ? cmds.join(", ") : "Nenhum")
);

console.log("=========================");
};

}).catch(function(error) {
console.error("Erro ao carregar o HaxBall:");
console.error(error);
});
