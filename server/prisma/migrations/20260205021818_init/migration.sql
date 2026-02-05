/*
  Warnings:

  - You are about to alter the column `fecha_login` on the `login_logs` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `ultimo_inicio_sesion` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `login_logs` MODIFY `fecha_login` DATETIME NOT NULL;

-- AlterTable
ALTER TABLE `usuario` MODIFY `ultimo_inicio_sesion` DATETIME NULL;
