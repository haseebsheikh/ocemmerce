'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CategorySchema extends Schema {
  up () {
    this.create('categories', (table) => {
      table.increments()
      table.string('slug', 100).notNullable().unique()
      table.string('title', 100).notNullable().unique()
      table.decimal('price', 10, 2).notNullable().defaultTo(0)
      table.string('description', 255).notNullable()
      table.enu('status', ['1', '0']).notNullable().defaultTo('1')
      table.string('image', 255).nullable()
      table.integer('parent_id').unsigned().nullable()
      table.timestamps()
      table.timestamp('deleted_at').nullable()
    })
  }

  down () {
    this.drop('categories')
  }
}

module.exports = CategorySchema
