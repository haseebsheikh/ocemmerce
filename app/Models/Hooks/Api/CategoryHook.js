'use strict'

class CategoryHook
{
    /**
     * omit fields from update request
     */
    static exceptUpdateField()
    {
        return [];
    }

    static async indexQueryHook(query, request, slug = {})
    {

    }

    static async beforeCreateHook(request, params)
    {

    }

    static async afterCreateHook(record, request, params)
    {

    }

    static async beforeEditHook(request, params, slug)
    {

    }

    static async afterEditHook(record, request, params)
    {

    }

    static async beforeDeleteHook(request, params, slug)
    {

    }

    static async afterDeleteHook(request, params, slug)
    {

    }
}
module.exports = CategoryHook;
