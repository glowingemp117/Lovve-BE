const asyncHandler = require('express-async-handler');
var path = require('path');
const { successResponse, PrintError } = require('../middleware/common');
const AWS = require('aws-sdk');
const fs = require('fs');

const S3 = new AWS.S3
    ({
        region: process.env.REGION,
        accessKeyId: process.env.S3KEY,
        secretAccessKey: process.env.S3SECRET
    });


const BUCKET_NAME = process.env.FILEUPLOADBUCKETNAME;

const uploadFileApi = asyncHandler(async (req, res) => {
    const file = req.files.file;
    var ext = file.name.split(".")
    var imagenamefinal = file.name.replace(file.name, (new Date).getTime() + "." + ext[ext.length - 1]);
    const ContentType = imagenamefinal.split('.')
    const myBucket = BUCKET_NAME,
        myKey = imagenamefinal,
        params = {
            Body: file.data,  // file buffer data
            Bucket: myBucket,  // bucket name
            Key: myKey,  // file name to be stored as in s3
            ContentType: ContentType[ContentType.length - 1],
            ACL: "public-read-write",
        };
    S3.putObject(params, (err, response) => {
        if (err) {
            console.log(err);
            return PrintError(400, err, res);
        }
        else {
            return successResponse(200, "added successfully", { fileUrl: `${process.env.IMAGEBASEURLAWS}` + imagenamefinal, fileName: imagenamefinal }, res)
        }
    });
})

module.exports = { uploadFileApi }