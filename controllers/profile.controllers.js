
const User = require('../models/user.model')
const bcryptjs = require("bcryptjs")
const updateProfile = async (req,res)=>{
    try {
        const {username,email,password,tags} = req.body;
        const userid = req.user.id;
        console.log(username,email,password,tags,userid)
        const usernameRegex = /^[a-z0-9]+$/;
        if (!usernameRegex.test(username)) {
          return res.status(400).json({
            error: "Username must contain only lowercase letters and numbers",
          });
        }
        const options = {}
    
        if(password !== undefined  && password !== null){
            const updatedPassword = bcryptjs.hashSync(password,10);
            options.password = updatedPassword
        }
        options.username = username;
        options.email = email;
        options.tags = tags;
        
        const updatedUser = await User.findByIdAndUpdate( userid, {
            $set :  options,
        },{new : true}
        )
    
        updatedUser.password = null;
        console.log("yaha tak aaya")
        return res.status(200).json({
            message : "User updated successfully",
            user : updatedUser
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error : "Backend error while updating user"
        })
    }

}

module.exports = {
    updateProfile,
}