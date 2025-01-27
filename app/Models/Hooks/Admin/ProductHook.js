'use strict'
const _ = use('lodash')

class ProductHook
{

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

    static async datatable_query_hook(query,request)
    {
        let urlParams = new URLSearchParams(request.input('keyword'));
        if( !_.isEmpty(urlParams.get('keyword')) ){
            let keyword = urlParams.get('keyword');
            query.where( function(){
                this.where('title','like',`%${keyword}%`)
            })
        }
    }
}
module.exports = ProductHook
