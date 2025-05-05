import https from "https";
import fs  from "fs";
import app from './app.js';
 import { Server } from 'socket.io';
import { socketMessaging } from "./socket/messaging/index.js";


const port = process.argv[2] || 8000;

const privateKeyPath = '../ssl/keys/e10a0_266e9_f471db838c717fcd42979346fd2ddb38.key';
const certificatePath = '../ssl/certs/hr_clikkle_com_e10a0_266e9_1745856110_238662a75fdeacf56967f57948929ee9.crt';
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');
const credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials,app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: true // Optional: Allow credentials (e.g., cookies) to be sent
    }
});
const users = new Map();

io.on('connection', (socket) => { socketMessaging(socket , io  , users) })


server.listen(port, () => {
 console.log(`Server started listening on ${port}`);
});


process.on("unhandledRejection", (error, promise) => {
 console.error(`Logged Error: ${error}  `);
//   server.close(() => process.exit(1));
});
