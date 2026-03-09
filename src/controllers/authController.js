import { prisma } from "../config/db";
import bcrypt from "bcrypt.js"
import {generateToken} from "../utils/generateToken.js"

const register = async(req, res) => {
    const {name, email, password, role} = req.body;

    const userExists = await prisma.user.findUnique({
        where: {email:email},
    });

    if (userExists){
        return res.status(400).json({error: "User already exists with this email"})
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data:{
            name,
            email,
            password:hashedPassword,
            role,
        },
    });

    const token = generateToken(user.id, res);

    res.status(201).json({
        status:"success",
        data:{
            user:{
                id: user.id,
                name:name,
                email:email,
                role: role
            },
            token,
        },
    });
};

const login = async(req, res) =>{
    const {email, password} = req.body;
    const user = await prisma.user.findUnique({
        where: {email:email},
    });

    if(!user){
        return res
        .status(400)
        .json({error:"Invalid email or password"})
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res
        .status(400)
        .json({error:"Invalid email or password"})
    }

    const token = generateToken(user.id, res);

        return res
        .status(200)
        .json({
            status:"success",
            data:{
                user:{
                    id:user.id,
                    email:email,
                },
                token,
            },
        });
};

const logout = async(req,res) =>{
    res.cookie("jwt","",{
        httpOnly:true,
        expires:newDate(0)
    });
    res.status(200).json({
        status:"success",
        message:"logged out successfully",
    });
};

export {register, login, logout};
