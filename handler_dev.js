const serverless = require("serverless-http");
const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const { errorHandler } = require("./backend/middleware/errorMiddleware");
const db = require("./backend/config/db");
const colors = require("colors");
var busboy = require("connect-busboy");
// load db
db();

app.use(express.json());
app.use(busboy());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", require("./backend/routes/userRoutes"));
app.use("/employer", require("./backend/routes/employerRoutes"));
app.use("/worker", require("./backend/routes/workerRoutes"));
app.use("/languages", require("./backend/routes/workerRoutes"));
app.use("/job", require("./backend/routes/jobRoutes"));
app.use("/jobs", require("./backend/routes/jobsRoutes"));
app.use("/file", require("./backend/routes/fileHandlingRouter"));
app.use(errorHandler);

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Route Not Found",
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Server listening in port ${process.env.PORT}`)
);

// module.exports.api = serverless(app);
