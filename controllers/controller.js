const { HEADERS, BACK_END_PARAMETERS, THROW_ERROR } = require('../helpers/constants');
let Data = require("../dataArray/data");
const moment = require('moment');
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

const calculatePromise = (promiseName, date, nextBusinessDays) => {
    ///min thing
    if (promiseName.type === "NULL") return null;
    if (promiseName.type === "DELTA-HOURS") return date.format("YYYY-MM-DD") + promiseName.deltaHours;
    if (promiseName.type === "DELTA-BUSINESSDAYS") return nextBusinessDays[promiseName.deltaBusinessDays - 1] + promiseName.timeOfDay;
}

async function get(req, res, services) {
    const date = moment()
    const { id } = req.params
    const dataIn = 50;
    try {
        const { data } = await services(BACK_END_PARAMETERS.AVAILABLE_SHIPPING_METHODS + id, HEADERS);
        const offDays = await services(BACK_END_PARAMETERS.LIST_OF_OFF_DAYS, HEADERS);
        const nextBusinessDays = addWeekdays(date, offDays.data, 10);
        if (!(data && data.rules)) {
            throw new Error("Error");
        }
        const weight_min = data.rules.availability.byWeight.min;
        const weight_max = data.rules.availability.byWeight.max;
        if (!(weight_min <= dataIn && dataIn <= weight_max)) {
            throw new Error("Error");
        }
        const dayType = data.rules.availability.byRequestTime;
        /* if (!dataTypeValidate(dayType, nextBusinessDays)) {
            throw new Error("Error");
        } */
        const fromTimeOfDay = data.rules.availability.byRequestTime.fromTimeOfDay;
        const toTimeOfDay = data.rules.availability.byRequestTime.toTimeOfDay;
        if (!(fromTimeOfDay <= moment().format("H") && moment().format("H") <= toTimeOfDay)) {
            throw new Error("Error");
        }
        const { promisesParameters } = data.rules;
        ///casos
        if (!(promisesParameters && promisesParameters.cases && promisesParameters.cases[0].priority)) {
            throw new Error("Error");
        }
        const Response = {};///recuerda que debeser un clon
        for (let d of promisesParameters.cases) {
            const { dayType, fromTimeOfDay, toTimeOfDay } = d.condition.byRequestTime;
         /*    if (!dataTypeValidate(dayType, nextBusinessDays)) {
                continue;
            } */
            if (!(fromTimeOfDay <= moment().format("H") && moment().format("H") <= toTimeOfDay)) {
                continue;
            }
            Response.pack_promise_min = calculatePromise(d.packPromise.min, date, nextBusinessDays);
            Response.pack_promise_max = calculatePromise(d.packPromise.max, date, nextBusinessDays);
            Response.ship_promise_min = calculatePromise(d.shipPromise.min, date, nextBusinessDays);
            Response.ship_promise_max = calculatePromise(d.shipPromise.max, date, nextBusinessDays);
            Response.delivery_promise_min = calculatePromise(d.deliveryPromise.min, date, nextBusinessDays);
            Response.delivery_promise_max = calculatePromise(d.deliveryPromise.max, date, nextBusinessDays);
            Response.ready_pickup_promise_min = calculatePromise(d.readyPickUpPromise.min, date, nextBusinessDays);
            Response.ready_pickup_promise_max = calculatePromise(d.readyPickUpPromise.max, date, nextBusinessDays);
        } 
        res.send(Response);
    } catch (err) {
        res.status(500).send(THROW_ERROR);
    }
}
function post(req, res) {
    res.send("Aqui vamos");
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




module.exports = {
    get,
    post
}