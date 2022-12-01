import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Codigo2Fa} from '../models';
import {Codigo2FaRepository} from '../repositories';

export class Codigo2FaController {
  constructor(
    @repository(Codigo2FaRepository)
    public codigo2FaRepository: Codigo2FaRepository,
  ) { }

  @post('/codigos2fa')
  @response(200, {
    description: 'Codigo2Fa model instance',
    content: {'application/json': {schema: getModelSchemaRef(Codigo2Fa)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Codigo2Fa, {
            title: 'NewCodigo2Fa',
            exclude: ['_id'],
          }),
        },
      },
    })
    codigo2Fa: Omit<Codigo2Fa, '_id'>,
  ): Promise<Codigo2Fa> {
    return this.codigo2FaRepository.create(codigo2Fa);
  }

  @get('/codigos2fa/count')
  @response(200, {
    description: 'Codigo2Fa model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Codigo2Fa) where?: Where<Codigo2Fa>,
  ): Promise<Count> {
    return this.codigo2FaRepository.count(where);
  }

  @get('/codigos2fa')
  @response(200, {
    description: 'Array of Codigo2Fa model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Codigo2Fa, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Codigo2Fa) filter?: Filter<Codigo2Fa>,
  ): Promise<Codigo2Fa[]> {
    return this.codigo2FaRepository.find(filter);
  }

  @patch('/codigos2fa')
  @response(200, {
    description: 'Codigo2Fa PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Codigo2Fa, {partial: true}),
        },
      },
    })
    codigo2Fa: Codigo2Fa,
    @param.where(Codigo2Fa) where?: Where<Codigo2Fa>,
  ): Promise<Count> {
    return this.codigo2FaRepository.updateAll(codigo2Fa, where);
  }

  @get('/codigos2fa/{id}')
  @response(200, {
    description: 'Codigo2Fa model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Codigo2Fa, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Codigo2Fa, {exclude: 'where'}) filter?: FilterExcludingWhere<Codigo2Fa>
  ): Promise<Codigo2Fa> {
    return this.codigo2FaRepository.findById(id, filter);
  }

  @patch('/codigos2fa/{id}')
  @response(204, {
    description: 'Codigo2Fa PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Codigo2Fa, {partial: true}),
        },
      },
    })
    codigo2Fa: Codigo2Fa,
  ): Promise<void> {
    await this.codigo2FaRepository.updateById(id, codigo2Fa);
  }

  @put('/codigos2fa/{id}')
  @response(204, {
    description: 'Codigo2Fa PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() codigo2Fa: Codigo2Fa,
  ): Promise<void> {
    await this.codigo2FaRepository.replaceById(id, codigo2Fa);
  }

  @del('/codigos2fa/{id}')
  @response(204, {
    description: 'Codigo2Fa DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.codigo2FaRepository.deleteById(id);
  }
}
