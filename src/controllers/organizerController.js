import {prisma} from "..//config/db";

const viewEvents = async(req, res) => {
    try{
        const user = req.user;

        if(user.role !== "ORGANIZER"){
            return res.status(403).json({error: "Not authorized to view Events"});
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
            where: {id:event_id}
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

export {viewEvents, viewEventReservation};