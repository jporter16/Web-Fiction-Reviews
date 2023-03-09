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

module.exports.genreList = [
  "Action",
  "Adventure",
  "Alternate Universe",
  "Anti-hero",
  "Comedy",
  "Cultivation",
  "Fantasy",
  "litRPG",
  "Romance",
  "Science Fiction",
  "Slice of Life",
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
