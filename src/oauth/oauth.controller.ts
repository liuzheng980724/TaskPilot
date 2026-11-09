import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Res
} from '@nestjs/common';

@Controller()
export class OauthController {

    @Get('.well-known/oauth-authorization-server')
    authorizationServer() {

        return {

            issuer:
                'https://aiagent.leo.ninja',

            authorization_endpoint:
                'https://aiagent.leo.ninja/oauth/authorize',

            token_endpoint:
                'https://aiagent.leo.ninja/oauth/token',

            registration_endpoint:
                'https://aiagent.leo.ninja/oauth/register',

            response_types_supported: [
                'code',
            ],

            grant_types_supported: [
                'authorization_code',
                'refresh_token',
            ],

            token_endpoint_auth_methods_supported: [
                'none',
            ],
        };
    }

    //temporary using
    @Post('oauth/register')
    register(
        @Body() body: any,
    ) {

        console.log(
            'REGISTER REQUEST',
            JSON.stringify(
                body,
                null,
                2,
            ),
        );

        return {
            client_id: 'taskpilot-claude',

            client_id_issued_at:
                Math.floor(
                    Date.now() / 1000,
                ),

            redirect_uris:
            body.redirect_uris,

            grant_types:
            body.grant_types,

            response_types:
            body.response_types,

            token_endpoint_auth_method:
                'none',
        };
    }

    @Get('oauth/authorize')
    authorize(
        @Query() query: any,
        @Res() res: any,
    ) {

        const code = 'test-auth-code';

        return res.redirect(
            `${query.redirect_uri}?code=${code}&state=${query.state}`,
        );
    }

    @Post('oauth/token')
    token() {

        console.log('TOKEN HIT');

        return {
            access_token:
                'taskpilot-access-token',

            token_type:
                'Bearer',

            expires_in:
                3600,
        };
    }
}