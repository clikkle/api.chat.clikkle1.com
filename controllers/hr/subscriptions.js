import express from 'express';
import Stripe from 'stripe';
import SubscriptionSchema from '../../schema/Subscription.js';
import PaymentSchema from '../../schema/Payment.js';
import planSchema from '../../schema/Plan.js';

const stripeGateway = Stripe(process.env.HR_STRIPE_SECRET_KEY);

const convertStripeDate  = ( date)=>{
      return new Date(date * 1000);
}

const subscriptionRouter = express.Router();

subscriptionRouter.post('/check', async (req, res) => {
  try {
    let userId =  req.user.id;
    const results = await SubscriptionSchema.find({ userId: userId }).sort({ updatedAt : -1})
    if (results && results.length > 0) {
      let result = results[0];
      if (result.isActive) {
        let  isSubscriptionIsActive = false ;
        const currentDate = new Date();
        let periods =  result.periods

        periods.map((period)=>{
          const startDate = new Date(period.start);
          const endDate = new Date(period.end);
          if(currentDate >= startDate && currentDate <= endDate){
            isSubscriptionIsActive = true ;
          }
        })

        if(!isSubscriptionIsActive){

          let isPaid =  await checkPaymentStatus(result.subscription.id);

          if (isPaid.result) {
         
            periods.push({ start:  convertStripeDate( isPaid.subscription.current_period_start) , end:  convertStripeDate(isPaid.subscription.current_period_end)  })

            let subscriptionInactive =  await SubscriptionSchema.findByIdAndUpdate(  result._id ,{ isActive : true , periods:periods },{ new: true, runValidators: true })
            
            if (!subscriptionInactive) {
              return res.status(404).json({
                  success: false,
                  error: 'Subscription not found',
                  subscriptionId: "",
              });
             }
            
          res.status(200).json({
            success: true,
            error: "",
            subscriptionId: result._id
          });
  
          } else {
          
            let subscriptionInactive =  await SubscriptionSchema.findByIdAndUpdate(  result._id ,{ isActive : false },{ new: true, runValidators: true })
            res.status(403).json({
              success: false,
              error: "Subscription is over , Payment has not been completed for the current month.",
              subscriptionId: result._id
            });

            if (!subscriptionInactive) {
              return res.status(404).json({
                  success: false,
                  error: 'Subscription not found',
                  subscriptionId: "",
              });
          }
          }


        }else {
          res.status(200).json({
            success: true,
            error: "",
            subscriptionId: result._id
          });
        }
      } else {
        res.status(403).json({
          success: false,
          error: "Subscription is inactive ",
          subscriptionId: result._id
        });
      }
    } else {
      res.status(401).json({
        success: false,
        error: "not Subscribed",
        subscriptionId: null
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      subscriptionId: "",
    });
  }
});

subscriptionRouter.post('/subscribe', async (req, res) => {

  try {
    // create a stripe customer
    let userId =  req.user.id;
    let createSubscriptionRequest = req.body;

    let selectedPlan  =  await planSchema.findOne({ amount : createSubscriptionRequest.amount });
    const customer = await stripeGateway.customers.create({
      name: createSubscriptionRequest.name,
      email: createSubscriptionRequest.email,
      payment_method: createSubscriptionRequest.paymentMethod,
      invoice_settings: {
        default_payment_method: createSubscriptionRequest.paymentMethod,
      },
    });

    if (!customer.id) {
      res.status(400).json({
        success: false,
        error: "",
        clientSecret: "",
        subscriptionId: "",
      });
    }
    // create a stripe subscription
    // 'price_1PNgx6F45yCfzDJKwauxEjRH'
    const subscription = await stripeGateway.subscriptions.create({
      customer: customer.id,
      items: [{ price: selectedPlan.plan.id }],
      trial_period_days: selectedPlan.trial,
      expand: ['latest_invoice.payment_intent'],
    });

    if (!subscription.id) {
      res.status(400).json({
        success: false,
        error: "",
        clientSecret: "",
        subscriptionId: "",
      });
    }


    let payment = new PaymentSchema({
      userId: userId,
      amount: subscription.plan.amount,
      currency: subscription.currency,
      customerId: customer.id,
      planId: subscription.plan.id,
      card: createSubscriptionRequest.card,
      cardToken: createSubscriptionRequest.tokenId,
    });
    await payment.save();

    let startDate = convertStripeDate(subscription.start_date) 
    let periods = [{ start:  convertStripeDate(subscription.current_period_start) , end:  convertStripeDate(subscription.current_period_end)  }]
    const subscriptionSchema = new SubscriptionSchema(
      {
        userId: userId,
        plan : selectedPlan._id,
        planName: selectedPlan.name,
        startDate: startDate,
        interval: subscription.plan.interval,
        isActive: true,
        periods: periods,
        paymentId: payment._id,
        subscription: subscription,
        maxEmployee: selectedPlan.maxUser,
        maxOrganizations: selectedPlan.maxOrg,
        orgId:createSubscriptionRequest?.orgId
      }
    );

    await subscriptionSchema.save();
    // return the client secret and subscription id


    sendEmail( selectedPlan.name, createSubscriptionRequest.email ,createSubscriptionRequest.name);


    res.status(200).json({
      success: true,
      clientSecret: subscription,
      subscriptionId: subscriptionSchema._id,
    });
  } catch (error) {
    console.log(error,"errorerrorerror")
    res.status(500).json({
      success: false,
      error: "Internal  Server Error",
      clientSecret: "",
      subscriptionId: "",
    });
  }
});

async function checkPaymentStatus(subscriptionId) {
  
  const subscription = await getSubscription(subscriptionId);
  const invoices = await getInvoicesForSubscription(subscriptionId);

  if (!subscription || !invoices) {
    return false;
  }

  const currentPeriodStart =  convertStripeDate(subscription.current_period_start) ;
  const currentPeriodEnd =  convertStripeDate(subscription.current_period_end);

  // Find the invoice for the current billing period
  let isSubscriptionIsActive = false ;
  const currentDate = new Date();

  if(currentDate >= currentPeriodStart && currentDate <= currentPeriodEnd){
    isSubscriptionIsActive = true ;
  }
  
  const currentInvoice = invoices.find(invoice => {
    let period_start =  convertStripeDate(invoice.lines.data[0].period.start);
    let period_end =  convertStripeDate(invoice.lines.data[0].period.end);
     return  (currentDate >= period_start && currentDate <= period_end)
    });

  if (isSubscriptionIsActive && currentInvoice.paid) {
    return  {  result  :  true   ,  subscription} ;
  } else {
    return {  result  :  false   ,  subscription : null};
  }
}

async function getSubscription(subscriptionId) {
  try {
    const subscription = await stripeGateway.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
  }
}

async function getInvoicesForSubscription(subscriptionId) {
  try {
    const invoices = await stripeGateway.invoices.list({
      subscription: subscriptionId,
      limit: 12, // Adjust this limit based on how far back you want to check
    });
    return invoices.data;
  } catch (error) {
    console.error('Error retrieving invoices:', error);
  }
}
async function sendEmail(planName , email , name) {
  try {
      const currentYear = new Date().getFullYear();
      const html = fs.readFileSync('templates/email/subscriptionVerification.html', {
          encoding: 'utf-8',
      });

      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.toLocaleString('en-US', { month: 'short' });
    
      const afterSevenDays = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const afterSevenDaysDay = afterSevenDays.getDate();
      const afterSevenDaysMonth = afterSevenDays.toLocaleString('en-US', { month: 'short' });
      let startTrailDate  = day + " "+ month ;
      let endTrailDate  = afterSevenDaysDay + " "+ afterSevenDaysMonth ;

      const data = {
        plan : planName , 
        startTrailDate ,
        year :currentYear,
        endTrailDate ,
        name
      };

      const template = generateTemplate(html, data);

      if(true){
          const info = await transporter.sendMail({
              from: `"Clikkle Hr"<hr@clikkle.com> `, // sender address
              to: email, // list of receivers
              subject: `Clikkle Subscription Verification`, // Subject line
              html: template, // html body
          });
      }else {
      const info = await sendSESEmail({
          from: organization.email, //`"${organization.name} offer letter"<hr@clikkle.com>`, // sender address
          to: jobApplication.email, // list of receivers
          subject: `${organization.name} offer letter`, // Subject line
          html: template, // html body
      });
  }
      // 
  } catch (err) {
      console.error(err);
  }
}



export default subscriptionRouter;
