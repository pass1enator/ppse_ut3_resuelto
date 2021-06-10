var express = require('express');
var router = express.Router();
const modeloPiscina = require("../models/piscina")
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { check, validationResult, body } = require('express-validator');

var usuario = "paco"
var clave = "falsa"
var tokenfalso = "mentira"
/**
 * se utiliza un array de piscinas para almacenar los recusos
 * no es el objetivo del módulo el trabajar con base de datos
 */
var piscinas = new Array();
var contador = 0;

function init(){
  let tempopiscina=  new modeloPiscina.Piscina("Torre Stark", "Iron Man", new Date().toISOString().slice(0, 10))
  piscinas.push(tempopiscina);
  contador++;
  tempopiscina.Id = contador;
  
  tempopiscina= new modeloPiscina.Piscina("C/Titan", "Thanos", new Date().toISOString().slice(0, 10))
  piscinas.push(tempopiscina);
  contador++;
  tempopiscina.Id = contador;

  tempopiscina=new modeloPiscina.Piscina("Avda Dimensión Espejo", "Doctor Strange", new Date().toISOString().slice(0, 10))
  piscinas.push(tempopiscina);
  contador++;
  tempopiscina.Id = contador;
  }
/**
 * Añadir el código necesario para validar los campos de entrada y generar 
 * un token
 */
router.post("/login",
  (req, res) => {
    return res.json(tokenfalso);
  })

/**
 * Alta de una nueva piscina, validar que se tiene permisos (enviar el token), comprobar los parámetros y desinfectar los mismos
 */
router.post(
  '/piscina',
  (req, res) => {
    var piscina = new modeloPiscina.Piscina(req.body.direccion, req.body.propietario, new Date().toISOString().slice(0, 10))
    piscinas.push(piscina);
    contador++;
    piscina.Id = contador;
    res.json(piscina)

  }
);
/**
 * 
 * Borrar una piscina, validar que se tiene permisos (enviar el token), comprobar los parámetros y desinfectar los mismos
 */
router.delete(
  '/piscina/:id',
  (req, res) => {
    var length_antes = piscinas.length, length_despues;
    var tempo;
    tempo = piscinas.filter(element => {
      return element.Id != parseInt(req.params.id)
    });
    //eb caso de no devolver nada
    if(tempo!=undefined){
      piscinas=tempo
    }
    length_despues = piscinas.length;
    res.json(length_antes - length_despues)
  }
);
/**
 *  Datos de todas las piscinas, comprobar si se tiene permisos. 
 * */
router.get('/piscina', function (req, res, next) {
  res.json(piscinas);
});
/**
 *  Datos de una piscina concreta, Comprobar si se tiene permisos y el parámetro es correcto. 
 * */
router.get('/piscina/:id', function (req, res, next) {
  var piscina = piscinas.find(element => element.Id == parseInt(req.params.id));
  if (piscina == undefined) {
    res.status(404).json({ error: "No existe la piscina" })
  } else {
    res.json(piscina);
  }
});


/**
 * Alta de una nueva medición a una piscina, validar que se tiene permisos (enviar el token), comprobar los parámetros y desinfectar los mismos
 */
router.post(
  '/piscina/:id/medicion',
  (req, res) => {
    var piscina = piscinas.find(element => element.Id == parseInt(req.params.id));
    var medicion;
    if (piscina == undefined) {
      res.status(404).json({ error: "No existe la piscina" })
    } else {
      medicion = new modeloPiscina.Medicion(new Date().toISOString().slice(0, 10), req.body.ph, req.body.cloro, req.body.gramos_ph, req.body.gramos_cloro, req.body.antialgas, req.body.fluoculante)
      piscina.addMedicion(medicion)
      res.json(medicion);
    }


  }
);
/**
* Borrar una medición, validar que se tiene permisos (enviar el token), comprobar los parámetros y desinfectar los mismos
*/
router.delete(
  '/piscina/:idpiscina/medicion/:id',
  (req, res) => {
    var length_antes, length_despues;
    var tempo;
    var piscina = piscinas.find(element => element.Id == parseInt(req.params.idpiscina));
    var medicion;
    if (piscina == undefined) {
      res.status(404).json({ error: "No existe la piscina" })
    } else {
      length_antes = piscina.Mediciones.length;
      tempo = piscina.Mediciones.filter(element => {
        return element.Id != parseInt(req.params.id)
      });
      //en caso de no devolver nada
      if(tempo!=undefined){
        piscina.Mediciones=tempo
      }
      length_despues = piscina.Mediciones.length;
      res.json(length_antes - length_despues)
    }

  }
);
/**
*  Obtener una medición concreta. 
* */
router.get('/piscina/:idpiscina/medicion/:id', function (req, res, next) {
  var piscina = piscinas.find(element => element.Id == parseInt(req.params.idpiscina));
  var medicion;
  if (piscina == undefined) {
    res.status(404).json({ error: "No existe la piscina" })
  } else {
    medicion = piscina.Mediciones.find(element => element.Id == parseInt(req.params.id))
    if (medicion == undefined) {
      res.status(404).json({ error: "No existe la medicion" })
    } else {
      res.json(medicion)
    }
  }
});

module.exports = {router, init};
