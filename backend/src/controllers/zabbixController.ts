import { Request, Response } from "express";
import { zabbixService } from "../services/zabbixService";

export class ZabbixController {
  async listarComputadores(_req: Request, res: Response) {
    const hosts = await zabbixService.listarComputadores();

    const computadores = hosts.map((host) => ({
      hostid: host.hostid,
      host: host.host,
      nome: host.name,
      ativo: host.status === "0",

      interfaces: host.interfaces
        .filter((interfaceRede) => interfaceRede.ip.trim() !== "")
        .map((interfaceRede) => ({
          interfaceid: interfaceRede.interfaceid,
          ip: interfaceRede.ip,
          dns: interfaceRede.dns,
          porta: interfaceRede.port,
          tipo: interfaceRede.type,
          principal: interfaceRede.main === "1",
          disponivel: interfaceRede.available === "1",
        })),

      ips: host.interfaces
        .filter((interfaceRede) => interfaceRede.ip.trim() !== "")
        .map((interfaceRede) => interfaceRede.ip),
    }));

    return res.status(200).json({
      success: true,
      data: computadores,
    });
  }
}
