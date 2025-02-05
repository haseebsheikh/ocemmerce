"use strict";

const { forEach } = require("lodash");

const OrderItem = use("App/Models/OrderItem");

class OrderHook {
  /**
   * omit fields from update request
   */
  static exceptUpdateField() {
    return [];
  }

  static async indexQueryHook(query, request, slug = {}) {}

  static async beforeCreateHook(request, params) {
    params.slug = `${
      Math.floor(Math.random() * 100 + 1) + new Date().getTime()
    }`;
  }

  static async afterCreateHook(record, request, params) {
    let req_params = request.all();
    // toJson
    // req_params.items = JSON.parse(req_params.items);
    forEach(req_params.items, (item) => {
      item.order_id = record.id;
      item.product_id = item.product_id;
      item.slug = `${item.product_id}_${
        Math.floor(Math.random() * 100 + 1) + new Date().getTime()
      }`;
      item.created_at = new Date();
      item.updated_at = new Date();
    });

    // create order_items
    await OrderItem.createMany(req_params.items);
  }

  static async beforeEditHook(request, params, slug) {}

  static async afterEditHook(record, request, params) {}

  static async beforeDeleteHook(request, params, slug) {}

  static async afterDeleteHook(request, params, slug) {}
}
module.exports = OrderHook;
