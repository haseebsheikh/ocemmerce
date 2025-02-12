'use strict'
const Env = use('Env');
const stripe = use('stripe')(Env.get('STRIPE_SECRET_KEY'));

class Stripe
{
    async createCustomer(data)
    {
        let customer;
        try{
          customer = await stripe.customers.create(data);
        } catch( error ){
            return {
              code: 400,
              message: error.message
            }
        }
        return {
          code: 200,
          message: 'Customer has been created successfully',
          data: customer
        }
    }

    async createCustomerCard(customer_id,card_token)
    {
        let card;
        try{
          card = await stripe.customers.createSource(
            customer_id,
            {source: card_token}
          );
        } catch ( error ){
          return {
              code: 400,
              message: error.message
          }
        }
        return {
          code: 200,
          message: 'Card has been created successfully',
          data: card
        }
    }

    async makeDefaultCard(customer_id,card_id)
    {
        let card;
        try{
          card = await stripe.customers.update(
              customer_id,
              { default_source:card_id }
            );
        } catch ( error ){
          return {
              code: 400,
              message: error.message
          }
        }
        return {
          code: 200,
          message: 'Card has been updated successfully',
          data: card
        }
    }

    async deleteCustomerCard(customer_id, card_id)
    {
        let card;
        try{
          card = await stripe.customers.deleteSource(
              customer_id,
              card_id
            );
        } catch ( error ){
          return {
              code: 400,
              message: error.message
          }
        }
        return {
          code: 200,
          message: 'Card has been deleted successfully',
          data: card
        }
    }

    async customerCharge(customer_id, amount, capture=true, currency='usd', description='')
    {
        let charge;
        try{
          charge = await stripe.charges.create({
                      amount: (amount * 100),
                      currency: currency,
                      customer: customer_id,
                      description: description,
                      capture: capture
                    });
        } catch ( error ){
          return {
              code: 400,
              message: error.message
          }
        }
        return {
          code: 200,
          message: 'payment has been charged successfully',
          data: charge
        }
    }

    static async createCheckoutSession(data, success_url = `${Env.get('APP_URL')}/payment/success`, cancel_url= `${Env.get('APP_URL')}/payment/cancel`) {
        let session;
        try{
          session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: data.items.map(item => {
              return {
                price_data: {
                  currency: 'pkr',
                  product_data: {
                    name: item.title,
                  },
                  unit_amount: item.price * 100,
                },
                quantity: item.quantity,
              };
            }),
            mode: 'payment',
            success_url: success_url,
            cancel_url: cancel_url,
          });
        } catch ( error ){
          return {
              code: 400,
              message: error.message
          }
        }
        return {
          code: 200,
          message: 'Checkout session has been created successfully',
          data: session
        }
    }
}
module.exports = Stripe
