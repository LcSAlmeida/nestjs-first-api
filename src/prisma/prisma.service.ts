import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient{
    constructor (config: ConfigService) {
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL')
                },
            },
        });
    }

    cleanDb() { // method for delete the users when his bookmarks to be deleted 
        return this.$transaction([
            this.bookmark.deleteMany(),
            this.user.deleteMany(),
            
        ]);
    }
}
