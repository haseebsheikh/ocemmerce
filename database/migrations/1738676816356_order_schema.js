'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrderSchema extends Schema {
  up () {
    this.create('orders', (table) => {
      table.increments()
      table.string('slug', 100).notNullable().unique()
      table.string('email', 100).nullable()
      table.string('contact_no', 20).nullable()
      table.string('address', 255).nullable()
      table.integer('user_id').unsigned().references('id').inTable('users').nullable()
      table.enum('payment_method', ['cash', 'card', 'paypal']).defaultTo('cash')
      table.enu('status',['1','0']).notNullable().defaultTo('1')
      table.enum('order_status', ['pending', 'processing', 'completed', 'cancelled']).defaultTo('pending')
      table.timestamps()
      table.timestamp('deleted_at').nullable()
    })
  }

  down () {
    this.drop('orders')
  }
}

module.exports = OrderSchema
