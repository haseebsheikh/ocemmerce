'use strict'
const { validateAll, rule } = use("Validator");
const CrudController = require("./CrudController");
const moment = use('moment');
const { baseUrl } = use('App/Helpers/Index.js');

class FaqController extends CrudController
{
    constructor(){
        super('Faq')
        this.__data['page_title'] = 'FAQ';
        this.__indexView  = 'faq.index';
        this.__createView = 'faq.add';
        this.__editView   = 'faq.edit';
        this.routeName    = 'faq';
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async validation(action, slug=null)
    {
        let rules = {};
        switch (action) {
            case "store":
              rules = {
                question: 'required|min:2|max:10000',
                answer: 'required|min:2|max:10000',
              }
              break;
            case "update":
                rules = {
                  question: 'required|min:2|max:10000',
                  answer: 'min:2|max:10000',
                }
                break;
        }
        let validator = await validateAll(this.request.all(), rules)
        return validator;
    }

    async beforeRenderIndexView()
    {

    }

    async dataTableRecords(record)
    {
        let options  = `<a href="${ baseUrl('/admin/faq/'+record.slug + '/edit') }" title="edit" class="btn btn-sm btn-info"><i class="fa fa-edit"></i></a>`;
            options += '<a title="Delete" class="btn btn-sm btn-danger _delete_record"><i class="fa fa-trash"></i></a>';
        return [
            `<input type="checkbox" name="record_id[]" class="record_id" value="${record.slug}"></input>`,
            record.question,
            moment(record.created_at).format('MM-DD-YYYY hh:mm A'),
            options
        ];
    }

    async beforeRenderCreateView()
    {

    }

    async beforeStoreLoadModel()
    {

    }

    async afterStoreLoadModel(record)
    {

    }

    async beforeRenderEditView(record)
    {

    }

    async beforeUpdateLoadModel()
    {

    }

    async afterUpdateLoadModel(record)
    {

    }

    async beforeDeleteLoadModel()
    {

    }
}
module.exports = FaqController
