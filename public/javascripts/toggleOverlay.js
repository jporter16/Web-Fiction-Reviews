const deleteStoryBtn = document.getElementById("delete-story-button");
const reviewDialog = document.getElementById("deleteReviewConfirmationDialog");
const overlay = document.getElementById("deleteConfirmationOverlay");
const deleteReviewBtns = document.querySelectorAll(".delete-review-btn");

// I am setting this up so that delete-general applies to everything except reviews. reviews needed special code.

const closeDeleteReview = document.getElementById(
  "closeDeleteReviewConfirmationDialog"
);

if (deleteStoryBtn) {
  deleteStoryBtn.addEventListener("click", showDeleteConfirmation);
}

const hideDialogButton = document.getElementById(
  "closeDeleteStoryConfirmationDialog"
);
if (hideDialogButton) {
  hideDialogButton.addEventListener("click", hideDeleteConfirmation);
}

function hideDeleteConfirmation() {
  // Hide the confirmation dialog
  const dialog = document.getElementById("deleteStoryConfirmationDialog");
  dialog.style.display = "none";
  overlay.style.display = "none";
  reviewDialog.style.display = "none";
}

overlay.addEventListener("click", hideDeleteConfirmation);

// deleting the reviews:

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
