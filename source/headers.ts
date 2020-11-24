import { OutgoingHttpHeaders } from "http"

export interface KnownHeaders extends OutgoingHttpHeaders {
    "Content-Type": string
    "X-Content-Type-Options"?: string
    "X-Download-Options"?: string
    "X-DNS-Prefetch-Control"?: string
    "Referrer-Policy"?: string
}

export default (enhancedSecurity: boolean, mimetype: string): KnownHeaders => {
    return !enhancedSecurity
        ? {
              "Content-Type": mimetype,
          }
        : {
              "Content-Type": mimetype,
              "X-Content-Type-Options": "nosniff",
              "X-Download-Options": "noopen",
              "X-DNS-Prefetch-Control": "off",
              "Referrer-Policy": "no-referrer",
          }
}
