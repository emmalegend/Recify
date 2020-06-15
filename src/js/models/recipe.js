import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe () {
        try{
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            
        } catch (error){
            console.log(error)
        }
    }

    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng/3);
        this.time = periods * 15;
    }

    calServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups','pounds'];
        const unitShort = ['tbsp', 'tbsp', 'oz', 'tsp', 'tsp', 'cup', 'pound']; 

        const newIngredients = this.ingredients.map(el =>{
            //1. Uniform Units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i)=> {
                ingredient = ingredient.replace(unit, unitShort[i]);
            });

            //2. Remove Parenthesis
            ingredient =  ingredient.replace(/ *\([^)]*\) */g, ' ');
            //3. parse ingredients into counts
            const arrrIng = ingredient.split(' ');
            const unitIndex = arrrIng.findIndex(el2 => unitShort.includes(el2));

            let objIng;
            if(unitIndex > -1) {
                //There is a unit
                const arrCount = arrrIng.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrrIng[unitIndex],
                    ingredient: arrrIng.slice(unitIndex + 1).join(' ')
                }

            }else if (parseInt(arrrIng[0], 10)){
                //There is no unit but first element is a number
                objIng = {
                    count: parseInt(arrrIng[0], 10),
                    unit: '',
                    ingredient: arrrIng.slice(1).join(' ')
                }

            }else if(unitIndex === -1){
                // There is no Unit and no Number in the 1st position.
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        })
        this.ingredients = newIngredients;
    }
    updateServings(type){
        //servings
        const newServings = type === 'dec' ? this.servings-1 : this.servings+1;

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings/this.servings)
        })
        this.servings = newServings; 
    }
}

