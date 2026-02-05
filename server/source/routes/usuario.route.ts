import { Router } from "express";
import { usuarioController } from "../controllers/usuarioController";

export class UsuarioRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new usuarioController();

    router.get("/", controller.getUsuarios);

    return router;
  }
}
