import cache from 'memory-cache'
import express from 'express';
var router = express.Router();

// artifically slow down getting the items from the database
// to pretend that this is a really difficulty query, so 
// we can see the benefits of caching
async function getItemsSlow(req){
    let allItems = await req.models.Item.find()

    // add a pause
    let sleepSeconds = 5
    await new Promise(r => setTimeout(r, sleepSeconds * 1000))

    return allItems
}

router.get('/', async (req, res) => {
    console.log("got a request, first look it up in the cache")
    let allItems = cache.get('allItems')
    
    if(allItems){
        console.log("found items in my cache!")
    } else {
        console.log("cache miss, doing the slow db lookup")
        allItems = await getItemsSlow(req)
        console.log("found items in db, saving to cache")
        cache.put('allItems', allItems, 30*1000)
    }

    // set caching rule for browser
    //res.set('Cache-Control', 'public, max-age=30')
    res.json(allItems)
})

router.post('/saveCart', async (req, res) => {
    console.log("saving cart, session currently is: ", req.session)
    // array of {} with itemCount and itemId
    let cartInfo = req.body

    req.session.cartInfo = JSON.stringify(cartInfo)

    console.log("session is now: ", req.session)
    
    res.json({status: "success"})
})

async function addPricesToCart(cartInfo, models){
    // look up all items listed in my cart
    let cartItemIds = cartInfo.map(cartItem => cartItem.itemId)
    let itemsInfo = await models.Item.find().where('_id').in(cartItemIds).exec()

    // itemsInfo will be an array of json, like: 
    //     [{_id: 234, name: "orange", ...}, {_id: 34, name: "m&ms", ...}]

    // make itemsInfo lookup-able by the id
    let itemsInfoById = {}
    itemsInfo.forEach(itemInfo => {
        itemsInfoById[itemInfo._id] = itemInfo
    })

    // itemsInfoById will look like:
    // {
    //    234: {_id: 234, name: "orange", ...},
    //    34: {_id: 34, name: "m&ms", ...}
    // }

    // take the cartInfo, and for each item, add the name and price
    let combinedCartInfo = cartInfo.map(cartItem => {
        return {
            itemId: cartItem.itemId,
            itemCount: cartItem.itemCount,
            name: itemsInfoById[cartItem.itemId].name,
            price: itemsInfoById[cartItem.itemId].price
        }
    })

    return combinedCartInfo
}

router.get('/getCart', async (req, res) => {
    if(!req.session || !req.session.cartInfo){
        res.json([])
        return
    }
    let cartInfo = JSON.parse(req.session.cartInfo)
    
    // look up item names and prices in the database
    let combinedCartInfo = await addPricesToCart(cartInfo, req.models)

    res.json(combinedCartInfo)
})

async function calculateOrderAmount(req){
    let cartInfo = JSON.parse(req.session.cartInfo)

    let combinedCartInfo = await addPricesToCart(cartInfo, req.models)

    let totalCost = combinedCartInfo
        .map(item => item.price * item.itemCount)
        .reduce((prev, curr) => prev + curr)
    
    return totalCost
}

router.post('/create-payment-intent', async(req, res) => {
    let orderAmount = await calculateOrderAmount(req)

    // create a PaymentIntent object with order amount
    const paymentIntent = await req.stripe.paymentIntents.create({
        amount: orderAmount * 100,
        currency: "usd", // usd in stripe is actually us cents, so multiply by 100
        automatic_payment_methods: {
            enabled: true
        }
    })

    res.send({
        clientSecret: paymentIntent.client_secret
    })
})

export default router;
