import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { AppError } from "../errors/custom.error";
import { Usuario, PrismaClient, Role } from "@prisma/client";
import passport from "passport";
import { generateToken } from "../config/authUtils";
import path from "path";
import { exec } from "child_process";
import { spawn } from "child_process";
import fs from "fs";

export class usuarioController {
  prisma = new PrismaClient();

    // Listado de usuarios
  getUsuarios = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const listado = await this.prisma.usuario.findMany({
      });
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nombre, correo, contrasena, role } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(contrasena, salt);

      const user = await this.prisma.usuario.create({
        data: {
          nombre,
          correo,
          contrasena: hash,
          id_rol: Role[role as keyof typeof Role],
        },
      });

      res.status(201).json({
        success: true,
        message: "Usuario creado",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      { session: false },
      async (
        err: Error | null,
        user: Express.User | false | null,
        info: { message?: string }
      ) => {
        if (err) return next(err);
        if (!user) {
          return res
            .status(401)
            .json({ success: false, message: info.message });
        }

        try {
          // Actualizar último inicio de sesión
          await this.prisma.usuario.update({
            where: {
              id_usuario: (user as Usuario).id_usuario, // usa el id del usuario autenticado
            },
            data: {
              ultimo_inicio_sesion: new Date(),
            },
          });
          // ingresar inicio de sesion en login logs
          let datetime = new Date()
          await this.prisma.login_logs.create({
            data: {
              id_usuario: (user as Usuario).id_usuario,
              fecha_login: datetime,
            },
          });

          // Generar token
          const token = generateToken(user as Usuario);

          return res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            token,
          });
        } catch (updateError) {
          return next(updateError);
        }
      }
    )(req, res, next);
  };

  userAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuario = req.user as Usuario;
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  };



  // Listado de Técnicos
  getByUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const listado = await this.prisma.usuario.findMany({
        where: {
          id_rol: "TECNICO", //Filtra solo los técnicos
        },
        orderBy: {
          id_usuario: "asc",
        },
      });
      response.json(listado);
    } catch (error) {
      next(error);
    }
  };

  //Obtener por Id
  getById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let idUsuario = parseInt(request.params.id as string);
      if (isNaN(idUsuario)) {
        next(AppError.badRequest("El ID no es válido"));
      }
      const objUsuario = await this.prisma.usuario.findFirst({
        where: { id_usuario: idUsuario },
      });
      if (objUsuario) {
        response.status(200).json(objUsuario);
      } else {
        next(AppError.notFound("No existe el Uusario"));
      }
    } catch (error: any) {
      next(error);
    }
  };

 



  //Crear

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const hashedPassword = await bcrypt.hash(body.contrasena, 10); // 10 = salt rounds
      const newTecnico = await this.prisma.usuario.create({
        data: {
          nombre: body.nombre,
          correo: body.correo,
          contrasena: hashedPassword,
          activo: body.activo === 1,
          id_rol: Role.TECNICO,
        },
      });
      response.status(201).json(newTecnico);
    } catch (error) {
      console.error("Error creando Tecnico:", error);
      next(error);
    }
  };

  createUsuario = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body = request.body;
      const hashedPassword = await bcrypt.hash(body.contrasena, 10); // 10 = salt rounds
      const newTecnico = await this.prisma.usuario.create({
        data: {
          nombre: body.nombre,
          correo: body.correo,
          contrasena: hashedPassword,
          activo: body.activo === 1,
          id_rol: body.id_rol,
        },
      });
      response.status(201).json(newTecnico);
    } catch (error) {
      console.error("Error creando Usuario:", error);
      next(error);
    }
  };
  //Actualizar una categoria
  update = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body;
      const idTecnico = parseInt(request.params.id as string);

      //Obtener categoria anterior
      const TecnicoExistente = await this.prisma.usuario.findUnique({
        where: { id_usuario: idTecnico },
      });
      if (!TecnicoExistente) {
        response.status(404).json({ message: "El tecnico no existe" });
        return;
      }
      //Actualizar
      const updateTecnico = await this.prisma.usuario.update({
        where: {
          id_usuario: idTecnico,
        },
        data: {
          nombre: body.nombre,
          correo: body.correo,
          activo: body.activo === 1 ? true : false,
        },
      });

      response.json(updateTecnico);
    } catch (error) {
      next(error);
    }
  };
}
