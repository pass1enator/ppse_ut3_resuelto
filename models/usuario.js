 class Usuario {
    constructor(nombre,apellidos,direccion,peso,altura,edad){
        this.nombre=nombre;
        this.altura=apellidos;
        this.direccion=direccion;
        this.peso=peso;
        this.altura=altura;
        this.edad=edad;
    }
  /*  get nombre(){
        return this.nombre;
    }
    set Nombre(nombre){
        this.nombre=nombre;
    }
    get Apellidos(){
        return this.apellidos;
    }
    set Apellidos(apellidos){
        this.apellidos=apellidos;
    }
    get Direccion(){
        return this.direccion;
    }
    set Direccion(direccion){
        this.direccion=direccion;
    }
    get Altura(){
        return this.altura;
    }
    set Altura(altura){
        this.altura=altura;
    }
    get Peso(){
        return this.peso;
    }
    set Peso(peso){
        this.peso=peso;
    }
    get Edad(){
        return this.edad;
    }
    set Edad(edad){
        this.edad=edad;
    }
    get JSON(){
        return JSON.stringify(this)
    }*/
} 
module.exports = Usuario;