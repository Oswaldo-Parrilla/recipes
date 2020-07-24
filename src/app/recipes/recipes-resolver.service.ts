import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Recipe} from './recipe.model';
import {DataStorageService} from '../shared/data-storage.serivce';
import {RecipeService} from './recipe.service';


@Injectable({providedIn: 'root'})
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(private dataStorageService: DataStorageService, private recipeService: RecipeService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const  recipe = this.recipeService.getRecipes();
    if (recipe.length === 0 ) {
      return this.dataStorageService.fetchRecipes();
    } else {
      return  recipe;
    }
  }
}
