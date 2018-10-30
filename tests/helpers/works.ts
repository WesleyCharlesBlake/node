/* tslint:disable:no-relative-imports */
import { SignedVerifiableClaim } from '@po.et/poet-js'
import fetch from 'node-fetch'

import { delay } from './utils'

const baseUrl = (port: string, host: string = 'localhost') => `http://${host}:${port}`
export const getWork = (port: string, host?: string) => (id: string) => fetch(`${baseUrl(port, host)}/works/${id}`)

export const postWork = (port: string, host?: string) => (claim: SignedVerifiableClaim) =>
  fetch(`${baseUrl(port, host)}/works/`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(claim),
  })

export const postWorkWithDelay = (port: string, host?: string, delayValue: number = 10000) => async (
  claim: SignedVerifiableClaim,
) => {
  const postWorkToNode = postWork(port, host)
  const response = postWorkToNode(claim)
  await delay(delayValue)
  return response
}
