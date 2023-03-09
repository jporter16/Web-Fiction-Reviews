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

const seedDB = async () => {
  await Story.deleteMany({});
  const tagArray = ["Fantasy", "LitRPG", "Romance"];
  const storyList = [
    {
      title: "Never Die Twice",
      author: "Maxime J. Durand (Void Herald)",
      link: "https://www.royalroad.com/fiction/32067/never-die-twice",
      tags: ["Fantasy", "litRPG"],
      poster: "640a4568e962686921f0259b",
      ratingScore: -1,
      reported: false,
      images: [
        {
          url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1678325348/webfictionreviews/never-die-twice_ckxppc.jpg",
          filename: "never-die-twice_ckxppc",
        },
      ],
      description:
        "Walter Tye is the best friend any adventurer needs. He is the smiling shopkeeper next to your local dungeon, the one who sells you these cheap healing potions. When you need information about a monster, Tye always knows. He wants to help; you can trust him. He is also the undead necromancer ruling said dungeon, getting paid to solve problems that he caused in the first place. But don't tell anyone that...",
    },
    {
      title: "Mother of Learning",
      author: "nobody103",
      link: "https://www.royalroad.com/fiction/32067/never-die-twice",
      tags: ["Fantasy", "Adventure", "Time Travel"],
      poster: "640a4568e962686921f0259b",
      ratingScore: -1,
      reported: false,
      verifiedByAuthor: false,
      pending: true,
      images: [
        {
          url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1678325348/webfictionreviews/mother-of-learning-cover_m3kmfp.jpg",
          filename: "mother-of-learning-cover_m3kmfp",
        },
      ],
      description:
        "Zorian is a teenage mage of humble birth and slightly above-average skill, attending his third year of education at Cyoria's magical academy. He is a driven and irritable young man, consumed by a desire to ensure his own future and free himself of the influence of his family, whom he resents for favoring his brothers over him. Consequently, he has no time for pointless distractions or paying attention to other people's problems. As it happens, time is something he is about to get plenty of. On the eve of the Cyoria's annual summer festival, he is killed and brought back to the beginning of the month, just before he was about to take a train to Cyoria. Suddenly trapped in a time loop with no clear end or exit, Zorian will have to look both within and without to unravel the mystery before him. And he does have to unravel it, for the time loop hadn't been made for his sake and dangers lurk everywhere... Repetition is the mother of learning, but Zorian will have to first make sure he survives to try again - in a world of magic, even a time traveler isn't safe from those who wish him ill.",
    },
    {
      title: "A Practical Guide to Evil",
      author: "ERRATICERRATA",
      link: "https://practicalguidetoevil.wordpress.com/2015/03/25/prologue/",
      tags: ["Fantasy", "Adventure", "Anti-hero"],
      poster: "640a4568e962686921f0259b",
      ratingScore: -1,
      reported: false,
      verifiedByAuthor: false,
      pending: true,
      images: [
        {
          url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1678325550/webfictionreviews/placeholder-book-cover_jmu4wk.png",
          filename: "placeholder-book-cover_jmu4wk",
        },
      ],
      description:
        "The Empire stands triumphant.For twenty years the Dread Empress has ruled over the lands that were once the Kingdom of Callow, but behind the scenes of this dawning golden age threats to the crown are rising. The nobles of the Wasteland, denied the power they crave, weave their plots behind pleasant smiles. In the north the Forever King eyes the ever-expanding borders of the Empire and ponders war. The greatest danger lies to the west, where the First Prince of Procer has finally claimed her throne: her people sundered, she wonders if a crusade might not be the way to secure her reign. Yet none of this matters, for in the heart of the conquered lands the most dangerous man alive sat across an orphan girl and offered her a knife. Her name is Catherine Foundling, and she has a plan. A Practical Guide to Evil is a fantasy series about a young girl named Catherine Foundling making her way through the world – though, in a departure from the norm, not on the side of the heroes. Is there such a thing as doing bad things for good reasons, or is she just rationalizing her desire for control? Good and Evil are tricky concepts, and the more power you get the blurrier the lines between them become.",
    },
    {
      title: "Unsong",
      author: "Scott Alexander",
      link: "http://unsongbook.com/prologue-2/",
      tags: ["Comedy", "Alternate Universe", "Fantasy"],
      poster: "640a4568e962686921f0259b",
      ratingScore: -1,
      reported: false,
      verifiedByAuthor: false,
      pending: true,
      images: [
        {
          url: "https://res.cloudinary.com/dj3dni7xt/image/upload/v1678340540/webfictionreviews/Unsongcover_zla3nz.png",
          filename: "Unsongcover_zla3nz",
        },
      ],
      description:
        "Aaron Smith-Teller works in a kabbalistic sweatshop in Silicon Valley, where he and hundreds of other minimum-wage workers try to brute-force the Holy Names of God. All around him, vast forces have been moving their pieces into place for the final confrontation. An overworked archangel tries to debug the laws of physics. Henry Kissinger transforms the ancient conflict between Heaven and Hell into a US-Soviet proxy war. A Mexican hedge wizard with no actual magic wreaks havoc using the dark art of placebomancy. The Messiah reads a book by Peter Singer and starts wondering exactly what it would mean to do as much good as possible...  Aaron doesn't care about any of this. He and his not-quite-girlfriend Ana are engaged in something far more important – griping about magical intellectual property law. But when a chance discovery brings them into conflict with mysterious international magic-intellectual-property watchdog UNSONG, they find themselves caught in a web of plots, crusades, and prophecies leading inexorably to the end of the world.",
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
