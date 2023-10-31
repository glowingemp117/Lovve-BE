/**
 * Sample schema
 *  @author glowingemp101
 */
const mongoose = require("mongoose");

const AssessmentsSchema = new mongoose.Schema(
    {
        patient: {
            //id of the patient to whom this  is assigned
            type: mongoose.Schema.Types.ObjectId,
            ref: "patients", //Reference to the model of patient
        },
        therapist: {
            //id of the Therapist who is taking this assessment
            type: mongoose.Schema.Types.ObjectId,
            ref: "therapists", //Reference to the model of Therapist
        },
        type: {
            //type of assessment
            type: String,
            enum: ["simple", "motion"],
        },
        status: {
            //status of assessment
            type: String,
            enum: ["requested", "started", "submitted", "reviewed", "archive"],
            default: "requested",
        },
        exercise: String,
        sets: Number, //sets for exercise assigned by Therapist
        reps: Number, //reps for exercise assigned by Therapist
        due_date: Date, //deadline to submit assessment
        submission_date: Date, //date of assessment submission
        time_start: Date, //time when assessment started
        time_spent: String, //total time taken by patient to complete assessment
        note: String, //note  from Therapist after reviewing exercise
        questions:
            //This will store ids of all the questions taken by a Therapist
            [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "questions",
                },
            ],
    },
    {
        timestamps: true,
    }
);

// Model
module.exports = mongoose.model("assessments", AssessmentsSchema);