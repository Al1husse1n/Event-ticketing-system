import { PrismaClient} from "@prisma/client/extension";

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"] : ['error'],
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const connnectDB = async() =>{
    try{
        await prisma.$connect();
        console.log("DB connected via prisma");
    }
    catch(error){
        console.error("Database connection error", error.message);
        process.exit(1);
    }
};

const disconnectDB = async() =>{
    try{
        await prisma.$disconnect();
    }
    catch(error){
        console.error("Error while disconnecting", error.message)
    }
};

export {prisma, connnectDB, disconnectDB}