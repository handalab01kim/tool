const io = require("socket.io-client")

console.log("sockets on!")

const ANALYSIS_IP = "172.30.1.202";
const UI_SERVER_IP = "172.30.1.202";
const UI_SERVER_IP2 = "172.30.1.203";

const FIRST = "1호기";
const SECOND = "2호기";



const timezone = (date) =>{
    return date.toLocaleString("ko-KR", {
        timezone: "Asia/Seoul",
    });
};



const dio = io(`ws://${ANALYSIS_IP}:4003/output`)
//
dio.on("message", (data)=>{
    console.log("\n\ndio(output) - message", timezone(new Date()));
    console.log(data);
});

// const dio_input = io(`ws://${ANALYSIS_IP}:4003/input`)
// //
// dio_input.on("message", (data)=>{
//     console.log("\n\ndio(input) - message", timezone(new Date()));
//     console.log(data);
// });



// FIRST

const all = io(`ws://${UI_SERVER_IP}:4001/all`)
//
all.on("event", (data)=>{
    console.log("\n\nall - event:",FIRST, timezone(new Date()));
    console.log(data);
});
//
all.on("status", (data)=>{
    console.log("\n\nall - status:",FIRST, timezone(new Date()));
    console.log(data);
});




const analysis = io(`ws://${UI_SERVER_IP}:4001/analysis`)
//
analysis.on("message", (data)=>{
    console.log("\n\nanalysis - message:",FIRST, timezone(new Date()));
    console.log(data);
});




// SECOND

const all2 = io(`ws://${UI_SERVER_IP2}:4001/all`)
//
all2.on("event", (data)=>{
    console.log("\n\nall - event:",SECOND, timezone(new Date()));
    console.log(data);
});
//
all2.on("status", (data)=>{
    console.log("\n\nall - status:",SECOND, timezone(new Date()));
    console.log(data);
});




const analysis2 = io(`ws://${UI_SERVER_IP2}:4001/analysis`)
//
analysis2.on("message", (data)=>{
    console.log("\n\nanalysis - message:",SECOND, timezone(new Date()));
    console.log(data);
});