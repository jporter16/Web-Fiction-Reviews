const allCheckboxes = document.querySelectorAll(".form-check-input");
let checkedCount = 0;

function countCheckedBoxes() {
  checkedCount = 0;
  const allCheckbox = document.querySelector("#Fantasy");
  for (checkbox of allCheckboxes) {
    if (checkbox.checked) {
      checkedCount += 1;
    }
  }
  // now disable the unchecked boxes when checkedCount >=3
  if (checkedCount >= 3) {
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
    countCheckedBoxes();
  });
}
