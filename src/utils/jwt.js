module.exports.generateJWT = async (user) => {
    return await jwt.sign(
        { id: user.id, phone: user.phone, role: user.role, name: user.name },
        'wx:miniprogram-team-light:passport',
        { expiresIn: '7d' })
}