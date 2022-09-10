import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) {}
    getBookmarks(userId: number) {
        return this.prisma.bookmark.findMany({
            where: {
                userId
            }
        })
    }

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto,
            },
        });
        return bookmark;
    }

    async getBookmarkById(userId: number, bookmarkId: number) {
        return this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
                userId,
            }
        })
    }
    
    async editBookmarkById(userId: number, dto: EditBookmarkDto, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })

        if (!bookmark ||bookmark.userId !== userId) {
            throw new ForbiddenException('Acces to resources denied')
        };
        return this.prisma.bookmark.update({
            where: {
                id: bookmarkId,
            },
            data: {
                ...dto,
            },
        });
    }

    async deleteBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })

        if (!bookmark ||bookmark.userId !== userId) {
            throw new ForbiddenException('Acces to resources denied')
        };
        
        await this.prisma.bookmark.delete({
            where: {
                id: bookmarkId
            }
        })
    }
}
