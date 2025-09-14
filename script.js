// ====== Select DOM Elements ======
const searchInp = document.getElementById('search-input');          // Input field for typing search term
const searchBtn = document.getElementById('search-btn');            // Button to trigger the search
const errorContainer = document.getElementById('error-container');  // Container to show error messages
const searchResult = document.getElementById('search-result');      // Element to display the search result heading
const mealsWrapper = document.getElementById('meals-wrapper');      // Container to hold meal cards
const mealDetails = document.getElementById('meal-details');        // Section to show full meal details
const mealContent = document.getElementById('meal-content');        // Inner content for selected meal details
const backBtn = document.getElementById('back-btn');                // Button to go back from meal details to list


// ====== API Endpoints ======
const BASIC_URL = 'https://www.themealdb.com/api/json/v1/1/';
const NAME_URL = `${BASIC_URL}search.php?s=`;
const ID_URL = `${BASIC_URL}lookup.php?i=`;

// ====== Event Listeners ======
searchBtn.addEventListener('click', searchMeal);

searchInp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchMeal();
});

mealsWrapper.addEventListener('click', showMealDetails);

backBtn.addEventListener('click', backToRecipes);

// ====== Fetch and Display Meals ======
async function searchMeal() {
    // Hide previous error
    errorContainer.textContent = '';
    errorContainer.classList.add('hidden');
    mealDetails.classList.add('hidden')

    // Validate input
    if (searchInp.value.trim() === '') {
        errorContainer.textContent = 'Please enter a search term';
        errorContainer.classList.remove('hidden');
        return;
    }

    // Show loading state
    searchResult.textContent = `Searching for '${searchInp.value}'...`;
    mealsWrapper.innerHTML = '';

    try {
        // Request meals from API
        const response = await fetch(`${NAME_URL}${searchInp.value}`);
        const data = await response.json();

        if (data.meals === null) {
            // No results found
            errorContainer.textContent = `No recipes found for "${searchInp.value}". Try another search term!`;
            errorContainer.classList.remove('hidden');
            searchResult.textContent = '';
        } else {
            // Show meals
            searchResult.textContent = `Search results for "${searchInp.value}":`;
            showMeals(data.meals);
        }
    } catch (error) {
        // API request failed
        errorContainer.textContent = 'Fail Connection with API URL';
        errorContainer.classList.remove('hidden');
    }

    // Reset input
    searchInp.value = '';
}

// ====== Render Meals List ======
function showMeals(meals) {
    mealsWrapper.innerHTML = '';
    meals.forEach(meal => {
        mealsWrapper.innerHTML += `
            <div class="meal" data-meal-id=${meal['idMeal']}>
                <img src=${meal['strMealThumb']} alt="${meal['strMeal']}">
                <div class="info">
                    <h3 class="meal-title">${meal['strMeal']}</h3>
                    <span class="meal-category">${meal['strCategory'] || 'UnCategorized'}</span>
                </div>
            </div>
        `;
    });
}

// ====== Show Meal Details View ======
async function showMealDetails(e) {
    const mealEl = e.target.closest('.meal');
    if (!mealEl) return;

    const mealId = mealEl.dataset.mealId;

    try {
        // Fetch details by ID
        const res = await fetch(`${ID_URL}${mealId}`);
        const data = await res.json();

        if (data.meals === null) {
            errorContainer.textContent = 'Error fetching meal details';
            errorContainer.classList.remove('hidden');
        } else {
            const meal = data.meals[0];

            // Show details section
            mealDetails.classList.remove('hidden');
            mealDetails.scrollIntoView({ behavior: "smooth" });

            // Render meal details
            mealContent.innerHTML = `
                <img src=${meal.strMealThumb} alt="${meal.strMeal}">
                <h3 id="meal-title">${meal.strMeal}</h3>
                <span id="meal-category">${meal.strCategory}</span>

                <div class="instructions">
                    <h3>Instructions</h3>
                    <p id="instructions-details">${meal.strInstructions}</p>
                </div>

                <div class="ingredients">
                    <h3>Ingredients</h3>
                    <ul id="ingredients-list"></ul>
                </div>

                <a id="youtube-meal" href=${meal.strYoutube} target="_blank">
                    <i class="fa-brands fa-youtube"></i>Watch Video
                </a>
            `;

            // Render ingredients list
            const ingredientList = document.getElementById('ingredients-list');
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== '') {
                    ingredientList.innerHTML += `
                        <li><i class="fas fa-check-circle"></i> ${measure} ${ingredient}</li>
                    `;
                }
            }
        }
    } catch (error) {
        errorContainer.textContent = error.message;
        errorContainer.classList.remove('hidden');
    }
}

// ====== Back Button Function ======
function backToRecipes() {
    mealContent.innerHTML = '';
    mealDetails.classList.add('hidden');
    mealsWrapper.scrollIntoView({ behavior: "smooth" });
}
