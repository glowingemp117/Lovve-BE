const asyncHandler = require('express-async-handler');
const { successResponse, SuccessWithoutBody, PrintError, verifyrequiredparams, sendNotification } = require('../middleware/common');
const Conversations = require('../schemas/Conversations');
const { getConversations, getConversationById } = require('../helpers/conversationHelper');

const getconversationbyid = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    const timezone = req.user.timezone
    const conversation_id = req.query.id;
    let pageno = !req.query.pageno ? 1 : req.query.pageno;
    try {
        let cond = req.user.user_type == 1 ? { employer_id: user_id } : { worker_id: user_id };
        const data = await getConversationById(conversation_id, cond, pageno, timezone);
        return successResponse(200, 'Fetched Successfully',
            data.messages, res, data.total_pages);

    } catch (err) {
        return PrintError(400, err.message, res);

    }
})


const conversations = asyncHandler(async (req, res) => {
    const user_id = req.user._id;
    let { pageno, search } = req.query;
    pageno = !pageno ? 1 : pageno;
    search = !search ? "" : search;
    try {
        const data = await getConversations(req.user.user_type, user_id, req.user.timezone, pageno, search);

        return successResponse(200, 'Fetched Successfully', data.conversations, res, data.total_pages);
    } catch (err) {
        return PrintError(400, err.message, res);

    }
})



module.exports = { conversations, getconversationbyid }
