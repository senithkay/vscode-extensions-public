export interface CCDAErrorResponse {
  resourceType: string;
  meta: {
    profile: string[];
  };
  issue: {
    severity: string;
    diagnostics: string;
    code: string;
    details: {
      coding: {
        system: string;
        code: string;
      }[];
      text: string;
    };
  }[];
}
