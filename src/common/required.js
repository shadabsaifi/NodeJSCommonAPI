module.exports = {

    signup:['fullName', 'countryCode', 'phone', 'email', 'password'],
    login:['countryCode','phone', 'password'],
    verifyOTP:['otp', 'userId'],
    forgotPassword:['countryCode', 'phone'],
    resendOTP:['userId'],
    resetPassword:['password', 'userId', 'secureKey'],
    getUserDetail:['userId'],
    editUserProfile:['userId']
}