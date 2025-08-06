
let BASE_URL = 'https://www.omdbapi.com';

document.addEventListener('DOMContentLoaded', addEventHandlers);

function searchHandler() {
    const inputTxt = document.getElementById("searchBar").value.trim();
    console.log(`Text Entered: ${inputTxt}`);
    if (inputTxt !== "") {
        clearPreviousResult();
        getMovies(inputTxt);
    }
}

function addEventHandlers() {
    document.getElementById("searchIconDiv").addEventListener("click", searchHandler);
    document.getElementById("searchBar").addEventListener("keydown", (event) => {
        if (event.key === 'Enter') {
            searchHandler();
        }
    });
}

function clearPreviousResult() {
    const parent = document.getElementById("movieCards");
    console.log(`Clearing previous results...`);
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function createHtmlElement(elementName, classNames = [], contentText = '') {
    const htmlElement = document.createElement(elementName);
    classNames.forEach(className => htmlElement.classList.add(className));
    htmlElement.innerHTML = contentText;
    return htmlElement;
}

async function getMovies(movieTitle) {
    const API_URL = `${BASE_URL}/?apikey=${myApiKey}&s=${movieTitle}`;

    try {
        const response = await fetch(API_URL);

        if (response.ok) {
            const data = await response.json();
            const movieList = data.Search;

            if (!movieList || movieList.length === 0) {
                createEmptyView();
                return;
            }

            const moviePromises = movieList.map(movie => checkPosterURL(movie));
            const results = await Promise.allSettled(moviePromises);

            const filteredMovies = [];
            results.forEach(result => {
                if (result.status === "fulfilled" && result.value != null) {
                    const movieObj = result.value;
                    movieObj.Title = movieObj.Title.length > 40
                        ? `${movieObj.Title.substring(0, 40)}...`
                        : movieObj.Title;
                    filteredMovies.push(movieObj);
                }
            });

            console.log("Final movie list:", filteredMovies);

            if (filteredMovies.length === 0) {
                createEmptyView();
            } else {
                for (let movie of filteredMovies) {
                    createMovieCard(movie);
                }
            }

        } else {
            console.error("OMDB API response error");
            createEmptyView();
        }

    } catch (exception) {
        console.error("Exception in getMovies:", exception);
        createEmptyView();
    }
}

async function checkPosterURL(movie) {
    try {
        const response = await fetch(movie.Poster);
        if (response.ok) {
            return movie;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error checking poster URL:", error);
        return null;
    }
}

function createEmptyView() {
    console.log("createEmptyView");
    const movieCards = document.getElementById("movieCards");
    const p = document.createElement("p");
    p.classList.add("noresult");
    p.textContent = "No movie found!!! Please search for another title.";
    movieCards.appendChild(p);
}

function createMovieCard(movie) {
    console.log("createMovieCard", movie);

    const movieCards = document.getElementById("movieCards");

    const article = document.createElement("article");
    article.classList.add("card");

    const title = document.createElement("p");
    title.classList.add("cardTitle");
    title.textContent = movie.Title;

    const posterDiv = document.createElement("div");
    posterDiv.classList.add("cardPosterDiv");

    const img = document.createElement("img");
    img.classList.add("moviePoster");
    img.src = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/150";
    img.alt = "Movie poster";

    posterDiv.appendChild(img);
    article.appendChild(title);
    article.appendChild(posterDiv);
    movieCards.appendChild(article);
}
