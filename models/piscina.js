class Medicion {
    constructor(fecha,ph,cloro,gramos_ph, gramos_cloro,antialgas,fluoculante){
        this.fecha_=fecha;
        this.php=ph;
        this.cloro=cloro;
        this.gramos_php=gramos_ph;
        this.gramos_cloro=gramos_cloro
        this.antialgas=antialgas
        this.fluoculante=fluoculante;
        this.id=-1;
    }
    set Id(id){
        this.id=id;
    }
    get Id(){
        return this.id;
    }
}
 class Piscina {
    static contador=0;
    constructor(direccion, propietario,fecha_alta){
        this.direccion=direccion;
        this.propietario=propietario;
        this.fecha_alta=fecha_alta;
        this.mediciones=new Array();
        this.id=-1

    }
    addMedicion(medicion){
        this.mediciones.push(medicion)
        Piscina.contador++;
       
        medicion.Id=Piscina.contador;
    }
    
    set Id(id){
        this.id=id;
    }
    get Id(){
        return this.id;
    }
    get Mediciones(){
        return this.mediciones;
    }
    set Mediciones(mediciones){
        this.mediciones=mediciones;
    }
 
} 
module.exports = {Piscina, Medicion};