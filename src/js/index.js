import Search from './models/Search';
import Recipe from './models/recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import{elements, renderLoader, clearLoader } from './views/base'
/**
*- Search Global Object
*- Current Recipe object
*- Shopping list object#
*- Liked Recipes
*/

const state = {}

/**
 * Search Controller
 */
const controlSearch = async () => {
    // 1. Get query from view;
    const query = searchView.getInput();
    if(query){
        // 2. create new search object and add it to state;
        state.search = new Search(query)
        // 3. prepare UI for results;
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        // 4. search for recipes
       await state.search.getResults();

       // 5. Render Results to the UI
       clearLoader();
       searchView.renderResults(state.search.result);
    }
}

elements.searchForm.addEventListener('click', e => { 
    e.preventDefault();
    controlSearch();
})

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
       searchView.renderResults(state.search.result, goToPage);
        
    }   
})



/**
 * Recipe Controller
 */

 const controlRecipe = async () => {
    //Get Id for URL 
    const id = window.location.hash.replace('#', '');

     if(id){
         // Prepare UI for changes
         recipeView.clearRecipe();
         renderLoader(elements.recipe);
         
         //HIghlight selected search item
         if(state.search)searchView.highlightSelected(id)

         // Create New recipe object
            state.recipe = new Recipe(id);
        try{
            // Get recipe data and parse ingredients
               await state.recipe.getRecipe();
               state.recipe.parseIngredients();
   
            // Calculate servings and time
               state.recipe.calcTime();
               state.recipe.calServings();
            // Render Recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch(error){
            alert('Error processing recipe');
        }
     }
 }

 ['hashchange', 'load'].forEach(event =>window.addEventListener(event, controlRecipe));