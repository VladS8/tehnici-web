const express= require("express");
const path = require("path");
const fs = require("fs"); //filesystem

app= express();

console.log("Folderul proiectului", __dirname)
console.log("Calea fisierului index.js", __filename)
console.log("Folderul curent de lucru", process.cwd())

app.set("view engine", "ejs")


obGlobal= {
    obErori:null
}

vect_foldere = ["temp", "backup", "temp1"]
for(let folder of vect_foldere){
    let caleFolder = path.join(__dirname, folder)
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}


function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    
    obGlobal.obErori=JSON.parse(continut)
    
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori)

}
initErori()



function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){
        if(eroare.status)
            res.status(identificator)
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;


    }
    else{
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
})

}



app.use("/resurse", express.static(path.join(__dirname, "resurse")))

app.get("/favicon.ico", function(req, res){
    res.sendfile(path.join(__dirname, "/resurse/imagini/favicon/favicon.ico"))
})

app.get(["/", "/index", "/home"], function(req, res){
    res.render("pagini/index", {ip: req.ip});
})

app.get("/despre", function(req, res){
    res.send("pagini/despre");
})

app.get("/cerere", function(req, res){
    res.send("<p>dsada</p>");
})

app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){ //"^, $" - respecta strict string-ul
    afisareEroare(res, 403);
})

app.get("/*.ejs", function(req,res,next){
    afisareEroare(res, 400);
});


app.get("/*", function(req, res, next){
    try{
  res.render("pagini "+ req.url, function(err, rezultatRandare){
    if(err){
        console.log(err);
        if(err.message.startsWith("Failed to lookup view")){
            afisareEroare(res, 404);
        }
        else{
            afisareEroare(res);
        }
    }
    else{
        console.log(rezultatRandare);
        res.send(rezultatRandare)
    }

  })
}
    catch(errRandare){
                if(err.message.startsWith("Cannot find module")){
                afisareEroare(res, 404);
            }
            else{
                afisareEroare(res);
            }
    }
})

app.listen(8080);
console.log("Serverul a pornit")


