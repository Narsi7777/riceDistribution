const express=require('express')
const pool=require('./config/db')
const cors=require("cors")
const app=express()

app.use(express.json())
app.use(cors())


//all storage operations

app.get('/storage',async(req,res)=>{
try{
    const result=await pool.query('select * from Storage')
    //console.log(result.rows)
    res.status(200).json(result.rows)

}
catch(err){
    console.log('error in fetching data from storage',err.stack)
    res.status(500).send('An Error Occurrrreddd')
}
})


app.put('/updateStorage/:name',async(req,res)=>{
    const name=req.params.name
    const {column,value}=req.body
    console.log("Column is ",column)
    if (value===undefined){
        return res.status(400).send("Missing Price Value")
    }
    try{
        const result=await pool.query(`update Storage set ${column}=$1 where nameofthebrand=$2`,[value,name])
        if(result.rowCount===0){
            return res.status(404).send("No record found to update..")
        }
        console.log("Updated Record",result.rows[0])
        res.status(200).json(result.rows[0])    
    }
    catch(err){
        console.log("error in fetching data",err.stack)
        res.status(400).send("not found")
    }
})
//adding newPackets
app.put('/updateStorage/:name/add',async(req,res)=>{
    const name=req.params.name
    const {addPackets}=req.body
    console.log("Packets To add is",addPackets)
    if (addPackets===undefined){
        return res.status(400).send("Missing No of Packets To Addd")
    }
    try{
        const result=await pool.query(`select nameofthebrand,quantityinpackets from storage where nameofthebrand=$1`,[name])
        if(result.rowCount===0){
            return res.status(404).send("No record found to Addd")
        }
            console.log("Name is",result.rows[0]["nameofthebrand"])
            console.log("Old Quantity is",result.rows[0]["quantityinpackets"])
            oldPackets=result.rows[0]["quantityinpackets"]
            newPackets=oldPackets+addPackets
            const result2=await pool.query(`update Storage set quantityinpackets=$1 where nameofthebrand=$2`,[newPackets,name])
            if(result2.rowCount===0){
                return res.status(404).send("Record Not Found To update")
            }
        
        console.log("Record Updated")
        res.status(200).json(result2.rows[0])    
    }
    catch(err){
        console.log("error in fetching data",err.stack)
        res.status(400).send("not found")
    }
})

//removing packets

app.put('/updateStorage/:name/remove',async(req,res)=>{
    const name=req.params.name
    const {addPackets}=req.body
    console.log("Packets To Remove is",addPackets)
    if (addPackets===undefined){
        return res.status(400).send("Missing No of Packets To Addd")
    }
    try{
        const result=await pool.query(`select nameofthebrand,quantityinpackets from storage where nameofthebrand=$1`,[name])
        if(result.rowCount===0){
            return res.status(404).send("No record found to Addd")
        }
            console.log("Name is",result.rows[0]["nameofthebrand"])
            console.log("Old Quantity is",result.rows[0]["quantityinpackets"])
            oldPackets=result.rows[0]["quantityinpackets"]
            newPackets=oldPackets-addPackets
            const result2=await pool.query(`update Storage set quantityinpackets=$1 where nameofthebrand=$2`,[newPackets,name])
            if(result2.rowCount===0){
                return res.status(404).send("Record Not Found To update")
            }
        
        console.log("Record Updated")
        res.status(200).json(result2.rows[0])    
    }
    catch(err){
        console.log("error in fetching data",err.stack)
        res.status(400).send("not found")
    }
})


//add new brand

app.post("/storage/addBrand",async(req,res)=>{
    const {nameofthebrand,quantityinpackets,costofeachpacket,location}=req.body    
    console.log("hehe",nameofthebrand,quantityinpackets,costofeachpacket,location)
    if(nameofthebrand===undefined||quantityinpackets===undefined||costofeachpacket===undefined){
        return res.status(400).send("SomeThing Is Missing....")
    }
    try{
        const result=await pool.query(`insert into Storage values($1,$2,$3,$4)`,[nameofthebrand,quantityinpackets,costofeachpacket,location])
        console.log(result)
        return res.status(200).send("Insertion successfullll")
    }catch(err){
        if(err.code==="23505"){
            return res.status(400).send(err.stack)
        }
        return res.status(400).send(err.stack)
    }
      
})

app.get("/storage/allDetails",async(req,res)=>{
    try{
        const result=await pool.query("select sum(quantityinpackets) as totalPackets from storage")
        const result2=await pool.query("select sum(quantityinpackets*costofeachpacket) as totalCost from Storage")
        //console.log(result)
        //console.log(result2)
        

        const temp={
            "totalPackets":result.rows[0]["totalpackets"],
            "totalCost":result2.rows[0]["totalcost"]
        }
        console.log("cost is",temp["totalCost"])
        return res.status(200).send(temp)

    }catch(err){
        return res.status(400).send("Cannot get Detailssssss")
    }
})
// all customer operations



app.get("/customers",async(req,res)=>{
    try{
        const response=await pool.query("select * from customers")
        console.log(response.rows)
        res.status(200).send(response.rows)

    }catch(err){
        console.log("error in retriving custoimer data ",err)
    }
})

app.put('/addBalance/:customerId', async (req, res) => {
    const { customerId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).send('Invalid amount');
    }

    try {
        // Update customer's outstanding balance
        const updateQuery = `
            UPDATE customers
            SET outstanding_balance = outstanding_balance + $1
            WHERE customer_id = $2
            RETURNING outstanding_balance;
        `;
        const result = await pool.query(updateQuery, [amount, customerId]);

        if (result.rowCount === 0) {
            return res.status(404).send('Customer not found');
        }

        res.send({
            message: 'Balance added successfully',
            newBalance: result.rows[0].outstanding_balance,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to remove balance
app.put('/removeBalance/:customerId', async (req, res) => {
    const { customerId } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).send('Invalid amount');
    }

    try {
        // Check current balance before subtracting
        const balanceQuery = `
            SELECT outstanding_balance FROM customers WHERE customer_id = $1;
        `;
        const balanceResult = await pool.query(balanceQuery, [customerId]);

        if (balanceResult.rowCount === 0) {
            return res.status(404).send('Customer not found');
        }

        const currentBalance = balanceResult.rows[0].outstanding_balance;

        if (currentBalance < amount) {
            return res
                .status(400)
                .send('Insufficient balance to remove the specified amount');
        }

        // Update customer's outstanding balance
        const updateQuery = `
            UPDATE customers
            SET outstanding_balance = outstanding_balance - $1
            WHERE customer_id = $2
            RETURNING outstanding_balance;
        `;
        const result = await pool.query(updateQuery, [amount, customerId]);

        res.send({
            message: 'Balance removed successfully',
            newBalance: result.rows[0].outstanding_balance,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.post("/customers/addCustomer", async (req, res) => {
    const { name, address } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO customers (name, address) VALUES ($1, $2) RETURNING *",
        [name, address]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error adding customer", err);
      res.status(500).send("Server error");
    }
  });

port=3000
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})