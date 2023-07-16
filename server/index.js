import csvtojson from 'csvtojson'
import { createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import { Readable, Transform } from 'node:stream'
import { setTimeout } from 'node:timers/promises'
const PORT = 3000

createServer(async(req,res)=>{
    const headers = {
        'Access-Control-Allow-Origin':"*",
        'Access-Control-Allow-Methods':"*"
    }
    
    if (req.method==='OPTIONS'){
        res.writeHead(204, headers)
        res.end()
        return;        
    }

    req.once('close', _=>console.log("Connection was closed!", items))
    let items = 0;
    Readable.toWeb(createReadStream('./animeflv.csv'))
    //pipeThrough é middleware

    .pipeThrough(
        Transform.toWeb(csvtojson())
    )    
    .pipeThrough(new TransformStream({
        transform(chunk, controller){
            const data = JSON.parse(Buffer.from(chunk))
            const mappedData = {
                title:data.title,
                description:data.description,
                url_anime: data.url_anime          
            }
            
            controller.enqueue(JSON.stringify(mappedData).concat("\n"))
        }
    }))
    //PIPE TO É A ULTIMA ETAPA
    .pipeTo(
        new WritableStream({
            async write(chunk, enc, cb){
                await setTimeout(1000)
                items++
                res.write(chunk)
            },
            
            close(){
                res.end()
            }
        })
    )    

    res.writeHead(200, headers)
    
})
.listen(PORT)
.on("listening",()=>console.log("Listening at ", PORT))