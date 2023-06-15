const allCheckboxes = document.querySelectorAll(".form-check-input.tag-check");
const documentTitle = document.querySelector("#document-title");
let max = 4;

if (
  documentTitle.textContent === "Edit Collection" ||
  documentTitle.textContent === "New Collection"
) {
  max = 8;
}
let checkedCount = 0;

function countCheckedBoxes(max) {
  checkedCount = 0;
  for (checkbox of allCheckboxes) {
    if (checkbox.checked) {
      checkedCount += 1;
    }
  }
  // now disable the unchecked boxes when checkedCount >=4
  // This sets the number of tags to 4 on the client side.
  if (checkedCount >= max) {
    for (checkbox of allCheckboxes) {
      if (!checkbox.checked) {
        checkbox.disabled = true;
      }
    }
  } else {
    for (checkbox of allCheckboxes) {
      checkbox.disabled = false;
    }
  }
  if (checkedCount === 0) {
    for (checkbox of allCheckboxes) {
      checkbox.required = true;
    }
  } else {
    for (checkbox of allCheckboxes) {
      checkbox.required = false;
    }
  }
}

for (checkbox of allCheckboxes) {
  checkbox.addEventListener("click", () => {
    countCheckedBoxes(max);
  });
}
window.addEventListener("load", countCheckedBoxes(max));

// if there is a public /private toggle for collections, then do that:
const publicToggle = document.querySelector("#public");
const publicLabel = document.querySelector("#public-label");
if (publicToggle && publicLabel) {
  publicToggle.addEventListener("click", () => {
    if (!publicToggle.checked) {
      publicLabel.innerText = "This collection is private";
    } else {
      publicLabel.innerText = "This collection is public";
    }
  });
  // if it's not checked, then set the text.
  if (!publicToggle.checked) {
    publicLabel.innerText = "This collection is private";
  }
}
