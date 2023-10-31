const User = require('../schemas/User');



const getCode = async () => {
    return Math.floor(1000 + Math.random() * 9000)
}




const getProfile = async ( user_id) => {
    try {
        const user =  await User.findById(user_id);
        if(!user){
            throw new Error('Invalid user_id found');
        }
        else{
            return user._doc;
        }
        
    } catch (error) {
        throw new Error(error.message);
    }
}


module.exports = { getCode,getProfile }