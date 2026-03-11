import {prisma} from "../config/db"
import bcrypt from "bcrypt";

const changeProfile = async(req, res) =>{
    try{
        const {name, currentPassword, newPassword} = req.body;
        const user = req.user;
        
        const userExists = await prisma.user.findUnique({
            where: {id:user.id}
        }) 

        if(!userExists){
            return res.status(404).json({error: "User not found"})
        }

        let updateData = {};
        if(name){
            updateData.name = name
        };

        if(newPassword){
            if(!currentPassword){
                return res.status(400).json({error: "Current password required"})
            }
            
            const isMatch = await bcrypt.compare(
                currentPassword, 
                userExists.password
            )

            if(!isMatch){
                return res.status(401).json({ error: "Incorrect password" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        if(Object.keys(updateData).length === 0){
            return res.status(400).json({
                error: "No fields provided to update"
            });
        }

        const updatedUser = await prisma.user.update({
            where: {id: userExists.id},
            data: updateData
        });

        return res.status(200).json({
            status: "success",
            data:{
                updatedUser
            }
        });
    }
    
    catch(error){
        console.error(error);
        return res.status(500).json({error: "Failed to update profile"});
    }
};

const viewReservation = async(req, res) =>{
    try{
        const {cursor, limit} = req.query;
        const user = req.user;
        const pageSize = parseInt(limit) || 10;

        const reservations = await prisma.reservation.findMany({
            where:{userId: user.id},
            take: pageSize + 1,
            ...(cursor && {cursor: {id:cursor}}),
            
            orderBy:{
                createdAt: "desc"
            }
        });

        let nextCursor = null;

        if(reservations.length > pageSize){
            const nextItem = reservations.pop();
            nextCursor = nextItem.id;
        }

        return res.status(200).json({
            status: "success",
            data:{
                reservations,
                nextCursor
            }
        });
    }

    catch(error){
        console.error(error);
        return res.status(500).json({error: "Failed to fetch your reservations"})
    }
};

export {changeProfile, viewReservation};