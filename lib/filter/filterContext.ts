import type { FileContext } from '~/lib/assemble/rawResourceCollection/context';
import { ResContext } from './context/context';
import filterItem from './filterItem';
import filterObject from './filterObject';
import { Recipe } from './filterRecipe';

function filterContext(ctx: FileContext): ResContext {
    const resCtx = new ResContext();
    resCtx.starboundVersion = ctx.starboundVersion;
    resCtx.centrifugeRecipes = ctx.centrifugeRecipes;
    resCtx.extractionRecipes = ctx.extractionRecipes;
    resCtx.recipes = Object.values(ctx.recipes).map((recipeFile) =>
        Recipe.fromFile(recipeFile),
    );
    Object.values(ctx.items).forEach((item) => filterItem(resCtx, item));
    Object.values(ctx.objects).forEach((object) =>
        filterObject(resCtx, object),
    );
    return resCtx;
}

export default filterContext;
