import {prisma} from "../config/db";
import redisClient from "../config/redis.js";

const createEvent = async(req, res) => {    
    try{
        const {name, totalSeats, eventDate, category} = req.body;
        const user = req.user;  
        if(user.role !== "ORGANIZER"){
            return res.status(401).json({error:"Only Organizers are allowed to create an Event"})
        }           

        const event = await prisma.event.create({
            data:{
                userId: user.id,    
                name,
                totalSeats: parseInt(totalSeats),
                availableSeats: parseInt(totalSeats),
                eventDate: new Date(eventDate),
                category: category
            },
        });

        await redisClient.incr('event:version'); 
        await redisClient.incr('searchevent:version'); 

        return res.status(201).json({
            status: "success",
            data:{
                event
            }
        });

    }   
    
    catch(error){
        console.error(error);
        return res.status(500).json({error: "Failed to create event"});
    }
    
};   

const updateEvent = async(req, res) => {
    try{
        const {name, totalSeats, eventDate, category} = req.body;
        const user = req.user;
        const event_id = req.params.event_id;

        const event = await prisma.event.findUnique({
            where: {id:event_id},
        });

        if(!event){
            return res.status(404).json({error: "The event no longer exists"});
        }

        if(user.role !== "ORGANIZER" || user.id !== event.userId){
            return res.status(403).json({error:"Only event Organizers are allowed to update an Event"})
        }

        const updatedEvent = await prisma.event.update({
            where: {id : event_id},

            data:{
                name: name ? name : event.name,
                totalSeats: totalSeats ? parseInt(totalSeats) : event.totalSeats,
                availableSeats: totalSeats ? Math.max(0,parseInt(totalSeats) - event.availableSeats) : event.availableSeats,
                eventDate: eventDate ? new Date(eventDate) : event.eventDate,
                category: category? category: event.category,   
            }
        });

        await redisClient.incr('event:version'); 
        await redisClient.incr('searchevent:version');
        

        return res.status(200).json({
            status: "success",
            data: {updatedEvent}
        })
    }

    catch(error){
        console.error(error);
        return res.status(500).json({error: "Failed to update event"})
    }
    
}

const deleteEvent = async(req, res) =>{
    try{
        const event_id = req.params.event_id;
        const user = req.user;

        const event = await prisma.event.findUnique({
            where: {id: event_id}
        });

        if(!event){
            return res.status(404).json({error: "Event is no longer available"});
        }

        if(user.role !== "ORGANIZER" || user.id !== event.userId){
            return res.status(403).json({error:"Only event Organizers are allowed to delete"})
        }

        const deletedEvent = await prisma.event.update({
            where: {id:event_id},
            data: {
                isDelete: true,
            }
        });

        await redisClient.incr('event:version'); 
        await redisClient.incr('searchevent:version'); 
    

        return res.status(200).json({
            status:"success",
            data:{
                deletedEvent
            }       
        })
    }

    catch(error){
        console.error(error);
        return res.status(500).json({error: "Failed to delete event"});
    }
}


const viewEvents = async(req, res) => {
    try{
        const user = req.user;

        if(user.role !== "ORGANIZER"){
            return  res.status(403).json({error: "Not authorized to view Events"});
        }

        const events = await prisma.event.findMany({
            where: {userId: user.id},
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json({
            status: "success",
            data: {
                events
            }
        });

    }

    catch(error){
        console.error(error);
        return res.status(500).json({error: "Failed to fetch events"})
    }
};

const viewEventReservation = async(req, res) => {
    try{
        const {cursor, limit} = req.query;
        const event_id = req.params.event_id;
        const user = req.user;

        const pageSize = parseInt(limit) || 10;

        if(user.role !== "ORGANIZER"){
            return res.status(403).json({error: "Not authorized to view Events"});
        }

        const eventExists = await prisma.event.findUnique({
            where: {id:event_id, status: "PAID"}
        });

        if(!eventExists){
            return res.status(404).json({error: "Event doesn't exist"});
        }

        const reservations = await prisma.reservation.findMany({
            where: {eventId: event_id},
            ...(cursor && {cursor: {id:cursor}}),
            take:pageSize + 1,
            orderBy: {
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
        })

    }

    catch(error){
        console.error(error);
        return res.status(500).json({error: "Failed fetching reservations"});
    }
};

export {createEvent, updateEvent, deleteEvent, viewEvents, viewEventReservation};