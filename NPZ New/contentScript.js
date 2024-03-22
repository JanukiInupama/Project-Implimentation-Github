// content.js
let blockSpoilers = true;
let spoilerCount = 0; // Move this to the global scope

chrome.storage.local.get("blockSpoilers", function (data) {
    blockSpoilers = data.blockSpoilers;
});

let postLinks = Array.from(
    document.querySelectorAll('a[data-testid="post-title"]')
).map((a) => a.href);
console.log(postLinks);
// Initialize the votes object
const votes = {};

// Add event listeners to track upvotes and downvotes
postLinks.forEach((postLink, index) => {
    const upvoteButtons = document.querySelectorAll(".upvote-button");
    const downvoteButtons = document.querySelectorAll(".downvote-button");

    // Initialize the votes object
    const votes = {};

    // Create the upvote and downvote buttons
    const upvoteButton = document.createElement("button");
    upvoteButton.textContent = "Upvote";
    upvoteButton.className = `upvote-button-${index}`; // Assign a unique class

    const downvoteButton = document.createElement("button");
    downvoteButton.textContent = "Downvote";
    downvoteButton.className = `downvote-button-${index}`; // Assign a unique class

    // ...
    // Function to log the vote counts
    function logVoteCounts() {
        console.log(votes);
    }

    // Add event listeners to track upvotes and downvotes
    postLinks.forEach((postLink, index) => {
        const postElement = document.querySelector(`a[href="${postLink}"]`);
        if (postElement) {
            const upvoteButton = document.createElement("button");
            upvoteButton.textContent = "Upvote";
            upvoteButton.className = `upvote-button-${index}`; // Assign a unique class

            const downvoteButton = document.createElement("button");
            downvoteButton.textContent = "Downvote";
            downvoteButton.className = `downvote-button-${index}`; // Assign a unique class

            postElement.parentNode.appendChild(upvoteButton);
            postElement.parentNode.appendChild(downvoteButton);

            upvoteButton.addEventListener("click", function () {
                if (!votes[postLink]) {
                    votes[postLink] = { upvotes: 0, downvotes: 0 };
                }
                votes[postLink].upvotes++;
                logVoteCounts();
                // Send the updated votes object to the database
                // replace 'yourDatabaseFunction' with your actual function to send data to the database
                yourDatabaseFunction(votes);
            });

            downvoteButton.addEventListener("click", function () {
                if (!votes[postLink]) {
                    votes[postLink] = { upvotes: 0, downvotes: 0 };
                }
                votes[postLink].downvotes++;
                logVoteCounts();
                // Send the updated votes object to the database
                // replace 'yourDatabaseFunction' with your actual function to send data to the database
                yourDatabaseFunction(votes);
            });
        }
    });
});

async function fetchModel(totalContent, postUniqueLink, article) {
    containsSpoiler = false;
    var post = {
        text: totalContent,
        link: postUniqueLink,
    };
    try {
        // let response = await fetch(
        // "https://nospoilerzone.azurewebsites.net/aidetection/",
        // {
        let response = await fetch("http://127.0.0.1:5000/aidetection/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(post),
        });
        let data = await response.json();

        containsSpoiler = data; // Extract label from the response
        console.log("contain spoiler return" + containsSpoiler);

        if (containsSpoiler == "1") {
            console.log("Contains spoiler in if");
            containsSpoiler = true;
            hideSpoilerPosts(article);
        } else if (containsSpoiler == "0") {
            containsSpoiler = false;
            console.log("not spoiler in if");
        } else if (containsSpoiler == "Text is too long.") {
            containsSpoiler = false;
            console.log("Text is too long");
        } else {
            containsSpoiler = false;
            console.log("Error in the fetch");
        }
        console.log("fetch method Contains spoiler: " + containsSpoiler);
        return containsSpoiler;
    } catch (error) {
        console.error("Error:", error);
        console.log("Error in the fetch");
        return false;
    }
}

