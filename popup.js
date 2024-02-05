const viewCodeReviews = (codeReviewData = []) => {
    if (isEmpty(codeReviewData)) {
        createFreshCodeReview();
    } else {
        loadExistingCodeReview(codeReviewData);
    }

    return;
};

const createFreshCodeReview = () => {
    fetch("./cr-guidelines.json")
    .then(response => {
       return response.json();
    })
    .then(crGuidelinesData => { 
        createView(crGuidelinesData);
        saveCodeReviews(crGuidelinesData);
    });
};

const createView = (crGuidelinesData = {}) => {
    const codeReviewElement = document.getElementById("codeReviewList");
    codeReviewElement.innerHTML = "";
    for (var crGuidelinesGroup in crGuidelinesData) {
        const guidelinesGroupElement = document.createElement("div");

        const guidelinesGroupTitleElement = document.createElement("button");
        guidelinesGroupTitleElement.className = "collapsible";
        guidelinesGroupTitleElement.textContent = crGuidelinesData[crGuidelinesGroup]["groupName"];
        guidelinesGroupTitleElement.addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });

        guidelinesGroupElement.appendChild(guidelinesGroupTitleElement);

        const guidelinesGroupListElement = document.createElement("ul");
        guidelinesGroupListElement.className = "content";
        let guidelines = crGuidelinesData[crGuidelinesGroup]["guidelines"];
        let guidelineIndex = 0;
        while (guidelineIndex < guidelines.length) {
            const guidelinesGroupListItemElement = document.createElement("li");
            guidelinesGroupListItemElement.textContent = guidelines[guidelineIndex]["text"];
            
            const guidelinesGroupListItemCheckboxElement = document.createElement("input");
            guidelinesGroupListItemCheckboxElement.type = "checkbox";
            guidelinesGroupListItemCheckboxElement.id = guidelines[guidelineIndex]["id"];
            guidelinesGroupListItemCheckboxElement.name = guidelines[guidelineIndex]["id"];
            guidelinesGroupListItemCheckboxElement.checked = guidelines[guidelineIndex]["checked"];
            guidelinesGroupListItemCheckboxElement.addEventListener("click", function() {
                const itemChecked = this.checked;
                chrome.storage.local.get(["codeReviewData"], (data) => {
                    const itemId = this.id;
                    const groupId = parseInt(itemId.split(".")[0]);
                    let codeReviewUpdatedData = data.codeReviewData;
                    codeReviewUpdatedData[groupId - 1]["guidelines"].find(g => g.id === itemId).checked = itemChecked;
                    saveCodeReviews(codeReviewUpdatedData);
                });
            });
            guidelinesGroupListItemElement.appendChild(guidelinesGroupListItemCheckboxElement);

            guidelinesGroupListElement.appendChild(guidelinesGroupListItemElement);
            
            guidelineIndex += 1;
        }
        guidelinesGroupElement.appendChild(guidelinesGroupListElement);

        codeReviewElement.appendChild(guidelinesGroupElement);
    }
}

const loadExistingCodeReview = (data = {}) => {
    createView(data.codeReviewData);
};

const clearView = () => {
    chrome.storage.local.clear();
    createFreshCodeReview();
}

function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
        return false;
        }
    }

    return true;
}

const saveCodeReviews = (codeReviewData = []) => {
    chrome.storage.local.set({ codeReviewData: codeReviewData });
};

chrome.storage.local.get(["codeReviewData"], (data) => {
    viewCodeReviews(data);
    document.querySelector('button').addEventListener('click', clearView);
});
