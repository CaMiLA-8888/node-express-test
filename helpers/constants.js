module.exports = Object.freeze({
    BACK_END_PARAMETERS: {
        AVAILABLE_SHIPPING_METHODS: "https://yhua9e1l30.execute-api.us-east-1.amazonaws.com/sandbox/shipping-methods/",
        LIST_OF_OFF_DAYS: "https://yhua9e1l30.execute-api.us-east-1.amazonaws.com/sandbox/off-days"
    },
    HEADERS: {
        headers: {
            "x-api-key": process.env.AUTHORIZATION
        }
    },
    THROW_ERROR: {
        statusCode: 500,
        body: {
            pack_promise_min: null,
            pack_promise_max: null,
            ship_promise_min: null,
            ship_promise_max: null,
            delivery_promise_min: null,
            delivery_promise_max: null,
            ready_pickup_promise_min: null,
            ready_pickup_promise_max: null
        }
    },
    PREFIX: [
        "MSE"
    ]
})