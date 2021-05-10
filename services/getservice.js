
async function getconsult(axios, url, options){
    return await axios.get(url,options);
}

module.exports = { getconsult}
