/**
 * Get response headers.
 * 
 * @param {boolean} enhancedSecurity Should enhanced security be applied?
 * @param {string} mimetype The mime-type of the requested file.
 * @default
 */
export default (enhancedSecurity, mimetype) => {
    return !enhancedSecurity ? {
        "Content-Type": mimetype
    } : {
        "Content-Type": mimetype,
        "X-Content-Type-Options": "nosniff",
        "X-Download-Options": "noopen"
    }
}
