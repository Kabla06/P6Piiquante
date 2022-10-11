const passwordValidator = require("password-validator");

const passSchema = new passwordValidator();

passSchema
.is().min(8)                                    // Minimum length 8
.is().max(20)                                  // Maximum length 20
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123', 'pass', 'PASS', 'motdepasse']); // Blacklist these values

module.exports = passSchema;