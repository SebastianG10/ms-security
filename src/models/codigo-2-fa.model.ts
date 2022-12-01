import {Entity, model, property} from '@loopback/repository';

@model()
export class Codigo2Fa extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  idUsuario: string;

  @property({
    type: 'number',
    required: true,
  })
  codigo: number;

  @property({
    type: 'boolean',
    required: true,
  })
  estado: boolean;


  constructor(data?: Partial<Codigo2Fa>) {
    super(data);
  }
}

export interface Codigo2FaRelations {
  // describe navigational properties here
}

export type Codigo2FaWithRelations = Codigo2Fa & Codigo2FaRelations;
