import Search from './models/Search';
import Recipe from './models/recipe';
import List from './models/list';
import Likes from './models/likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id) 
                );
        } catch(error){
            alert('Error processing recipe');
        }
     }
 }

 ['hashchange', 'load'].forEach(event =>window.addEventListener(event, controlRecipe));


 //Handling recipe button clicks
 /**
 * Recipe Controller
 */
 const controlList = () => {
     //create a new list if there is none yet
     if(!state.list) state.list = new List();

     //Add each ingredient to the list and IU
     state.recipe.ingredients.forEach(el => {
         const item = state.list.addItem(el.count, el.unit, el.ingredient);
         listView.renderItem(item);
     })
 }
 //Handle delete and update list item events.
    elements.shopping.addEventListener('click', e => {
        const id = e.target.closest('.shopping__item').dataset.itemid;

        //handle delete button event
        if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete from state
        state.list.deleteItem(id);
        //Delete from UI
        listView.deleteItem(id);
        } else if (e.target.matches('.shopping__count-value')){
            const val = parseFloat(e.target.value, 10);
            state.list.updateCount(id, val);

        }
    });


/**
 * Like Controller
 */
    //Testing

    const controlLike = () => {
        if (!state.likes) state.likes = new Likes();
        const currentID = state.recipe.id;

        //user has not yet liked current recipe
        if(!state.likes.isLiked(currentID)){
            // Add like to the state
            const newLike = state.likes.addLike(
                currentID,
                state.recipe.title,
                state.recipe.author,
                state.recipe.img
            );
            //Toggle the like button
            likesView.toggleLikeBtn(true);

            //Add like to the UI list
            likesView.renderLike(newLike);
           
        // user has like current recipe    
        }else {
            // Remove like from the state
            state.likes.deleteLike(currentID)
            // toggle the like button
            likesView.toggleLikeBtn(false);

            // remove like from the UI list
            likesView.deleteLike(currentID);
        }
        likesView.toggleLikeMenu(state.likes.getNumLikes())
    };

 // Restore likes recipes when the page loads;
     window.addEventListener('load', ()=>{
         state.likes = new Likes();
         
         //Restore likes
         state.likes.readStorage();

         //Toggle likemenu button
        likesView.toggleLikeMenu(state.likes.getNumLikes());

        // render existing likes
        state.likes.likes.forEach(like => likesView.renderLike(like));
     })  

 // Handling recipe button clicks
    elements.recipe.addEventListener('click', e => {
     if(e.target.matches('.btn-decrease, .btn-decrease *')){
         //Decrease button is clicked
         if(state.recipe.servings > 1){
             state.recipe.updateServings('dec');
             recipeView.updateServingsIngredients(state.recipe)
         }
     } else if (e.target.matches('.btn-increase, .btn-increase *')){
         //Increase button is clicked
         state.recipe.updateServings('inc');
         recipeView.updateServingsIngredients(state.recipe)
     } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
         controlList()
     }  else if (e.target.matches('.recipe__love, .recipe__love *')){
         //Like controller
         controlLike();
     }
 });