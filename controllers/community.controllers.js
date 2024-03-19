const User = require('../models/user.model')
const Community = require('../models/community.model')
const createCommunity = async (req,res) =>{

    try {
        const userId = req.user.id;
        const {name,description} = req.body;
        if(!name || !description){
            return res.status(400).json({
                error : "All field are required"
            })
        }
        const validateCommunity = await Community.findOne({name: name})
        if(validateCommunity) {
            return res.status(400).json({
                error : "community already exists"
            })
        }
        const newCommunity = new Community({
            name,
            description,
            creator: userId,
        })
        newCommunity.members.push(userId);
        await newCommunity.save();
        return res.status(200).json({
            message : "Commuinty created",
            community: newCommunity 
        })
    } catch (error) {
        return res.status(500).json({
            error : "Backend error while creating community"
        })
    }

}

const joinCommunity = async(req,res)=>{
    try {
        const userid = req.user.id;
        const { communityId } = req.params;
        const community = await Community.findById(communityId);
        if (!community) {
          return res.status(404).json({ error: 'Community not found' });
        }
        if (!community.members.includes(userid)) {
            community.members.push(userid);
            await community.save();
        }

        return res.status(200).json({
            message : "Joined Successfully"
        })

    } catch (error) {
        return res.status(500).json({
            error : "Backend Error while joining community"
        })
    }
}

const getCommunity = async (req,res) =>{
    try {
        const communities = await Community.find();
        return res.status(200).json({
            communities,
        });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
}
const myCommunity = async (req,res)=>{
    try {
        const userId = req.user.id;
        const communities = await Community.find({ $or: [{ creator: userId }, { members: userId }] });
        return  res.status(200).json({ communities });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      }
}
const deleteCommunity = async(req,res)=>{
    try {
        console.log("aata")
        const userId = req.user.id;
        const {communityId} = req.params
        const validateCommunity = await Community.findById({_id:communityId});
        if(!validateCommunity){
            return res.status(400).json({
                error : "No communities exits"
            })
        }
        console.log(userId," ",validateCommunity.creator)
        if(validateCommunity.creator != userId){
            return res.status(400).json({
                error : "You are not the creator of this community"
            })
        }
        await Community.findByIdAndDelete(communityId)

        return res.status(200).json({
            message : "deleted successfully"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({error : "Internal Server Error"})
    }
}
const members = async (req,res)=>{
   try 
   {

     const {communityId} = req.params;
     const users = await Community.findById(communityId).populate('members')
     return res.status(200).json({
         users : users
     })
   } catch (error) {
     return res.status(500).json({
        error : "Internal Server Error"
     })
   }
}
module.exports = {
    createCommunity,
    joinCommunity,
    getCommunity,
    myCommunity,
    deleteCommunity,
    members
}