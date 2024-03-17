const jwt = require('jsonwebtoken')
const verifyToken = (req,res,next)=>{
    const token =  req.header("Authorization").replace("Bearer ", "");


    if(!token){
        return res.status(400).json({
            message : "Unauthorized"
        })
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
        if(err){
            return res.status(400).json({
                message : "Invalid Token"
            })
        }
        req.user = user;
        next();
    })
}
module.exports ={
    verifyToken,
}