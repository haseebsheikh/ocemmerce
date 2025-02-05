'use strict'
const { validateAll, rule } = use("Validator");
const Controller = require("../Controller");
const _ = use('lodash');
const Antl = use('Antl');
const Config = use('Config');
const Order = use('App/Models/Order');
const moment = use('moment');
const { baseUrl } = use('App/Helpers/Index.js');

class OrderController extends Controller
{
    async index({view})
    {
        return view.render('admin.order.index')
    }

    async ajaxListing({request, response})
    {
        let params = request.all();
        let records  = {};
        let record_data = [];
        records.data = [];
        //get records for datatable
        let dataTableRecord = await Order.dataTableRecords(request);
        records.draw = parseInt(params['draw']);
        records.recordsTotal = dataTableRecord['total_record']== null ? 0 : dataTableRecord['total_record'];
        records.recordsFiltered = dataTableRecord['total_record']== null ? 0 : dataTableRecord['total_record'];
        // set data grid output
        if( dataTableRecord['records'].length > 0 ) {
            for( var i=0; i < dataTableRecord['records'].length; i++ ){
              record_data.push([
                  dataTableRecord['records'][i].id,
                //   moment(dataTableRecord['records'][i].created_at).format('MM-DD-YYYY hh:mm A'),
                  `<a href="${ baseUrl('admin/order/edit/'+dataTableRecord['records'][i].slug) }" class="btn btn-sm btn-info"><i class="fa fa-edit"></i></a>`
              ])
            }
            records.data = record_data
        }
        return response.json(records);
    }

    async create({request,response,session,view})
    {
        if( request.method() == 'POST' ){
            return this._store(request,response,session);
        }
        return view.render('admin.order.add');
    }

    async _store(request,response,session) {
        let body_params = request.all();
        let rules = {
        }
        let validator = await validateAll(request.all(), rules);
        if (validator.fails()) {
            let errorMessages = await this.webValidateRequestParams(validator)
            session.withErrors({errors: errorMessages }).flashAll()
            return response.redirect('back')
        }
        delete body_params._csrf;
        if (!_.isEmpty(request.file('image_url'))) {
            body_params.image_url = await FileUpload.doUpload(request.file('image_url'), 'event/')
        }


        let data = {
            status: '1',
            slug: `${Math.floor((Math.random() * 100) + 1) + new Date().getTime()}`,
            ...body_params
        }
        await Category.create(data);
        session.flash({success: Antl.formatMessage('messages.success_store_message') });
        response.route('admin.category');
        return;
    }

    async edit({request,response,session,view, params})
    {

        if( request.method() == 'POST' ){
            return this._update(request,response,params,session);
        }
        let record = await Order.getRecordBySlug(request,params.slug);
        if( _.isEmpty(record) ){
            session.withErrors({error: Antl.formatMessage('messages.invalid_request') }).flashAll()
            response.route('admin.order');
            return;
        }
        return view.render('admin.order.edit',{ record:record });
    }

    async _update(request,response,params,session)
    {
        let body_params = request.all();
        let rules = {
            status: 'required|in:1,0',
        }
        let validator = await validateAll(request.all(), rules);
        if (validator.fails()) {
            let errorMessages = await this.webValidateRequestParams(validator)
            session.withErrors({errors: errorMessages }).flashAll()
            return response.redirect('back')
        }
        // body_params.status = body_params.status == 1 ? '1' : '0';

        delete body_params._csrf;
        await Category.updateCategory({slug:params.slug},body_params);

        session.flash({success: Antl.formatMessage('messages.success_update_message') });
        response.route('admin.user');
        return;
    }
}
module.exports = OrderController
