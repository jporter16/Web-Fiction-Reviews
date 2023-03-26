const hiddenStoryForm = document.querySelector("#hide-report-story-form");
const viewHiddenStoryForm = document.querySelector("#view-report-story-form");

const hiddenReviewForm = document.querySelector("#hide-report-review-form");
const viewHiddenReviewForm = document.querySelector("#view-report-review-form");

viewHiddenStoryForm.addEventListener("click", () => {
  hiddenStoryForm.classList.toggle("hide");
  if (viewHiddenStoryForm.innerText === "Cancel") {
    viewHiddenStoryForm.innerText = "Report";
    viewHiddenStoryForm.classList.remove("btn-primary");
    viewHiddenStoryForm.classList.add("btn-danger");
  } else {
    viewHiddenStoryForm.innerText = "Cancel";
    viewHiddenStoryForm.classList.remove("btn-danger");
    viewHiddenStoryForm.classList.add("btn-primary");
  }
});

// viewHiddenReviewForm.addEventListener("click", (e) => {
//   hiddenReviewForm.classList.toggle("hide");
//   if (viewHiddenReviewForm.innerText === "Cancel") {
//     viewHiddenReviewForm.innerText = "Report";
//     viewHiddenReviewForm.classList.remove("btn-primary");
//     viewHiddenReviewForm.classList.add("btn-danger");
//   } else {
//     viewHiddenReviewForm.innerText = "Cancel";
//     viewHiddenReviewForm.classList.remove("btn-danger");
//     viewHiddenReviewForm.classList.add("btn-primary");
//   }
// });
const hiddenFormButtons = document.querySelectorAll(".hidden-form-button");
[...hiddenFormButtons].forEach((button) => {
  button.addEventListener("click", (e) => {
    const buttonId = e.target.id;
    const selectedForm = document.querySelector(`#${buttonId} + form`);

    selectedForm.classList.toggle("hide");
    if (button.innerText === "Cancel") {
      button.innerText = "Report";
      button.classList.remove("btn-primary");
      button.classList.add("btn-danger");
    } else {
      button.innerText = "Cancel";
      button.classList.remove("btn-danger");
      button.classList.add("btn-primary");
    }
  });
});
