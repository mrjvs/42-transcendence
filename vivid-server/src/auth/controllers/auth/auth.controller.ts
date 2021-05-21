import { Controller, Get, Headers, Redirect, Res, Req } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {

    // Get /api/v1/auth/login 
    // route user will use to authenticate
    @Get('login')
    login() { 
        return ;
    }

    @Get('done')
    @Redirect('https://www.kanikeenkortebroekaan.nl/')
    done(@Headers() headers){
        console.log(headers);
        return ;
    }
    
    @Get('redirect')
    @Redirect('https://api.intra.42.fr/oauth/authorize?client_id=c17eb5a0f81dddfb75518b31ae3b99cd405a6178cf6f36ff1e089fb5a3bbf090&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fv1%2Fauth%2Fdone&response_type=code', 302)
    getDocs(@Headers() headers){
        console.log(headers);
        return ;
    }


    // Get /api/v1/auth/redirect
    // This is the redirect URL the OAUTH2 provider will call

    // redirect(@Res() res:Response) { 
    //     res.send(200);
    // }
    
    // Get /api/v1/auth/status
    @Get('status')
    status() { }
    
    // Get /api/v1/auth/logout
    @Get('logout')
    logout() { }
}
