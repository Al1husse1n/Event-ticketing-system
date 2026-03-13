import { prisma } from "../config/db";

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

export {searchEvent};