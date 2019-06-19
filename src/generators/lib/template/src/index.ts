import { isArray } from 'vtils'

export const x = 1

export const obj = {
  ...window,
  x,
}

export const obj2 = {
  ...obj,
  x,
}

export class Klass {
  async getT() {

  }
}

export const isArray2 = isArray
