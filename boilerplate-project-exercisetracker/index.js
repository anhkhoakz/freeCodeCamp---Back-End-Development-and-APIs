const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB

const { MONGO_URI } = process.env;

const clientOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function run() {
    try {
        await mongoose.connect(MONGO_URI, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

        // Start the server after successful connection
        const listener = app.listen(process.env.PORT || 3000, () => {
            console.log(
                "Your app is listening on port " + listener.address().port
            );
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
}

run().catch(console.dir);

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Schemas
let User;
let Excerise;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
});

const exerciseSchema = new mongoose.Schema({
    username: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

User = mongoose.model("User", userSchema);
Excerise = mongoose.model("Exercise", exerciseSchema);

// Routes

app.post("/api/users", async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.json({ error: "Username is required" });
    }

    if (await User.exists({ username })) {
        return res.json({ error: "Username already taken" });
    }

    const newUser = new User({ username });
    try {
        await newUser.save();
        res.json({ username, _id: newUser._id });
    } catch (error) {
        console.error(error);

        res.json({ error: "Username already taken" });
    }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
    const { description, duration, date } = req.body;
    const { _id } = req.params;

    if (!description || !duration || !_id) {
        return res.json({
            error: "Id, description, and duration are required",
        });
    }

    const user = await User.findById(_id);
    if (!user) {
        return res.json({ error: "User not found" });
    }

    const newExercise = new Excerise({
        username: user.username,
        description,
        duration,
        date: date ? new Date(date) : Date.now(),
    });

    try {
        await newExercise.save();
        res.json({
            _id: user._id,
            username: user.username,
            date: newExercise.date.toDateString(),
            duration,
            description,
        });
    } catch (error) {
        res.json({ error: "Failed to save exercise" });
    }
});

// GET user's exercise log: GET /api/users/:_id/logs?[from][&to][&limit]

app.get("/api/users/:_id/logs", async (req, res) => {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    if (!_id) {
        return res.json({ error: "Id is required" });
    }

    const user = await User.findById(_id);

    if (!user) {
        return res.json({ error: "User not found" });
    }

    const query = { username: user.username };

    if (from || to) {
        query.date = {};
        if (from) {
            query.date.$gte = new Date(from);
        }
        if (to) {
            query.date.$lte = new Date(to);
        }
    }

    let exercises = await Excerise.find(query).limit(parseInt(limit));

    exercises = exercises.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
    }));

    res.json({
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log: exercises,
    });
});
