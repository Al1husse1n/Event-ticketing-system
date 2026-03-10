import express from 'express'
import { config } from 'dotenv'
import cookieParser from "cookie-parser";
import authRoutes from './routes/authRoutes.js'


config()            

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));  
app.use(cookieParser());         

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

process.on("unhandledRejection", (err) =>{
    console.error("Unhandled rejection: ", err);
    server.close(async() =>{
        await disconnectDB();
        process.exit(1);
    });
});


process.on("uncaughtException", async(err) => {
    console.error("uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
});

process.on("SIGTERM", async()=>{
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () =>{       
        await disconnectDB();
        process.exit(0);
    });
});