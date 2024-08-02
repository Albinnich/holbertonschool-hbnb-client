document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const reviewForm = document.getElementById('review-form');
    const placeDetailsSection = document.getElementById('place-details');
    const countryFilter = document.getElementById('country-filter');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await loginUser(email, password);
        });
    }

    checkAuthentication();

    if (countryFilter) {
        countryFilter.addEventListener('change', (event) => {
            const selectedCountry = event.target.value;
            filterPlacesByCountry(selectedCountry);
        });
    }

    if (placeDetailsSection) {
        const placeId = getPlaceIdFromURL();
        checkAuthenticationAndFetchPlaceDetails(placeId);
    }

    if (reviewForm) {
        const token = checkAuthentication();
        const placeId = getPlaceIdFromURL();

        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const reviewText = document.getElementById('review-text').value;
            await submitReview(token, placeId, reviewText);
        });
    }
});

async function loginUser(email, password) {
    try {
        const response = await fetch('https://your-api-url/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            document.cookie = `token=${data.access_token}; path=/`;
            window.location.href = 'index.html';
        } else {
            const errorData = await response.json();
            alert('Login failed: ' + (errorData.message || response.statusText));
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const addReviewSection = document.getElementById('add-review');

    if (!token) {
        if (loginLink) loginLink.style.display = 'block';
        if (addReviewSection) addReviewSection.style.display = 'none';
    } else {
        if (loginLink) loginLink.style.display = 'none';
        if (addReviewSection) addReviewSection.style.display = 'block';
    }

    return token;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchPlaces(token) {
    try {
        const response = await fetch('https://your-api-url/places', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayPlaces(data);
        } else {
            alert('Failed to fetch places: ' + response.statusText);
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    if (placesList) {
        placesList.innerHTML = '';
        places.forEach(place => {
            const placeElement = document.createElement('div');
            placeElement.innerHTML = `
                <h3>${place.name}</h3>
                <p>${place.description}</p>
                <p>${place.location}</p>
            `;
            placesList.appendChild(placeElement);
        });
    }
}

function filterPlacesByCountry(country) {
    const placesList = document.getElementById('places-list');
    if (placesList) {
        const places = placesList.children;
        Array.from(places).forEach(place => {
            if (place.querySelector('p').innerText.includes(country) || country === 'all') {
                place.style.display = 'block';
            } else {
                place.style.display = 'none';
            }
        });
    }
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function checkAuthenticationAndFetchPlaceDetails(placeId) {
    const token = checkAuthentication();
    fetchPlaceDetails(token, placeId);
}

async function fetchPlaceDetails(token, placeId) {
    try {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`https://your-api-url/places/${placeId}`, { headers });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            alert('Failed to fetch place details: ' + response.statusText);
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
}

function displayPlaceDetails(place) {
    const placeDetailsSection = document.getElementById('place-details');
    if (placeDetailsSection) {
        placeDetailsSection.innerHTML = `
            <h2>${place.name}</h2>
            <p>${place.description}</p>
            <p>${place.location}</p>
            <div id="place-images">
                ${place.images.map(image => `<img src="${image}" alt="Image of ${place.name}">`).join('')}
            </div>
        `;
    }
}

async function submitReview(token, placeId, reviewText) {
    try {
        const response = await fetch('https://your-api-url/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ placeId, reviewText })
        });

        if (response.ok) {
            alert('Review submitted successfully!');
            document.getElementById('review-form').reset();
        } else {
            const errorData = await response.json();
            alert('Failed to submit review: ' + (errorData.message || response.statusText));
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
}
