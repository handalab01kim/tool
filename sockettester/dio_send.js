const io = require("socket.io-client")


const ANALYSIS_IP = "172.30.1.203";


const timezone = (date) =>{
    return date.toLocaleString("ko-KR", {
        timezone: "Asia/Seoul",
    });
};



const dio = io(`ws://${ANALYSIS_IP}:4003/output`, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
})


dio.on("connect", ()=>{
    console.log("dio on!");
});
dio.on("disconnect", ()=>{
    console.log("dio off!");
});





dio.on("message", (data)=>{
    console.log("\n\ndio - message", timezone(new Date()));
    console.log(data);
});


dio.emit("message", {"PORTS": "1", "DATA": "1"});