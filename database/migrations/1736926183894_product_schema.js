'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProductSchema extends Schema {
  up () {
    this.create('products', (table) => {
      table.increments()
      table.string('slug', 100).notNullable().unique()
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE').onUpdate('NO ACTION');
      table.string('title', 100).notNullable().unique()
      table.string('description', 255).notNullable()
      table.enu('status', ['1', '0']).notNullable().defaultTo('1')
      table.decimal('price', 10, 2).defaultTo(0)
      table.string('image', 255).nullable()
      table.timestamp('deleted_at').nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('products')
  }
}

module.exports = ProductSchema
