const MongoClient = require('mongodb').MongoClient;

const state ={
    db:null
}

module.exports.connect = function(done){

    const url = 'mongodb://localhost:27017' 
    const dbname = 'shopping'

    MongoClient.connect(url,{family:4},(err,data)=>{
        if(err) return  done(err)
        state.db = data.db(dbname)
        done()
    })
     

}

module.exports.get = ()=>{
    return state.db
}
