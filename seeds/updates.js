const {
  calculatePopularity,
} = require("../controllers/databaseCalculations.js");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Story = require("../models/fiction");

// const dbUrl = "mongodb://localhost:27017/webfiction";
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

const updateDatabase = async () => {
  console.log("in update db");

  const allStories = await Story.find().populate("reviews");
  console.log("after allStories db");

  // for (let story of allStories) {
  //   story.updateOne

  //   await calculatePopularity(story._id);
  //   console.log("in for loop");
  // }

  for (let story of allStories) {
    const avgRating = story.ratingScore;
    const minNumRatings = 1;
    let storyPopularity;
    if (avgRating == -1) {
      storyPopularity = 0;
    } else {
      const numRatings = story.reviews.length;
      storyPopularity = (avgRating * numRatings) / (numRatings + minNumRatings);
    }

    await Story.updateOne(
      { _id: story._id },
      { $set: { popularity: storyPopularity } }
    );
  }
};

updateDatabase().then(() => {
  setTimeout(() => {
    mongoose.connection.close();
  }, 2000);
});