package com.shv.Ecommerce.service.interf;

import com.shv.Ecommerce.dto.LoginRequest;
import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.dto.UserDto;
import com.shv.Ecommerce.entity.User;

public interface IUserService {
    Response registerUser(UserDto registrationRequest);
    Response loginRequest(LoginRequest loginRequest);
    Response forgotPassword(String email);
    Response resetPassword(String token, String newPassword);
    Response googleLogin(String idToken);
    Response getAllUsers();
    User getLoginUser();
    Response getUserInfoAndOrderHistory();
}
