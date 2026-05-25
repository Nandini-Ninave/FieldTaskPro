let express=require("express")
let cors=require("cors")
let mongoose=require("mongoose")
let adminrt=require("./routes/adminroutes")
let memberrt=require("./routes/memberroutes")
let editorrt=require("./routes/editorroutes")
require("dotenv").config()
mongoose.connect(process.env.DB_URL).then(()=>{
    console.log("db connected");
}
).catch((err)=>{
    console.log(err);
})
let app=express()
app.use(cors({
    origin:process.nextTick.FRONTEND_URL,
    credentials:true
}))
app.use(express.json())
// app.use(express.urlencoded({extended:true}))
app.use("/admin",adminrt)
app.use("/member",memberrt)
app.use("/editor", editorrt)
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})