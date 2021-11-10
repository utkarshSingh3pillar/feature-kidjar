import { createParamDecorator } from '@nestjs/common';
import jwt_decode from "jwt-decode";

export const AuthUser = createParamDecorator((data, req) => {
    debugger;
    // const jwt = req.headers.authorization.replace('Bearer ', '');
    // const json = jwt_decode(jwt);
    // return req.user;
});