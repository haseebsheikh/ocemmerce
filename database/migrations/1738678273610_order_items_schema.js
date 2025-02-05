'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderItemsSchema extends Schema {
  up () {
    this.create('order_items', (table) => {
      table.increments()
      table.string('slug', 100).notNullable().unique()
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE').onUpdate('NO ACTION');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('CASCADE').onUpdate('NO ACTION');
      table.integer('quantity').notNullable().defaultTo(1)
      table.decimal('price', 10, 2).defaultTo(0)
      table.enu('status', ['1', '0']).notNullable().defaultTo('1')
      table.timestamps()
      table.timestamp('deleted_at').nullable()
    })
  }

  down () {
    this.drop('order_items')
  }
}

module.exports = OrderItemsSchema
