import 'dotenv/config';
import jwt from 'jsonwebtoken';

const {JWT_SECRET} = process.env;

export function authVerify (req,res,next) {
    
    let token = req.cookies.app_session;
    
    if(!token){
        console.log("token not found");
        return res.status(401).json({
            message: "token not found"
        });
    }
    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        console.log("Decoded Payload",decoded);
        req.user = decoded.userId;
        next();

    }catch(error){
        console.log("error at Jwt verify", error);
        res.status(401).json({
            message:error
        });
    }
}

