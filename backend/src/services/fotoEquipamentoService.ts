import fs from "node:fs/promises";
import path from "node:path";

import { diretorioFotosEquipamentos as diretorioFotos } from "../config/upload";
import { AppError } from "../errors/AppError";
import { EquipamentoRepository } from "../repositories/equipamentoRepository";
import {
  type CreateFotoEquipamentoData,
  FotoEquipamentoRepository,
} from "../repositories/fotoEquipamentoRepository";

export interface ArquivoFotoEquipamento {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

export class FotoEquipamentoService {
  private readonly repository: FotoEquipamentoRepository;
  private readonly equipamentoRepository: EquipamentoRepository;

  constructor() {
    this.repository = new FotoEquipamentoRepository();
    this.equipamentoRepository = new EquipamentoRepository();
  }

  async listarPorEquipamento(equipamentoId: number) {
    this.validarId(equipamentoId, "ID do equipamento");
    await this.validarEquipamentoExiste(equipamentoId);

    return this.repository.findByEquipamentoId(equipamentoId);
  }

  async adicionar(equipamentoId: number, arquivos: ArquivoFotoEquipamento[]) {
    if (!arquivos.length) {
      throw new AppError("Envie pelo menos uma foto", 400);
    }

    try {
      this.validarId(equipamentoId, "ID do equipamento");
      await this.validarEquipamentoExiste(equipamentoId);

      const fotoPrincipalExistente =
        await this.repository.findPrincipalByEquipamentoId(equipamentoId);

      const dados: CreateFotoEquipamentoData[] = arquivos.map(
        (arquivo, indice) => ({
          nomeArquivo: arquivo.filename,
          nomeOriginal: arquivo.originalname,
          tipoMime: arquivo.mimetype,
          tamanho: arquivo.size,
          principal: !fotoPrincipalExistente && indice === 0,
          equipamentoId,
        }),
      );

      return await this.repository.createMany(dados);
    } catch (erro) {
      await this.removerArquivosRecebidos(arquivos);
      throw erro;
    }
  }

  async definirPrincipal(equipamentoId: number, fotoId: number) {
    this.validarId(equipamentoId, "ID do equipamento");
    this.validarId(fotoId, "ID da foto");
    await this.validarEquipamentoExiste(equipamentoId);

    const foto = await this.repository.setPrincipal(fotoId, equipamentoId);

    if (!foto) {
      throw new AppError("Foto não encontrada para este equipamento", 404);
    }

    return foto;
  }

  async excluir(equipamentoId: number, fotoId: number) {
    this.validarId(equipamentoId, "ID do equipamento");
    this.validarId(fotoId, "ID da foto");
    await this.validarEquipamentoExiste(equipamentoId);

    const foto = await this.repository.findById(fotoId);

    if (!foto || foto.equipamentoId !== equipamentoId) {
      throw new AppError("Foto não encontrada para este equipamento", 404);
    }

    const fotoExcluida = await this.repository.deleteAndPromote(
      fotoId,
      equipamentoId,
    );

    if (!fotoExcluida) {
      throw new AppError("Foto não encontrada para este equipamento", 404);
    }

    await this.removerArquivoPorNome(fotoExcluida.nomeArquivo);

    return fotoExcluida;
  }

  private validarId(id: number, campo: string) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(`${campo} inválido`, 400);
    }
  }

  private async validarEquipamentoExiste(equipamentoId: number) {
    const equipamento =
      await this.equipamentoRepository.findById(equipamentoId);

    if (!equipamento) {
      throw new AppError("Equipamento não encontrado", 404);
    }
  }

  private async removerArquivosRecebidos(arquivos: ArquivoFotoEquipamento[]) {
    await Promise.all(
      arquivos.map((arquivo) => this.removerArquivoSeguro(arquivo.path)),
    );
  }

  private async removerArquivoPorNome(nomeArquivo: string) {
    if (path.basename(nomeArquivo) !== nomeArquivo) {
      console.error("Nome de arquivo de foto inválido no banco de dados");
      return;
    }

    const caminhoArquivo = path.join(diretorioFotos, nomeArquivo);
    await this.removerArquivoSeguro(caminhoArquivo);
  }

  private async removerArquivoSeguro(caminhoArquivo: string) {
    const caminhoResolvido = path.resolve(caminhoArquivo);
    const caminhoRelativo = path.relative(diretorioFotos, caminhoResolvido);

    const estaDentroDoDiretorio =
      caminhoRelativo !== "" &&
      !caminhoRelativo.startsWith("..") &&
      !path.isAbsolute(caminhoRelativo);

    if (!estaDentroDoDiretorio) {
      console.error("Tentativa de remover foto fora do diretório permitido");
      return;
    }

    try {
      await fs.unlink(caminhoResolvido);
    } catch (erro) {
      const erroArquivo = erro as NodeJS.ErrnoException;

      if (erroArquivo.code !== "ENOENT") {
        console.error("Não foi possível remover o arquivo da foto", erro);
      }
    }
  }
}

export const fotoEquipamentoService = new FotoEquipamentoService();
