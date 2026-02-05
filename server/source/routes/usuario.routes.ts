import { Router } from "express";
import { usuarioController } from "../controllers/usuarioController";
import { authenticateJWT } from "../middleware/authMiddleware";

export class UsuarioRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new usuarioController();

    router.post("/login", controller.login);
    router.post("/register", controller.register);
    router.get("/profile", authenticateJWT, controller.userAuth);

    router.get("/usuarios", controller.getUsuarios);
    router.get("/", controller.getByUser);
    router.get("/:id", controller.getById);
    router.post("/usuario/", controller.createUsuario);
    router.post("/", controller.create);
    router.put("/:id", controller.update);

    return router;
  }
}
