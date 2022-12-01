import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {Keys} from '../config/keys';
var jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class JwtService {
  constructor(/* Add @inject to inject parameters */) { }

  /**
   * Se genera un token con la informacion en formato JWT
   * @param info datos que quedarán en el token
   * @returns token firmado con la clave secreta
   */
  crearToken(info: object): string {
    try {
      var token = jwt.sign(info, Keys.JwtSecretKey);
      return token;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Se valida un token si es correcto o no
   * @param tk token a validar
   * @returns boolean con la respuesta
   */
  ValidarToken(tk: string): string {
    try {
      let info = jwt.verify(tk, Keys.JwtSecretKey);
      console.log(info.rol);
      return info.rol;
    } catch (err) {
      return '';
    }
  }
}