async function checkForSpoilers() {
    spoilerCount = 0; // Reset the counter
    const articles = document.querySelectorAll("article.w-full");

    // Iterate over each article
    for (const article of articles) {
        // Select the first child of the article element
        const firstChild = article.firstElementChild;

        const hrefAttribute = firstChild.getAttribute("content-href");
        const titleElement = article.querySelector('[slot="title"]');
        const textBodyElement = article.querySelector('[slot="text-body"]');

        // Extract text content from elements with slot="title" and slot="text-body"
        const titleTextContent = titleElement
            ? titleElement.textContent.trim()
            : "";
        const textBodyTextContent = textBodyElement
            ? textBodyElement.textContent.trim()
            : "";

        // Merge the title and text body text content
        const mergedContent = titleTextContent + " " + textBodyTextContent;

        console.log("Merged Content:", mergedContent);
        console.log("Href Attribute:", hrefAttribute);

        let totalContent = "";
        totalContent = mergedContent;
        let postUniqueLink = "no-link";
        postUniqueLink = hrefAttribute;

        containsSpoiler = await fetchModel(
            totalContent,
            postUniqueLink,
            article
        );

        console.log("fetch finished" + containsSpoiler);

        console.log("Contains spoiler: " + containsSpoiler);

        if (containsSpoiler) {
            hideSpoilerPosts(article
                );
        }
    }
}

function hideSpoilerPosts(article) {
    containsSpoiler = true;
    spoilerCount++; // Increment counter
    const parentBackground = article.closest(
        "post-consume-tracker, shreddit-post"
    );

    if (
        parentBackground &&
        !parentBackground.classList.contains("spoiler-viewed")
    ) {
        const descendants = parentBackground.querySelectorAll(
            '[data-testid="post-title-text" ], [slot="title"], [slot="text-body"], [slot="post-media-container"], [data-testid="search_post_thumbnail"]'
        );

        descendants.forEach((descendant) => {
            descendant.style.backgroundColor = "grey";
            descendant.style.color = "grey";
            descendant.style.filter = "blur(8px)";
        });

        if (!parentBackground.querySelector(".view-spoiler-button")) {
            const viewSpoilerButton = document.createElement("button");
            viewSpoilerButton.textContent = "View Spoiler";
            viewSpoilerButton.className = "view-spoiler-button";

            const upvoteButton = document.createElement("button");
            upvoteButton.textContent = "Upvote";
            upvoteButton.style.backgroundColor = "green";
            upvoteButton.style.color = "white";
            upvoteButton.style.border = "none";
            upvoteButton.style.padding = "5px 10px";
            upvoteButton.style.cursor = "pointer";
            upvoteButton.style.display = "none";

            const downvoteButton = document.createElement("button");
            downvoteButton.textContent = "Downvote";
            downvoteButton.style.backgroundColor = "red";
            downvoteButton.style.color = "white";
            downvoteButton.style.border = "none";
            downvoteButton.style.padding = "5px 10px";
            downvoteButton.style.cursor = "pointer";
            downvoteButton.style.display = "none";

            viewSpoilerButton.addEventListener("click", function () {
                // Remove the blur and color changes
                descendants.forEach((descendant) => {
                    descendant.style.backgroundColor = "";
                    descendant.style.color = "";
                    descendant.style.filter = "";
                });

                // Show the upvote and downvote buttons
                upvoteButton.style.display = "";
                downvoteButton.style.display = "";

                // Hide the view spoiler button
                viewSpoilerButton.style.display = "none";
            });

            // Append the buttons to the parentBackground element
            parentBackground.appendChild(viewSpoilerButton);
            parentBackground.appendChild(upvoteButton);
            parentBackground.appendChild(downvoteButton);
        }
    }
    // elements.forEach((element) => {
    // });
}

console.log(`Detected ${spoilerCount} spoilers.`); // Log the total number of spoilers detected

chrome.storage.local.get("blockSpoilers", function (data) {
    if (data.blockSpoilers) {
        checkForSpoilers();
    }
});

// Create a MutationObserver instance
const observer = new MutationObserver(checkForSpoilers);

// Start observing the document with the configured parameters
observer.observe(document, { childList: true, subtree: true });

chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.blockSpoilers) {
        blockSpoilers = changes.blockSpoilers.newValue;
    }
});

window.addEventListener("scroll", function () {
    const viewSpoilerButton = document.querySelector(".view-spoiler-button");
    if (viewSpoilerButton) {
        viewSpoilerButton.style.display = "block";
    }
});

window.addEventListener("scroll", function () {
    const upvoteButton = document.querySelector(".upvote-button");
    const downvoteButton = document.querySelector(".downvote-button");

    if (upvoteButton && downvoteButton) {
        upvoteButton.style.display = "none";
        downvoteButton.style.display = "none";
    }
});

// Send the spoiler count to the background script
chrome.runtime.sendMessage({ action: "updateBadge", count: spoilerCount });

// window.addEventListener("scroll", function () {
//     postLinks = Array.from(
//         document.querySelectorAll('a[data-testid="post-title"]')
//     ).map((a) => a.href);
//     console.log(postLinks);
// });

