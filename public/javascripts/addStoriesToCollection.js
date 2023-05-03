const selectedStories = document.getElementById("selected-stories");
const checkboxContainer = document.getElementById("checkbox-container");
const existingStories = document.getElementsByClassName(
  "existing-checkbox-stories"
);
for (let i = 0; i < existingStories.length; i++) {
  existingStories[i].addEventListener("change", removeStory);
}
selectedStories.addEventListener("change", () => {
  const storyTitle = selectedStories.value;
  const storyId = getStoryIdByTitle(storyTitle);

  if (storyId) {
    const checkboxId = `checkbox-${storyId}`;

    if (!document.getElementById(checkboxId)) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.name = "collection[stories]";
      checkbox.value = storyId;
      checkbox.setAttribute("aria-label", "Checkbox for following text input");
      checkbox.classList.add("form-check-input");
      checkbox.setAttribute("data-story-id", storyId);
      checkbox.setAttribute("checked", true);

      checkbox.addEventListener("change", removeStory);

      const label = document.createElement("label");
      label.classList.add("form-check-label");
      label.classList.add("mx-1");

      // label.htmlFor = checkboxId;
      label.textContent = storyTitle;

      const wrapper = document.createElement("div");
      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);

      checkboxContainer.appendChild(wrapper);
    }
  }

  selectedStories.value = "";
});

function getStoryIdByTitle(title) {
  const storyOption = Array.from(
    document.querySelectorAll("#story-titles option")
  ).find((option) => option.value === title);
  return storyOption ? storyOption.getAttribute("data-id") : null;
}

function removeStory(event) {
  const checkbox = event.target;
  const wrapper = checkbox.parentElement;
  checkboxContainer.removeChild(wrapper);
}
