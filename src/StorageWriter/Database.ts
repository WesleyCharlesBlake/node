import { Claim } from '@po.et/poet-js'

export interface Database {
  readonly addClaim: (claim: Claim) => Promise<void>
  readonly addClaimHash: (claimId: string, ipfsFileHash: string) => Promise<void>
  readonly findNextClaim: () => Promise<Claim>
  readonly addError: (error: any) => Promise<void>
  readonly start: () => Promise<void>
}
