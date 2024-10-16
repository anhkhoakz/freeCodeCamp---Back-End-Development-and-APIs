require("dotenv").config();

const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB", err);
    });

let Person;

const personSchema = new mongoose.Schema({
    name: String,
    age: Number,
    favoriteFoods: [String],
});

Person = mongoose.model("Person", personSchema);

const createAndSavePerson = (done) => {
    const janeFonda = new Person({
        name: "Jane Fonda",
        age: 84,
        favoriteFoods: ["eggs", "fish", "fresh fruit"],
    });

    janeFonda.save((err, data) => {
        if (err) return console.error(err);
        done(null, data);
    });
};

const createManyPeople = (arrayOfPeople, done) => {
    Person.create(arrayOfPeople, (err, data) => {
        if (err) return console.error(err);
        done(null, data);
    });
};

const findPeopleByName = (personName, done) => {
    Person.find({ name: personName }, (err, data) => {
        if (err) return done(err);
        done(null, data);
    });
};

const findOneByFood = (food, done) => {
    Person.findOne({ favoriteFoods: food }, (err, data) => {
        if (err) return done(err);
        done(null, data);
    });
};

const findPersonById = (personId, done) => {
    Person.findById(personId, (err, data) => {
        if (err) return done(err);
        done(null, data);
    });
};

const findEditThenSave = (personId, done) => {
    const foodToAdd = "hamburger";

    Person.findById(personId, (err, person) => {
        if (err) return done(err);

        person.favoriteFoods.push(foodToAdd);
        person.markModified("favoriteFoods");

        person.save((err, data) => {
            if (err) return done(err);
            done(null, data);
        });
    });
};

const findAndUpdate = (personName, done) => {
    const ageToSet = 20;

    Person.findOneAndUpdate(
        { name: personName },
        { age: ageToSet },
        { new: true },
        (err, data) => {
            if (err) return done(err, data);
            return done(null, data);
        }
    );
};

const removeById = (personId, done) => {
    Person.findByIdAndRemove(personId, (err, removedDoc) => {
        if (err) return console.log(err);
        done(null, removedDoc);
    });
};

const removeManyPeople = (done) => {
    const nameToRemove = "Mary";

    Person.remove({ name: nameToRemove }, (err, data) => {
        if (err) return done(err);
        done(null, data);
    });
};

const queryChain = (done) => {
    const foodToSearch = "burrito";
    Person.find({ favoriteFoods: foodToSearch })
        .sort({ name: 1 })
        .limit(2)
        .select("-age")
        .exec((err, data) => {
            if (err) return done(err);
            done(null, data);
        });
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
