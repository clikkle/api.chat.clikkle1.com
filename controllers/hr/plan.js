import express from 'express';
import stripe from 'stripe';
import PaymentSchema from '../../schema/Payment.js';
import SubscriptionSchema from '../../schema/Subscription.js';
import planSchema from '../../schema/Plan.js';

const stripeGateway = stripe(process.env.HR_STRIPE_SECRET_KEY);

const planRouter = express.Router();

const convertStripeDate  = ( date)=>{
    return new Date(date * 1000);
}
/// not is use  latter  remove code 
// planRouter.post('/subscribe', async (req, res) => {
//   try {
//     // create a stripe customer
//     let userId =  req.user.id;
//     let createSubscriptionRequest = req.body;
//     const customer = await stripeGateway.customers.create({
//       name: createSubscriptionRequest.name,
//       email: createSubscriptionRequest.email,
//       payment_method: createSubscriptionRequest.paymentMethod,
//       invoice_settings: {
//         default_payment_method: createSubscriptionRequest.paymentMethod,
//       },
//     });

//     if (!customer.id) {
//       res.status(400).json({
//         success: false,
//         error: "",
//         clientSecret: "",
//         subscriptionId: "",
//       });
//     }
//     // create a stripe subscription
//     const subscription = await stripeGateway.subscriptions.create({
//       customer: customer.id,
//       items: [{ price: 'price_1PNgx6F45yCfzDJKwauxEjRH' }]
//     });

//     if (!subscription.id) {
//       res.status(400).json({
//         success: false,
//         error: "",
//         clientSecret: "",
//         subscriptionId: "",
//       });
//     }


//     let payment = new PaymentSchema({
//       userId: userId,
//       amount: subscription.plan.amount,
//       currency: subscription.currency,
//       customerId: customer.id,
//       planId: subscription.plan.id,
//       card: createSubscriptionRequest.card,
//       cardToken: createSubscriptionRequest.tokenId,
//     });
//     await payment.save();

//     let startDate = convertStripeDate(subscription.start_date) 
//     let periods = [{ start:  convertStripeDate(subscription.current_period_start) , end:  convertStripeDate(subscription.current_period_end)  }]
//     const subscriptionSchema = new SubscriptionSchema(
//       {
//         userId: userId,
//         plan: "private",
//         startDate: startDate,
//         interval: subscription.plan.interval,
//         isActive: true,
//         periods: periods,
//         paymentId: payment._id,
//         subscription: subscription,
//         maxEmployee: 5,
//         maxOrganizations: 2
//       }
//     );

//     await subscriptionSchema.save();
//     // return the client secret and subscription id
//     res.status(200).json({
//       success: true,
//       clientSecret: subscription,
//       subscriptionId: subscriptionSchema._id,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: "Internal  Server Error",
//       clientSecret: "",
//       subscriptionId: "",
//     });
//   }
// });

planRouter.get('/create/:name', async (req, res) => {
  try {

    let name =  req.params.name
    // create a stripe customer
     let allPlan  =  await planSchema.find({ name :name});
    // return the client secret and subscription id
      let product =  await createProduct(allPlan[0].name ,allPlan[0].description);

      for(let i = 0;i< allPlan.length ;i++){

        const plan = await createPlan(product.id, allPlan[i].amount, allPlan[i].interval);

        const status = await planSchema.findByIdAndUpdate(allPlan[i]._id  , {
          $set: { product ,  plan  },
      });

      }

    res.status(200).json({
      success: true, product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal  Server Error",
      clientSecret: "",
      subscriptionId: "",
    });
  }
});

async function createProduct(name, description ="product description") {
  try {
    const product = await stripeGateway.products.create({
      name: name,
      description: description,
    });
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

async function createPlan(productId, amount, interval, currency = 'usd') {
  try {
    console.log(productId,'productId')
    let unit_amount =  Number(amount)*100
    const plan = await stripeGateway.prices.create({
      unit_amount:unit_amount,
      currency: currency,
      recurring: {
        interval: interval,
      },
      product: productId.id,
    });

    new planSchema({
      name:interval,
      description:interval,
      interval,
      amount,
      maxUser : 5,
      maxOrg : 5,
      product: productId, // optional: retrieve it from Stripe if needed
      plan: plan, // storing Stripe plan details
      trial:7,
    }).save();

    return plan;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

export async function setupProductsAndPlans() {
  try {
    
    console.log("CALLLL")
    // Create products
    const product1Id = await createProduct('Product 1 Private', 'Description for Product 1');
    const product2Id = await createProduct('Product 2 Business', 'Description for Product 2');
    const product3Id = await createProduct('Product 3 Enterprise', 'Description for Product 3');
    // const product4Id = await createProduct('Product 4', 'Description for Product 2');

    // Create plans for each product
    const plan1Id = await createPlan(product1Id, 10, 'month'); // $10/month
    const plan2Id = await createPlan(product2Id, 14, 'month'); // $14/year
    const plan3Id = await createPlan(product3Id, 20, 'month'); // $20/month
    
    console.log("ENDDD")
    // const plan4Id = await createPlan(product4Id, 20000, 'month'); // $200/year

  } catch (error) {
    console.error('Error setting up products and plans:', error);
  }
}



export default planRouter;