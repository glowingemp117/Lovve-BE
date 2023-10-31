const Conversation = require('../schemas/Conversations');
const User = require('../schemas/User');
const moment = require('moment-timezone');
const mongoose = require('mongoose');



const getConversations = async (user_type, user_id, timezone, pageno, search) => {
    const limit = parseInt(process.env.ITEMPERPAGE);
    const skip = (pageno - 1) * limit;
    if (user_type == 2) {
        const data = await Conversation.aggregate([
            {
                '$match': {
                    'worker_id': user_id
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'employer_id',
                    'foreignField': '_id',
                    'pipeline': [
                        {
                            '$project': {
                                '_id': 1,
                                'name': 1,
                                'image': 1
                            }
                        }
                    ],
                    'as': 'employer'
                }
            }, {
                '$unwind': {
                    'path': '$employer'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'worker_id',
                    'foreignField': '_id',
                    'pipeline': [
                        {
                            '$project': {
                                '_id': 1,
                                'name': 1,
                                'image': 1
                            }
                        }
                    ],
                    'as': 'worker'
                }
            }, {
                '$unwind': {
                    'path': '$worker'
                }
            }, {
                '$addFields': {
                    'message': {
                        '$last': '$messages.message'
                    },
                    'timesince': {
                        '$last': '$messages.timestamp'
                    },
                    'worker.image': {
                        '$concat': [
                            process.env.IMAGEBASEURL, '$worker.image'
                        ]
                    },
                    'employer.image': {
                        '$concat': [
                            process.env.IMAGEBASEURL, '$employer.image'
                        ]
                    },
                    'conversation_id': '$_id',
                    'total_pages': {
                        $size: "$messages"
                    }
                }
            }, {
                '$replaceRoot': {
                    'newRoot': {
                        '$mergeObjects': [
                            '$employer', {
                                'message': '$message',
                                'timesince': '$timesince',
                                'conversation_id': '$conversation_id',
                                'total_pages': '$total_pages'
                            }
                        ]
                    }
                }
            }, {
                $match: {
                    'name': {
                        '$regex': search,
                        '$options': 'i'
                    }
                }
            }, {
                $facet: {
                    metadata: [
                        {
                            $count: "total",
                        },
                    ],
                    data: [
                        {
                            $skip: skip,
                        },
                        {
                            $limit: limit,
                        },
                    ],
                },
            }
        ]);
        if (!data[0].metadata[0]) {
            throw new Error("Nothing found");
        } else {
            for (const iterator of data[0].data) {
                iterator.timesince = moment(iterator.timesince).tz(timezone).fromNow()
                iterator.total_pages = Math.ceil(iterator.total_pages / limit);

            }
            const total_pages = Math.ceil(data[0].metadata[0].total / limit);
            return {
                total_pages: total_pages,
                conversations: data[0].data,
            };

        }
    }
    if (user_type == 1) {
        const data = await Conversation.aggregate([
            {
                '$match': {
                    'employer_id': user_id
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'employer_id',
                    'foreignField': '_id',
                    'pipeline': [
                        {
                            '$project': {
                                '_id': 1,
                                'name': 1,
                                'image': 1
                            }
                        }
                    ],
                    'as': 'employer'
                }
            }, {
                '$unwind': {
                    'path': '$employer'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'worker_id',
                    'foreignField': '_id',
                    'pipeline': [
                        {
                            '$project': {
                                '_id': 1,
                                'name': 1,
                                'image': 1
                            }
                        }
                    ],
                    'as': 'worker'
                }
            }, {
                '$unwind': {
                    'path': '$worker'
                }
            }, {
                '$addFields': {
                    'message': {
                        '$last': '$messages.message'
                    },
                    'timesince': {
                        '$last': '$messages.timestamp'
                    },
                    'worker.image': {
                        '$concat': [
                            process.env.IMAGEBASEURL, '$worker.image'
                        ]
                    },
                    'employer.image': {
                        '$concat': [
                            process.env.IMAGEBASEURL, '$employer.image'
                        ]
                    },
                    'conversation_id': '$_id',
                    'total_pages': {
                        $size: "$messages"
                    }

                }
            }, {
                '$replaceRoot': {
                    'newRoot': {
                        '$mergeObjects': [
                            '$worker', {
                                'message': '$message',
                                'timesince': '$timesince',
                                'conversation_id': '$conversation_id',
                                'total_pages': '$total_pages'
                            }
                        ]
                    }
                }
            },
            {
                $match: {
                    'name': {
                        '$regex': search,
                        '$options': 'i'
                    }
                }
            },
            {
                $facet: {
                    metadata: [
                        {
                            $count: "total",
                        },
                    ],
                    data: [
                        {
                            $skip: skip,
                        },
                        {
                            $limit: limit,
                        },
                    ],
                },
            }
        ]);
        if (!data[0].metadata[0]) {
            throw new Error("Nothing found");
        } else {
            for (const iterator of data[0].data) {
                iterator.total_pages = Math.ceil(iterator.total_pages / limit) > 0 ? Math.ceil(iterator.total_pages / limit) : 0;
                iterator.timesince = moment(iterator.timesince).tz(timezone).fromNow()
            }
            const total_pages = Math.ceil(data[0].metadata[0].total / limit);
            return {
                total_pages: total_pages,
                conversations: data[0].data,
            };

        }
    }
}



const getConversationById = async (conversation_id, cond, pageno, timezone) => {
    const limit = parseInt(process.env.ITEMPERPAGE);
    const skip = (pageno - 1) * limit;
    const total_messages = await Conversation.findOne({ _id: new mongoose.Types.ObjectId(conversation_id), ...cond }, { messages: 1, _id: 0 });
    if (total_messages.messages.length > 0) {
        const total = total_messages.messages.length;
        const total_pages = Math.ceil(total / limit);
        const data = await Conversation.aggregate([
            {
                '$match': {
                    _id: new mongoose.Types.ObjectId(conversation_id), ...cond
                }
            }, {
                '$unwind': {
                    'path': '$messages'
                }
            }, {
                '$sort': {
                    'messages.timestamp': -1
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'messages': {
                        '$push': '$messages'
                    }
                }
            }, {
                '$project': {
                    'messages': {
                        '$slice': [
                            '$messages', skip, limit
                        ]
                    }
                }
            },
            {
                '$unwind': {
                    'path': '$messages'
                }
            }, {
                '$sort': {
                    'messages.timestamp': 1
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'messages': {
                        '$push': '$messages'
                    }
                }
            },
        ])
        // const data = await Conversation.findOne({ _id: conversation_id, ...cond }, { messages: { $reverseArray: { $slice: [skip, limit] } }, _id: 0 });
        for (const iterator of data[0].messages) {
            iterator.timesince = moment(iterator.timestamp).tz(timezone).fromNow()
        }
        if (data[0].messages.length > 0) {
            return { messages: data[0].messages, total_pages: total_pages };
        }
        else {
            throw new Error('Nothing Found');
        }
    }
    else {
        throw new Error('Nothing found')

    }

}


module.exports = { getConversations, getConversationById }