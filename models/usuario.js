const crypto = require("crypto");
class Usuario {


    constructor(nombre) {
        this.nombre = nombre;
        this.clave = "";
        this.sal = crypto.randomBytes(6).toString('hex');
    }
    get Nombre(){
        return this.nombre;
    }
    get Clave(){
        return this.clave;
    }
    set Nombre(nombre){
        this.nombre=nombre;
    }
    set Clave(clave){
        this.clave = crypto.createHash("sha256").update(clave + this.sal).digest("hex")
    }
  
    validarUsuario(otro_usuario, otra_clave) {
      
        return (otro_usuario == this.nombre && crypto.createHash("sha256").update(otra_clave + this.sal).digest("hex") == this.clave)
    }

}
module.exports = Usuario;