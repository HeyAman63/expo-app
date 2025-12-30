import Stripe from "stripe";
import { ENV } from "../config/env.js"
import { Cart } from "../models/cart.model.js"
import { Order } from "../models/order.model.js"
import { Product } from "../models/product.model.js"
import { User } from "../models/user.model.js"

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);


export const createPaymentIntent =async(req,res)=>{
    try {
        const {cartItems,shipingAddress} = req.body;
        const user = req.user;

        // validate cart Items
        if(!cartItems || !cartItems.length === 0){
            return res.status(404).json({error:"Cart is Empty"});
        }

        // calculate total from server side
        let subTotal = 0;
        const validateItems = [];
        for(const item of cartItems){
            const product = await Product.findById(item.product._id);
            if(!product){
                return res.status(404).json({error:`Product ${item.product.name} is not found`});
            }
            if(product.stock< item.quantity){
                return res.status(400).json({error:`Insufficient Stock for ${product.name}`})
            }

            subTotal += product.price * item.quantity;
            validateItems.push({
                product:product._id.toString(),
                name:product.name,
                price:product.price,
                quantity:item.quantity,
                image:product.images[0],
            });
        }

        const shippingFee = 10.0;
        const tax = subTotal*0.8;

        const total = subTotal+shippingFee+tax;

        if(total<=0){
            return res.status(400).json({error:"Invalid total order"});
        }

        // finde and create stripe customer

        let customer;
        if(user.stripeCustomerId){
            // find the customer
            customer = await stripe.customers.retrieve(user.stripeCustomerId);
        }else{
            //create a customer
            customer = await stripe.customers.create({
                email:user.email,
                name:user.name,
                metadata:{
                    clerkId:user.clerkId,
                    userId:user._id.toString(),
                },
            });

            // add the stripe customer id to the mongobd database
            await User.findByIdAndUpdate(user._id,{stripeCustomerId:customer.id})
        }

        // create payment intent

        const paymentIntent = await stripe.paymentIntents.create({
            amount:Math.round(total*100), // convert to paisa
            currency:"usd",
            customer:customer.id,
            automatic_payment_methods:{
                enabled
            },
            metadata:{
                clerkId:user.clerkId,
                userId:user._id.toString(),
                orderItems:JSON.stringify(validateItems),
                shipingAddress:JSON.stringify(shipingAddress),
                totalPrice:total.toFixed(2),
            },
        });

        res.status(200).json({clientSecret:paymentIntent.client_secret});
    } catch (error) {
        console.error("Error creating payment intent: ",error);
        res.status(500).json({error:"failed to create payment intent"});
    }

}


export const handleWebHook = async(req,res)=>{
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if(event.type=="payment_intent.succeeded"){
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);

        try {
            const {userId, clerkId, orderItems, shippingAddress, totalPrice} = paymentIntent.metadata;

            // Check if order already exists (prevent duplicates)
            const existingOrder = await Order.findOne({ "paymentResult.id": paymentIntent.id });
            if (existingOrder) {
                console.log("Order already exists for payment:", paymentIntent.id);
                return res.json({ received: true });
            }

            // create order
            const order = await Order.create({
                user: userId,
                clerkId,
                orderItems: JSON.parse(orderItems),
                shippingAddress: JSON.parse(shippingAddress),
                paymentResult: {
                id: paymentIntent.id,
                status: "succeeded",
                },
                totalPrice: parseFloat(totalPrice),
            });

            // update product stock
            const items = JSON.parse(orderItems);
            for (const item of items) {
                await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
                });
            }

            console.log("Order created successfully:", order._id);
        } catch (error) {
            console.error("Error creating order from webhook:", error);
        }
    }
    res.json({ received: true });
}