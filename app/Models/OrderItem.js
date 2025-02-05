'use strict'

const { first } = require("@adonisjs/lucid/src/Lucid/Model");
const { isEmpty } = require("lodash");
const RestModel  = use('./RestModel');
const moment     = use('moment');
const Hash       = use('Hash');
const Encryption = use('Encryption');
const _          = use('lodash');
const Env        = use('Env');
const Database   = use('Database')
const Request    = use('Adonis/Src/Request')
const Config     = use('Config')
const {strSlug, rand, sendMail, baseUrl, momentNow, randomString, getBlurHash} = use("App/Helpers/Index.js");
const jwt     = use('jsonwebtoken');

class OrderItem extends RestModel
{
    static get table()
    {
      return "order_items";
    }

    static get createdAtColumn () {
      return 'created_at';
    }

    static get updatedAtColumn () {
      return 'updated_at';
    }

    static softdelete()
    {
        return true;
    }

    static getFields()
    {
        return [];
    }

    static get hidden ()
    {
      return []
    }

    static showColumns()
    {
        return ['*'];
    }

    product() {
        return this.belongsTo('App/Models/Product', 'product_id', 'id');
    }
}
module.exports = OrderItem
