import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { GatewayServiceContext } from '../types';

export class CreateConversation extends OpenAPIRoute {
    schema = {
        request: {
            query: z.object({
                conversationId: z.string(),
            }),
        },
        responses: {
            '200': {
                description: 'Job',
                content: {
                    'application/json': {
                        schema: z.object({
                            message: z.string(),
                            data: z.object({
                                success: z.boolean(),
                            }),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: GatewayServiceContext) {
        console.log('CreateConversation for user', c.get('userId'));
        return c.json({
            message: 'ok',
            data: { success: true },
        });
    }
}
