// This first part is to create reports (which is a hidden div).
const hiddenStoryForm = document.querySelector("#hide-report-story-form");
const viewHiddenStoryForm = document.querySelector("#view-report-story-form");
// This is for the report story form:
if (viewHiddenStoryForm) {
  viewHiddenStoryForm.addEventListener("click", () => {
    console.log("clicked on report");
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
}
// This is for reach report review:
const hiddenFormButtons = document.querySelectorAll(".hidden-form-button");
if (hiddenFormButtons) {
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
}
// This is to reveal the hidden div to edit the review:

const hiddenEditReviewFormButtons = document.querySelectorAll(
  ".hidden-edit-review-form-button"
);
[...hiddenEditReviewFormButtons].forEach((button) => {
  button.addEventListener("click", (e) => {
    const buttonId = e.target.id;
    const selectedForm = document.querySelector(`#${buttonId} + form`);

    selectedForm.classList.toggle("hide");
    if (button.innerText === "Cancel") {
      button.innerText = "Edit";
      button.classList.remove("btn-primary");
      button.classList.add("btn-info");
    } else {
      button.innerText = "Cancel";
      button.classList.remove("btn-info");
      button.classList.add("btn-primary");
    }
  });
});

// This next part is to create a popup delete option:
const deleteStoryBtn = document.getElementById("delete-story-button");
const reviewDialog = document.getElementById("deleteReviewConfirmationDialog");
const overlay = document.getElementById("deleteConfirmationOverlay");
const deleteReviewBtns = document.querySelectorAll(".delete-review-btn");
const hideDialogButton = document.getElementById(
  "closeDeleteStoryConfirmationDialog"
);

const closeDeleteReview = document.getElementById(
  "closeDeleteReviewConfirmationDialog"
);

if (deleteStoryBtn) {
  deleteStoryBtn.addEventListener("click", showDeleteConfirmation);
}

hideDialogButton.addEventListener("click", hideDeleteConfirmation);

function hideDeleteConfirmation() {
  // Hide the confirmation dialog
  const dialog = document.getElementById("deleteStoryConfirmationDialog");
  dialog.style.display = "none";
  overlay.style.display = "none";
  reviewDialog.style.display = "none";
}
if (overlay) {
  overlay.addEventListener("click", hideDeleteConfirmation);
}

// deleting the reviews:
if (deleteReviewBtns) {
  deleteReviewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      reviewIdToDelete = btn.getAttribute("data-id");
      storyIdToDelete = btn.getAttribute("data-story-id");

      overlay.style.display = "block";

      const deleteReviewForm = document.getElementById("delete-review-form");
      deleteReviewForm.action = `/fiction/${storyIdToDelete}/reviews/${reviewIdToDelete}?_method=DELETE`;
      reviewDialog.style.display = "block";
    });
  });
}

if (closeDeleteReview) {
  closeDeleteReview.addEventListener("click", () => {
    reviewDialog.style.display = "none";
    overlay.style.display = "none";
  });
}

function showDeleteConfirmation() {
  overlay.style.display = "block";
  // Show the confirmation dialog
  const dialog = document.getElementById("deleteStoryConfirmationDialog");
  dialog.style.display = "block";
}

console.log("test");
