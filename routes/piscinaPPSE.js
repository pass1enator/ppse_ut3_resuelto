var express = require('express');
var router = express.Router();
const modeloPiscina = require("../models/piscina")
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { check, validationResult, body } = require('express-validator');
const Usuario = require('../models/usuario');

var regEx_sanityze = /<script>|<\/script>|<iframe>|<\/iframe>|javascript:|onload=|alert(1)|<|>|\"1=1\"|\'1\'=\'1\'|--,1=|SELECT/i
var privadaJWT = "Mq@45oP!2"
/**
 * se utiliza un array de piscinas para almacenar los recusos
 * no es el objetivo del módulo el trabajar con base de datos
 */
var piscinas = new Array();
//se crea la variable usuario, en otros casos se almacenaría en la base de datos.
var usuario = new Usuario();
usuario.nombre = "Pedro";
usuario.Clave="1234"
var contador = 0;

function init() {
  let tempopiscina = new modeloPiscina.Piscina("Torre Stark", "Iron Man", new Date().toISOString().slice(0, 10))
  piscinas.push(tempopiscina);
  contador++;
  tempopiscina.Id = contador;

  tempopiscina = new modeloPiscina.Piscina("C/Titan", "Thanos", new Date().toISOString().slice(0, 10))
  piscinas.push(tempopiscina);
  contador++;
  tempopiscina.Id = contador;

  tempopiscina = new modeloPiscina.Piscina("Avda Dimensión Espejo", "Doctor Strange", new Date().toISOString().slice(0, 10))
  piscinas.push(tempopiscina);
  contador++;
  tempopiscina.Id = contador;
}
/**
 * Añadir el código necesario para validar los campos de entrada y generar 
 * un token
 */
router.post("/login",
  check('usuario').exists().withMessage('Necesario el usuario').customSanitizer((value) => {
    if (value != undefined)
      value = value.replace(regEx_sanityze, "")
    return value;
  }),
  check('clave').exists().withMessage('Necesaria la clave').customSanitizer((value) => {
    if (value != undefined) {
      value = value.replace(regEx_sanityze, "")
    }
    return value;
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    if (usuario.validarUsuario(req.body.usuario,req.body.clave)){ // = usuario.nombre && req.body.clave == usuario.clave) {
      var token = jwt.sign({ usuario: usuario.nombre }, privadaJWT, { algorithm: 'HS512', expiresIn: 86400 });
      return res.json(token);
    } else {
      return res.json({ errors: [{ msg: "usuario o clave incorrectos", param: "todos", location: "body" }] })
    }

  })

function recursoprotegido(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ errors: [{ msg: "Petición sin token" }] });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, privadaJWT, (err, decoded) => {
    if (err) {
      return res.status(403).json({ errors: [{ msg: "token incorrecto", param: "token", location: "body" }] })
    } else {
      //se almacena en la petición para su uso en el método
      req.decoded = decoded;
      next();
    }
  });
}

/**
 * Alta de una nueva piscina, validar que se tiene permisos (enviar el token), comprobar los parámetros y desinfectar los mismos
 */
router.post(
  '/piscina',
  recursoprotegido,
  check('direccion').exists().withMessage('Campo dirección necesario').isLength({ min: 4, max: 150 }).withMessage('Longitud de la dirección entre 4 y 150').customSanitizer((value) => {
    if (value != undefined)
      value = value.replace(regEx_sanityze, "")
    return value;
  }),
  check('propietario').exists().withMessage('Campo propietario necesario').isLength({ min: 10, max: 110 }).withMessage('Longitud de propietario debe estar entre 10 y 110').customSanitizer((value) => {
    if(value != undefined)
    value = value.replace(regEx_sanityze, "")
    return value;
  }),
  (req, res) => {

      //errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

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
  recursoprotegido,
  check('id').exists().withMessage('Necesita el identificador de la piscina').isInt().withMessage('El id ha de ser un entero').customSanitizer((value) => {
    value = value.replace(regEx_sanityze, "")
    return value;
  }),
  (req, res) => {

    var length_antes = piscinas.length, length_despues;
    var tempo;

  //errores de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

    tempo = piscinas.filter(element => {
      return element.Id != parseInt(req.params.id)
    });
    //eb caso de no devolver nada
    if (tempo != undefined) {
      piscinas = tempo
    }
    length_despues = piscinas.length;
    res.json(length_antes - length_despues)
  }
);
/**
 *  Datos de todas las piscinas, comprobar si se tiene permisos. 
 * */
router.get('/piscina',
  recursoprotegido,
  function (req, res, next) {
    res.json(piscinas);
  });
/**
 *  Datos de una piscina concreta, Comprobar si se tiene permisos y el parámetro es correcto. 
 * */
router.get('/piscina/:id',
  recursoprotegido,
  check('id').exists().withMessage('Necesita el identificador de la piscina').isInt().withMessage('El id ha de ser un entero'),
  function (req, res, next) {
    
    //errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
  recursoprotegido,
  check('id').exists().withMessage('Necesita el identificador de la piscina').isInt().withMessage('El id ha de ser un entero'),
  check('ph').exists().withMessage('Se necesita el nivel de ph').isInt().withMessage('El PH ha de ser un entero'),
  check('cloro').exists().withMessage('Se necesita el nivel de cloro').isInt().withMessage('El cloro ha de ser un entero'),
  check('gramos_ph').exists().withMessage('Se necesita los gramos de pho').isInt().withMessage('Los gramos de ph han de ser un entero'),
  check('gramos_cloro').exists().withMessage('Se necesita los gramos de cloro').isInt().withMessage('Los gramos de cloro han de ser un entero'),
  check('antialgas').exists().withMessage('Se necesita los gramos de antialgas').isInt().withMessage('Los gramos de antialgas han de ser un entero'),
  check('fluoculante').exists().withMessage('Se necesita los gramos de fluoculante').isInt().withMessage('Los gramos de fluoculante han de ser un entero'),
  (req, res) => {

    //errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
  recursoprotegido,
  check('idpiscina').exists().withMessage('Necesita el identificador de la piscina').isInt().withMessage('El id de la pisicna  ha de ser un entero'),
  check('id').exists().withMessage('Necesita el identificador de la medición').isInt().withMessage('El id ha de ser un entero'),
  (req, res) => {
    var length_antes, length_despues;
    var tempo;

    //errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
      if (tempo != undefined) {
        piscina.Mediciones = tempo
      }
      length_despues = piscina.Mediciones.length;
      res.json(length_antes - length_despues)
    }

  }
);
/**
*  Obtener una medición concreta. 
* */
router.get('/piscina/:idpiscina/medicion/:id',
  recursoprotegido,
  check('idpiscina').exists().withMessage('Necesita el identificador de la piscina').isInt().withMessage('El id de la pisicna  ha de ser un entero'),
  check('id').exists().withMessage('Necesita el identificador de la medición').isInt().withMessage('El id ha de ser un entero'),
  function (req, res, next) {
    //errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

module.exports = { router, init };
