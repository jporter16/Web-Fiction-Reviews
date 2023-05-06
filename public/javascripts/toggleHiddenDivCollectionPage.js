// This first part is to create reports (which is a hidden div).
const hiddenStoryForm = document.querySelector("#hide-report-collection-form");
const viewHiddenStoryForm = document.querySelector(
  "#view-report-collection-form"
);
// This is for the report story form:
if (viewHiddenStoryForm) {
  viewHiddenStoryForm.addEventListener("click", () => {
    hiddenStoryForm.classList.toggle("hide");
    hiddenStoryForm.classList.toggle("center-contents");

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
