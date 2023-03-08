if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Story = require("../models/fiction");

const dbUrl = "mongodb://localhost:27017/welp";
// const dbUrl = process.env.DB_URL || ;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

const seedDB = async () => {
  await Story.deleteMany({});
  const tagArray = ["Fantasy", "LitRPG", "Romance"];
  const storyList = [
    {
      title: "Never Die Twice",
      author: "Maxime J. Durand (Void Herald)",
      link: "https://www.royalroad.com/fiction/32067/never-die-twice",
      tags: "Fantasy, litRPG",
      poster: "64031ea187db0eb0cd6f272c",
      ratingScore: -1,
      reported: false,
      images: [
        {
          url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1677957260/Welp/never-die-twice_dpfjww.jpg",
          filename: "never-die-twice_dpfjww",
        },
        {
          url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1674868356/YelpCamp/lv5chzqfhnxq5wmlbzsr.jpg",
          filename: "YelpCamp/lv5chzqfhnxq5wmlbzsr",
        },
      ],
      description:
        "Walter Tye is the best friend any adventurer needs. He is the smiling shopkeeper next to your local dungeon, the one who sells you these cheap healing potions. When you need information about a monster, Tye always knows. He wants to help; you can trust him. He is also the undead necromancer ruling said dungeon, getting paid to solve problems that he caused in the first place. But don't tell anyone that...",
    },
    {
      title: "Mother of Learning",
      author: "nobody103",
      link: "https://www.royalroad.com/fiction/32067/never-die-twice",
      tags: "Fantasy, Adventure, Time Travel",
      poster: "64031ea187db0eb0cd6f272c",
      ratingScore: -1,
      reported: false,
      verifiedByAuthor: false,
      pending: true,
      images: [
        {
          url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1678003392/Welp/mother-of-learning-cover_lpmzt3.jpg",
          filename: "mother-of-learning-cover_lpmzt3",
        },
      ],
      description:
        "Zorian is a teenage mage of humble birth and slightly above-average skill, attending his third year of education at Cyoria's magical academy. He is a driven and irritable young man, consumed by a desire to ensure his own future and free himself of the influence of his family, whom he resents for favoring his brothers over him. Consequently, he has no time for pointless distractions or paying attention to other people's problems. As it happens, time is something he is about to get plenty of. On the eve of the Cyoria's annual summer festival, he is killed and brought back to the beginning of the month, just before he was about to take a train to Cyoria. Suddenly trapped in a time loop with no clear end or exit, Zorian will have to look both within and without to unravel the mystery before him. And he does have to unravel it, for the time loop hadn't been made for his sake and dangers lurk everywhere... Repetition is the mother of learning, but Zorian will have to first make sure he survives to try again - in a world of magic, even a time traveler isn't safe from those who wish him ill.",
    },
  ];
  for (const storyObject of storyList) {
    // I'm working here!!! FIX ME:
    const string = "https://www.royalroad.com/fiction/32067/never-die-twice";
    const story = new Story({
      poster: storyObject.poster,
      link: storyObject.link,
      tags: storyObject.tags,
      title: storyObject.title,
      author: storyObject.author,
      images: storyObject.images,
      description: storyObject.description,
      ratingScore: storyObject.ratingScore,
    });
    await story.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
