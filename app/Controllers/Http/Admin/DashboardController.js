'use strict'

const Controller = require("../Controller");
const _          = use('lodash');
const Widget = use('App/Models/Widget');
const Database   = use('Database');

class DashboardController extends Controller
{

    async index({view, auth})
    {
        return view.render('admin.dashboard.index')
    }

    async getSmallWidget({ response })
    {
       
        let data = [];
        let widgets = await Widget.getWidgetByType('small_box');

        for (const widget of widgets) {
            const records = await Database.raw(widget.sql);
            let value = 0;
          
            if (records.length) {
              for (const record of records[0]) {
                value = record.count;
              }
            }
            
            data.push({
                title: widget.title,
                icon: widget.icon,
                color: widget.color,
                div_column_class: widget.div_column_class,
                link: widget.link,
                config: widget.config,
                value: value,
            });

        }
        return response.json(data);

    }

    async getLineChart({ response })
    {
        let data = [];
        let finalData = [];
        let widgets = await Widget.getWidgetByType('line_chart');

        for (const widget of widgets) {
            const records = await Database.raw(widget.sql);
            let data = {};
          
            if (records.length) {
              data = {
                label: [],
                value: []
              };
          
              for (const record of records[0]) {
                data.label.push(record.label);
                data.value.push(record.value);
              }
              
              finalData.push({
                title: widget.title,
                description: widget.description,
                icon: widget.icon,
                color: widget.color,
                div_column_class: widget.div_column_class,
                link: widget.link,
                config: widget.config,
                data: data
              });
            } else {
              data = {};
            }
          }
        return response.json(finalData);
    }

}
module.exports = DashboardController
