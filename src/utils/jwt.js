const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'wx:miniprogram-team-light:passport';

module.exports.generateJWT = async (user) => {
    return await jwt.sign(
        { id: user.id, phone: user.phone, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' })
}