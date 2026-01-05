import type { FileContext } from '~/lib/assemble/rawResourceCollection/context';
import { ResContext } from './context/context';
import filterItem from './filterItem';
import { Recipe } from './filterRecipe';

function filterContext(ctx: FileContext): ResContext {
    const resCtx = new ResContext();
    Object.values(ctx.items).forEach((item) => filterItem(resCtx, item));
    resCtx.recipes = Object.values(ctx.recipes).map((recipeFile) =>
        Recipe.fromFile(recipeFile),
    );
    return resCtx;
}

export default filterContext;
