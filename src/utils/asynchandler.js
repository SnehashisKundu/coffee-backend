// const asynchandler =(fn)=>async(req,resizeBy,next)=>{
//     try{
//         await fn(req,res,next)

//     }catch(error){
//         res.status(error.code||500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }


const asynchandler =(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((error) => next(err))
    }
}