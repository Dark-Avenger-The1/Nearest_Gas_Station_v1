const LOADING_SCREEN_ID = "loading-screen";

function createLoadingScreen() {
    const existingScreen = document.getElementById(LOADING_SCREEN_ID);
    if(existingScreen) return existingScreen;

    const screen = document.createElement("div");
    screen.id = LOADING_SCREEN_ID;
    screen.className = "loading-screen";
    screen.setAttribute("role", "status");
    screen.setAttribute("aria-live", "polite");
    screen.innerHTML = `
        <div class="loading-box">
            <div class="loading-spinner" aria-hidden="true"></div>
            <h2 class="loading-title">Finding gas stations</h2>
            <p class="loading-message">Starting search...</p>
        </div>
    `;

    document.body.appendChild(screen);
    return screen;
}

export function showLoadingScreen(message = "Starting search...") {
    const screen = createLoadingScreen();
    updateLoadingScreen(message);
    screen.classList.add("active");
}

export function updateLoadingScreen(message, title = "Finding gas stations") {
    const screen = createLoadingScreen();
    const titleElement = screen.querySelector(".loading-title");
    const messageElement = screen.querySelector(".loading-message");

    titleElement.innerText = title;
    messageElement.innerText = message;
}

export function hideLoadingScreen() {
    const screen = document.getElementById(LOADING_SCREEN_ID);
    if(!screen) return;

    screen.classList.remove("active");
}

export function waitForLoadingStep(duration = 700) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}
