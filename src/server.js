import express from 'express'
import { config } from 'dotenv'
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import searhEventRoutes from './routes/searchEventRoutes.js';



config()     

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET missing");
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));  
app.use(cookieParser()); 
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
        

app.use('/auth', authRoutes);
app.use('/event', eventRoutes);
app.use('/payment', paymentRoutes);
app.use('/profile', profileRoutes);
app.use('/searchevent', searhEventRoutes);

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
        process.exit(1);
    });
});


process.on("uncaughtException", async(err) => {
    console.error("uncaught Exception:", err);
    process.exit(1);
});

process.on("SIGTERM", async()=>{
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () =>{       
        process.exit(0);
    });
});