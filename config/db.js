const {Pool} =require('pg')
const pool=new Pool({
    user:'postgres',
    host:'localhost',
    database:'RiceDistribution',
    password:'Narsi@123',
    port:'5432',
    ssl: false,
})

pool.connect((err,client,release)=>{
    if(err){
        return console.error("Error in connection",err.stack);
    }
    console.log("Data Base Connected Successfully")
    release()
});

module.exports=pool