// fLAGGING POST FEATURE

// ADDS FLAG POST BUTTON TO POSTS IN THE HOME PAGE
function flagHomePosts() {
    // Getting the posts based on the a tag
    let posts = document.getElementsByTagName("a");

    // Looping through the posts and adding a button at end of the post
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].slot.includes("full-post-link")) {
            posts[i].slot = "full-post";
            console.log("Added a button");
            posts[i].insertAdjacentHTML(
                "afterend",
                "<button class='flag' style='transform: translate(290px, 32px)'>Flag Post<button/>"
            );
        }
    }

    //
}

// EVENT HANDLER WHEN A USER CLICKS ON A FLAG POST BUTTON
function getData(et) {
    console.log("Get data is running");
    let button = et.target;
    let text;
    let heading;
    let link;
    try {
        // Getting the content if it is part of the homepage
        text = text = button.parentElement.children[5].textContent.trim();
        heading = button.parentElement.children[3].textContent.trim();
        link = button.parentElement.children[3].href;
    } catch (error) {
        // Getting the Content if it was an individual post
        console.log("There was an error for heading button access");
        text = document
            .getElementsByTagName("h1")[0]
            .parentElement.children[3].textContent.trim();
        heading = document.getElementsByTagName("h1")[0].textContent.trim();
        link = document
            .getElementsByTagName("h1")[0]
            .parentElement.getAttribute("content-href");
    }

    // setting the heading, text and link of the post into an object
    let post = {
        Heading: heading.trim(),
        TextContent: text.trim(),
        link: link,
    };

    // Sending the post details to the background script for storing in a database
    chrome.runtime.sendMessage(post, (response) => {
        console.log(response);
    });
}

let idList = [];

// ADDS EVENT HANDLERS TO THE FLAG POST BUTTONS
function addClickEvent() {
    let btns = document.getElementsByClassName("flag");

    for (let i = 0; i < btns.length; i++) {
        if (btns[i].id == "") {
            btns[i].id = "" + i;
            btns[i].addEventListener("click", (event) => getData(event));
        }
    }
}

// ADDING FLAG POST BUTTON TO INDIVIDUAL POSTS WHEN CLICKED

// to make sure only one button is added to the page
let executed = false;

function flagIndividualPosts() {
    // Getting the post using the span tag
    let post = document.getElementsByTagName("span");

    // looping through the post and
    for (let i = 0; i < post.length; i++) {
        if (post[i].innerText.includes("Sort")) {
            post[i].innerText = "sort by: ";
            executed = true;
            console.log("Added a button");
            post[i].insertAdjacentHTML(
                "afterend",
                "<button class='flag' style='transform: translate(290px, -61px)'>Flag Post<button/>"
            );
        }
    }
}

// REMOVES THE EMPTY BUTTON ON TOP OF THE FLAG POST BUTTON
function removeEmptyButton() {
    let button4 = document.getElementsByTagName("button");

    for (let y = 0; y < button4.length; y++) {
        if (button4[y].innerText === "") {
            button4[y].remove();
        }
    }
}

// dynamically adds Flag Post button
setInterval(flagHomePosts, 2000);

// adds click events to the flag post buttons
setInterval(addClickEvent, 20);

// adds flag post button to individual posts
setInterval(flagIndividualPosts, 20);

// Removes unwanted extra buttons that were added during the insertion  of the flag post button
setInterval(removeEmptyButton, 20);

function addLoadingScreen() {
    const loadingScreen = document.createElement("div");
    loadingScreen.id = "loading-screen";
    loadingScreen.style.position = "fixed";
    loadingScreen.style.top = "0";
    loadingScreen.style.left = "0";
    loadingScreen.style.width = "100%";
    loadingScreen.style.height = "100%";
    loadingScreen.style.backgroundColor = "rgba(0, 0, 0)";
    loadingScreen.style.justifyContent = "center";
    loadingScreen.style.alignItems = "center";
    loadingScreen.style.display = "flex";
    loadingScreen.style.zIndex =
        "1000000000000000000000000000000000000000000000000000000000";
    loadingScreen.innerHTML =
        "<h1 style='font-size: 3rem; color: white; text-align: center;'>Your Spoiler are being detected</h1>";
    document.body.appendChild(loadingScreen);
}

function removeLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
        loadingScreen.remove();
    }
}

// addLoadingScreen();

// setTimeout(removeLoadingScreen, 120000);
