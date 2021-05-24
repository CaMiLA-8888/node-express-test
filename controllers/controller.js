const { HEADERS, BACK_END_PARAMETERS, THROW_ERROR, PREFIX } = require('../helpers/constants');
const moment = require('moment'); /// Quedo faltando modularizar funciones en mappers y helpers, ademas de validar modelos con el modulo AJV

function writeJson(object, fs) {
    fs.readFile('./data.json', 'utf-8', function (err, data) {
        if (err) throw err

        const arrayOfObjects = JSON.parse(data)
        arrayOfObjects.data.push(object);

        fs.writeFile('./data.json', JSON.stringify(arrayOfObjects), 'utf-8', function (err) {
            if (err) throw err
            console.log('Done!')
        })
    })
}

const offDayIsTrue = (date, offDays) => {
    let flag = true;
    const Dayexist = offDays.find(element => element === date)
    flag = Dayexist ? false : true;
    return flag;
}

const dataTypeValidate = (data, nextBusinessDays) => {
    let flag = false
    switch (data) {
        case "ANY":
            flag = true
            break;
        case "BUSINESS":
            if (moment().isoWeekday() !== 6 && moment().isoWeekday() !== 7 && moment().format("YYYY-MM-DD") === nextBusinessDays[0]) {
                flag = true
            }
            break;
        default:
            flag = false
            break;
    }
    return flag;
}

const calculatePromise = (promiseName, date, nextBusinessDays) => { ///min thing
    if (promiseName.type === "NULL") return null;;
    if (promiseName.type === "DELTA-HOURS") return `${date} At ${moment(promiseName.deltaHours,"HH:mm a").utc(0).format("HH:mm a")}`;
    if (promiseName.type === "DELTA-BUSINESSDAYS"){
        return `${nextBusinessDays[promiseName.deltaBusinessDays - 1]} At ${moment(promiseName.timeOfDay,"HH:mm a").utc(0).format("HH:mm a")}`;
    } 
}

async function post(req, res, services, fs) {
    const { body } = req
    const date = moment();
    const timestap = moment().valueOf()
    const creation_date = moment().format("YYYY-MM-DD")
    const internal_order_number = PREFIX[0] + timestap + Math.floor(Math.random() * 101);
    let result = {
        creation_date,
        internal_order_number,
        ...body
    }
    console.log(result);
    try {
        const { data } = await services(BACK_END_PARAMETERS.AVAILABLE_SHIPPING_METHODS + body.shopping_method, HEADERS);
        const offDays = await services(BACK_END_PARAMETERS.LIST_OF_OFF_DAYS, HEADERS);
        const nextBusinessDays = addWeekdays(date, offDays.data, 10);
        if (!(data && data.rules)) {
            throw THROW_ERROR;
        }
        const weight_min = data.rules.availability.byWeight.min;
        const weight_max = data.rules.availability.byWeight.max;
        if (!(weight_min <= body.line[0].Product_weight && body.line[0].Product_weight <= weight_max)) {
            throw statusCode;
        }
        const { dayType } = data.rules.availability.byRequestTime;
        if (!dataTypeValidate(dayType, nextBusinessDays)) {
            throw THROW_ERROR;
        }
        const fromTimeOfDay = data.rules.availability.byRequestTime.fromTimeOfDay;
        const toTimeOfDay = data.rules.availability.byRequestTime.toTimeOfDay;
        if (!(fromTimeOfDay <= moment().format("H") && moment().format("H") <= toTimeOfDay)) {
            throw THROW_ERROR;
        }
        const { promisesParameters } = data.rules;
        ///casos
        if (!(promisesParameters && promisesParameters.cases && promisesParameters.cases[0].priority)) {
            throw THROW_ERROR;
        }
        const Response = {};
        for (let d of promisesParameters.cases) {
            const { dayType, fromTimeOfDay, toTimeOfDay } = d.condition.byRequestTime;
            if (!dataTypeValidate(dayType, nextBusinessDays)) {
                continue;
            }
            if (!(fromTimeOfDay <= moment().format("H") && moment().format("H") <= toTimeOfDay)) {
                continue;
            }
            Response.pack_promise_min = calculatePromise(d.packPromise.min, creation_date, nextBusinessDays);
            Response.pack_promise_max = calculatePromise(d.packPromise.max, creation_date, nextBusinessDays);
            Response.ship_promise_min = calculatePromise(d.shipPromise.min, creation_date, nextBusinessDays);
            Response.ship_promise_max = calculatePromise(d.shipPromise.max, creation_date, nextBusinessDays);
            Response.delivery_promise_min = calculatePromise(d.deliveryPromise.min, creation_date, nextBusinessDays);
            Response.delivery_promise_max = calculatePromise(d.deliveryPromise.max, creation_date, nextBusinessDays);
            Response.ready_pickup_promise_min = calculatePromise(d.readyPickUpPromise.min, creation_date, nextBusinessDays);
            Response.ready_pickup_promise_max = calculatePromise(d.readyPickUpPromise.max, creation_date, nextBusinessDays);
        }
        result = {
            ...result,
            ...Response
        }
        writeJson(result, fs)
        res.status(201).send(result);
    } catch (err) {
        console.log(err)
        res.status(err.statusCode).send(err.body);
    }
}

function get(req, res, fs) {
    const { id } = req.params;
    fs.readFile('./data.json', 'utf-8', function (err, info) {
        if (err) throw err
        const { data } = JSON.parse(info);
        const result = data.find((element) => element.internal_order_number === id);
        res.status(200).send(result);
    });
}

function addWeekdays(date, offDays, days) {
    let arrayDays = [];
    while (days > 0) {
        date = date.add(1, 'days');
        let offDayFlag = offDayIsTrue(date.format("YYYY-MM-DD"), offDays);
        if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7 && offDayFlag) {
            arrayDays.push(date.format("YYYY-MM-DD"));
            days -= 1;
        }
    }
    return arrayDays;
}

function getAll(req, res, fs) {
    console.log("Aqui", fs);
    fs.readFile('./data.json', 'utf-8', function (err, info) {
        if (err) throw err
        const { data } = JSON.parse(info);
        console.log(data);
        const result = data.map((element) => {
            const {
                internal_order_number,
                creation_date,
                seller_store,
                shopping_method
            } = element;
            return {
                internal_order_number,
                creation_date,
                seller_store,
                shopping_method
            };
        });
        res.status(200).send(result);
    });
}

module.exports = {
    get,
    post,
    getAll,
}