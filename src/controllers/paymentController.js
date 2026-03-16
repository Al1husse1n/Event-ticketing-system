import {prisma} from "../config/db";
import { deleteCacheByPattern } from "../utils/deleteCache";
const bookReservation = async(req, res) =>{
    try{
        const event_id = req.params.event_id;
        const user = req.user;

        if(user.role !== "CUSTOMER"){
            return res.status(403).json({error: "Only customers can book reservations"});
        }

        const eventExists = await prisma.event.findUnique({
            where: {id:event_id}
        })

        if(!eventExists){
            return res.status(404).json({error: "Event doesn't exist"});
        }
        
        const alreadyReserved =  await prisma.reservation.findUnique({
            where: {userId_eventId:{
                userId: user.id,
                eventId: event_id,
            }}
        });

        if(alreadyReserved){
            return res.status(400).json({error: "User already booked a reservation"});
        } 

        const expiresInMinutes = 10;
        const reservation = await prisma.$transaction(async(tx) =>{
            
            const updatedEvent = await tx.event.updateMany({        
                where: {
                    id: event_id,
                    availableSeats: { gt: 0 },
                    version: eventExists.version,
                },
                data:{
                    availableSeats: {decrement: 1},
                    version: {increment: 1}
                }
            });

            if(updatedEvent.count === 0){
                throw new Error("No seats available")
            }

            return await tx.reservation.create({
                data:{
                    eventId: event_id,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 1000 * 60 * expiresInMinutes)
                }
            });
        });

            return res.status(201).json({
                status: "success",
                data: { reservation }
            });
    }

    catch(error){
        console.error(error);
        if(error.message === "No seats available"){
            return res.status(400).json({error: "Event is full"});
        }
        return res.status(500).json({error: "Failed to book reservation"});
    }
};

const payment = async(req, res) =>{
    try{
        const {idempotencyKey, reservationId} = req.body;
        const user = req.user;

        const reservationExists = await prisma.reservation.findUnique({
            where:{id: reservationId}
        })

        if(!reservationExists){
            return res.status(404).json({error:"Reservation doesn't exist"})
        }

        if(reservationExists.status === "EXPIRED"){
            return res.status(400).json({error: "Reservation has expired"})
        }

        if(reservationExists.status === "PAID"){
            return res.status(400).json({error:"You already paid for this reservation"})
        }

        if(reservationExists.expiresAt < new Date()){
            return res.status(400).json({error:"Reservation expired"})
        }

        if(reservationExists.userId !== user.id){
            return res.status(403).json({error: "You cannot pay for another user"});
        }

        const existingPayment = await prisma.payment.findUnique({
            where:{idempotencyKey}
        });
        if(existingPayment){
            return res.status(200).json({
                status: "success",
                data: existingPayment
            })
        }

        const payment = await prisma.payment.create({
            data:{
                reservationId,
                idempotencyKey
            }
        });

        return res.status(201).json({
            status: "success",
            data:{
                payment
            }
        })
    }

    catch(error){
        return res.status(500).json({error: "Failed to pay for reservation"});
    }
}

const confirmPayment = async(req,res) =>{

    try{
        const {event_id, reservationId, paymentId} = req.body;
        const user = req.user;

        const reservationExists = await prisma.reservation.findUnique({
            where:{id: reservationId}
        });

        if(!reservationExists){
            return res.status(404).json({error: "Reservation no longer exists"});
        }

        if(reservationExists.userId !== user.id){
            return res.status(403).json({error:"Not authorized"});
        }
        
        if(reservationExists.expiresAt < new Date()){
            return res.status(400).json({error:"Reservation expired"});
        }

        const paymentExists = await prisma.payment.findUnique({
            where:{id: paymentId}
        });

        if(!paymentExists){
            return res.status(404).json({error: "Something went wrong try paying later"});
        }

        if(paymentExists.status === "COMPLETED"){
            return res.status(400).json({error:"Payment already confirmed"});
        }
        const paymentDetails = await prisma.$transaction(async(tx) =>{
            await tx.reservation.update({
                where:{
                    id: reservationId
                },
                data:{
                    status: "PAID",
                    version:{increment: 1},
                }
            });

            return await tx.payment.update({
                where:{
                    id: paymentId
                },
                data: {
                    status: "COMPLETED"
                }
            });
        });

        await deleteCacheByPattern(`cache:*:/${event_id}/eventReservation:*`);
        await redisClient.incr('profile:version'); 

        return res.status(200).json({
            status: "success",
            data:{
                paymentDetails
            }
        })
    }

    catch(error){
        console.error(error);
        return res.status(500).json({error: "Failed completing payment"});
    }

};              

export {bookReservation, payment, confirmPayment};