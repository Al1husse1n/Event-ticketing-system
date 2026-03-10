import { prisma } from "../config/db";


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

const searchEvent = async(req,res) =>{
    try{
        const {page, limit, category, upcoming, userId, name, date} = req.query;
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;

        const where = {
                    ...(upcoming === "true" && {eventDate: {gte: new Date()}}),
                    ...(category && {category: category.toUpperCase()}),
                    ...(userId  && {userId: userId}),
                    ...(name  && {name: {contains: name, mode:"insensitive"}}),
                    ...(date && {eventDate: {
                                        gte: new Date(date),
                                        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
                                    }}),
                    
                    isDelete: false,
                }

        const [events, total] = await Promise.all([
            prisma.event.findMany({
            where,  
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            orderBy: {
                eventDate: "asc"
            }
            }),

            prisma.event.count({where})
        ]);

        const totalPages = Math.ceil(total/pageSize);

        return res.status(200).json({
            status:"success",
            data:{
                events,
                totalPages,
                currentPage: pageNumber,
                pageSize,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1
            }
        });
            

    }

    catch(error){
        console.error(error);
        return res.status(500).json({error:"Failed to search events"})
    }
}

export {createEvent, updateEvent, deleteEvent, searchEvent};