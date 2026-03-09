import { prisma } from "../config/db";
import {userRole} from "..."

const createEvent = async(req, res) => {    
    try{
        const {name, totalSeats, eventDate} = req.body;
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
            },
        });

        res.status(201).json({
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
        const {name, totalSeats, eventDate} = req.query;
        const user = req.user;
        const event_id = req.params.event_id;

        const event = await prisma.event.findUnique({
            where: {id:event_id},
        });

        if(!event){
            return res.status(404).json({error: "The event no longer exists"});
        }

        if(user.id !== event.userId || user.role !== "ORGANIZER"){
            return res.status(401).json({error:"Only event Organizers are allowed to update an Event"})
        }

        const updatedEvent = await prisma.event.update({
            where: {id : event_id},

            data:{
                name: name ? name : event.name,
                totalSeats: totalSeats ? parseInt(totalSeats) : event.totalSeats,
                eventDate: eventDate ? new Date(eventDate) : event.eventDate
            }
        });

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

        if(user.id !== event.userId || user.role !== "ORGANIZER"){
            return res.status(401).json({error:"Only event Organizers are allowed to delete"})
        }

        const deletedEvent = await prisma.event.update({
            where: {id:event_id},
            data: {
                isDelete: true,
            }
        })

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