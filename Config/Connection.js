const MongoClient = require('mongodb').MongoClient;

const state ={
    db:null
}

module.exports.connect = function(done){

    const url = "mongodb+srv://testDB:testDB@testdb.a2vdg.mongodb.net/?retryWrites=true&w=majority"; 
   let dbname = "shopping"
    MongoClient.connect(url,{
        family:4,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },(err,data)=>{
        if(err) return  done(err)
        state.db = data.db(dbname)
        done()
    })
     

}

module.exports.get = ()=>{
    return state.db
}
