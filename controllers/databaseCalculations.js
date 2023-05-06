const Fiction = require("../models/fiction");

module.exports.createSortedArrayOfStories = (storyList) => {
  let sortedArray = [];
  for (let story of storyList) {
    if (sortedArray.length === 0) {
      sortedArray.push(story);
    } else {
      for (let i = 0; i < sortedArray.length; i++) {
        if (story.ratingScore > sortedArray[i].ratingScore) {
          sortedArray.splice(i, 0, story);
          break;
        }
      }
      // Check to confirm that the last value's rating score is less than the story that we are adding's rating score.
      if (
        story.ratingScore <= sortedArray[sortedArray.length - 1].ratingScore
      ) {
        sortedArray.push(story);
      }
    }
  }
  return sortedArray;
};

module.exports.updateRatingScore = async (storyId) => {
  const story = await Fiction.findById(storyId).populate("reviews");

  if (story.reviews.length > 0) {
    let avg = 0;
    let count = 0;
    for (let i = 0; i < story.reviews.length; i++) {
      avg += story.reviews[i].rating;

      count += 1;
    }
    avg = avg / count;

    story.ratingScore = avg;
    await story.save();
  } else {
    story.ratingScore = -1;
    await story.save();
  }
};

module.exports.calculatePopularity = async (storyId) => {
  // Run this after updating ratingScore.
  const story = await Fiction.findById(storyId).populate("reviews");
  const avgRating = story.ratingScore;
  const minNumRatings = 1;
  if (avgRating == -1) {
    story.popularity = 0;
    await story.save();
  } else {
    const numRatings = story.reviews.length;
    const popularity = (avgRating * numRatings) / (numRatings + minNumRatings);
    story.popularity = popularity;
    await story.save();
  }
};

module.exports.calculateAudienceAndWarnings = async (storyId) => {
  const story = await Fiction.findById(storyId).populate("reviews");
  if (story.reviews.length > 0) {
    // First calculate Audience :

    let avg = 0;
    let count = 0;
    for (let i = 0; i < story.reviews.length; i++) {
      // 0 is null so don't calculate that into average.
      if (story.reviews[i].audience > 0) {
        avg += story.reviews[i].audience;
        count += 1;
      }
    }
    if (count > 0) {
      avg = avg / count;
    } else {
      avg = 0;
    }
    story.audience = avg;
    // Now calculate Warnings:
    let avgViolence = 0;
    let countViolence = 0;
    let avgProfanity = 0;
    let countProfanity = 0;
    let avgSexualContent = 0;
    let countSexualContent = 0;
    try {
      for (let j = 0; j < story.reviews.length; j++) {
        // 0 is null so don't calculate that into average.
        if (story.reviews[j].warnings.violence > 0) {
          avgViolence += story.reviews[j].warnings.violence;
          countViolence += 1;
        }
      }
      if (countViolence > 0) {
        avgViolence = avgViolence / countViolence;
      }
      // Now calculate sexualContent:
      for (let j = 0; j < story.reviews.length; j++) {
        if (story.reviews[j].warnings.sexualContent > 0) {
          avgSexualContent += story.reviews[j].warnings.sexualContent;
          countSexualContent += 1;
        }
      }
      if (countSexualContent > 0) {
        avgSexualContent = avgSexualContent / countSexualContent;
      }
      // Now calculate profanity:
      for (let j = 0; j < story.reviews.length; j++) {
        if (story.reviews[j].warnings.profanity > 0) {
          avgProfanity += story.reviews[j].warnings.profanity;
          countProfanity += 1;
        }
      }
      if (countProfanity > 0) {
        avgProfanity = avgProfanity / countProfanity;
      }
    } catch (e) {
      console.error(e);
      console.error("there was an error calculating warning ratings");
    }
    story.warnings = {};
    story.warnings.sexualContent = avgSexualContent;
    story.warnings.violence = avgViolence;
    story.warnings.profanity = avgProfanity;
    await story.save();
  } else {
    story.audience = 0;
    story.warnings = {};
    story.warnings.sexualContent = 0;
    story.warnings.violence = 0;
    story.warnings.profanity = 0;

    await story.save();
  }
};

module.exports.genreList = [
  "Action",
  "Adventure",
  "Alternate Universe",
  "Anti-hero",
  "Contemporary",
  "Comedy",
  "Cultivation",
  "Drama",
  "Fantasy",
  "Female Lead",
  "Historical",
  "Horror",
  "litRPG",
  "Martial Arts",
  "Mystery",
  "Reincarnation",
  "Romance",
  "Science Fiction",
  "Slice of Life",
  "Strategy",
  "Time Travel",
  "Virtual Reality",
];

module.exports.sortReviewList = async (story) => {
  sortedReviews = story.reviews.sort((r1, r2) => {
    return r2.upvotes.number - r1.upvotes.number;
  });

  // await story.save();
  // for (let i = 0; i < reviewList.length; i++) {
  //   if (i === 0) {
  //     sortedReviewList.push(reviewList[i]);
  //   } else {
  //     for (let j = 0; j < sortedReviewList.length; j++) {
  //       if (sortedReviewList[j].upvotes.number < reviewList[i].upvotes.number) {
  //         sortedReviewList.splice(j, 0, reviewList[i]);
  //         break;
  //       }
  //       if (
  //         reviewList[i].upvotes.number <=
  //         sortedReviewList[sortedReviewList.length - 1].upvotes.number
  //       ) {
  //         sortedReviewList.push(reviewList[i]);
  //       }
  //     }
  //   }
  // }
  // story.reviews = sortedReviewList;
};
// I'm not going to use this. Taking this out.
module.exports.cleanUrl = (url) => {
  if (url.slice(0, 12) === "https://www.") {
    console.log("Url is acceptable ");
    return url;
  } else if (url.slice(0, 4) === "www.") {
    console.log("http added");
    const prefix = "https://";
    newUrl = prefix + url;
    return newUrl;
  } else {
    console.log("url is not acceptable, adding https://www.");
    const prefix = "https://www.";
    newUrl = prefix + url;
    return newUrl;
  }
};
