//EJERCICIO REALIZADO POR GABRIEL GRONDONA - 20/9/2019

const fs = require("fs");
const file = fs.createWriteStream("people.out");
const lineReader = require("readline").createInterface({
  input: require("fs").createReadStream("people.in")
});

const industries = require("./industries.json");
const roles = require("./roles.json");
const nationalities = require("./nationalities");
const rolesArr = Object.keys(roles);
let leadList = [];

lineReader
  .on("line", function(line) {
    let lead = getLead(line);
    //Podría ser muy útil obtener información de la companía a la que pertenece el lead. Por ejemplo, si la companía muestra un crecimiento marcado de personal en el último tiempo o tiene muchas búsquedas activas (metricas provistas por LinkedIn en su versión premium) esto setearía un booleano en "true" que tenga un efecto  multiplicador sobre el puntaje obtenido para cada lead (un booleano "aggresiveHiring",por ejemplo: if (aggresiveHiring) lead.points*=1.5)).

    //Se podría agregar una capa de complejidad más para el sistema de evaluación de manera que el puntaje asignado al rol de cada lead varíe según el tamaño de la companía a la que pertenece (información provista por LinkedIn). De esta manera por ejemplo, se le asignaría mayor puntaje al CEO de una startup de < 50 empleados que al de una gran companía, puesto que es menos probable que el CEO de una gran corporación se encuentre involucrado en la decisión de iniciar un proceso de outsourcing, y esto se encuentre delegado en roles mas específicos o mid-management level. A menor tamaño de la companía, mayor puntaje asignado a cargos jerárquicos, y viceversa.
    if (nationalities[lead.country]) lead.points += nationalities[lead.country];
    if (industries[lead.industry]) lead.points += industries[lead.industry];
    for (let i = 0; i < rolesArr.length; i++) {
      if (lead.role.includes(rolesArr[i])) lead.points += roles[rolesArr[i]];
    }
    //También se podría otorgar algunos "bonus points" para aquellas leads ideales que reúnan ciertas condiciones con la finalidad de separarlas de las "average". Por ejemplo, if (role == "Technical Leader" && nationality == "United States" && industry == "Information Technology") lead.points += 30


    //Otra optimizacion posible sería limitar el length del array a 100 e ir reemplazando el lead con menor puntaje cada vez que una lead obtiene un puntaje mayor. De esta manera se podría mejorar la performance del algoritmo tanto en tiempo como en espacio.
    leadList.push(lead);
  })
  .on("close", function() {
    file.on("error", function(err) {
      console.log("The file could not be read successfully. Reason :", err);
    });
    leadList.sort(compareFn);
    let topLeads = leadList.splice(0, 100);
    for (let i = 0; i < topLeads.length; i++) {
      let usrId = topLeads[i].id;
      file.write(usrId + "\n");
    }

    file.end();
  });

function getLead(str) {
  let arr = str.split("|");

  let lead = {
    id: arr[0],
    name: arr[1],
    lname: arr[2],
    role: arr[3],
    country: arr[4],
    industry: arr[5],
    recommendations: arr[6],
    connections: arr[7],
    points: 0
  };
  return lead;
}

function compareFn(a, b) {
  return b.points - a.points;
}
