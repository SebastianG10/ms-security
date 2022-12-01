import { /* inject, */ BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import fetch from 'node-fetch';
import {Keys} from '../config/keys';
import {CredencialesLogin, CredencialesRecuperarClave} from '../models';
import {Codigo2FaRepository, UsuarioRepository} from '../repositories';
import {JwtService} from './jwt.service';
var generator = require('generate-password');
var MD5 = require('crypto-js/md5');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    @repository(UsuarioRepository)
    private usuarioRepository: UsuarioRepository,

    @repository(Codigo2FaRepository)
    private codigo2FARepositorio: Codigo2FaRepository,

    @service(JwtService)
    private servicioJwt: JwtService,
  ) { }

  // TODO?[01]: Creación de validación de usuario para el ingreso al sistema.
  /**
   * Método para la autenticación de usuarios
   * @param credenciales credenciales de acceso
   * @returns una cadena con el token cuando todo está bien, o una cadena vacía cuando no coinciden las credenciales
   */
  async identificarUsuario(credenciales: CredencialesLogin): Promise<object> {
    //? MODIFICACIÖN
    let res = {
      token: '',
      user: {
        nombre: '',
        correo: '',
        rol: '',
        id: '',
      }
    }

    let usuarioValido = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo,
        clave: credenciales.clave,
      },
    });

    if (usuarioValido) {
      let datos = {
        nombre: `${usuarioValido.nombres} ${usuarioValido.apellidos}`,
        correo: usuarioValido.correo,
        rol: usuarioValido.rolId,
        id: usuarioValido._id ? usuarioValido._id : '',
      };
      try {
        let tk = this.servicioJwt.crearToken(datos);
        console.log('res1', res);
        res.token = tk
        res.user = datos
        console.log('res2', res);

      } catch (err) {
        throw err;
      }
    }
    return res;
  }


  /**
   * Genera una clave aleatoria
   * @returns clave generada
   */
  CrearClaveAleatoria(): string {
    let password = generator.generate({
      length: 10,
      numbers: true,
      symbols: true,
      uppercase: true,
    });
    console.log(password);
    return password;
  }

  /**
   * Genera una clave aleatoria
   * @returns clave generada
   */
  CrearCodigoAleatorio(): string {
    let code = generator.generate({
      length: 4,
      numbers: true,
    });
    // console.log(password);
    return code;
  }

  CifrarCadena(cadena: string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

  /**
   * Se recupera una clave generándola aleatoriamente y enviándola por correo
   * @param credenciales credenciales del usuario a recuperar la clave
   */
  async RecuperarClave(
    credenciales: CredencialesRecuperarClave,
  ): Promise<boolean> {
    const params = new URLSearchParams();
    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo,
      },
    });

    if (usuario) {
      let nuevaClave = this.CrearClaveAleatoria();
      let nuevaClaveCifrada = this.CifrarCadena(nuevaClave);
      usuario.clave = nuevaClaveCifrada;
      this.usuarioRepository.updateById(usuario._id, usuario);

      let mensaje = `Hola ${usuario.nombres} <br /> Su contraseña ha sido actualizada satisfactoriamente, y la nueva es ${nuevaClave} <br /><br /> Sí no ha sido usted quien cambio la contraseña por favor tome las medidas correspondientes y llame al *611. <br /><br /> Saludos, su amigo incondicional... equipo de soporte.`;
      console.log('Validator: ' + process.env.HASH_VALIDATOR);

      params.append('hash_validator', 'Admin@notification.sender');
      params.append('destination', usuario.correo);
      params.append('subject', Keys.mensajeAsuntoRecuperarClave);
      params.append('message', mensaje);

      let r = '';

      await fetch(Keys.urlEnviarCorreo, {method: 'POST', body: params}).then(
        async (res: any) => {
          //console.log("2");
          r = await res.text();
          //console.log(r);
        },
      );
      return r == 'OK';
    } else {
      throw new HttpErrors[400](
        'El correo ingresado no está asociado a un usuario',
      );
    }
  }

  /* Métodos para el doble factor de autenticación */


  /**
   * verifica el usuario y le envia el codigo
   * @param credenciales credenciales de login
   * @returns
   */
  async envioCodigo(credenciales: CredencialesLogin): Promise<boolean> {
    const params = new URLSearchParams()
    let res = ""

    let usuario = await this.usuarioRepository.findOne({
      where: {
        email: credenciales.correo,
        clave: credenciales.clave
      }
    }
    );

    if (usuario) {
      //Generación del código
      let codigoAleatorio = this.CrearCodigoAleatorio();
      //Guardar codigo en la base de datos
      let codigo = {
        "id_usuario": usuario._id,
        "codigo": codigoAleatorio,
        "estado": true
      }

      let resPostCodigo = ''

      await fetch(Keys.url2FA, {
        method: 'POST',
        body: JSON.stringify(codigo),
        headers: {"Content-Type": "application/json"}
      }).then(async (res: any) => {
        resPostCodigo = await res.text()
        console.log("codigo de verificación: " + codigoAleatorio)
        console.log("resPostCodigo: " + resPostCodigo)
      });

      // envio del codigo
      let mensaje = {
        "mensaje": `Hola ${usuario.nombres}, tu codigo de verificion es`,
        "codigo": `${codigoAleatorio}`
      }
      console.log(mensaje);

      let r = '';

      params.append('hash_validator', 'Admin@notification.sender');
      params.append('destination', usuario.correo);
      params.append('subject', Keys.mensaje2FA);
      params.append('message', JSON.stringify(mensaje));
      console.log(params)

      await fetch(Keys.urlEnviarCorreo, {method: 'POST', body: params}).then(async (res: any) => {
        r = await res.text()
        console.log("r: " + r)
      });

      return r == "OK";
    } else {
      throw new HttpErrors[400]("El usuario o la contraseña ingresada son invalidos.");
    }
  }


  /**
   * valida el codigo de doble factor
   * @param codigo el codigo de verificación de usuario
   * @returns true o false
   */
  async ValidarCodigo(codigo: number): Promise<object> {
    let code = await this.codigo2FARepositorio.findOne({
      where: {
        codigo: codigo,
      },
    });
    if (code && code.estado) {
      let usuario = await this.usuarioRepository.findOne({
        where: {
          _id: code.idUsuario,
        },
      });

      if (usuario) {
        //creación del token y asignación a respuesta
        let datos = {
          id: usuario._id,
          nombre: `${usuario.nombres} ${usuario.apellidos}`,
          correo: usuario.correo,
          rol: usuario.rolId,
          // isLogged: false
        }
        try {
          code.estado = false;
          this.codigo2FARepositorio.updateById(code._id, code)
          let respuesta = {
            Token: this.servicioJwt.crearToken(datos),
            User: datos
          }
          console.log(respuesta);
          return respuesta;
        } catch (err) {
          throw err;
        }
      } else {
        return {error: "Usuario no registrado"}
      }
    } else {
      return {error: "El código es invalido"}
    }
  }

}


