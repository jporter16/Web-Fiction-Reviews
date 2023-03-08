// i decided not to use this-the import/require statements weren't working.

import Fiction from "../../models/fiction";

const titleInput = document.querySelector("#title");

async function liveUpdateSearch() {
  const searchStories = await Fiction.find({
    title: { $regex: new RegExp(query, "i") },
  });
  insideText = `Your story might already exist. These are similar titles: ${searchStories}`;
}

titleInput.addEventListener("blur", (e) => {
  const similarStories = document.querySelector("#similar-stories");
  liveUpdateSearch(e.target.value);
  similarStories.innerText = insideText;
});
