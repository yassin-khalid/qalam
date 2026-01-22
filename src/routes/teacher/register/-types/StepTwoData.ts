import { Certificate } from "./Certificate";
import { IdentityDocument } from "./IdentityDocument";


export interface StepTwoData {
  isInSaudiArabia: boolean;
  identityDocument: IdentityDocument;
  certificates: Certificate[];
}