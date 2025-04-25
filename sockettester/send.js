const io = require("socket.io-client")
const {ANALYSIS_IP, UI_SERVER_IP} = require("./config");

// const analysis = io(`ws://${UI_SERVER_IP}:4001/analysis`)
// analysis.emit("message", { test: "test", text: "Hello, server!" });



// const all = io(`ws://${UI_SERVER_IP}:4001/all`)
// all.emit("event", { channel: 1, status: 1, time:"123456123456" });

const all = io(`ws://${UI_SERVER_IP}:4001/all`)
all.emit("status", { server: 1, status: 1 });

console.log("send!")